import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getDiscogsOAuthClient } from '@/lib/discogs/oauth';

/**
 * Import user's Discogs collection
 * This endpoint will:
 * 1. Fetch the user's Discogs collection using their stored credentials
 * 2. Transform Discogs data to our format
 * 3. Import records into the database
 * 4. Return import statistics
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Import collection - Starting...');
    const supabase = await createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Import collection - User:', user.id);

    // Get user profile with Discogs credentials
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('discogs_username, discogs_token, discogs_token_secret, discogs_connected')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    if (!profile?.discogs_connected || !profile.discogs_token || !profile.discogs_token_secret) {
      return NextResponse.json(
        { error: 'Discogs account not connected. Please connect in Settings.' },
        { status: 400 }
      );
    }

    console.log('Import collection - Fetching from Discogs for user:', profile.discogs_username);

    // Fetch collection from Discogs API
    const oauthClient = getDiscogsOAuthClient();
    
    // First, verify the user's identity and get their actual username
    let username = profile.discogs_username;
    
    try {
      console.log('Import collection - Verifying identity...');
      const identity = await oauthClient.makeRequest(
        'https://api.discogs.com/oauth/identity',
        profile.discogs_token,
        profile.discogs_token_secret,
        'GET'
      );
      console.log('Import collection - Identity response:', identity);
      username = identity.username || profile.discogs_username;
    } catch (identityError) {
      console.error('Import collection - Identity check failed:', identityError);
      // Continue with stored username if identity check fails
    }

    console.log('Import collection - Using username:', username);
    const collectionUrl = `https://api.discogs.com/users/${username}/collection/folders/0/releases`;
    
    let allReleases: any[] = [];
    let page = 1;
    let hasMore = true;

    try {
      // Fetch all pages of the collection
      while (hasMore) {
        console.log(`Import collection - Fetching page ${page} from: ${collectionUrl}?per_page=100&page=${page}`);
        const response = await oauthClient.makeRequest(
          `${collectionUrl}?per_page=100&page=${page}`,
          profile.discogs_token,
          profile.discogs_token_secret,
          'GET'
        );

        console.log(`Import collection - Page ${page} response:`, {
          releases: response.releases?.length || 0,
          pagination: response.pagination
        });

        allReleases = allReleases.concat(response.releases || []);
        
        // Check if there are more pages
        hasMore = response.pagination && response.pagination.page < response.pagination.pages;
        page++;

        // Safety limit to prevent infinite loops
        if (page > 100) break;
      }
    } catch (fetchError) {
      console.error('Import collection - Error fetching from Discogs:', fetchError);
      throw new Error(`Failed to fetch collection from Discogs: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
    }

    console.log(`Import collection - Found ${allReleases.length} releases`);

    // Transform and import records with tracks
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    let tracksCreated = 0;

    for (const release of allReleases) {
      try {
        const basicInfo = release.basic_information;
        
        // Check if record already exists
        const { data: existingRecord } = await supabase
          .from('records')
          .select('id')
          .eq('user_id', user.id)
          .eq('discogs_release_id', basicInfo.id)
          .single();

        let recordId: string;

        if (existingRecord) {
          skipped++;
          recordId = existingRecord.id;
          
          // Check if tracks already exist for this record
          const { data: existingTracks } = await supabase
            .from('tracks')
            .select('id')
            .eq('release_id', recordId)
            .limit(1);

          if (existingTracks && existingTracks.length > 0) {
            console.log(`Tracks already exist for release ${basicInfo.id}, skipping track import`);
            continue;
          }
        } else {
          // Create new record
          const recordData = {
            user_id: user.id,
            discogs_release_id: basicInfo.id,
            title: basicInfo.title,
            artist: basicInfo.artists?.[0]?.name || 'Unknown Artist',
            year: basicInfo.year || null,
            format: basicInfo.formats?.[0]?.name || null,
            label: basicInfo.labels?.[0]?.name || null,
            catalog_number: basicInfo.labels?.[0]?.catno || null,
            cover_image_url: basicInfo.cover_image || basicInfo.thumb || null,
            genres: basicInfo.genres || [],
            styles: basicInfo.styles || [],
          };

          const { data: newRecord, error: insertError } = await supabase
            .from('records')
            .insert(recordData)
            .select()
            .single();

          if (insertError) {
            console.error('Import error for release:', basicInfo.id, insertError);
            errors++;
            continue;
          }
          
          recordId = newRecord.id;
          imported++;
        }

        // Fetch full release details to get tracklist
        console.log(`Fetching tracklist for release ${basicInfo.id}...`);
        const releaseDetails = await oauthClient.makeRequest(
          `https://api.discogs.com/releases/${basicInfo.id}`,
          profile.discogs_token,
          profile.discogs_token_secret,
          'GET'
        );

        // Import tracks
        if (releaseDetails.tracklist && releaseDetails.tracklist.length > 0) {
          for (const discogsTrack of releaseDetails.tracklist) {
            // Skip non-track items (headings, etc.)
            if (discogsTrack.type_ && discogsTrack.type_ !== 'track') continue;

            try {
              // Find or create canonical song
              const songTitle = discogsTrack.title;
              const songArtist = discogsTrack.artists?.[0]?.name || basicInfo.artists?.[0]?.name || 'Unknown Artist';
              
              // Normalize for matching
              const titleNorm = songTitle.toLowerCase().replace(/[^\w\s]/g, '').trim();
              const artistNorm = songArtist.toLowerCase().replace(/[^\w\s]/g, '').trim();

              // Try to find existing song
              let { data: existingSong } = await supabase
                .from('songs')
                .select('id')
                .eq('title_normalized', titleNorm)
                .eq('artist_normalized', artistNorm)
                .single();

              let songId: string;

              if (existingSong) {
                songId = existingSong.id;
              } else {
                // Create new song
                const { data: newSong, error: songError } = await supabase
                  .from('songs')
                  .insert({
                    title: songTitle,
                    artist: songArtist,
                    original_year: basicInfo.year,
                    genres: basicInfo.genres,
                    styles: basicInfo.styles,
                  })
                  .select()
                  .single();

                if (songError) {
                  console.error('Error creating song:', songError);
                  continue;
                }
                
                songId = newSong.id;
              }

              // Parse duration
              let durationMs = null;
              if (discogsTrack.duration) {
                const parts = discogsTrack.duration.split(':');
                if (parts.length === 2) {
                  const minutes = parseInt(parts[0]);
                  const seconds = parseInt(parts[1]);
                  durationMs = (minutes * 60 + seconds) * 1000;
                }
              }

              // Create track
              const { data: newTrack, error: trackError } = await supabase
                .from('tracks')
                .insert({
                  song_id: songId,
                  release_id: recordId,
                  position: discogsTrack.position,
                  title: songTitle,
                  duration_ms: durationMs,
                  discogs_track_id: `${basicInfo.id}-${discogsTrack.position}`,
                })
                .select()
                .single();

              if (trackError) {
                console.error('Error creating track:', trackError);
                continue;
              }

              // Create user_track entry
              const { error: userTrackError } = await supabase
                .from('user_tracks')
                .insert({
                  user_id: user.id,
                  track_id: newTrack.id,
                  source: basicInfo.formats?.[0]?.name?.toLowerCase().includes('vinyl') ? 'vinyl' : 'digital',
                });

              if (userTrackError) {
                console.error('Error creating user_track:', userTrackError);
                continue;
              }

              tracksCreated++;
            } catch (trackErr) {
              console.error('Error processing track:', trackErr);
            }
          }
        }
      } catch (err) {
        console.error('Error processing release:', err);
        errors++;
      }
    }

    console.log(`Import collection - Complete: ${imported} releases imported, ${skipped} skipped, ${tracksCreated} tracks created, ${errors} errors`);

    return NextResponse.json({
      success: true,
      message: 'Collection import completed',
      statistics: {
        total: allReleases.length,
        imported,
        skipped,
        errors,
        tracksCreated,
      },
    });
  } catch (error) {
    console.error('Discogs import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import Discogs collection' },
      { status: 500 }
    );
  }
}


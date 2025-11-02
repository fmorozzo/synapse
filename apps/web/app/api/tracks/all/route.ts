import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Get all tracks for the authenticated user with full details
 * Uses the user_tracks_detail view which joins tracks, songs, and releases
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Try to get tracks from database first (fast!)
    let tracks;
    
    try {
      // Try using the view first (if migration 004 has been run)
      console.log('Fetching tracks from user_tracks_detail view...');
      const { data: viewData, error: viewError } = await supabase
        .from('user_tracks_detail')
        .select('*')
        .eq('user_id', user.id)
        .order('song_title', { ascending: true });

      if (viewError) {
        console.log('user_tracks_detail view not found, using fallback');
        throw viewError;
      }

      console.log(`Found ${viewData?.length || 0} tracks from database`);
      tracks = viewData;
    } catch (viewError) {
      // Fallback: Query records and manually extract tracks from Discogs
      console.log('Falling back to records table with track extraction');
      const { data: recordsData, error: recordsError } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (recordsError) throw recordsError;

      // Get user's Discogs credentials for fetching tracklists
      const { data: profile } = await supabase
        .from('profiles')
        .select('discogs_token, discogs_token_secret')
        .eq('id', user.id)
        .single();

      // If we have Discogs credentials, fetch tracklists
      if (profile?.discogs_token && profile?.discogs_token_secret) {
        console.log('Fetching tracklists from Discogs...');
        const { getDiscogsOAuthClient } = await import('@/lib/discogs/oauth');
        const oauthClient = getDiscogsOAuthClient();
        
        const allTracks = [];
        
        for (const record of recordsData || []) {
          try {
            // Fetch full release details to get tracklist
            const releaseDetails = await oauthClient.makeRequest(
              `https://api.discogs.com/releases/${record.discogs_release_id}`,
              profile.discogs_token,
              profile.discogs_token_secret,
              'GET'
            );

            // Extract tracks from the release
            if (releaseDetails.tracklist && releaseDetails.tracklist.length > 0) {
              for (const track of releaseDetails.tracklist) {
                // Skip non-track items (headings, etc.)
                if (track.type_ && track.type_ !== 'track') continue;

                // Parse duration
                let durationMs = null;
                if (track.duration) {
                  const parts = track.duration.split(':');
                  if (parts.length === 2) {
                    const minutes = parseInt(parts[0]);
                    const seconds = parseInt(parts[1]);
                    durationMs = (minutes * 60 + seconds) * 1000;
                  }
                }

                allTracks.push({
                  user_track_id: `${record.id}-${track.position}`,
                  track_id: `${record.id}-${track.position}`,
                  track_title: track.title,
                  position: track.position,
                  bpm: null, // Will be populated later
                  key: null,
                  camelot_key: null,
                  energy_level: null,
                  duration_ms: durationMs,
                  version_type: null,
                  version_info: null,
                  song_id: `${record.id}-${track.position}`,
                  song_title: track.title,
                  song_artist: record.artist,
                  genres: record.genres,
                  styles: record.styles,
                  release_id: record.id,
                  release_title: record.title,
                  cover_image_url: record.cover_image_url,
                  format: record.format,
                  year: record.year,
                  personal_rating: null,
                  tags: null,
                  source: 'vinyl',
                  location: record.location,
                  crate_name: null,
                  play_count: 0,
                  last_played_at: null,
                });
              }
            } else {
              // No tracklist, show album as single track
              allTracks.push({
                user_track_id: record.id,
                track_id: record.id,
                track_title: record.title,
                position: null,
                bpm: null,
                key: null,
                camelot_key: null,
                energy_level: null,
                duration_ms: null,
                version_type: null,
                version_info: null,
                song_id: record.id,
                song_title: record.title,
                song_artist: record.artist,
                genres: record.genres,
                styles: record.styles,
                release_id: record.id,
                release_title: record.title,
                cover_image_url: record.cover_image_url,
                format: record.format,
                year: record.year,
                personal_rating: null,
                tags: null,
                source: 'vinyl',
                location: record.location,
                crate_name: null,
                play_count: 0,
                last_played_at: null,
              });
            }
          } catch (err) {
            console.error(`Error fetching tracklist for release ${record.discogs_release_id}:`, err);
            // Fallback to showing album as single track
            allTracks.push({
              user_track_id: record.id,
              track_id: record.id,
              track_title: record.title,
              position: null,
              bpm: null,
              key: null,
              camelot_key: null,
              energy_level: null,
              duration_ms: null,
              version_type: null,
              version_info: null,
              song_id: record.id,
              song_title: record.title,
              song_artist: record.artist,
              genres: record.genres,
              styles: record.styles,
              release_id: record.id,
              release_title: record.title,
              cover_image_url: record.cover_image_url,
              format: record.format,
              year: record.year,
              personal_rating: null,
              tags: null,
              source: 'vinyl',
              location: record.location,
              crate_name: null,
              play_count: 0,
              last_played_at: null,
            });
          }
        }
        
        tracks = allTracks;
      } else {
        // No Discogs credentials, just show records as tracks
        tracks = recordsData?.map(record => ({
          user_track_id: record.id,
          track_id: record.id,
          track_title: record.title,
          position: null,
          bpm: null,
          key: null,
          camelot_key: null,
          energy_level: null,
          duration_ms: null,
          version_type: null,
          version_info: null,
          song_id: record.id,
          song_title: record.title,
          song_artist: record.artist,
          genres: record.genres,
          styles: record.styles,
          release_id: record.id,
          release_title: record.title,
          cover_image_url: record.cover_image_url,
          format: record.format,
          year: record.year,
          personal_rating: null,
          tags: null,
          source: 'vinyl',
          location: record.location,
          crate_name: null,
          play_count: 0,
          last_played_at: null,
        })) || [];
      }
    }

    return NextResponse.json({ 
      tracks,
      count: tracks?.length || 0 
    });
  } catch (error) {
    console.error('Get tracks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    );
  }
}


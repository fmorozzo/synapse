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

    // Transform and import records
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const release of allReleases) {
      try {
        const basicInfo = release.basic_information;
        
        // Check if record already exists
        const { data: existing } = await supabase
          .from('records')
          .select('id')
          .eq('user_id', user.id)
          .eq('discogs_release_id', basicInfo.id)
          .single();

        if (existing) {
          skipped++;
          continue;
        }

        // Prepare record data
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

        // Insert record
        const { error: insertError } = await supabase
          .from('records')
          .insert(recordData);

        if (insertError) {
          console.error('Import error for release:', basicInfo.id, insertError);
          errors++;
        } else {
          imported++;
        }
      } catch (err) {
        console.error('Error processing release:', err);
        errors++;
      }
    }

    console.log(`Import collection - Complete: ${imported} imported, ${skipped} skipped, ${errors} errors`);

    return NextResponse.json({
      success: true,
      message: 'Collection import completed',
      statistics: {
        total: allReleases.length,
        imported,
        skipped,
        errors,
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


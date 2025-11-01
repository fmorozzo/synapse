import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getDiscogsOAuthClient } from '@/lib/discogs/oauth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  console.log('🔥 OAuth callback route HIT - URL:', request.url);
  try {
    console.log('OAuth callback - Starting...');
    const supabase = await createServerSupabaseClient();
    
    // Check if user is authenticated
    console.log('OAuth callback - Checking user authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('OAuth callback - Auth error:', authError);
      return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }
    console.log('OAuth callback - User authenticated:', user.id);

    // Get OAuth parameters from callback
    const searchParams = request.nextUrl.searchParams;
    const oauth_token = searchParams.get('oauth_token');
    const oauth_verifier = searchParams.get('oauth_verifier');

    console.log('OAuth callback - Parameters:', { 
      oauth_token: oauth_token?.substring(0, 10) + '...', 
      oauth_verifier: oauth_verifier?.substring(0, 10) + '...' 
    });

    if (!oauth_token || !oauth_verifier) {
      console.error('OAuth callback - Missing parameters');
      throw new Error('Missing OAuth parameters');
    }

    // Get token secret from cookies
    const cookieStore = await cookies();
    const oauth_token_secret = cookieStore.get('discogs_oauth_token_secret')?.value;

    console.log('OAuth callback - Cookie found:', !!oauth_token_secret);

    if (!oauth_token_secret) {
      console.error('OAuth callback - Token secret not found in cookies');
      throw new Error('OAuth token secret not found');
    }

    // Get access token
    console.log('OAuth callback - Getting access token from Discogs...');
    const oauthClient = getDiscogsOAuthClient();
    const { oauth_token: access_token, oauth_token_secret: access_token_secret, username } = 
      await oauthClient.getAccessToken(oauth_token, oauth_token_secret, oauth_verifier);

    console.log('OAuth callback - Access token received, username:', username);

    // Store in database
    console.log('OAuth callback - Updating database...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        discogs_username: username,
        discogs_token: access_token,
        discogs_token_secret: access_token_secret,
        discogs_connected: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('OAuth callback - Database update error:', updateError);
      throw updateError;
    }

    console.log('OAuth callback - Database updated successfully');

    // Clear temporary cookie
    cookieStore.delete('discogs_oauth_token_secret');

    // Redirect to settings with success message
    return NextResponse.redirect(
      new URL('/dashboard/settings?discogs=connected', request.url)
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('OAuth callback error details:', errorMessage);
    return NextResponse.redirect(
      new URL(`/dashboard/settings?error=oauth_callback_failed&details=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}


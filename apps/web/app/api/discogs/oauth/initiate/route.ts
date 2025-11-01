import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getDiscogsOAuthClient } from '@/lib/discogs/oauth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('OAuth initiate - Starting...');
    const supabase = await createServerSupabaseClient();
    
    // Check if user is authenticated
    console.log('OAuth initiate - Checking user authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('OAuth initiate - Auth error:', authError);
      return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }
    console.log('OAuth initiate - User authenticated:', user.id);

    // Get OAuth client
    console.log('OAuth initiate - Creating OAuth client...');
    const oauthClient = getDiscogsOAuthClient();

    // Get request token
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/discogs/oauth/callback`;
    console.log('OAuth initiate - Callback URL:', callbackUrl);
    console.log('OAuth initiate - Getting request token from Discogs...');
    
    const { oauth_token, oauth_token_secret, authorize_url } = 
      await oauthClient.getRequestToken(callbackUrl);

    console.log('OAuth initiate - Request token received:', oauth_token.substring(0, 10) + '...');
    console.log('OAuth initiate - Authorize URL:', authorize_url);

    // Store token secret in cookies temporarily (needed for step 2)
    const cookieStore = await cookies();
    cookieStore.set('discogs_oauth_token_secret', oauth_token_secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    console.log('OAuth initiate - Cookie set, redirecting to Discogs...');

    // Redirect to Discogs authorization page
    return NextResponse.redirect(authorize_url);
  } catch (error) {
    console.error('OAuth initiate error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('OAuth initiate error details:', errorMessage);
    return NextResponse.redirect(
      new URL(`/dashboard/settings?error=oauth_failed&details=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}


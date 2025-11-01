import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

const DISCOGS_REQUEST_TOKEN_URL = 'https://api.discogs.com/oauth/request_token';
const DISCOGS_AUTHORIZE_URL = 'https://www.discogs.com/oauth/authorize';
const DISCOGS_ACCESS_TOKEN_URL = 'https://api.discogs.com/oauth/access_token';

export class DiscogsOAuthClient {
  private oauth: OAuth;
  private consumerKey: string;
  private consumerSecret: string;

  constructor(consumerKey: string, consumerSecret: string) {
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;

    this.oauth = new OAuth({
      consumer: {
        key: consumerKey,
        secret: consumerSecret,
      },
      signature_method: 'PLAINTEXT',
      hash_function: (base_string: string, key: string) => key,
    });
  }

  /**
   * Step 1: Get request token
   */
  async getRequestToken(callbackUrl: string): Promise<{
    oauth_token: string;
    oauth_token_secret: string;
    authorize_url: string;
  }> {
    console.log('DiscogsOAuth - getRequestToken called with callback:', callbackUrl);
    const requestData = {
      url: DISCOGS_REQUEST_TOKEN_URL,
      method: 'GET',
      data: {
        oauth_callback: callbackUrl,
      },
    };

    const authHeader = this.oauth.toHeader(
      this.oauth.authorize(requestData)
    );

    console.log('DiscogsOAuth - Making GET request to Discogs request_token endpoint...');
    const response = await fetch(requestData.url + '?oauth_callback=' + encodeURIComponent(callbackUrl), {
      method: 'GET',
      headers: {
        ...authHeader,
        'User-Agent': 'Synapse/1.0',
      },
    });

    console.log('DiscogsOAuth - Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DiscogsOAuth - Discogs API error:', errorText);
      throw new Error(`Failed to get request token: ${response.status} - ${errorText}`);
    }

    const text = await response.text();
    console.log('DiscogsOAuth - Response received:', text.substring(0, 100) + '...');
    const params = new URLSearchParams(text);

    const oauth_token = params.get('oauth_token');
    const oauth_token_secret = params.get('oauth_token_secret');

    console.log('DiscogsOAuth - Parsed tokens:', { 
      hasToken: !!oauth_token, 
      hasSecret: !!oauth_token_secret 
    });

    if (!oauth_token || !oauth_token_secret) {
      console.error('DiscogsOAuth - Invalid response, missing tokens');
      throw new Error('Invalid response from Discogs');
    }

    return {
      oauth_token,
      oauth_token_secret,
      authorize_url: `${DISCOGS_AUTHORIZE_URL}?oauth_token=${oauth_token}`,
    };
  }

  /**
   * Step 2: Get access token
   */
  async getAccessToken(
    oauth_token: string,
    oauth_token_secret: string,
    oauth_verifier: string
  ): Promise<{
    oauth_token: string;
    oauth_token_secret: string;
    username: string;
  }> {
    console.log('DiscogsOAuth - getAccessToken called');
    const requestData = {
      url: DISCOGS_ACCESS_TOKEN_URL,
      method: 'POST',
      data: {
        oauth_verifier,
      },
    };

    const token = {
      key: oauth_token,
      secret: oauth_token_secret,
    };

    const authHeader = this.oauth.toHeader(
      this.oauth.authorize(requestData, token)
    );

    console.log('DiscogsOAuth - Making POST request to Discogs...');
    const response = await fetch(requestData.url, {
      method: 'POST',
      headers: {
        ...authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Synapse/1.0',
      },
      body: `oauth_verifier=${oauth_verifier}`,
    });

    console.log('DiscogsOAuth - Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DiscogsOAuth - Discogs API error:', errorText);
      throw new Error(`Failed to get access token: ${response.status} - ${errorText}`);
    }

    const text = await response.text();
    console.log('DiscogsOAuth - Response received:', text.substring(0, 100) + '...');
    const params = new URLSearchParams(text);

    const access_token = params.get('oauth_token');
    const access_token_secret = params.get('oauth_token_secret');
    const username = params.get('username');

    console.log('DiscogsOAuth - Parsed tokens:', { 
      hasToken: !!access_token, 
      hasSecret: !!access_token_secret, 
      username 
    });

    if (!access_token || !access_token_secret) {
      console.error('DiscogsOAuth - Invalid response, missing tokens');
      throw new Error('Invalid access token response');
    }

    return {
      oauth_token: access_token,
      oauth_token_secret: access_token_secret,
      username: username || '',
    };
  }

  /**
   * Make authenticated request to Discogs API
   */
  async makeRequest(
    url: string,
    oauth_token: string,
    oauth_token_secret: string,
    method: 'GET' | 'POST' = 'GET'
  ) {
    console.log('DiscogsOAuth - makeRequest:', { url, method });
    const requestData = {
      url,
      method,
    };

    const token = {
      key: oauth_token,
      secret: oauth_token_secret,
    };

    const authHeader = this.oauth.toHeader(
      this.oauth.authorize(requestData, token)
    );

    const response = await fetch(url, {
      method,
      headers: {
        ...authHeader,
        'User-Agent': 'Synapse/1.0',
      },
    });

    console.log('DiscogsOAuth - Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('DiscogsOAuth - Error response:', errorBody);
      throw new Error(`Discogs API error: ${response.statusText} - ${errorBody}`);
    }

    return response.json();
  }
}

// Singleton instance
let discogsOAuthClient: DiscogsOAuthClient | null = null;

export function getDiscogsOAuthClient(): DiscogsOAuthClient {
  if (!discogsOAuthClient) {
    const consumerKey = process.env.DISCOGS_CONSUMER_KEY;
    const consumerSecret = process.env.DISCOGS_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
      throw new Error('Discogs OAuth credentials not configured');
    }

    discogsOAuthClient = new DiscogsOAuthClient(consumerKey, consumerSecret);
  }

  return discogsOAuthClient;
}


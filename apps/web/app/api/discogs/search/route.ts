import { NextRequest, NextResponse } from 'next/server';
import { getDiscogsClient } from '@/lib/discogs/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const discogs = getDiscogsClient();
    const results = await discogs.search(query, type || undefined, page, perPage);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Discogs search error:', error);
    return NextResponse.json(
      { error: 'Failed to search Discogs' },
      { status: 500 }
    );
  }
}


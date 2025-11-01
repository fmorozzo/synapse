import { NextRequest, NextResponse } from 'next/server';
import { getDiscogsClient } from '@/lib/discogs/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const releaseId = parseInt(id);

    if (isNaN(releaseId)) {
      return NextResponse.json(
        { error: 'Invalid release ID' },
        { status: 400 }
      );
    }

    const discogs = getDiscogsClient();
    const release = await discogs.getRelease(releaseId);

    return NextResponse.json(release);
  } catch (error) {
    console.error('Discogs release error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch release' },
      { status: 500 }
    );
  }
}


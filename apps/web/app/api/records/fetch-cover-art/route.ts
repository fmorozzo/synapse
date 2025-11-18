/**
 * API Route: Fetch Missing Cover Art
 * 
 * POST /api/records/fetch-cover-art
 * 
 * Fetches cover art from Spotify for records without images
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fetchCoverArt } from '@/lib/spotify/cover-art';

export async function POST(request: NextRequest) {
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
    
    const { recordId, recordIds } = await request.json();
    
    if (recordId) {
      // Single record
      const result = await fetchCoverArtForRecord(supabase, recordId);
      return NextResponse.json({ success: true, result });
    } else if (recordIds && Array.isArray(recordIds)) {
      // Batch
      const results = await Promise.all(
        recordIds.map(id => fetchCoverArtForRecord(supabase, id))
      );
      return NextResponse.json({ success: true, results });
    } else {
      return NextResponse.json(
        { error: 'Missing recordId or recordIds' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Error fetching cover art:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch cover art',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function fetchCoverArtForRecord(supabase: any, recordId: string) {
  try {
    // Get record
    const { data: record, error } = await supabase
      .from('records')
      .select('id, artist, title, cover_image_url')
      .eq('id', recordId)
      .single();
    
    if (error || !record) {
      return { recordId, success: false, error: 'Record not found' };
    }
    
    // Skip if already has cover
    if (record.cover_image_url) {
      return { recordId, success: false, reason: 'Already has cover art' };
    }
    
    // Fetch from Spotify
    const coverUrl = await fetchCoverArt(record.artist, record.title);
    
    if (!coverUrl) {
      return { recordId, success: false, reason: 'No cover art found on Spotify' };
    }
    
    // Update record
    const { error: updateError } = await supabase
      .from('records')
      .update({ cover_image_url: coverUrl })
      .eq('id', recordId);
    
    if (updateError) {
      return { recordId, success: false, error: updateError.message };
    }
    
    return { recordId, success: true, coverUrl };
    
  } catch (error) {
    return {
      recordId,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get record details
    const { data: record, error: recordError } = await supabase
      .from('records')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (recordError || !record) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    // Try to get tracks for this record
    let tracks = [];
    try {
      const { data: tracksData } = await supabase
        .from('tracks')
        .select('*')
        .eq('release_id', params.id)
        .order('position', { ascending: true });

      tracks = tracksData || [];
    } catch (err) {
      // Tracks table might not exist yet
      console.log('Tracks table not found, skipping');
    }

    return NextResponse.json({
      record,
      tracks,
    });
  } catch (error) {
    console.error('Get record error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch record' },
      { status: 500 }
    );
  }
}

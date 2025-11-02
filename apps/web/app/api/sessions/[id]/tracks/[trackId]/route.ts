import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; trackId: string } }
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

    // Verify session belongs to user
    const { data: session } = await supabase
      .from('sessions')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Delete session track
    const { error: deleteError } = await supabase
      .from('session_tracks')
      .delete()
      .eq('id', params.trackId)
      .eq('session_id', params.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove track from session error:', error);
    return NextResponse.json(
      { error: 'Failed to remove track from session' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(
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

    const body = await request.json();
    const { enabled } = body;

    // Update record to set relations_enabled
    // Note: This field needs to be added to the records table
    // For now, we'll store it in the notes field as a workaround
    const { data: record, error: updateError } = await supabase
      .from('records')
      .update({
        notes: enabled ? null : '__RELATIONS_DISABLED__',
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ 
      success: true,
      enabled: !record.notes?.includes('__RELATIONS_DISABLED__')
    });
  } catch (error) {
    console.error('Toggle relations error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle relations' },
      { status: 500 }
    );
  }
}


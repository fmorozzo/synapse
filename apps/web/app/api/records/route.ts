import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUserRecords, createRecord } from '@synapse/supabase';
import { CreateRecordInputSchema } from '@synapse/shared';

export async function GET(request: NextRequest) {
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

    // Get search query if provided
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (query) {
      // Search records
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json(data);
    }

    // Get all records
    const records = await getUserRecords(supabase, user.id);
    return NextResponse.json({ records });
  } catch (error) {
    console.error('Get records error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    
    // Validate input
    const validatedInput = CreateRecordInputSchema.parse(body);

    // Create record
    const record = await createRecord(supabase, user.id, validatedInput);

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Create record error:', error);
    return NextResponse.json(
      { error: 'Failed to create record' },
      { status: 500 }
    );
  }
}


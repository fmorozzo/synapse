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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const sourceFilter = searchParams.get('source') || 'discogs'; // Default to discogs
    const genres = searchParams.get('genres')?.split(',').filter(Boolean) || [];
    const genreMode = searchParams.get('genreMode') || 'any'; // 'any' or 'all'
    const sortBy = searchParams.get('sortBy') || 'dateAdded';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build the query
    let dbQuery = supabase
      .from('records')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .limit(10000); // Increase limit to 10,000

    // Filter by source
    if (sourceFilter !== 'all') {
      dbQuery = dbQuery.eq('import_source', sourceFilter);
    }

    // Filter by search query
    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,artist.ilike.%${query}%,label.ilike.%${query}%`);
    }

    // Filter by genres
    if (genres.length > 0) {
      if (genreMode === 'all') {
        // Records must have ALL selected genres
        dbQuery = dbQuery.contains('genres', genres);
      } else {
        // Records must have ANY of the selected genres
        dbQuery = dbQuery.overlaps('genres', genres);
      }
    }

    // Apply sorting
    const sortMapping: Record<string, { column: string; ascending: boolean }> = {
      'album': { column: 'title', ascending: sortOrder === 'asc' },
      'artist': { column: 'artist', ascending: sortOrder === 'asc' },
      'year': { column: 'year', ascending: sortOrder === 'asc' },
      'dateAdded': { column: 'created_at', ascending: sortOrder === 'asc' },
    };

    const sortConfig = sortMapping[sortBy] || sortMapping.dateAdded;
    dbQuery = dbQuery.order(sortConfig.column, { ascending: sortConfig.ascending });

    const { data, error, count } = await dbQuery;

    if (error) throw error;

    return NextResponse.json({ 
      records: data,
      count: count || 0,
      hasMore: (count || 0) > 10000
    });
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


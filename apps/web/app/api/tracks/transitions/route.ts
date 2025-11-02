import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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
    const { from_track_id, to_track_id, rating, worked_well, context, bpm_diff, key_compatible } = body;

    if (!from_track_id || !to_track_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get track details for BPM/key if not provided
    let calculatedBpmDiff = bpm_diff;
    let calculatedKeyCompatible = key_compatible;

    if (bpm_diff === undefined || key_compatible === undefined) {
      const { data: fromTrack } = await supabase
        .from('tracks')
        .select('bpm, key')
        .eq('id', from_track_id)
        .single();

      const { data: toTrack } = await supabase
        .from('tracks')
        .select('bpm, key')
        .eq('id', to_track_id)
        .single();

      if (fromTrack && toTrack) {
        if (fromTrack.bpm && toTrack.bpm) {
          calculatedBpmDiff = Math.abs(fromTrack.bpm - toTrack.bpm);
        }

        if (fromTrack.key && toTrack.key) {
          calculatedKeyCompatible = checkKeyCompatibility(fromTrack.key, toTrack.key);
        }
      }
    }

    // Create transition
    const { data: transition, error: insertError } = await supabase
      .from('track_transitions')
      .insert({
        user_id: user.id,
        from_track_id,
        to_track_id,
        rating: rating || null,
        worked_well: worked_well !== undefined ? worked_well : null,
        context: context || null,
        bpm_diff: calculatedBpmDiff,
        key_compatible: calculatedKeyCompatible,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert transition error:', insertError);
      throw insertError;
    }

    return NextResponse.json({ success: true, transition });
  } catch (error) {
    console.error('Create transition error:', error);
    return NextResponse.json(
      { error: 'Failed to create transition' },
      { status: 500 }
    );
  }
}

// Helper function to check key compatibility
function checkKeyCompatibility(key1: string, key2: string): boolean {
  const compatibleKeys: Record<string, string[]> = {
    'C': ['C', 'G', 'F', 'Am', 'Em', 'Dm'],
    'G': ['G', 'D', 'C', 'Em', 'Bm', 'Am'],
    'D': ['D', 'A', 'G', 'Bm', 'F#m', 'Em'],
    'A': ['A', 'E', 'D', 'F#m', 'C#m', 'Bm'],
    'E': ['E', 'B', 'A', 'C#m', 'G#m', 'F#m'],
    'Am': ['Am', 'Em', 'Dm', 'C', 'G', 'F'],
    'Em': ['Em', 'Bm', 'Am', 'G', 'D', 'C'],
    'Dm': ['Dm', 'Am', 'Gm', 'F', 'C', 'Bb'],
  };

  const key1Compatible = compatibleKeys[key1] || [key1];
  return key1Compatible.includes(key2);
}


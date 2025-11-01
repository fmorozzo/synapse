import type { SupabaseClient } from '../client';
import type { CreateRecordInput, UpdateRecordInput } from '@synapse/shared';

/**
 * Get all records for a user
 */
export async function getUserRecords(
  client: SupabaseClient,
  userId: string
) {
  const { data, error } = await client
    .from('records')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get a single record by ID
 */
export async function getRecordById(
  client: SupabaseClient,
  recordId: string,
  userId: string
) {
  const { data, error } = await client
    .from('records')
    .select('*')
    .eq('id', recordId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new record
 */
export async function createRecord(
  client: SupabaseClient,
  userId: string,
  input: CreateRecordInput
) {
  const { data, error } = await client
    .from('records')
    .insert({
      user_id: userId,
      ...input,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a record
 */
export async function updateRecord(
  client: SupabaseClient,
  recordId: string,
  userId: string,
  input: UpdateRecordInput
) {
  const { data, error } = await client
    .from('records')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', recordId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a record
 */
export async function deleteRecord(
  client: SupabaseClient,
  recordId: string,
  userId: string
) {
  const { error } = await client
    .from('records')
    .delete()
    .eq('id', recordId)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Search records by title or artist
 */
export async function searchRecords(
  client: SupabaseClient,
  userId: string,
  query: string
) {
  const { data, error } = await client
    .from('records')
    .select('*')
    .eq('user_id', userId)
    .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get collection statistics
 */
export async function getCollectionStats(
  client: SupabaseClient,
  userId: string
) {
  const { data: records, error } = await client
    .from('records')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;

  // Calculate statistics
  const stats = {
    total_records: records.length,
    total_value: records.reduce((sum, record) => sum + (record.purchase_price || 0), 0),
    genres_count: {} as Record<string, number>,
    formats_count: {} as Record<string, number>,
    by_year: {} as Record<string, number>,
  };

  records.forEach((record) => {
    // Count genres
    if (record.genres) {
      record.genres.forEach((genre) => {
        stats.genres_count[genre] = (stats.genres_count[genre] || 0) + 1;
      });
    }

    // Count formats
    if (record.format) {
      stats.formats_count[record.format] = (stats.formats_count[record.format] || 0) + 1;
    }

    // Count by year
    if (record.year) {
      const yearKey = record.year.toString();
      stats.by_year[yearKey] = (stats.by_year[yearKey] || 0) + 1;
    }
  });

  return stats;
}


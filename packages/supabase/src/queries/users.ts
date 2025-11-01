import type { SupabaseClient } from '../client';
import type { UpdateUserProfileInput } from '@synapse/shared';

/**
 * Get user profile by ID
 */
export async function getUserProfile(
  client: SupabaseClient,
  userId: string
) {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create or update user profile
 */
export async function upsertUserProfile(
  client: SupabaseClient,
  userId: string,
  input: UpdateUserProfileInput
) {
  const { data, error } = await client
    .from('profiles')
    .upsert({
      id: userId,
      ...input,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  client: SupabaseClient,
  userId: string,
  input: UpdateUserProfileInput
) {
  const { data, error } = await client
    .from('profiles')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}


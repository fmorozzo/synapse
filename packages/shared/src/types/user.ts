import { z } from 'zod';

// User Profile Schema
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().optional(),
  avatar_url: z.string().optional(),
  discogs_username: z.string().optional(),
  discogs_connected: z.boolean().default(false),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    currency: z.string().default('USD'),
    default_condition: z.string().optional(),
  }).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// Update User Profile Input
export const UpdateUserProfileInputSchema = UserProfileSchema.partial().omit({
  id: true,
  email: true,
  created_at: true,
  updated_at: true,
});

export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileInputSchema>;


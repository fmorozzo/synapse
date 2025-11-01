import { z } from 'zod';

// User's Record in Collection
export const RecordSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  discogs_release_id: z.number(),
  title: z.string(),
  artist: z.string(),
  year: z.number().optional(),
  format: z.string().optional(),
  label: z.string().optional(),
  catalog_number: z.string().optional(),
  cover_image_url: z.string().optional(),
  genres: z.array(z.string()).optional(),
  styles: z.array(z.string()).optional(),
  notes: z.string().optional(),
  condition: z.enum(['mint', 'near_mint', 'very_good_plus', 'very_good', 'good_plus', 'good', 'fair', 'poor']).optional(),
  purchase_date: z.string().optional(),
  purchase_price: z.number().optional(),
  purchase_currency: z.string().optional(),
  location: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Record = z.infer<typeof RecordSchema>;

// Create Record Input (without generated fields)
export const CreateRecordInputSchema = RecordSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type CreateRecordInput = z.infer<typeof CreateRecordInputSchema>;

// Update Record Input
export const UpdateRecordInputSchema = RecordSchema.partial().omit({
  id: true,
  user_id: true,
  created_at: true,
});

export type UpdateRecordInput = z.infer<typeof UpdateRecordInputSchema>;

// Collection Statistics
export const CollectionStatsSchema = z.object({
  total_records: z.number(),
  total_value: z.number().optional(),
  genres_count: z.record(z.number()),
  formats_count: z.record(z.number()),
  by_year: z.record(z.number()),
});

export type CollectionStats = z.infer<typeof CollectionStatsSchema>;


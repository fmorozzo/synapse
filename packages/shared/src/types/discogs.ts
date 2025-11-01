import { z } from 'zod';

// Discogs Release Schema
export const DiscogsReleaseSchema = z.object({
  id: z.number(),
  title: z.string(),
  artists: z.array(z.object({
    name: z.string(),
    id: z.number(),
  })),
  year: z.number().optional(),
  genres: z.array(z.string()).optional(),
  styles: z.array(z.string()).optional(),
  formats: z.array(z.object({
    name: z.string(),
    qty: z.string().optional(),
    descriptions: z.array(z.string()).optional(),
  })).optional(),
  labels: z.array(z.object({
    name: z.string(),
    catno: z.string().optional(),
  })).optional(),
  cover_image: z.string().optional(),
  thumb: z.string().optional(),
  resource_url: z.string().optional(),
});

export type DiscogsRelease = z.infer<typeof DiscogsReleaseSchema>;

// Discogs Search Result Schema
export const DiscogsSearchResultSchema = z.object({
  id: z.number(),
  type: z.string(),
  title: z.string(),
  thumb: z.string().optional(),
  cover_image: z.string().optional(),
  resource_url: z.string(),
  year: z.string().optional(),
  format: z.array(z.string()).optional(),
  label: z.array(z.string()).optional(),
  genre: z.array(z.string()).optional(),
  style: z.array(z.string()).optional(),
  country: z.string().optional(),
});

export type DiscogsSearchResult = z.infer<typeof DiscogsSearchResultSchema>;

// Discogs Artist Schema
export const DiscogsArtistSchema = z.object({
  id: z.number(),
  name: z.string(),
  realname: z.string().optional(),
  profile: z.string().optional(),
  images: z.array(z.object({
    type: z.string(),
    uri: z.string(),
    width: z.number(),
    height: z.number(),
  })).optional(),
  resource_url: z.string().optional(),
});

export type DiscogsArtist = z.infer<typeof DiscogsArtistSchema>;


import { z } from 'zod';

// Common API response shapes
export const ErrorResponse = z.object({
  error: z.string(),
  details: z.any().optional(),
});
export type ErrorResponse = z.infer<typeof ErrorResponse>;

export const ServerStatus = z.object({
  ok: z.boolean(),
  tvConnected: z.boolean().optional(),
  host: z.string().optional(),
});
export type ServerStatus = z.infer<typeof ServerStatus>;

export const PairStartResponse = z.object({
  pairingRequired: z.boolean(),
  message: z.string().optional(),
});
export type PairStartResponse = z.infer<typeof PairStartResponse>;

export const ArtListItem = z.object({
  id: z.string(),
  title: z.string().optional(),
  createdAt: z.string().optional(),
});
export type ArtListItem = z.infer<typeof ArtListItem>;

export const UploadResult = z.object({
  id: z.string().optional(),
  status: z.literal('queued').or(z.literal('done')).or(z.literal('error')),
});
export type UploadResult = z.infer<typeof UploadResult>;

export const BrightnessBody = z.object({
  value: z.number().int().min(0).max(100),
});
export type BrightnessBody = z.infer<typeof BrightnessBody>;

export const MatteBody = z.object({
  style: z.string(),
});
export type MatteBody = z.infer<typeof MatteBody>;

export const SelectArtBody = z.object({ id: z.string() });
export type SelectArtBody = z.infer<typeof SelectArtBody>;

export const UploadMeta = z.object({
  title: z.string().optional(),
});
export type UploadMeta = z.infer<typeof UploadMeta>;

import { z } from 'zod';

export const createCollectionSchema = z.object({
  name: z.string().trim().min(1, 'Please enter a collection name.'),
});

export const updateCollectionSchema = z.object({
  name: z.string().trim().min(1, 'Please enter a collection name.').optional(),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>
import { z } from 'zod';

export const createRecordSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1),
  date: z.string(),
  notes: z.string().optional(),
  email: z.string().email().optional(),
});


export const recordIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const userIdParamSchema = z.object({
  userId: z.string().uuid(),
});


export const updateRecordSchema = createRecordSchema.partial();
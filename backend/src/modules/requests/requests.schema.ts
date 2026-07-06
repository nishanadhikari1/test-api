import { z } from "zod";

export const createRequestSchema = z.object({
  name: z.string().min(1, "Empty name is not valid"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  url: z.string().url(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.any().optional(),
});

export const updateRequestSchema = z.object({
  name: z.string().min(1, "Empty name is not valid").optional(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).optional(),
  url: z.string().url().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.any().optional(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>
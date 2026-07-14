import { z } from "zod";

export const createRequestSchema = z.object({
  name: z.string().trim().min(1, "Please enter a request name."),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"], {
    message: "Please choose a valid HTTP method.",
  }),
  url: z.string().url("Please enter a valid request URL."),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.any().optional(),
});

export const updateRequestSchema = z.object({
  name: z.string().trim().min(1, "Please enter a request name.").optional(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"], {
    message: "Please choose a valid HTTP method.",
  }).optional(),
  url: z.string().url("Please enter a valid request URL.").optional(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.any().optional(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>
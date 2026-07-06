import {z} from 'zod'

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be of 8 characters"),
    name: z.string().optional()
})

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8, "Password must be of 8 characters")
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>


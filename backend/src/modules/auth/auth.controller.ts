import type {Request, Response} from 'express'
import { loginSchema, registerSchema } from './auth.schema'
import { loginUser, registerUser } from './auth.service'


export async function register(req:Request, res:Response){
    const parsed = registerSchema.safeParse(req.body)
    if(!parsed.success){
        return res.status(400).json({error:'Validation failed', details:parsed.error.issues})
    }
    try {
        const result = await registerUser(parsed.data)
        res.status(201).json(result)
        
    } catch (error) {
        res.status(409).json({error:(error as Error).message})
    }
}

export async function login(req:Request, res:Response){
    const parsed = loginSchema.safeParse(req.body)
    if(!parsed.success){
        return res.status(400).json({error:'Validation failed'})
    }

    try{
        const result = await loginUser(parsed.data)
        res.json(result)
    } catch(error){
        res.status(401).json({error: (error as Error).message})
    }
}



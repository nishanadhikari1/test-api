import jwt from 'jsonwebtoken'
import type {Request, Response, NextFunction} from 'express'
import {env} from '../config/env'

export function authMiddleware(req:Request, res:Response, next:NextFunction){
    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({error:'No token provided'})
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        return res.status(401).json({error: 'Invalid or expired token'})
    }
}
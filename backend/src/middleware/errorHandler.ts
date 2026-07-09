import type {Request, Response, NextFunction} from 'express'


export async function errorHandler(err:Error, req: Request, res:Response, next:NextFunction){
    console.error(err)

    res.status(500).json({
        error:"Something went wrong"
    })
}
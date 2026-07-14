import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {prisma} from '../../lib/prisma'
import {env} from '../../config/env'
import {RegisterInput, LoginInput} from './auth.schema'

export async function registerUser(input: RegisterInput){
    const existing = await prisma.user.findUnique({where:{email:input.email}})
    if(existing){
        throw new Error("An account with this email already exists.")
    }

    const passwordHash = await bcrypt.hash(input.password, 10)

    const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
    },
  });

  const token = jwt.sign({userId: user.id}, env.JWT_SECRET,{expiresIn:'1d'} )

  return ({user:{id:user.id, email:user.email, name:user.name}, token})
}

export async function loginUser(input: LoginInput){
    const user = await prisma.user.findUnique({where:{email:input.email}})
    if(!user){
        throw new Error('No account was found with this email address.')
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash)
    if(!valid){
        throw new Error('The password you entered is incorrect.')
    }

    const token = jwt.sign({userId:user.id}, env.JWT_SECRET, {expiresIn:'1d'})

    return ({user:{id:user.id, email:user.email, name: user.name}, token})
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });
}
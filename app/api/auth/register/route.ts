import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email уже используется' }, { status: 400 });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
    data: { email, name: name || email.split('@')[0], password: hashedPassword }
  });
  
  const token = jwt.sign({ userId: user.id }, 'secret-key', { expiresIn: '7d' });
  
  return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name } });
}
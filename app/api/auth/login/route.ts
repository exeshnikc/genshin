import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, password } = await req.json();
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
  }
  
  const token = jwt.sign({ userId: user.id }, 'secret-key', { expiresIn: '7d' });
  
  return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name } });
}
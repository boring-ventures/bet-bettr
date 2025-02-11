import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { id, email, name } = await request.json();

    // Try to find existing user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // If user doesn't exist, create new user
    if (!user) {
      user = await prisma.user.create({
        data: {
          id,
          email,
          name,
          role: 'user',
          organizationId: process.env.NEXT_PUBLIC_DEFAULT_ORG_ID!, // Make sure this env variable is set
          active: true,
        },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in get-or-create user:', error);
    return NextResponse.json(
      { error: 'Failed to process user' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 
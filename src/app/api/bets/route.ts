import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const bets = await prisma.bet.findMany({
      where: {
        userId,
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert Decimal to number for JSON serialization
    const serializedBets = bets.map(bet => ({
      ...bet,
      odds: Number(bet.odds),
      stake: Number(bet.stake),
    }));

    return NextResponse.json(serializedBets);
  } catch (error) {
    console.error("Error fetching bets:", error);
    return NextResponse.json(
      { error: "Failed to fetch bets" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const betData = await request.json();
    
    // Convert string numbers to Prisma Decimal
    const bet = {
      ...betData,
      odds: new Prisma.Decimal(betData.odds),
      stake: new Prisma.Decimal(betData.stake),
    };

    const newBet = await prisma.bet.create({
      data: bet,
    });

    // Convert Decimal to number for response
    const serializedBet = {
      ...newBet,
      odds: Number(newBet.odds),
      stake: Number(newBet.stake),
    };

    return NextResponse.json(serializedBet);
  } catch (error) {
    console.error("Error creating bet:", error);
    return NextResponse.json(
      { error: "Failed to create bet" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 
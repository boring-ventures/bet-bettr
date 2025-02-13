import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const moneyRolls = await prisma.moneyRoll.findMany({
      where: {
        userId,
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(moneyRolls);
  } catch (error) {
    console.error("Error fetching money rolls:", error);
    return NextResponse.json(
      { error: "Failed to fetch money rolls" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newRole = await prisma.moneyRoll.create({ data });
    return NextResponse.json(newRole);
  } catch (error) {
    console.error("Error creating money roll:", error);
    return NextResponse.json(
      { error: "Failed to create money roll" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const updatedRole = await prisma.moneyRoll.update({
      where: { id: data.id },
      data,
    });
    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error("Error updating money roll:", error);
    return NextResponse.json(
      { error: "Failed to update money roll" },
      { status: 500 }
    );
  }
} 
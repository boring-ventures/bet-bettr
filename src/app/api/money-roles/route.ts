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
    const moneyRoles = await prisma.moneyRole.findMany({
      where: {
        userId,
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(moneyRoles);
  } catch (error) {
    console.error("Error fetching money roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch money roles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newRole = await prisma.moneyRole.create({ data });
    return NextResponse.json(newRole);
  } catch (error) {
    console.error("Error creating money role:", error);
    return NextResponse.json(
      { error: "Failed to create money role" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const updatedRole = await prisma.moneyRole.update({
      where: { id: data.id },
      data,
    });
    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error("Error updating money role:", error);
    return NextResponse.json(
      { error: "Failed to update money role" },
      { status: 500 }
    );
  }
} 
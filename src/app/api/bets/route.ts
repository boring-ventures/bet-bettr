import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

interface Selection {
  odds: number;
  userId: string;
  moneyRollId?: string;
  statusResult?: string;
  id?: string;
  market: string;
  bettingHouse: string;
  sport: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const includeMoneyRoll = searchParams.get("includeMoneyRoll") === "true";

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const bets = await prisma.bet.findMany({
      where: {
        userId,
        active: true,
      },
      include: {
        moneyRoll: includeMoneyRoll, // Include money roll data if requested
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert Decimal to number for JSON serialization
    const serializedBets = bets.map((bet) => ({
      ...bet,
      odds: Number(bet.odds),
      stake: Number(bet.stake),
      moneyRollName: bet.moneyRoll?.name, // Include money roll name if available
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

    // Handle combined bets by creating multiple bet records
    if (betData.type === "Combined") {
      const combinedOdds = betData.selections.reduce(
        (acc: number, sel: Selection) => acc * Number(sel.odds),
        1
      );

      // Create individual bets for each selection
      const selections = await Promise.all(
        betData.selections.map((selection: Selection) =>
          prisma.bet.create({
            data: {
              ...selection,
              userId: betData.userId,
              moneyRollId: betData.moneyRollId,
              type: "Single",
              stake: new Prisma.Decimal(0),
              odds: new Prisma.Decimal(selection.odds),
              market: selection.market,
              bettingHouse: selection.bettingHouse,
              sport: selection.sport,
            },
          })
        )
      );

      // Create the main combined bet
      const combinedBet = await prisma.bet.create({
        data: {
          ...betData,
          odds: new Prisma.Decimal(combinedOdds),
          stake: new Prisma.Decimal(betData.stake),
          type: "Combined",
          market: "Combined", // You might want to store the individual markets somewhere
          sport: "Multiple", // You might want to store the individual sports somewhere
        },
      });

      return NextResponse.json({
        ...combinedBet,
        odds: Number(combinedBet.odds),
        stake: Number(combinedBet.stake),
        selections: selections.map((s) => ({
          ...s,
          odds: Number(s.odds),
          stake: Number(s.stake),
        })),
      });
    }

    // Handle single bets
    const bet = {
      ...betData,
      odds: new Prisma.Decimal(betData.odds),
      stake: new Prisma.Decimal(betData.stake),
    };

    const newBet = await prisma.bet.create({
      data: bet,
    });

    return NextResponse.json({
      ...newBet,
      odds: Number(newBet.odds),
      stake: Number(newBet.stake),
    });
  } catch (error) {
    console.error("Error creating bet:", error);
    return NextResponse.json(
      { error: "Failed to create bet" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const betData = await request.json();

    // Handle status updates
    if (betData.updateType === "status") {
      const updatedBet = await prisma.bet.update({
        where: { id: betData.id },
        data: {
          statusResult: betData.statusResult,
        },
      });

      return NextResponse.json({
        ...updatedBet,
        odds: Number(updatedBet.odds),
        stake: Number(updatedBet.stake),
      });
    }

    // Handle combined bet updates
    if (betData.type === "Combined" && betData.selections) {
      // Update individual selections
      await Promise.all(
        betData.selections.map((selection: Selection) =>
          prisma.bet.update({
            where: { id: selection.id },
            data: {
              statusResult: selection.statusResult,
              odds: new Prisma.Decimal(selection.odds),
            },
          })
        )
      );
    }

    // Update the main bet
    const bet = {
      ...betData,
      odds: new Prisma.Decimal(betData.odds),
      stake: new Prisma.Decimal(betData.stake),
    };

    const updatedBet = await prisma.bet.update({
      where: { id: bet.id },
      data: bet,
    });

    return NextResponse.json({
      ...updatedBet,
      odds: Number(updatedBet.odds),
      stake: Number(updatedBet.stake),
    });
  } catch (error) {
    console.error("Error updating bet:", error);
    return NextResponse.json(
      { error: "Failed to update bet" },
      { status: 500 }
    );
  }
}

// Update the PATCH method to handle status updates
export async function PATCH(request: Request) {
  try {
    const { id, statusResult } = await request.json();

    if (!id || !statusResult) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedBet = await prisma.bet.update({
      where: { id },
      data: {
        statusResult,
        updatedAt: new Date(),
      },
      include: {
        moneyRoll: true, // Include money roll to get the name
      },
    });

    // Convert Decimal values to numbers for JSON serialization
    return NextResponse.json({
      ...updatedBet,
      odds: Number(updatedBet.odds),
      stake: Number(updatedBet.stake),
      moneyRollName: updatedBet.moneyRoll?.name,
    });
  } catch (error) {
    console.error("Error updating bet status:", error);
    return NextResponse.json(
      { error: "Failed to update bet status" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 
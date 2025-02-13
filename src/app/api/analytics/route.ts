import { NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });

    // Use getUser instead of getSession for better security
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: {
        bets: {
          where: { active: true },
          orderBy: { createdAt: "desc" },
          include: {
            moneyRoll: true, // Include money roll data
          },
        },
        moneyRolls: {
          where: { active: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get unique sports and markets for filters
    const sports = [...new Set(dbUser.bets.map((bet) => bet.sport))];
    const markets = [...new Set(dbUser.bets.map((bet) => bet.market))];

    // Get summary statistics
    const totalBets = dbUser.bets.length;
    const completedBets = dbUser.bets.filter(
      (bet) => bet.statusResult !== "Pending"
    );
    const winningBets = completedBets.filter(
      (bet) => bet.statusResult === "Win"
    );
    const winRate = completedBets.length
      ? (winningBets.length / completedBets.length) * 100
      : 0;

    const totalStake = dbUser.bets.reduce(
      (sum, bet) => sum + Number(bet.stake),
      0
    );
    const totalProfit = dbUser.bets.reduce((sum, bet) => {
      if (bet.statusResult === "Win") {
        return sum + Number(bet.stake) * (Number(bet.odds) - 1);
      } else if (bet.statusResult === "Lose") {
        return sum - Number(bet.stake);
      }
      return sum;
    }, 0);

    // Add money roll statistics
    const moneyRollStats = dbUser.moneyRolls.map((roll) => {
      const rollBets = dbUser.bets.filter((bet) => bet.moneyRollId === roll.id);
      const rollCompletedBets = rollBets.filter(
        (bet) => bet.statusResult !== "Pending"
      );
      const rollWinningBets = rollCompletedBets.filter(
        (bet) => bet.statusResult === "Win"
      );

      return {
        id: roll.id,
        name: roll.name,
        totalBets: rollBets.length,
        winRate: rollCompletedBets.length
          ? (rollWinningBets.length / rollCompletedBets.length) * 100
          : 0,
        totalStake: rollBets.reduce((sum, bet) => sum + Number(bet.stake), 0),
        totalProfit: rollBets.reduce((sum, bet) => {
          if (bet.statusResult === "Win") {
            return sum + Number(bet.stake) * (Number(bet.odds) - 1);
          } else if (bet.statusResult === "Lose") {
            return sum - Number(bet.stake);
          }
          return sum;
        }, 0),
      };
    });

    return NextResponse.json({
      bets: dbUser.bets.map((bet) => ({
        ...bet,
        odds: Number(bet.odds),
        stake: Number(bet.stake),
        moneyRollName: bet.moneyRoll?.name,
      })),
      summary: {
        totalBets,
        winRate,
        totalStake,
        totalProfit,
        sports,
        markets,
      },
      moneyRolls: moneyRollStats,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Activity, DollarSign, Percent, TrendingUp } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { addDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import {
  filterBets,
  calculateTotalBets,
  calculateWinRate,
  calculateTotalStake,
  calculateAverageOdds,
  calculateProfitOverTime,
  calculateBetDistribution,
  type FilterOptions,
} from "@/lib/utils/analytics";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";

const chartConfig = {
  profit: {
    theme: {
      light: "hsl(142.1, 76.2%, 36.3%)",
      dark: "hsl(142.1, 76.2%, 36.3%)",
    },
  },
  distribution: {
    theme: {
      light: "hsl(142.1, 76.2%, 36.3%)",
      dark: "hsl(142.1, 76.2%, 36.3%)",
    },
  },
};

export default function DashboardPage() {
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      from: addDays(new Date(), -90),
      to: new Date(),
    },
    sport: "All Sports",
    market: "All Markets",
    statusResult: "All Results",
  });

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await fetch("/api/analytics?userId=current");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  const { bets = [], summary = {} } = analyticsData || {};
  const filteredBets = filterBets(bets, filters);
  const totalBets = calculateTotalBets(filteredBets);
  const winRate = calculateWinRate(filteredBets);
  const totalStake = calculateTotalStake(filteredBets);
  const averageOdds = calculateAverageOdds(filteredBets);
  const profitOverTime = calculateProfitOverTime(filteredBets);
  const betDistribution = calculateBetDistribution(filteredBets);

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <Card className="w-full md:w-auto">
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <DatePickerWithRange
                  value={filters.dateRange}
                  onChange={(newDateRange) => {
                    if (newDateRange && "from" in newDateRange) {
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: newDateRange,
                      }));
                    } else if (newDateRange === undefined) {
                      setFilters((prev) => ({ ...prev, dateRange: undefined }));
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <Select
                    value={filters.sport}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, sport: value }))
                    }
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Sport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Sports">All Sports</SelectItem>
                      {summary.sports?.map((sport: string) => (
                        <SelectItem key={sport} value={sport}>
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.market}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, market: value }))
                    }
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Market" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Markets">All Markets</SelectItem>
                      {summary.markets?.map((market: string) => (
                        <SelectItem key={market} value={market}>
                          {market}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFilters({
                        dateRange: {
                          from: addDays(new Date(), -90),
                          to: new Date(),
                        },
                        sport: "All Sports",
                        market: "All Markets",
                        statusResult: "All Results",
                      })
                    }
                    className="whitespace-nowrap"
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{winRate.toFixed(2)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stake</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalStake.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Odds
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageOdds.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="col-span-1 lg:col-span-2 overflow-hidden">
            <CardHeader>
              <CardTitle>Profit Over Time</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[300px] sm:h-[400px]">
                <ChartContainer className="h-full" config={chartConfig}>
                  <ResponsiveContainer>
                    <AreaChart data={profitOverTime}>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString()
                        }
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <ChartTooltip />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        stroke="var(--color-profit)"
                        fill="var(--color-profit)"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-x-auto">
            <CardHeader>
              <CardTitle>Recent Bets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Sport</TableHead>
                      <TableHead>Market</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBets.slice(0, 5).map((bet) => (
                      <TableRow key={bet.id}>
                        <TableCell>
                          {new Date(bet.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{bet.sport}</TableCell>
                        <TableCell>{bet.market}</TableCell>
                        <TableCell>{bet.statusResult}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bet Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[300px]">
                <ChartContainer className="h-full" config={chartConfig}>
                  <ResponsiveContainer>
                    <BarChart data={betDistribution}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip />
                      <Bar dataKey="value" fill="var(--color-distribution)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

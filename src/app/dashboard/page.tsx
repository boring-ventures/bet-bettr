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
import { ChartTooltip } from "@/components/ui/chart";
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
  ResponsiveContainer,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

// Update FilterOptions type to include moneyRoll
type FilterOptions = {
  dateRange: { from: Date; to: Date } | undefined;
  sport: string;
  market: string;
  statusResult: string;
  moneyRoll: string;
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
    moneyRoll: "All Money Rolls",
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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Sports Betting Analytics Dashboard</h1>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <Select
            value={filters.sport}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, sport: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Sports" />
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
            <SelectTrigger>
              <SelectValue placeholder="All Markets" />
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
          <Select
            value={filters.moneyRoll}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, moneyRoll: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Money Rolls" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Money Rolls">All Money Rolls</SelectItem>
              {analyticsData?.moneyRolls?.map((roll: any) => (
                <SelectItem key={roll.id} value={roll.id}>
                  {roll.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
              moneyRoll: "All Money Rolls",
            })
          }
          className="w-fit"
        >
          Reset Filters
        </Button>
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
            <CardTitle className="text-sm font-medium">Average Odds</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageOdds.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Profit Over Time</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={profitOverTime}>
                  <defs>
                    <linearGradient
                      id="profitGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#profitGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bet Distribution by Sport</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={betDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {betDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Bets</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead>Odds</TableHead>
                  <TableHead>Stake</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Money Roll</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBets.slice(0, 8).map((bet) => (
                  <TableRow key={bet.id}>
                    <TableCell>
                      {new Date(bet.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{bet.sport}</TableCell>
                    <TableCell>{bet.market}</TableCell>
                    <TableCell>{Number(bet.odds)}</TableCell>
                    <TableCell>
                      $
                      {isNaN(Number(bet.stake))
                        ? "0.00"
                        : Number(bet.stake).toFixed(2)}
                    </TableCell>
                    <TableCell>{bet.statusResult}</TableCell>
                    <TableCell>{bet.moneyRollName || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

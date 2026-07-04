"use client";

import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";
import type { CategoryBreakdownItem, MonthlySpendItem } from "@/lib/types";

type DashboardChartsProps = {
  categoryBreakdown: CategoryBreakdownItem[];
  monthlySpend: MonthlySpendItem[];
};

export function DashboardCharts({ categoryBreakdown, monthlySpend }: DashboardChartsProps) {
  const monthlyData = monthlySpend.map((item) => ({
    month: item.month,
    total: item.totalPence / 100,
    totalPence: item.totalPence,
  }));

  return (
    <section className="grid gap-4 xl:grid-cols-5">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryBreakdown.length ? (
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px] xl:grid-cols-1">
              <div className="h-72 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={96}
                      paddingAngle={2}
                    >
                      {categoryBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatMoney(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {categoryBreakdown.slice(0, 7).map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="font-medium">{formatMoney(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyChartState />
          )}
        </CardContent>
      </Card>

      <Card className="xl:col-span-3">
        <CardHeader>
          <CardTitle>Monthly Line Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ left: 8, right: 16, top: 12, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={12} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  tickFormatter={(value) => `£${value}`}
                  width={54}
                />
                <Tooltip
                  formatter={(_, __, props) => formatMoney(props.payload.totalPence)}
                  labelClassName="font-medium"
                  contentStyle={{
                    borderRadius: 8,
                    borderColor: "var(--border)",
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#0891b2"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#0891b2" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function EmptyChartState() {
  return (
    <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
      No expense data yet.
    </div>
  );
}

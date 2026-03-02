import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users, Eye, TrendingUp, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { supabase } from "@/integrations/supabase/client";

type Range = "7d" | "30d" | "90d";

function getDateRange(range: Range) {
  const end = new Date();
  const start = new Date();
  if (range === "7d") start.setDate(end.getDate() - 7);
  else if (range === "30d") start.setDate(end.getDate() - 30);
  else start.setDate(end.getDate() - 90);
  return {
    startdate: start.toISOString().split("T")[0],
    enddate: end.toISOString().split("T")[0],
    granularity: range === "7d" ? "hourly" as const : "daily" as const,
  };
}

export default function AdminAnalytics() {
  const [range, setRange] = useState<Range>("30d");
  const { startdate, enddate, granularity } = getDateRange(range);

  const { data: productCount } = useQuery({
    queryKey: ["admin-product-count"],
    queryFn: async () => {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: orderCount } = useQuery({
    queryKey: ["admin-order-count"],
    queryFn: async () => {
      const { count } = await supabase.from("orders").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: reviewCount } = useQuery({
    queryKey: ["admin-review-count"],
    queryFn: async () => {
      const { count } = await supabase.from("reviews").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["admin-recent-orders", range],
    queryFn: async () => {
      const { startdate } = getDateRange(range);
      const { data } = await supabase
        .from("orders")
        .select("created_at, total_usd")
        .gte("created_at", startdate)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  // Aggregate orders by day for chart
  const ordersByDay = recentOrders?.reduce((acc: Record<string, { date: string; orders: number; revenue: number }>, order) => {
    const day = order.created_at?.split("T")[0] ?? "";
    if (!acc[day]) acc[day] = { date: day, orders: 0, revenue: 0 };
    acc[day].orders += 1;
    acc[day].revenue += Number(order.total_usd) || 0;
    return acc;
  }, {});

  const chartData = Object.values(ordersByDay ?? {}).sort((a, b) => a.date.localeCompare(b.date));

  const totalRevenue = recentOrders?.reduce((sum, o) => sum + (Number(o.total_usd) || 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Overview of your store performance</p>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as Range)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{productCount ?? "—"}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Orders ({range})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{recentOrders?.length ?? "—"}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" /> Revenue ({range})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">${totalRevenue.toFixed(2)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" /> Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{reviewCount ?? "—"}</span>
          </CardContent>
        </Card>
      </div>

      {/* Orders Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Orders Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No order data for this period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time (USD)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No revenue data for this period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

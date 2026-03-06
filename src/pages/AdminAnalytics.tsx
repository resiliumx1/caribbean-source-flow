import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Package, ShoppingCart, DollarSign, Users, Star, BarChart3, MessageCircle, MousePointerClick, ArrowRightLeft, AlertTriangle } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line, FunnelChart, Funnel, LabelList,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

type Range = "7d" | "30d" | "90d" | "all";

function getDays(range: Range) {
  if (range === "7d") return 7;
  if (range === "30d") return 30;
  if (range === "90d") return 90;
  return 3650;
}

function getStartDate(range: Range) {
  const d = new Date();
  d.setDate(d.getDate() - getDays(range));
  return d.toISOString();
}

function getPrevStartDate(range: Range) {
  const days = getDays(range);
  const d = new Date();
  d.setDate(d.getDate() - days * 2);
  return d.toISOString();
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

const COLORS = {
  green: "#1c4a1c",
  gold: "#c8a84b",
  cream: "#f5f0e8",
  greenLight: "#2e6e2e",
  greenMuted: "#3a7a3a",
  amber: "#d97706",
  red: "#dc2626",
};

const PIE_COLORS = ["#1c4a1c", "#c8a84b", "#2e6e2e", "#8b6914", "#5aad5a", "#d4af37", "#7aa25b", "#a07040"];

export default function AdminAnalytics() {
  const [range, setRange] = useState<Range>("30d");
  const startDate = getStartDate(range);
  const prevStart = getPrevStartDate(range);
  const prevEnd = startDate;

  // ─── Data Queries ───
  const { data: productCount } = useQuery({
    queryKey: ["analytics-products"],
    queryFn: async () => {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true);
      return count ?? 0;
    },
  });

  const { data: currentOrders } = useQuery({
    queryKey: ["analytics-orders-current", range],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, created_at, total_usd, email, city, country, user_id")
        .gte("created_at", startDate)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  const { data: prevOrders } = useQuery({
    queryKey: ["analytics-orders-prev", range],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, total_usd, email")
        .gte("created_at", prevStart)
        .lt("created_at", prevEnd);
      return data ?? [];
    },
  });

  const { data: orderItems } = useQuery({
    queryKey: ["analytics-order-items", range],
    queryFn: async () => {
      const orderIds = currentOrders?.map(o => o.id) ?? [];
      if (!orderIds.length) return [];
      const { data } = await supabase
        .from("order_items")
        .select("product_id, product_name, quantity, price_usd, order_id")
        .in("order_id", orderIds);
      return data ?? [];
    },
    enabled: !!currentOrders,
  });

  const { data: products } = useQuery({
    queryKey: ["analytics-products-list"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id, name, slug, stock_status, category_id, product_type").eq("is_active", true);
      return data ?? [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["analytics-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("product_categories").select("id, name");
      return data ?? [];
    },
  });

  const { data: currentReviews } = useQuery({
    queryKey: ["analytics-reviews-current", range],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, rating, user_name, title, content, created_at, product_id, status")
        .gte("created_at", startDate)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: prevReviews } = useQuery({
    queryKey: ["analytics-reviews-prev", range],
    queryFn: async () => {
      const { count } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .gte("created_at", prevStart)
        .lt("created_at", prevEnd);
      return count ?? 0;
    },
  });

  const { data: allReviewsCount } = useQuery({
    queryKey: ["analytics-reviews-total"],
    queryFn: async () => {
      const { count } = await supabase.from("reviews").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: allReviews } = useQuery({
    queryKey: ["analytics-all-reviews-ratings"],
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("id, rating, created_at, status");
      return data ?? [];
    },
  });

  // ─── Chat Analytics ───
  const { data: chatEvents } = useQuery({
    queryKey: ["analytics-chat-events", range],
    queryFn: async () => {
      const { data } = await supabase
        .from("chat_analytics_events")
        .select("*")
        .gte("created_at", startDate)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: allChatSessions } = useQuery({
    queryKey: ["analytics-chat-sessions-all"],
    queryFn: async () => {
      const { count } = await supabase
        .from("chat_analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "session_start");
      return count ?? 0;
    },
  });

  // ─── Computed KPIs ───
  const totalRevenue = useMemo(() => currentOrders?.reduce((s, o) => s + (Number(o.total_usd) || 0), 0) ?? 0, [currentOrders]);
  const prevRevenue = useMemo(() => prevOrders?.reduce((s, o) => s + (Number(o.total_usd) || 0), 0) ?? 0, [prevOrders]);
  const orderCount = currentOrders?.length ?? 0;
  const prevOrderCount = prevOrders?.length ?? 0;
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;
  const prevAvgOrder = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0;
  const uniqueCustomers = useMemo(() => new Set(currentOrders?.map(o => o.email)).size, [currentOrders]);
  const prevUniqueCustomers = useMemo(() => new Set(prevOrders?.map(o => o.email)).size, [prevOrders]);

  // ─── Revenue by Day ───
  const revenueByDay = useMemo(() => {
    const map: Record<string, { date: string; revenue: number }> = {};
    currentOrders?.forEach(o => {
      const day = o.created_at?.split("T")[0] ?? "";
      if (!map[day]) map[day] = { date: day, revenue: 0 };
      map[day].revenue += Number(o.total_usd) || 0;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [currentOrders]);

  // ─── Top Products ───
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; units: number }> = {};
    orderItems?.forEach(item => {
      const key = item.product_name;
      if (!map[key]) map[key] = { name: key, revenue: 0, units: 0 };
      map[key].revenue += Number(item.price_usd) * item.quantity;
      map[key].units += item.quantity;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [orderItems]);

  // ─── Sales by Category ───
  const salesByCategory = useMemo(() => {
    const catMap = new Map(categories?.map(c => [c.id, c.name]) ?? []);
    const productCatMap = new Map(products?.map(p => [p.id, catMap.get(p.category_id ?? "") ?? p.product_type ?? "Other"]) ?? []);
    const map: Record<string, number> = {};
    orderItems?.forEach(item => {
      const cat = productCatMap.get(item.product_id) ?? "Other";
      map[cat] = (map[cat] || 0) + Number(item.price_usd) * item.quantity;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 })).sort((a, b) => b.value - a.value);
  }, [orderItems, products, categories]);

  // ─── Orders by Geography ───
  const ordersByGeo = useMemo(() => {
    const map: Record<string, number> = {};
    currentOrders?.forEach(o => {
      const country = o.country || "Unknown";
      map[country] = (map[country] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [currentOrders]);

  // ─── New vs Returning ───
  const newVsReturning = useMemo(() => {
    const allEmails = new Set<string>();
    const weekMap: Record<string, { week: string; new: number; returning: number }> = {};
    const sorted = [...(currentOrders ?? [])].sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));
    sorted.forEach(o => {
      const d = new Date(o.created_at ?? "");
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];
      if (!weekMap[weekKey]) weekMap[weekKey] = { week: weekKey, new: 0, returning: 0 };
      if (allEmails.has(o.email)) {
        weekMap[weekKey].returning++;
      } else {
        weekMap[weekKey].new++;
        allEmails.add(o.email);
      }
    });
    return Object.values(weekMap).sort((a, b) => a.week.localeCompare(b.week));
  }, [currentOrders]);

  // ─── Review Rating Trend ───
  const ratingTrend = useMemo(() => {
    const map: Record<string, { date: string; sum: number; count: number }> = {};
    currentReviews?.forEach(r => {
      const day = r.created_at?.split("T")[0] ?? "";
      if (!map[day]) map[day] = { date: day, sum: 0, count: 0 };
      map[day].sum += r.rating;
      map[day].count++;
    });
    return Object.values(map)
      .map(d => ({ date: d.date, rating: Math.round((d.sum / d.count) * 10) / 10 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [currentReviews]);

  const recentReviews = useMemo(() => {
    const productMap = new Map(products?.map(p => [p.id, p.name]) ?? []);
    return (currentReviews ?? []).slice(0, 5).map(r => ({
      ...r,
      productName: productMap.get(r.product_id) ?? "Unknown Product",
    }));
  }, [currentReviews, products]);

  // ─── Low Stock / Slow Movers ───
  const slowMovers = useMemo(() => {
    const soldIds = new Set(orderItems?.map(i => i.product_id) ?? []);
    return (products ?? []).filter(p => !soldIds.has(p.id));
  }, [products, orderItems]);

  // ─── Chat Analytics Computed ───
  const chatAnalytics = useMemo(() => {
    const events = chatEvents ?? [];
    const sessionStarts = events.filter(e => e.event_type === "session_start");
    const productClicks = events.filter(e => e.event_type === "product_click");
    const handoffs = events.filter(e => e.event_type === "whatsapp_handoff");

    // Top symptoms
    const symptomMap: Record<string, number> = {};
    events.filter(e => e.event_type === "symptom_query" && e.symptom).forEach(e => {
      const s = (e.symptom ?? "").toLowerCase().trim();
      if (s) symptomMap[s] = (symptomMap[s] || 0) + 1;
    });
    const topSymptoms = Object.entries(symptomMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const clickRate = sessionStarts.length > 0
      ? Math.round((productClicks.length / sessionStarts.length) * 100)
      : 0;

    return {
      periodSessions: sessionStarts.length,
      allTimeSessions: allChatSessions ?? 0,
      productClicks: productClicks.length,
      handoffs: handoffs.length,
      clickRate,
      topSymptoms,
    };
  }, [chatEvents, allChatSessions]);

  // ─── Review Intelligence ───
  const reviewIntelligence = useMemo(() => {
    const reviews = allReviews ?? [];
    const approved = reviews.filter(r => r.status === "approved");
    const avgRating = approved.length > 0
      ? approved.reduce((s, r) => s + r.rating, 0) / approved.length
      : 0;

    // Rating distribution
    const dist = [1, 2, 3, 4, 5].map(star => ({
      star: `${star}★`,
      count: approved.filter(r => r.rating === star).length,
    }));

    // Review velocity — last 12 weeks
    const now = new Date();
    const weeks: { week: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);
      const label = `W${12 - i}`;
      const count = approved.filter(r => {
        const d = new Date(r.created_at);
        return d >= weekStart && d < weekEnd;
      }).length;
      weeks.push({ week: label, count });
    }

    return { avgRating: Math.round(avgRating * 10) / 10, distribution: dist, velocity: weeks };
  }, [allReviews]);

  // ─── Revenue by Product Category (donut) ───
  const revenueByCategoryDonut = useMemo(() => {
    const catMap = new Map(categories?.map(c => [c.id, c.name]) ?? []);
    const productCatMap = new Map(products?.map(p => [p.id, catMap.get(p.category_id ?? "") ?? p.product_type ?? "Other"]) ?? []);
    const map: Record<string, number> = {};
    orderItems?.forEach(item => {
      const cat = productCatMap.get(item.product_id) ?? "Other";
      map[cat] = (map[cat] || 0) + Number(item.price_usd) * item.quantity;
    });
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100, pct: total > 0 ? Math.round((value / total) * 100) : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [orderItems, products, categories]);

  // ─── Inventory & Demand Alerts ───
  const inventoryAlerts = useMemo(() => {
    const soldIds = new Set(orderItems?.map(i => i.product_id) ?? []);
    // Products recommended in chat
    const chatRecommendedMap: Record<string, number> = {};
    (chatEvents ?? []).filter(e => e.event_type === "product_click" && e.product_name).forEach(e => {
      const name = e.product_name ?? "";
      chatRecommendedMap[name] = (chatRecommendedMap[name] || 0) + 1;
    });

    // Review counts per product
    const reviewCountMap: Record<string, number> = {};
    (currentReviews ?? []).forEach(r => {
      reviewCountMap[r.product_id] = (reviewCountMap[r.product_id] || 0) + 1;
    });

    return (products ?? []).map(p => {
      const noOrders = !soldIds.has(p.id);
      const chatRecs = chatRecommendedMap[p.name] ?? 0;
      const reviewCount = reviewCountMap[p.id] ?? 0;
      const highDemandNoSales = noOrders && chatRecs > 0;
      let severity: "red" | "amber" | "green" | "none" = "none";
      if (highDemandNoSales) severity = "red";
      else if (noOrders) severity = "amber";

      return { ...p, noOrders, chatRecs, reviewCount, severity };
    })
      .filter(p => p.severity !== "none" || p.reviewCount > 0)
      .sort((a, b) => {
        if (a.severity === "red" && b.severity !== "red") return -1;
        if (b.severity === "red" && a.severity !== "red") return 1;
        if (a.severity === "amber" && b.severity !== "amber") return -1;
        if (b.severity === "amber" && a.severity !== "amber") return 1;
        return b.reviewCount - a.reviewCount;
      })
      .slice(0, 20);
  }, [products, orderItems, chatEvents, currentReviews]);

  // ─── KPI Card ───
  const KPICard = ({ title, value, icon: Icon, change, prefix = "" }: {
    title: string; value: string | number; icon: any; change: number; prefix?: string;
  }) => (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
          <Icon className="h-4 w-4" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-bold text-foreground">{prefix}{value}</span>
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${change >= 0 ? "text-green-600" : "text-red-500"}`}>
            {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change >= 0 ? "+" : ""}{change}%
          </span>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm italic">
      {message}
    </div>
  );

  const CustomTooltipStyle = {
    backgroundColor: "#1a2e1e",
    border: "1px solid #3a7a3a",
    borderRadius: 8,
    color: "#dff0df",
    fontSize: 12,
    padding: "8px 12px",
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Performance overview for your store</p>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as Range)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Row 1 — KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Products" value={productCount ?? "—"} icon={Package} change={0} />
        <KPICard title="Orders" value={orderCount} icon={ShoppingCart} change={pctChange(orderCount, prevOrderCount)} />
        <KPICard title="Revenue" value={totalRevenue.toFixed(2)} icon={DollarSign} change={pctChange(totalRevenue, prevRevenue)} prefix="$" />
        <KPICard title="Avg Order" value={avgOrderValue.toFixed(2)} icon={BarChart3} change={pctChange(avgOrderValue, prevAvgOrder)} prefix="$" />
        <KPICard title="Customers" value={uniqueCustomers} icon={Users} change={pctChange(uniqueCustomers, prevUniqueCustomers)} />
        <KPICard title="Reviews" value={allReviewsCount ?? "—"} icon={Star} change={pctChange(currentReviews?.length ?? 0, prevReviews ?? 0)} />
      </div>

      {/* Row 2 — Revenue Over Time */}
      <Card>
        <CardHeader><CardTitle className="text-foreground">Revenue Over Time</CardTitle></CardHeader>
        <CardContent>
          {revenueByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueByDay}>
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={CustomTooltipStyle} formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke={COLORS.green} fill="url(#greenGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Orders will appear here once your store receives its first purchase." />
          )}
        </CardContent>
      </Card>

      {/* Row 3 — Top Products + Category Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-foreground">Top Products by Revenue</CardTitle></CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={topProducts} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => `$${v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} className="fill-muted-foreground" width={120} />
                  <Tooltip contentStyle={CustomTooltipStyle} formatter={(v: number, _: string, props: any) => [`$${v.toFixed(2)} (${props.payload.units} sold)`, "Revenue"]} />
                  <Bar dataKey="revenue" fill={COLORS.gold} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Product sales data will appear after your first order." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-foreground">Sales by Category</CardTitle></CardHeader>
          <CardContent>
            {salesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie data={salesByCategory} cx="50%" cy="45%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {salesByCategory.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CustomTooltipStyle} formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Category breakdown will appear after your first sale." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4 — New vs Returning + Geography */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-foreground">New vs Returning Customers</CardTitle></CardHeader>
          <CardContent>
            {newVsReturning.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={newVsReturning}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Bar dataKey="new" stackId="a" fill={COLORS.green} name="New" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="returning" stackId="a" fill={COLORS.gold} name="Returning" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Customer loyalty trends will show after your first orders." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-foreground">Orders by Geography</CardTitle></CardHeader>
          <CardContent>
            {ordersByGeo.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ordersByGeo} layout="vertical">
                  <defs>
                    <linearGradient id="geoGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={COLORS.green} />
                      <stop offset="100%" stopColor={COLORS.gold} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" width={80} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Bar dataKey="count" fill="url(#geoGrad)" radius={[0, 4, 4, 0]} name="Orders">
                    <LabelList dataKey="count" position="right" style={{ fontSize: 11, fill: COLORS.gold }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Geographic order data will appear here." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 5 — Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-foreground">Average Rating Trend</CardTitle></CardHeader>
          <CardContent>
            {ratingTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={ratingTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip contentStyle={CustomTooltipStyle} formatter={(v: number) => [v.toFixed(1), "Avg Rating"]} />
                  <Line type="monotone" dataKey="rating" stroke={COLORS.gold} strokeWidth={2} dot={{ fill: COLORS.gold, r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Review ratings will appear once customers leave reviews." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Recent Reviews</CardTitle>
            <a href="/admin/reviews" className="text-xs text-primary hover:underline">View All →</a>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentReviews.length > 0 ? recentReviews.map(r => (
              <div key={r.id} className="border border-border/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{r.created_at?.split("T")[0]}</span>
                </div>
                <p className="text-xs font-semibold text-foreground">{r.user_name} — <span className="font-normal text-muted-foreground">{r.productName}</span></p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.content}</p>
              </div>
            )) : (
              <EmptyState message="Reviews will appear here once customers leave feedback." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 6 — Slow Movers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Slow Movers — No Orders in Period</CardTitle>
        </CardHeader>
        <CardContent>
          {slowMovers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Stock Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slowMovers.slice(0, 15).map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground capitalize">{p.product_type}</TableCell>
                      <TableCell>
                        <Badge variant={p.stock_status === "in_stock" ? "default" : "destructive"} className="text-[10px]">
                          {p.stock_status === "in_stock" ? "In Stock" : p.stock_status ?? "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => window.open(`/shop/${p.slug}`, "_blank")}>
                          Promote
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState message="All products have been sold in this period — great job! 🎉" />
          )}
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════
          NEW SECTIONS BELOW
      ═══════════════════════════════════════════════════════════ */}

      {/* ─── AI Chat Analytics ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <MessageCircle className="h-5 w-5" style={{ color: COLORS.green }} />
            AI Chat Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-lg p-4" style={{ background: COLORS.cream }}>
              <p className="text-xs font-medium" style={{ color: COLORS.green }}>Sessions (All Time)</p>
              <p className="text-2xl font-bold" style={{ color: COLORS.green }}>{chatAnalytics.allTimeSessions}</p>
            </div>
            <div className="rounded-lg p-4" style={{ background: COLORS.cream }}>
              <p className="text-xs font-medium" style={{ color: COLORS.green }}>Sessions (Period)</p>
              <p className="text-2xl font-bold" style={{ color: COLORS.green }}>{chatAnalytics.periodSessions}</p>
            </div>
            <div className="rounded-lg p-4" style={{ background: COLORS.cream }}>
              <p className="text-xs font-medium flex items-center gap-1" style={{ color: COLORS.green }}>
                <MousePointerClick className="h-3 w-3" /> Chat→Shop Rate
              </p>
              <p className="text-2xl font-bold" style={{ color: COLORS.gold }}>{chatAnalytics.clickRate}%</p>
            </div>
            <div className="rounded-lg p-4" style={{ background: COLORS.cream }}>
              <p className="text-xs font-medium flex items-center gap-1" style={{ color: COLORS.green }}>
                <ArrowRightLeft className="h-3 w-3" /> WhatsApp Handoffs
              </p>
              <p className="text-2xl font-bold" style={{ color: COLORS.green }}>{chatAnalytics.handoffs}</p>
            </div>
          </div>

          <h4 className="text-sm font-semibold text-foreground mb-3">Top Symptoms / Conditions Asked</h4>
          {chatAnalytics.topSymptoms.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chatAnalytics.topSymptoms} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} className="fill-muted-foreground" width={140} />
                <Tooltip contentStyle={CustomTooltipStyle} />
                <Bar dataKey="count" fill={COLORS.gold} radius={[0, 4, 4, 0]} name="Queries">
                  <LabelList dataKey="count" position="right" style={{ fontSize: 11, fill: COLORS.gold }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Symptom tracking data will appear as users interact with the AI chat. Events are tracked automatically." />
          )}
        </CardContent>
      </Card>

      {/* ─── Review Intelligence ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Average Rating */}
        <Card>
          <CardHeader><CardTitle className="text-foreground">Average Rating</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <span className="text-5xl font-bold" style={{ color: COLORS.gold }}>
              {reviewIntelligence.avgRating > 0 ? reviewIntelligence.avgRating : "—"}
            </span>
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.round(reviewIntelligence.avgRating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{allReviewsCount ?? 0} total reviews</p>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <CardHeader><CardTitle className="text-foreground">Rating Distribution</CardTitle></CardHeader>
          <CardContent>
            {reviewIntelligence.distribution.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={reviewIntelligence.distribution} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis type="category" dataKey="star" tick={{ fontSize: 12 }} className="fill-muted-foreground" width={40} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Bar dataKey="count" fill={COLORS.gold} radius={[0, 4, 4, 0]} name="Reviews">
                    <LabelList dataKey="count" position="right" style={{ fontSize: 11, fill: COLORS.gold }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Rating data will appear once reviews are received." />
            )}
          </CardContent>
        </Card>

        {/* Review Velocity */}
        <Card>
          <CardHeader><CardTitle className="text-foreground">Review Velocity (12 weeks)</CardTitle></CardHeader>
          <CardContent>
            {reviewIntelligence.velocity.some(w => w.count > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={reviewIntelligence.velocity}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Line type="monotone" dataKey="count" stroke={COLORS.green} strokeWidth={2} dot={{ fill: COLORS.green, r: 3 }} name="Reviews" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Review velocity will appear over the next 12 weeks." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Revenue by Product Category (Donut) ─── */}
      <Card>
        <CardHeader><CardTitle className="text-foreground">Revenue by Product Category</CardTitle></CardHeader>
        <CardContent>
          {revenueByCategoryDonut.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={revenueByCategoryDonut}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={140}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, pct }) => `${name} (${pct}%)`}
                >
                  {revenueByCategoryDonut.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={CustomTooltipStyle}
                  formatter={(v: number, _name: string, props: any) => [
                    `$${v.toFixed(2)} (${props.payload.pct}%)`,
                    props.payload.name,
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Revenue category breakdown will appear after your first sale." />
          )}
        </CardContent>
      </Card>

      {/* ─── Inventory & Demand Alerts ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" style={{ color: COLORS.amber }} />
            Inventory & Demand Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inventoryAlerts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Chat Recs</TableHead>
                    <TableHead className="text-center">Reviews</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryAlerts.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>
                        {p.severity === "red" && (
                          <Badge className="text-[10px]" style={{ background: COLORS.red, color: "white" }}>High Demand / 0 Sales</Badge>
                        )}
                        {p.severity === "amber" && (
                          <Badge className="text-[10px]" style={{ background: COLORS.amber, color: "white" }}>No Orders</Badge>
                        )}
                        {p.severity === "none" && p.reviewCount > 0 && (
                          <Badge className="text-[10px]" style={{ background: COLORS.green, color: "white" }}>Most Reviewed</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground capitalize">{p.product_type}</TableCell>
                      <TableCell className="text-center text-foreground">{p.chatRecs}</TableCell>
                      <TableCell className="text-center text-foreground">{p.reviewCount}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => window.open(`/shop/${p.slug}`, "_blank")}>
                          Promote
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState message="Inventory alerts will appear as order and chat data accumulates." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

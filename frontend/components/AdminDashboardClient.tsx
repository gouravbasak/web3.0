"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { getApiBaseUrl, getAdminAuthHeaders } from "@/lib/apiBase";
import { useReactToPrint } from "react-to-print";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  LabelList,
  LineChart,
  Line as RechartsLine,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, Download, Filter, RefreshCw, Eye, EyeOff, Calendar, ChevronDown } from "lucide-react";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

/* ================= TYPES ================= */

type Product = {
  _id?: string;
  title: string;
  actualCost?: number;
  stock?: number;
};

type OrderItem = {
  productId: string;
  title: string;
  price: number;
  qty: number;
};

type Order = {
  _id?: string;
  items: OrderItem[];
  status?: string;
  createdAt?: string;
  payment?: { method?: string };
  paymentMethod?: string;
};

const API = getApiBaseUrl();

/* ================= BLUE GRADIENT ================= */
const BLUE_GRADIENT = [
  "#1E3A8A", // darkest blue
  "#1D4ED8",
  "#2563EB",
  "#3B82F6",
  "#93C5FD", // lightest blue
];

/* ================= COMPONENT ================= */

export default function AdminDashboardClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDateRange, setFilterDateRange] = useState("all");
  const [showExpenses, setShowExpenses] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const dashboardRef = useRef<HTMLDivElement | null>(null);

  /* ---------------- FETCH ---------------- */

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [p, o] = await Promise.all([
        fetch(`${API}/api/products`, { credentials: "include", 
          headers: getAdminAuthHeaders(),
         }).then((r) => r.json()),
        fetch(`${API}/api/orders`, { credentials: "include", 
          headers: getAdminAuthHeaders(),
         }).then((r) => r.json()),
      ]);
      setProducts(Array.isArray(p) ? p : []);
      setOrders(Array.isArray(o) ? o : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ---------------- FILTERING ---------------- */

  const filteredOrders = useMemo(() => {
    const valid = orders.filter((o) => o.status !== "Cancelled");
    
    if (filterDateRange === "all") return valid;
    
    const now = new Date();
    const filterDate = new Date();
    
    switch (filterDateRange) {
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return valid;
    }
    
    return valid.filter(order => {
      if (!order.createdAt) return false;
      return new Date(order.createdAt) >= filterDate;
    });
  }, [orders, filterDateRange]);

  const validOrders = useMemo(
    () => filteredOrders,
    [filteredOrders],
  );

  const productMap = useMemo(() => {
    const map: Record<string, Product> = {};
    products.forEach((p) => {
      if (p._id) map[p._id] = p;
    });
    return map;
  }, [products]);

  /* ================= KPI CALCULATIONS ================= */

  const totalProfit = useMemo(() => {
    let profit = 0;
    validOrders.forEach((o) =>
      o.items.forEach((i) => {
        const p = productMap[i.productId];
        if (p?.actualCost) {
          profit += (i.price - p.actualCost) * i.qty;
        }
      }),
    );
    return profit;
  }, [validOrders, productMap]);

  const currentMonthProfit = useMemo(() => {
    const now = new Date();
    let profit = 0;
    
    validOrders.forEach((o) => {
      if (!o.createdAt) return;
      const d = new Date(o.createdAt);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        o.items.forEach((i) => {
          const p = productMap[i.productId];
          if (p?.actualCost) {
            profit += (i.price - p.actualCost) * i.qty;
          }
        });
      }
    });
    
    return profit;
  }, [validOrders, productMap]);

  const inventoryExpense = useMemo(() => {
    return products.reduce((sum, p) => {
      if (!p.actualCost || !p.stock) return sum;
      return sum + p.actualCost * p.stock;
    }, 0);
  }, [products]);

  const totalRevenue = useMemo(() => {
    let revenue = 0;
    validOrders.forEach((o) =>
      o.items.forEach((i) => {
        revenue += i.price * i.qty;
      }),
    );
    return revenue;
  }, [validOrders]);

  const salesVsExpense = useMemo(() => {
    let sales = 0;
    let expense = 0;

    validOrders.forEach((o) =>
      o.items.forEach((i) => {
        sales += i.price * i.qty;
        const p = productMap[i.productId];
        if (p?.actualCost) expense += p.actualCost * i.qty;
      }),
    );

    return { sales, expense };
  }, [validOrders, productMap]);

  const salesExpenseChartData = useMemo(
    () => [
      {
        name: "Sales",
        value: salesVsExpense.sales,
        fill: "#10B981", // Emerald-500
      },
      {
        name: "Cost",
        value: salesVsExpense.expense,
        fill: "#EF4444", // Red-500
      },
    ],
    [salesVsExpense],
  );

  const salesExpenseChartConfig = {
    Sales: {
      label: "Sales",
      color: "#10B981",
    },
    Cost: {
      label: "Cost",
      color: "#EF4444",
    },
  } satisfies ChartConfig;

  const profitPercentage =
    salesVsExpense.sales > 0 ? (totalProfit / salesVsExpense.sales) * 100 : 0;

  /* ================= CHART DATA ================= */

  // Get current year dynamically
  const currentYear = new Date().getFullYear();
  
  // Generate available years from order data
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    orders.forEach(order => {
      if (order.createdAt) {
        years.add(new Date(order.createdAt).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [orders]);

  // Initialize selected year with current year if available
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const revenueByMonth = useMemo(() => {
    const months = Array(12).fill(0);
    validOrders.forEach((o) => {
      if (!o.createdAt) return;
      const d = new Date(o.createdAt);
      const year = d.getFullYear();
      
      // Filter by selected year
      if (year === selectedYear) {
        o.items.forEach((i) => {
          months[d.getMonth()] += i.price * i.qty;
        });
      }
    });
    return months;
  }, [validOrders, selectedYear]);

  const revenueChartData = useMemo(
    () => [
      { month: "Jan", revenue: revenueByMonth[0] || 0 },
      { month: "Feb", revenue: revenueByMonth[1] || 0 },
      { month: "Mar", revenue: revenueByMonth[2] || 0 },
      { month: "Apr", revenue: revenueByMonth[3] || 0 },
      { month: "May", revenue: revenueByMonth[4] || 0 },
      { month: "Jun", revenue: revenueByMonth[5] || 0 },
      { month: "Jul", revenue: revenueByMonth[6] || 0 },
      { month: "Aug", revenue: revenueByMonth[7] || 0 },
      { month: "Sep", revenue: revenueByMonth[8] || 0 },
      { month: "Oct", revenue: revenueByMonth[9] || 0 },
      { month: "Nov", revenue: revenueByMonth[10] || 0 },
      { month: "Dec", revenue: revenueByMonth[11] || 0 },
    ],
    [revenueByMonth],
  );

  const revenueChartConfig = {
    revenue: {
      label: "Revenue",
      color: "#3B82F6",
    },
  } satisfies ChartConfig;

  const projectionChartConfig = {
    value: {
      label: "Projected Sales",
      color: "#8B5CF6",
    },
  } satisfies ChartConfig;

  const ordersStatusPieConfig = {
    count: {
      label: "Orders",
    },
    Pending: { label: "Pending", color: BLUE_GRADIENT[0] },
    Processing: { label: "Processing", color: BLUE_GRADIENT[1] },
    Shipped: { label: "Shipped", color: BLUE_GRADIENT[2] },
    Delivered: { label: "Delivered", color: BLUE_GRADIENT[3] },
    Cancelled: { label: "Cancelled", color: BLUE_GRADIENT[4] },
  } satisfies ChartConfig;

  const projection = useMemo(() => {
    const now = new Date();
    const last3: number[] = [];

    for (let i = 2; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      let sum = 0;

      validOrders.forEach((o) => {
        if (!o.createdAt) return;
        const d = new Date(o.createdAt);
        if (
          d.getMonth() === m.getMonth() &&
          d.getFullYear() === m.getFullYear()
        ) {
          o.items.forEach((i) => (sum += i.price * i.qty));
        }
      });

      last3.push(sum);
    }

    const nonZero = last3.filter((v) => v > 0);
    if (nonZero.length <= 1) return Array(6).fill(nonZero[0] || 0);

    let growth = 0;
    for (let i = 1; i < last3.length; i++) {
      if (last3[i - 1] > 0) {
        growth += (last3[i] - last3[i - 1]) / last3[i - 1];
      }
    }
    growth /= last3.length - 1;
    growth = Math.min(Math.max(growth, -0.3), 0.3);

    let base = last3[last3.length - 1];
    return Array.from({ length: 6 }, () => {
      base = base * (1 + growth);
      return Math.round(base);
    });
  }, [validOrders]);

  const projectionChartData = useMemo(
    () => [
      { month: "M+1", value: projection[0] },
      { month: "M+2", value: projection[1] },
      { month: "M+3", value: projection[2] },
      { month: "M+4", value: projection[3] },
      { month: "M+5", value: projection[4] },
      { month: "M+6", value: projection[5] },
    ],
    [projection],
  );

  const mostSoldProducts = useMemo(() => {
    const map: Record<string, { title: string; qty: number; revenue: number }> =
      {};

    validOrders.forEach((o) =>
      o.items.forEach((i) => {
        if (!map[i.productId]) {
          map[i.productId] = {
            title: i.title,
            qty: 0,
            revenue: 0,
          };
        }
        map[i.productId].qty += i.qty;
        map[i.productId].revenue += i.qty * i.price;
      }),
    );

    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [validOrders]);

  const ordersByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      const s = o.status || "Pending";
      map[s] = (map[s] || 0) + 1;
    });
    return map;
  }, [orders]);

  const ordersStatusPieData = useMemo(
    () => {
      const statusOrder = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
      return statusOrder
        .filter(status => ordersByStatus[status])
        .map((status, index) => ({
          status,
          count: ordersByStatus[status],
          fill: BLUE_GRADIENT[index % BLUE_GRADIENT.length],
        }));
    },
    [ordersByStatus],
  );

  const paymentModes = useMemo(() => {
    const map = {
      COD: 0,
      Razorpay: 0,
      Other: 0,
    };

    validOrders.forEach((o) => {
      const raw = o.payment?.method || o.paymentMethod || "";

      const mode = raw.toString().toLowerCase();

      if (mode.includes("cod") || mode.includes("cash")) {
        map.COD += 1;
      } else if (mode.includes("razorpay") || mode.includes("online")) {
        map.Razorpay += 1;
      } else {
        map.Other += 1;
      }
    });

    return map;
  }, [validOrders]);

  /* ================= CUSTOM TOOLTIP STYLES ================= */

  const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-300">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ₹{Number(entry.value).toLocaleString('en-IN')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  /* ================= PRINT ================= */

  const handlePrint = useReactToPrint({
    contentRef: dashboardRef,
    documentTitle: "Admin Dashboard",
    pageStyle: `
    @media print {
      body {
        -webkit-print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
    }
  `,
  });

  /* ================= LOADING STATE ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header + CONTROLS */}
      <div className="sticky top-0 z-10 bg-[#1E293B] border-b border-gray-800 p-4 mb-6 rounded-lg no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">
              Real-time analytics and insights
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Filter */}
            <div className="flex items-center gap-2 bg-[#2D3748] px-3 py-2 rounded-lg">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            {/* Toggle Expenses */}
            <button
              onClick={() => setShowExpenses(!showExpenses)}
              className="flex items-center gap-2 bg-[#2D3748] hover:bg-[#374151] px-3 py-2 rounded-lg transition-colors"
            >
              {showExpenses ? (
                <Eye className="h-4 w-4 text-green-400" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm text-white">
                {showExpenses ? "Hide Expenses" : "Show Expenses"}
              </span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchData}
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 text-white ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="text-sm text-white">Refresh</span>
            </button>

            {/* Download PDF */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4 text-white" />
              <span className="text-sm text-white font-medium">Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD */}
      <div
        ref={dashboardRef}
        className="space-y-6 p-4 md:p-6 bg-[#0F172A] text-white"
      >
        {/* BUSINESS OVERVIEW CARDS - Reduced padding */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            Business Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Revenue"
              value={`₹${totalRevenue.toLocaleString("en-IN")}`}
              change={`+${profitPercentage.toFixed(1)}%`}
              icon="📈"
              color="blue"
              description="Total sales revenue"
            />

            <KPICard
              title="Total Profit"
              value={`₹${totalProfit.toLocaleString("en-IN")}`}
              change={`${profitPercentage.toFixed(2)}% margin`}
              icon="💰"
              color="green"
              description="Net profit after expenses"
            />

            <KPICard
              title="Current Month"
              value={`₹${currentMonthProfit.toLocaleString("en-IN")}`}
              change="This month"
              icon="📅"
              color="purple"
              description="Profit this month"
            />

            {showExpenses && (
              <KPICard
                title="Inventory Value"
                value={`₹${inventoryExpense.toLocaleString("en-IN")}`}
                change="Stock on hand"
                icon="📦"
                color="orange"
                description="Total inventory value"
              />
            )}
          </div>
        </section>

        {/* SALES TRENDS - Fixed chart heights and year selector */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
            Sales Trends & Analytics
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Revenue Chart - Fixed year selector */}
            <DashboardCard
              title="Monthly Revenue"
              subtitle={`Revenue by month for ${selectedYear}`}
              action={
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="appearance-none text-xs bg-[#1E293B] border border-gray-700 rounded pl-2 pr-6 py-1 focus:outline-none cursor-pointer"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                </div>
              }
            >
              <div className="h-48">
                <ChartContainer config={revenueChartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChartData}>
                      <CartesianGrid vertical={false} stroke="#334155" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                        tickFormatter={(value) => value >= 1000 ? `₹${(value/1000).toFixed(0)}K` : `₹${value}`}
                        width={40}
                      />
                      <Tooltip 
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="url(#blueGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.4}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </DashboardCard>

            {/* Sales vs Expense - Fixed chart display */}
            <DashboardCard
              title="Revenue vs Cost"
              subtitle="Sales revenue vs product costs"
              action={
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-gray-400">Sales</span>
                  <div className="w-2 h-2 rounded-full bg-red-500 ml-2"></div>
                  <span className="text-xs text-gray-400">Cost</span>
                </div>
              }
            >
              <div className="h-48 flex flex-col">
                {/* Pie Chart Container */}
                <div className="flex-1">
                  <ChartContainer
                    config={salesExpenseChartConfig}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip 
                          content={<CustomTooltip />}
                          formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                        />
                        <Pie
                          data={salesExpenseChartData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          label={(entry) => entry.name}
                          labelLine={false}
                        >
                          {salesExpenseChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                
                {/* Profit Margin Display */}
                <div className="mt-2 p-3 bg-[#1E293B] rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-gray-400">Profit Margin</div>
                      <div className="text-lg font-bold text-green-400">
                        {profitPercentage.toFixed(2)}%
                      </div>
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </div>
                </div>
              </div>
            </DashboardCard>

            {/* Sales Forecast - Fixed hover styling */}
            <DashboardCard
              title="Sales Forecast"
              subtitle="Next 6 months projection"
              action={
                <span className="text-xs text-emerald-400">
                  Based on last 3 months
                </span>
              }
            >
              <div className="h-48">
                <ChartContainer config={projectionChartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectionChartData}>
                      <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                        tickFormatter={(value) => value >= 1000 ? `₹${(value/1000).toFixed(0)}K` : `₹${value}`}
                        width={40}
                      />
                      <Tooltip 
                        content={<CustomTooltip />}
                        cursor={{ stroke: '#8B5CF6', strokeWidth: 1, strokeDasharray: '3 3' }}
                      />
                      <RechartsLine
                        type="monotone"
                        dataKey="value"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={{ fill: "#8B5CF6", r: 3 }}
                        activeDot={{ r: 5, fill: "#8B5CF6" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-gray-400">Growth Trend</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Upward
                </span>
              </div>
            </DashboardCard>
          </div>
        </section>

        {/* OPERATIONAL INSIGHTS */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
            Operational Insights
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Most Sold Products */}
            <DashboardCard
              title="Top Products"
              subtitle="By quantity sold"
              action={
                <span className="text-xs text-blue-400">
                  {mostSoldProducts.reduce((sum, p) => sum + p.qty, 0)} total units
                </span>
              }
            >
              <div className="space-y-3">
                {mostSoldProducts.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 hover:bg-[#1E293B] rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-900/30 flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-400">
                          {i + 1}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-sm truncate max-w-[120px]">{p.title}</div>
                        <div className="text-xs text-gray-400">
                          {p.qty} units
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-sm text-blue-300">
                      ₹{p.revenue.toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>

            {/* Orders by Status */}
            <DashboardCard
              title="Order Status"
              subtitle="Distribution by status"
              action={
                <span className="text-xs text-blue-400">
                  {Object.values(ordersByStatus).reduce((a, b) => a + b, 0)} total orders
                </span>
              }
            >
              <div className="h-48">
                <ChartContainer
                  config={ordersStatusPieConfig}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip 
                        content={<CustomTooltip />}
                        formatter={(value, name) => [value, name]}
                      />
                      <Pie
                        data={ordersStatusPieData}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={2}
                      >
                        {ordersStatusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1">
                {ordersStatusPieData.map((status, index) => (
                  <div
                    key={status.status}
                    className="flex items-center justify-between p-1.5 bg-[#1E293B] rounded text-xs"
                  >
                    <div className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: BLUE_GRADIENT[index % BLUE_GRADIENT.length] }}
                      />
                      <span className="text-gray-300 truncate">{status.status}</span>
                    </div>
                    <span className="font-bold">{status.count}</span>
                  </div>
                ))}
              </div>
            </DashboardCard>

            {/* Payment Modes */}
            <DashboardCard
              title="Payment Methods"
              subtitle="Preferred payment options"
              action={
                <span className="text-xs text-emerald-400">
                  Most used: {Object.entries(paymentModes).sort((a,b) => b[1]-a[1])[0]?.[0]}
                </span>
              }
            >
              <div className="space-y-3">
                {Object.entries(paymentModes).map(([mode, count]) => {
                  const total = Object.values(paymentModes).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  
                  return (
                    <div key={mode} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">{mode}</span>
                        <span className="font-bold">{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </DashboardCard>
          </div>
        </section>

        {/* SUMMARY */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-800/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold">Performance Summary</h3>
              <p className="text-gray-300 text-xs mt-0.5">
                {profitPercentage > 20 ? "Excellent" : profitPercentage > 10 ? "Good" : "Needs Improvement"} performance with {profitPercentage.toFixed(1)}% profit margin
              </p>
            </div>
            <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium">
              View Detailed Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ================= UI COMPONENTS ================= */

function KPICard({
  title,
  value,
  change,
  icon,
  color,
  description,
}: {
  title: string;
  value: string;
  change: string;
  icon: string;
  color: "blue" | "green" | "purple" | "orange" | "red";
  description: string;
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-700",
    green: "from-emerald-500 to-emerald-700",
    purple: "from-purple-500 to-purple-700",
    orange: "from-orange-500 to-orange-700",
    red: "from-red-500 to-red-700",
  };

  return (
    <div className="group relative overflow-hidden rounded-lg bg-[#1E293B] p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-8 translate-x-8" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-xs text-gray-400 mb-0.5">{title}</div>
            <div className="text-xl font-bold text-white">{value}</div>
          </div>
          <div className={`text-xl p-1.5 rounded-lg bg-gradient-to-br ${colorClasses[color]} bg-opacity-20`}>
            {icon}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">{description}</span>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
            change.includes('+') 
              ? 'bg-emerald-900/30 text-emerald-300' 
              : 'bg-blue-900/30 text-blue-300'
          }`}>
            {change}
          </span>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-[#1E293B] border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm">{title}</h3>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
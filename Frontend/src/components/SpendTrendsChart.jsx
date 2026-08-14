import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { T } from "../constants/theme";

// SVG Icons
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const ChartAreaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"></path>
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
  </svg>
);

const ChartBarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

// Render a custom glassmorphism tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isWeekly = !!data.week;
    
    const title = isWeekly
      ? `Week ${data.week} Summary`
      : new Date(data.dateStr).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

    return (
      <div
        className="glass-card"
        style={{
          padding: "14px 18px",
          minWidth: 220,
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ fontWeight: 800, color: T.textPrimary, marginBottom: 8, fontSize: 13 }}>
          {title}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
          {payload.map((p) => {
            const isInc = p.name.toLowerCase().includes("income");
            const labelText = isInc ? "Inflow" : "Outflow";
            const valueColor = isInc ? "var(--color-success)" : "var(--color-danger)";
            return (
              <div key={p.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: T.textSecondary, fontWeight: 500 }}>{labelText}:</span>
                <span style={{ fontWeight: 700, color: valueColor }}>
                  ₹{p.value.toLocaleString("en-IN")}
                </span>
              </div>
            );
          })}
        </div>
        
        {data.transactions && data.transactions.length > 0 && (
          <div style={{ marginTop: 10, borderTop: "1px solid rgba(0, 0, 0, 0.05)", paddingTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: T.textMuted, marginBottom: 6, letterSpacing: "0.05em" }}>
              Recent Entries ({data.transactions.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {data.transactions.slice(0, 3).map((t, idx) => (
                <div key={t.id || idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textSecondary }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>
                    {t.title}
                  </span>
                  <span style={{ fontWeight: 600, color: t.type === "income" ? "var(--color-success)" : T.textPrimary }}>
                    ₹{t.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
              {data.transactions.length > 3 && (
                <div style={{ fontSize: 9.5, color: T.textMuted, textAlign: "right", marginTop: 2, fontWeight: 500 }}>
                  + {data.transactions.length - 3} more entries
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function SpendTrendsChart({ transactions = [] }) {
  const [activeTab, setActiveTab] = useState("trend"); // "trend" | "compare"
  const [viewType, setViewType] = useState("daily"); // "daily" | "weekly"
  
  // Find all available months in the transactions list
  const availableMonths = useMemo(() => {
    const months = new Set();
    const today = new Date();
    
    // Add current month by default
    const curKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    months.add(curKey);
    
    transactions.forEach((t) => {
      if (t.date) {
        const d = new Date(t.date);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          months.add(key);
        }
      }
    });
    
    return Array.from(months).sort().reverse();
  }, [transactions]);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });

  // Filter transactions for the selected month
  const filteredTransactions = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    return transactions.filter((t) => {
      if (!t.date) return false;
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  }, [transactions, selectedMonth]);

  // Aggregate daily and weekly data
  const { dailyData, weeklyData } = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Initialize daily array
    const daily = [];
    for (let i = 1; i <= daysInMonth; i++) {
      daily.push({
        day: i,
        dateStr: `${year}-${String(month).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
        label: `${i}`,
        income: 0,
        expense: 0,
        transactions: [],
      });
    }

    // Accumulate transaction amounts daily
    filteredTransactions.forEach((t) => {
      const d = new Date(t.date);
      const dayNum = d.getDate();
      if (dayNum >= 1 && dayNum <= daysInMonth) {
        const idx = dayNum - 1;
        if (t.type === "income") {
          daily[idx].income += t.amount;
        } else {
          daily[idx].expense += t.amount;
        }
        daily[idx].transactions.push(t);
      }
    });

    // Aggregate into weekly data (Week 1, Week 2, etc.)
    const weekly = [];
    const numWeeks = Math.ceil(daysInMonth / 7);
    for (let w = 1; w <= numWeeks; w++) {
      const startDay = (w - 1) * 7 + 1;
      const endDay = Math.min(w * 7, daysInMonth);
      
      const weekDailySlice = daily.slice(startDay - 1, endDay);
      const incomeSum = weekDailySlice.reduce((sum, d) => sum + d.income, 0);
      const expenseSum = weekDailySlice.reduce((sum, d) => sum + d.expense, 0);
      
      // Collect all transactions for the week
      const weekTxns = [];
      weekDailySlice.forEach((d) => weekTxns.push(...d.transactions));

      weekly.push({
        week: w,
        label: `W${w} (${startDay}-${endDay})`,
        income: incomeSum,
        expense: expenseSum,
        transactions: weekTxns,
        dateStr: `${year}-${String(month).padStart(2, "0")}-${String(startDay).padStart(2, "0")}`,
      });
    }

    return { dailyData: daily, weeklyData: weekly };
  }, [filteredTransactions, selectedMonth]);

  // Determine current active dataset
  const chartData = viewType === "daily" ? dailyData : weeklyData;



  const formatYAxis = (value) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  };

  // Human readable selected month for header display
  const formattedMonthLabel = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    return new Date(year, month - 1, 1).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  }, [selectedMonth]);

  return (
    <div
      className="glass-card animate-fade-in"
      style={{
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Top Header Row with Filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              color: T.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            Financial Trends
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary, fontFamily: "var(--font-heading)" }}>
            Cash Flow Insights
          </div>
        </div>

        {/* Filters Group */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {/* Daily vs Weekly Toggle */}
          <div
            style={{
              display: "flex",
              background: "rgba(15, 23, 42, 0.04)",
              padding: 3,
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.03)",
            }}
          >
            <button
              onClick={() => setViewType("daily")}
              style={{
                padding: "5px 10px",
                fontSize: 11.5,
                fontWeight: 600,
                border: "none",
                borderRadius: 6,
                background: viewType === "daily" ? "#fff" : "transparent",
                color: viewType === "daily" ? T.textPrimary : T.textSecondary,
                cursor: "pointer",
                boxShadow: viewType === "daily" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.2s",
              }}
            >
              Daily
            </button>
            <button
              onClick={() => setViewType("weekly")}
              style={{
                padding: "5px 10px",
                fontSize: 11.5,
                fontWeight: 600,
                border: "none",
                borderRadius: 6,
                background: viewType === "weekly" ? "#fff" : "transparent",
                color: viewType === "weekly" ? T.textPrimary : T.textSecondary,
                cursor: "pointer",
                boxShadow: viewType === "weekly" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.2s",
              }}
            >
              Weekly
            </button>
          </div>

          {/* Month Selector dropdown */}
          <div style={{ position: "relative" }}>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: "6px 28px 6px 12px",
                fontSize: 12.5,
                fontWeight: 600,
                color: T.textSecondary,
                background: "#fff",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                borderRadius: 8,
                cursor: "pointer",
                appearance: "none",
                outline: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              }}
            >
              {availableMonths.map((m) => {
                const [year, month] = m.split("-").map(Number);
                const label = new Date(year, month - 1, 1).toLocaleString("default", {
                  month: "short",
                  year: "numeric",
                });
                return (
                  <option key={m} value={m}>
                    {label}
                  </option>
                );
              })}
            </select>
            <span
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: T.textMuted,
                display: "flex",
                alignItems: "center",
              }}
            >
              <CalendarIcon />
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Selector Navigation */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid rgba(0,0,0,0.04)",
          paddingBottom: 2,
          gap: 16,
        }}
      >
        <button
          onClick={() => setActiveTab("trend")}
          style={{
            background: "none",
            border: "none",
            borderBottom: `2.5px solid ${activeTab === "trend" ? "var(--color-primary)" : "transparent"}`,
            padding: "8px 4px 10px",
            color: activeTab === "trend" ? T.textPrimary : T.textSecondary,
            fontWeight: activeTab === "trend" ? 700 : 500,
            fontSize: 13.5,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.2s",
            outline: "none",
            marginBottom: -2,
          }}
        >
          <ChartAreaIcon />
          Spend Fluctuations
        </button>
        <button
          onClick={() => setActiveTab("compare")}
          style={{
            background: "none",
            border: "none",
            borderBottom: `2.5px solid ${activeTab === "compare" ? "var(--color-primary)" : "transparent"}`,
            padding: "8px 4px 10px",
            color: activeTab === "compare" ? T.textPrimary : T.textSecondary,
            fontWeight: activeTab === "compare" ? 700 : 500,
            fontSize: 13.5,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.2s",
            outline: "none",
            marginBottom: -2,
          }}
        >
          <ChartBarIcon />
          Inflow vs Outflow
        </button>
      </div>

      {/* Charts Section */}
      <div style={{ height: 320, width: "100%", position: "relative" }}>
        {filteredTransactions.length === 0 ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: T.textMuted,
              fontSize: 14,
              gap: 8,
            }}
          >
            <div style={{ fontSize: 24 }}>📊</div>
            <div>No transactions recorded in {formattedMonthLabel}.</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === "trend" ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {/* Expense Gradient */}
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0.0} />
                  </linearGradient>
                  {/* Income Gradient */}
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis
                  dataKey="label"
                  stroke={T.textMuted}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  stroke={T.textMuted}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatYAxis}
                  dx={-4}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(99, 102, 241, 0.08)", strokeWidth: 1.5 }} />
                
                {/* Income Area */}
                <Area
                  type="monotone"
                  name="Total Income"
                  dataKey="income"
                  stroke="var(--color-success)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, fill: "#fff" }}
                />
                {/* Expense Area */}
                <Area
                  type="monotone"
                  name="Total Expense"
                  dataKey="expense"
                  stroke="var(--color-danger)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, fill: "#fff" }}
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={viewType === "weekly" ? 6 : 2}>
                <defs>
                  <linearGradient id="barIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="barExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis
                  dataKey="label"
                  stroke={T.textMuted}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  stroke={T.textMuted}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatYAxis}
                  dx={-4}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(15, 23, 42, 0.02)" }} />
                
                <Bar
                  name="Income"
                  dataKey="income"
                  fill="url(#barIncomeGrad)"
                  radius={viewType === "weekly" ? [5, 5, 0, 0] : [3, 3, 0, 0]}
                  maxBarSize={viewType === "weekly" ? 40 : 15}
                />
                <Bar
                  name="Expense"
                  dataKey="expense"
                  fill="url(#barExpenseGrad)"
                  radius={viewType === "weekly" ? [5, 5, 0, 0] : [3, 3, 0, 0]}
                  maxBarSize={viewType === "weekly" ? 40 : 15}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend / Small Stats Row */}
      {filteredTransactions.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 14,
            borderTop: "1px solid rgba(0,0,0,0.04)",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-success)" }} />
              <span style={{ fontSize: 11.5, color: T.textSecondary }}>Inflows</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-danger)" }} />
              <span style={{ fontSize: 11.5, color: T.textSecondary }}>Outflows</span>
            </div>
          </div>
          
          <div style={{ fontSize: 11.5, color: T.textMuted, fontWeight: 500 }}>
            Showing {filteredTransactions.length} transactions for {formattedMonthLabel}
          </div>
        </div>
      )}
    </div>
  );
}

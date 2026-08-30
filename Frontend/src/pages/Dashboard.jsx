import StatCard from "../components/StatCard";
import CategoryBar from "../components/CategoryBar";
import PulseRing from "../components/PulseRing";
import AIInsightBadge from "../components/AIInsightBadge";
import TransactionRow from "../components/TransactionRow";
import SpendTrendsChart from "../components/SpendTrendsChart";

export default function Dashboard({
  transactions,
  totalIncome,
  totalExpense,
  balance,
  deleteTransaction,
  headingColor,
  subColor,
  BUDGET,
  T,
  onUpdateBudget,
  categoryBudgets,
  onUpdateCategoryBudget,
  billingCycle,
  monthPicker,
}) {
  const currentMonthName =
    billingCycle ||
    new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

  return (
    <div>
      {/* Top Welcome Title */}
      <div
        style={{
          marginBottom: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: headingColor,
              margin: 0,
              fontFamily: "var(--font-heading)",
              letterSpacing: "-0.02em",
            }}
          >
            Overview
          </h1>
          <p style={{ fontSize: 13.5, color: subColor, margin: "6px 0 0" }}>
            Billing cycle: {currentMonthName}
          </p>
        </div>
        {monthPicker}
      </div>

      {/* Analytics Main Grid */}
      <div className="dashboard-grid" style={{ marginBottom: 28 }}>
        {/* Left Side: Stats and Transactions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Metrics Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 16,
            }}
          >
            <StatCard
              label="Net Balance"
              value={balance}
              accent={
                balance >= 0 ? "var(--color-success)" : "var(--color-danger)"
              }
              icon="💰"
              sub="Available Cash flow"
            />
            <StatCard
              label="Total Incomes"
              value={totalIncome}
              accent="var(--color-success)"
              icon="📈"
              sub={`${transactions.filter((t) => t.type === "income").length} credits`}
            />
            <StatCard
              label="Total Expenses"
              value={totalExpense}
              accent="var(--color-danger)"
              icon="📉"
              sub={`${transactions.filter((t) => t.type === "expense").length} debits`}
            />
          </div>

          {/* Spend Trends Chart */}
          <SpendTrendsChart transactions={transactions} />

          {/* Transactions Box */}
          <div>
            <div
              style={{
                fontSize: 12,
                color: T.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              Recent Transactions
            </div>
            <div
              className="glass-card"
              style={{
                padding: "8px 20px",
              }}
            >
              {transactions.length === 0 ? (
                <div
                  style={{
                    padding: "36px 0",
                    textAlign: "center",
                    color: T.textMuted,
                    fontSize: 14,
                  }}
                >
                  No transaction records yet.
                </div>
              ) : (
                transactions
                  .slice(0, 5)
                  .map((t) => (
                    <TransactionRow
                      key={t._id}
                      t={t}
                      onDelete={deleteTransaction}
                    />
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Budget and Category Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Budget ring box */}
          <div
            className="glass-card"
            style={{
              padding: "24px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: T.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
                alignSelf: "flex-start",
                marginBottom: 20,
              }}
            >
              Budget Allocation
            </div>
            <PulseRing
              spent={totalExpense}
              budget={BUDGET}
              onUpdate={onUpdateBudget}
            />
            <div style={{ textAlign: "center", marginTop: 18 }}>
              <div style={{ fontSize: 13, color: T.textSecondary }}>
                Limit:{" "}
                <span style={{ fontWeight: 600, color: T.textPrimary }}>
                  ₹{BUDGET.toLocaleString("en-IN")}
                </span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color:
                    BUDGET - totalExpense >= 0
                      ? "var(--color-success)"
                      : "var(--color-danger)",
                  marginTop: 6,
                  fontWeight: 600,
                }}
              >
                {BUDGET - totalExpense >= 0
                  ? `₹${(BUDGET - totalExpense).toLocaleString("en-IN")} remaining`
                  : `Over budget by ₹${Math.abs(BUDGET - totalExpense).toLocaleString("en-IN")}`}
              </div>
            </div>
          </div>

          <CategoryBar
            transactions={transactions}
            categoryBudgets={categoryBudgets}
            onUpdateCategoryBudget={onUpdateCategoryBudget}
          />
          <AIInsightBadge transactions={transactions} />
        </div>
      </div>
    </div>
  );
}

import TransactionRow from "../components/TransactionRow";

export default function Transactions({
  transactions,
  deleteTransaction,
  headingColor,
  subColor,
  T,
  billingCycle,
  monthPicker,
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: headingColor,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Transactions
          </h1>
          <p style={{ fontSize: 13, color: subColor, margin: "5px 0 0" }}>
            {transactions.length} entries · {billingCycle}
          </p>
        </div>
        {monthPicker}
      </div>
      <div
        style={{
          background: T.cardBg,
          border: `1px solid ${T.cardBorder}`,
          borderRadius: 14,
          padding: "4px 20px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        {transactions.length === 0 ? (
          <div
            style={{
              padding: "32px 0",
              textAlign: "center",
              color: T.textMuted,
              fontSize: 14,
            }}
          >
            No transactions yet. Add one to get started.
          </div>
        ) : (
          transactions.map((t) => (
            <TransactionRow
              key={t._id}
              t={t}
              onDelete={deleteTransaction}
            />
          ))
        )}
      </div>
    </div>
  );
}

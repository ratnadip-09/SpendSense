/* eslint-disable */
export default function App() {
  const [transactions, setTransactions] = useState(SAMPLE_TXN);
  const [active, setActive] = useState("dashboard");

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  function addTransaction(t) {
    setTransactions((prev) => [t, ...prev]);
  }
  function deleteTransaction(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  const headingColor = T.textPrimary;
  const subColor = T.textSecondary;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "Inter, -apple-system, sans-serif",
        background: T.pageBg,
        color: T.textPrimary,
      }}
    >
      <Sidebar active={active} setActive={setActive} />
      <main
        style={{
          flex: 1,
          padding: "32px 28px",
          overflowY: "auto",
          minWidth: 0,
        }}
      >
        {active === "dashboard" && (
          <Dashboard
            transactions={transactions}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            balance={balance}
            deleteTransaction={deleteTransaction}
            headingColor={headingColor}
            subColor={subColor}
            BUDGET={BUDGET}
            T={T}
          />
        )}
      </main>
    </div>
  );
}

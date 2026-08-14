// App.jsx — SpendSense with monthly separation
import { useState, useEffect, useCallback } from "react";
import "./index.css";
import { T } from "./constants/theme";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import AddEntry from "./pages/AddEntry";
import Transections from "./pages/Transections";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getTransactions,
  createTransaction,
  deleteTransaction,
  getSummary,
  getAvailableMonths,
  updateBudget,
  getMe,
} from "./api";


const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* ── AuthForm ── */
function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    monthlyBudget: 20000,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGoogleHovered, setIsGoogleHovered] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  async function handleGoogleLogin(email, name) {
    setLoading(true);
    setError("");
    setShowGoogleModal(false);
    try {
      let data;
      try {
        data = await apiLogin(email, "googleauth_mock_password_12345");
      } catch (err) {
        data = await apiRegister(
          name,
          email,
          "googleauth_mock_password_12345",
          25000
        );
      }
      onAuth(data.user);
    } catch (err) {
      setError(err.message || "Google authentication failed");
    }
    setLoading(false);
  }

  function patch(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }
  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const data =
        mode === "login"
          ? await apiLogin(form.email, form.password)
          : await apiRegister(
              form.name,
              form.email,
              form.password,
              Number(form.monthlyBudget),
            );
      onAuth(data.user);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }
  const inp = {
    background: "var(--input-bg)",
    border: "1px solid var(--input-border)",
    borderRadius: 10,
    color: "var(--text-primary)",
    fontSize: 13.5,
    padding: "10px 14px",
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };
  const lbl = {
    fontSize: 11,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 6,
    display: "block",
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--page-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--card-border)",
          borderRadius: 20,
          padding: "36px 32px",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              fontSize: 18,
              color: "#fff",
              background: "linear-gradient(135deg,#6366F1,#818CF8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ₹
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: "var(--text-primary)",
              }}
            >
              SpendSense
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              AI Tracker
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 6,
          }}
        >
          {mode === "login" ? "Welcome back" : "Create account"}
        </div>
        <div
          style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}
        >
          {mode === "login"
            ? "Sign in to continue"
            : "Start tracking your expenses"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "register" && (
            <div>
              <label style={lbl}>Full Name</label>
              <input
                style={inp}
                placeholder="Rahul Sharma"
                value={form.name}
                onChange={(e) => patch("name", e.target.value)}
              />
            </div>
          )}
          <div>
            <label style={lbl}>Email</label>
            <input
              style={inp}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => patch("email", e.target.value)}
            />
          </div>
          <div>
            <label style={lbl}>Password</label>
            <input
              style={inp}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => patch("password", e.target.value)}
            />
          </div>
          {mode === "register" && (
            <div>
              <label style={lbl}>Monthly Salary (₹)</label>
              <input
                style={inp}
                type="number"
                placeholder="25000"
                value={form.monthlyBudget}
                onChange={(e) => patch("monthlyBudget", e.target.value)}
              />
            </div>
          )}
          {error && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                color: "#DC2626",
              }}
            >
              {error}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: "linear-gradient(135deg,#6366F1,#818CF8)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginTop: 4,
            }}
          >
            {loading
              ? "Please wait…"
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "6px 0",
              color: "var(--text-muted)",
              fontSize: 12,
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }}></div>
            <span style={{ padding: "0 10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }}></div>
          </div>

          <button
            onMouseEnter={() => setIsGoogleHovered(true)}
            onMouseLeave={() => setIsGoogleHovered(false)}
            onClick={() => {
              setShowGoogleModal(true);
            }}
            style={{
              background: isGoogleHovered ? "rgba(99, 102, 241, 0.04)" : "#fff",
              color: "#1a73e8",
              border: "1px solid var(--border-subtle)",
              borderRadius: 10,
              padding: "11px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "background 0.2s, border-color 0.2s",
              width: "100%",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24c0-1.55-.15-3.24-.47-4.77H24v9.03h12.75c-.53 2.87-2.14 5.3-4.57 6.94l7.1 5.51C43.43 36.3 46.5 30.82 46.5 24z"/>
              <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.1-5.51c-1.97 1.34-4.55 2.18-8.79 2.18-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span>{mode === "login" ? "Sign in with Google" : "Sign up with Google"}</span>
          </button>

          <div
            style={{
              textAlign: "center",
              fontSize: 13,
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <span
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              style={{ color: "#6366F1", fontWeight: 600, cursor: "pointer" }}
            >
              {mode === "login" ? "Register" : "Sign In"}
            </span>
          </div>
        </div>
        {showGoogleModal && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "#fff",
              borderRadius: 20,
              padding: "36px 32px",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="32px" height="32px" style={{ marginBottom: 12 }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24c0-1.55-.15-3.24-.47-4.77H24v9.03h12.75c-.53 2.87-2.14 5.3-4.57 6.94l7.1 5.51C43.43 36.3 46.5 30.82 46.5 24z"/>
                <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.1-5.51c-1.97 1.34-4.55 2.18-8.79 2.18-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <div style={{ fontSize: 20, fontWeight: 500, color: "#202124", textAlign: "center" }}>
                Choose an account
              </div>
              <div style={{ fontSize: 13, color: "#5f6368", marginTop: 4, textAlign: "center" }}>
                to continue to <span style={{ fontWeight: 500, color: "#1a73e8" }}>SpendSense</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", border: "1px solid #dadce0", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
              {[
                { name: "Ratnesh Singh", email: "ratnesh.singh@gmail.com", avatar: "R", color: "#1a73e8" },
                { name: "Demo User", email: "demo.user@gmail.com", avatar: "D", color: "#0f9d58" }
              ].map((acc, index) => (
                <div
                  key={index}
                  onClick={() => handleGoogleLogin(acc.email, acc.name)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 16px",
                    cursor: "pointer",
                    borderBottom: index === 0 ? "1px solid #dadce0" : "none",
                    background: "#fff",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: acc.color,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 600,
                      marginRight: 12,
                    }}
                  >
                    {acc.avatar}
                  </div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: "#3c4043" }}>{acc.name}</div>
                    <div style={{ fontSize: 12, color: "#5f6368" }}>{acc.email}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowGoogleModal(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#1a73e8",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                padding: "8px",
                alignSelf: "flex-end",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── MonthPicker ── */
function MonthPicker({ month, year, availableMonths, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <select
        value={`${year}-${month}`}
        onChange={(e) => {
          const [y, m] = e.target.value.split("-");
          onChange(parseInt(m), parseInt(y));
        }}
        style={{
          background: "#fff",
          border: "1px solid var(--card-border)",
          borderRadius: 8,
          padding: "6px 12px",
          fontSize: 13,
          color: "var(--text-primary)",
          cursor: "pointer",
          outline: "none",
          fontFamily: "inherit",
        }}
      >
        {availableMonths.length === 0 ? (
          <option value={`${year}-${month}`}>
            {MONTH_NAMES[month]} {year}
          </option>
        ) : (
          availableMonths.map((m) => (
            <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
              {MONTH_NAMES[m.month]} {m.year}
            </option>
          ))
        )}
      </select>
    </div>
  );
}



const now = new Date();

/* ── App ── */
export default function App() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [availableMonths, setAvailableMonths] = useState([]);

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  async function handleUpdateBudget(newBudget) {
    try {
      const res = await updateBudget({ monthlyBudget: newBudget });
      setUser(res.user);
      getSummary(selectedMonth, selectedYear)
        .then((r) => setSummary(r.data))
        .catch(() => {});
      return true;
    } catch (err) {
      console.error("Failed to update budget:", err.message);
      return false;
    }
  }

  async function handleUpdateCategoryBudget(category, val) {
    try {
      const updatedCategoryBudgets = {
        ...(user.categoryBudgets || {}),
        [category]: val,
      };
      const res = await updateBudget({ categoryBudgets: updatedCategoryBudgets });
      setUser(res.user);
      return true;
    } catch (err) {
      console.error("Failed to update category budget:", err.message);
      return false;
    }
  }

  // Restore session
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    getMe()
      .then((d) => setUser(d.user))
      .catch(() => localStorage.removeItem("token"));
  }, []);

  // Fetch data for selected month/year
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [txnRes, sumRes, monthsRes] = await Promise.all([
        getTransactions(selectedMonth, selectedYear),
        getSummary(selectedMonth, selectedYear),
        getAvailableMonths(),
      ]);
      setTransactions(txnRes.data || []);
      setSummary(sumRes.data || null);
      // Always include current month in picker even if no transactions yet
      const months = monthsRes.data || [];
      const exists = months.find(
        (m) => m.month === now.getMonth() + 1 && m.year === now.getFullYear(),
      );
      if (!exists)
        months.unshift({ month: now.getMonth() + 1, year: now.getFullYear() });
      setAvailableMonths(months);
    } catch (err) {
      console.error("Fetch error:", err.message);
    }
    setLoading(false);
  }, [user, selectedMonth, selectedYear]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  async function handleDelete(id) {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      getSummary(selectedMonth, selectedYear)
        .then((r) => setSummary(r.data))
        .catch(() => {});
    } catch (err) {
      console.error(err.message);
    }
  }

  async function handleAdd(newTxn) {
    try {
      const res = await createTransaction(newTxn);
      const createdTxn = res.data;

      // Only add to list if transaction belongs to selected month
      const d = new Date(createdTxn.date);
      if (
        d.getMonth() + 1 === selectedMonth &&
        d.getFullYear() === selectedYear
      ) {
        setTransactions((prev) => [createdTxn, ...prev]);
      }
      getSummary(selectedMonth, selectedYear)
        .then((r) => setSummary(r.data))
        .catch(() => {});
      getAvailableMonths()
        .then((r) => {
          const months = r.data || [];
          const exists = months.find(
            (m) => m.month === now.getMonth() + 1 && m.year === now.getFullYear(),
          );
          if (!exists)
            months.unshift({
              month: now.getMonth() + 1,
              year: now.getFullYear(),
            });
          setAvailableMonths(months);
        })
        .catch(() => {});
      setActive("transactions");
    } catch (err) {
      console.error("Failed to add transaction:", err.message);
    }
  }

  function handleLogout() {
    apiLogout();
    setUser(null);
    setTransactions([]);
    setSummary(null);
  }

  if (!user) return <AuthForm onAuth={(u) => setUser(u)} />;

  const salary = user.monthlyBudget || 0;
  const spent = summary?.totalExpense || 0;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: T.pageBg,
        color: T.textPrimary,
        fontFamily: "var(--font-sans)",
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      <Sidebar
        active={active}
        setActive={setActive}
        user={user}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main
        style={{
          flex: 1,
          padding: "32px 28px",
          overflowY: "auto",
          minWidth: 0,
        }}
      >
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: T.textMuted,
              fontSize: 14,
            }}
          >
            Loading…
          </div>
        )}

        {!loading && active === "dashboard" && (
          <Dashboard
            transactions={transactions}
            totalIncome={summary?.totalIncome || 0}
            totalExpense={spent}
            balance={summary?.balance || 0}
            deleteTransaction={handleDelete}
            headingColor={T.textPrimary}
            subColor={T.textSecondary}
            BUDGET={salary}
            T={T}
            onUpdateBudget={handleUpdateBudget}
            categoryBudgets={user.categoryBudgets}
            onUpdateCategoryBudget={handleUpdateCategoryBudget}
            billingCycle={`${MONTH_NAMES[selectedMonth]} ${selectedYear}`}
            monthPicker={
              <MonthPicker
                month={selectedMonth}
                year={selectedYear}
                availableMonths={availableMonths}
                onChange={(m, y) => {
                  setSelectedMonth(m);
                  setSelectedYear(y);
                }}
              />
            }
          />
        )}

        {!loading && active === "transactions" && (
          <Transections
            transactions={transactions}
            deleteTransaction={handleDelete}
            headingColor={T.textPrimary}
            subColor={T.textSecondary}
            T={T}
            billingCycle={`${MONTH_NAMES[selectedMonth]} ${selectedYear}`}
            monthPicker={
              <MonthPicker
                month={selectedMonth}
                year={selectedYear}
                availableMonths={availableMonths}
                onChange={(m, y) => {
                  setSelectedMonth(m);
                  setSelectedYear(y);
                }}
              />
            }
          />
        )}

        {!loading && active === "add" && (
          <AddEntry
            headingColor={T.textPrimary}
            subColor={T.textSecondary}
            addTransaction={handleAdd}
            setActive={setActive}
          />
        )}
      </main>
    </div>
  );
}

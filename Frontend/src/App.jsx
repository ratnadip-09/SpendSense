// App.jsx — SpendSense with monthly separation
import { useState, useEffect, useCallback, useRef } from "react";
import "./index.css";
import { T } from "./constants/theme";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import AddEntry from "./pages/AddEntry";
import Transactions from "./pages/Transactions";
import {
  login as apiLogin,
  register as apiRegister,
  googleAuth as apiGoogleAuth,
  logout as apiLogout,
  getTransactions,
  createTransaction,
  deleteTransaction,
  getSummary,
  getAvailableMonths,
  updateBudget,
  getMe,
} from "./api";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;


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
  const [googleReady, setGoogleReady] = useState(false);
  const googleBtnRef = useRef(null);

  // Handle the signed ID token Google hands back after the user picks an
  // account, and exchange it for our own session via the backend.
  const handleGoogleCredential = useCallback(async (response) => {
    setError("");
    setLoading(true);
    try {
      const data = await apiGoogleAuth(response.credential);
      onAuth(data.user);
    } catch (err) {
      setError(err.message || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  }, [onAuth]);

  // Load Google Identity Services and render the official Google button.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes("your_google_oauth")) {
      return; // not configured — button area will show a helpful message instead
    }

    let cancelled = false;

    function init() {
      if (cancelled || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      setGoogleReady(true);
    }

    if (window.google?.accounts?.id) {
      init();
    } else {
      // The GSI script loads async; poll briefly until it's ready.
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          init();
        }
      }, 100);
      setTimeout(() => clearInterval(interval), 10000);
      return () => clearInterval(interval);
    }

    return () => {
      cancelled = true;
    };
  }, [handleGoogleCredential]);

  // Render (and re-render on mode change, so the label matches "Sign in" / "Sign up")
  useEffect(() => {
    if (!googleReady || !googleBtnRef.current || !window.google?.accounts?.id) return;
    googleBtnRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "pill",
      text: mode === "login" ? "signin_with" : "signup_with",
      logo_alignment: "left",
      width: 336,
    });
  }, [googleReady, mode]);

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

          {GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes("your_google_oauth") ? (
            <div
              ref={googleBtnRef}
              style={{
                display: "flex",
                justifyContent: "center",
                minHeight: 40,
                opacity: loading ? 0.6 : 1,
                pointerEvents: loading ? "none" : "auto",
              }}
            />
          ) : (
            <div
              style={{
                background: "#F9FAFB",
                border: "1px dashed #D1D5DB",
                borderRadius: 10,
                color: "#6B7280",
                fontSize: 12.5,
                lineHeight: 1.5,
                padding: "12px 14px",
                textAlign: "center",
              }}
            >
              Google Sign-In isn&apos;t configured yet. Add a real{" "}
              <code>VITE_GOOGLE_CLIENT_ID</code> (and matching{" "}
              <code>GOOGLE_CLIENT_ID</code> on the backend) to enable the
              official Google button here.
            </div>
          )}

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
          <Transactions
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

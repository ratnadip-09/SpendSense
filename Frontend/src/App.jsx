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

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

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
function AuthForm({ onAuth, theme = "dark", toggleTheme }) {
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

  // Render (and re-render on mode, theme, or resize)
  useEffect(() => {
    if (!googleReady || !googleBtnRef.current || !window.google?.accounts?.id) return;

    const renderBtn = () => {
      if (!googleBtnRef.current || !window.google?.accounts?.id) return;
      const containerWidth = Math.floor(googleBtnRef.current.getBoundingClientRect().width) || 336;
      const targetWidth = Math.min(Math.max(containerWidth, 200), 400);

      googleBtnRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: mode === "login" ? "signin_with" : "signup_with",
        logo_alignment: "center",
        width: targetWidth,
      });
    };

    renderBtn();

    const observer = new ResizeObserver(() => {
      renderBtn();
    });
    if (googleBtnRef.current) {
      observer.observe(googleBtnRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [googleReady, mode, theme]);

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
    fontSize: 14,
    fontWeight: 500,
    padding: "11px 14px",
    width: "100%",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s, background-color 0.2s",
  };
  const lbl = {
    fontSize: 11,
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 700,
    marginBottom: 6,
    display: "block",
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = "var(--color-primary)";
    e.target.style.boxShadow = "0 0 0 2px var(--border-focus)";
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = "var(--input-border)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-page)",
        color: "var(--text-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: 20,
        boxSizing: "border-box",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      {/* Theme toggle switch in top-right */}
      {toggleTheme && (
        <button
          onClick={toggleTheme}
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
            borderRadius: 10,
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "var(--shadow-sm)",
            transition: "all 0.2s ease",
            outline: "none",
          }}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
      )}

      {/* Auth Card: Matches the obsidian dashboard aesthetic */}
      <div
        className="glass-card"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 20,
          padding: "36px 32px",
          width: "100%",
          maxWidth: 400,
          boxSizing: "border-box",
          boxShadow: "var(--shadow-md)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          position: "relative",
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 26,
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
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
            }}
          >
            ₹
          </div>
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 17,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
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
                fontWeight: 600,
              }}
            >
              AI Tracker
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: 6,
            fontFamily: "var(--font-heading)",
          }}
        >
          {mode === "login" ? "Welcome back" : "Create account"}
        </div>
        <div
          style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 22 }}
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
                onFocus={handleFocus}
                onBlur={handleBlur}
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
              onFocus={handleFocus}
              onBlur={handleBlur}
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
              onFocus={handleFocus}
              onBlur={handleBlur}
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
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          )}
          {error && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                color: "#f87171",
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "linear-gradient(135deg,#6366F1,#818CF8)",
              color: "#ffffff",
              border: "none",
              borderRadius: 10,
              padding: "12px",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginTop: 4,
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
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
            <span style={{ padding: "0 10px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }}></div>
          </div>

          {GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes("your_google_oauth") ? (
            <div
              ref={googleBtnRef}
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                minHeight: 44,
                opacity: loading ? 0.6 : 1,
                pointerEvents: loading ? "none" : "auto",
              }}
            />
          ) : (
            <div
              style={{
                background: "var(--input-bg)",
                border: "1px dashed var(--border-subtle)",
                borderRadius: 10,
                color: "var(--text-secondary)",
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
              color: "var(--text-secondary)",
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
              style={{ color: "var(--color-primary)", fontWeight: 700, cursor: "pointer" }}
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
    <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
      <select
        value={`${year}-${month}`}
        onChange={(e) => {
          const [y, m] = e.target.value.split("-");
          onChange(parseInt(m), parseInt(y));
        }}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 8,
          padding: "7px 32px 7px 12px",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-primary)",
          cursor: "pointer",
          outline: "none",
          fontFamily: "inherit",
          appearance: "none",
          boxShadow: "var(--shadow-sm)",
          transition: "all 0.2s ease",
        }}
      >
        {availableMonths.length === 0 ? (
          <option value={`${year}-${month}`} style={{ background: "var(--bg-sidebar)", color: "var(--text-primary)" }}>
            {MONTH_NAMES[month]} {year}
          </option>
        ) : (
          availableMonths.map((m) => (
            <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`} style={{ background: "var(--bg-sidebar)", color: "var(--text-primary)" }}>
              {MONTH_NAMES[m.month]} {m.year}
            </option>
          ))
        )}
      </select>
      <span
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <CalendarIcon />
      </span>
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

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

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

  if (!user) return <AuthForm onAuth={(u) => setUser(u)} theme={theme} toggleTheme={toggleTheme} />;

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

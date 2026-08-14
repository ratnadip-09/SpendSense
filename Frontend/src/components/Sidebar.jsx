import { T } from "../constants/theme";

const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

// Vector SVG Icon Components
const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const ExchangeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 17 4 13 8"></polyline>
    <line x1="17" y1="4" x2="17" y2="16"></line>
    <polyline points="3 16 7 20 11 16"></polyline>
    <line x1="7" y1="20" x2="7" y2="8"></line>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

export default function Sidebar({ active, setActive, user, onLogout, theme, toggleTheme }) {
  const nav = [
    { id: "dashboard", icon: <GridIcon />, label: "Dashboard" },
    { id: "transactions", icon: <ExchangeIcon />, label: "Transactions" },
    { id: "add", icon: <PlusIcon />, label: "Add Entry" },
  ];

  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        width: 250,
        background: T.sidebarBg,
        borderRight: `1px solid ${T.sidebarBorder}`,
        display: "flex",
        flexDirection: "column",
        padding: "32px 0",
        flexShrink: 0,
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      {/* Brand Logo */}
      <div style={{ padding: "0 24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--grad-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              color: "#fff",
              fontWeight: 700,
              boxShadow: "var(--shadow-glow)",
            }}
          >
            ₹
          </div>
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: T.textPrimary,
                letterSpacing: "-0.01em",
                fontFamily: "var(--font-heading)",
              }}
            >
              SpendSense
            </div>
            <div
              style={{
                fontSize: 9,
                color: T.textMuted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 600,
                marginTop: 1,
              }}
            >
              AI Finance Tracker
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      {user && (
        <div style={{ padding: "0 18px 24px" }}>
          <div
            className="glass-card"
            style={{
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderRadius: 14,
              border: "1px solid rgba(255, 255, 255, 0.04)",
              boxShadow: "none",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: "#ffffff",
                fontSize: 14,
                flexShrink: 0,
                letterSpacing: "0.05em",
              }}
            >
              {getInitials(user.name)}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: T.textPrimary,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: T.textSecondary,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginTop: 1,
                }}
              >
                {user.email}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav Menu */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        {nav.map((n) => {
          const isSelected = active === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setActive(n.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                width: "90%",
                margin: "0 auto",
                padding: "12px 16px",
                borderRadius: 10,
                background: isSelected ? "rgba(99, 102, 241, 0.08)" : "transparent",
                color: isSelected ? "#818cf8" : T.textSecondary,
                fontSize: 14,
                fontWeight: isSelected ? 600 : 500,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                outline: "none",
              }}
              onMouseOver={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.color = T.textPrimary;
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.02)";
                }
              }}
              onMouseOut={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.color = T.textSecondary;
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isSelected ? "#818cf8" : T.textMuted,
                  transition: "color 0.2s",
                }}
              >
                {n.icon}
              </span>
              {n.label}
            </button>
          );
        })}

        {/* Logout Button */}
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            width: "90%",
            margin: "12px auto 0",
            padding: "12px 16px",
            borderRadius: 10,
            background: "transparent",
            color: "var(--color-danger)",
            fontSize: 14,
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            outline: "none",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-danger)" }}>
            <LogoutIcon />
          </span>
          Logout
        </button>
      </nav>

      {/* Theme Toggle Switch */}
      <div style={{ padding: "0 18px", marginBottom: 16 }}>
        <button
          onClick={toggleTheme}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid var(--border-subtle)",
            background: "rgba(99, 102, 241, 0.04)",
            color: "var(--text-secondary)",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            boxSizing: "border-box",
            outline: "none",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "var(--text-primary)";
            e.currentTarget.style.background = "rgba(99, 102, 241, 0.09)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.background = "rgba(99, 102, 241, 0.04)";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </div>
          <div
            style={{
              width: 32,
              height: 18,
              borderRadius: 10,
              background: theme === "dark" ? "var(--color-primary)" : "var(--text-muted)",
              position: "relative",
              transition: "background-color 0.2s",
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#ffffff",
                position: "absolute",
                top: 2,
                left: theme === "dark" ? 16 : 2,
                transition: "left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>
        </button>
      </div>

      {/* Footer Info */}
      <div style={{ padding: "0 18px" }}>
        <div
          style={{
            background: "rgba(0, 0, 0, 0.02)",
            borderRadius: 12,
            padding: "14px 16px",
            border: `1px solid rgba(0, 0, 0, 0.05)`,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: T.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 700,
            }}
          >
            {currentMonth}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#059669",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#10b981",
                display: "inline-block",
                boxShadow: "0 0 8px #10b981",
              }}
            />
            Vault Protected
          </div>
        </div>
      </div>
    </div>
  );
}

import { T } from "../constants/theme";

const CATEGORY_ICONS = {
  Food: "🍜",
  Transport: "🚌",
  Shopping: "🛍️",
  Health: "💊",
  Housing: "🏠",
  Entertainment: "🎮",
  Salary: "💼",
  Other: "📦",
};

const CATEGORY_COLORS = {
  Food: "rgba(248, 113, 113, 0.15)",
  Transport: "rgba(251, 191, 36, 0.15)",
  Shopping: "rgba(167, 139, 250, 0.15)",
  Health: "rgba(52, 211, 153, 0.15)",
  Housing: "rgba(96, 165, 250, 0.15)",
  Entertainment: "rgba(244, 114, 182, 0.15)",
  Salary: "rgba(52, 211, 153, 0.15)",
  Other: "rgba(156, 163, 175, 0.15)",
};

const CATEGORY_TEXT_COLORS = {
  Food: "#F87171",
  Transport: "#FBBF24",
  Shopping: "#A78BFA",
  Health: "#34D399",
  Housing: "#60A5FA",
  Entertainment: "#F472B6",
  Salary: "#34D399",
  Other: "#9CA3AF",
};

export default function TransactionRow({ t, onDelete }) {
  const isIncome = t.type === "income";
  const categoryColor = CATEGORY_COLORS[t.category] || "rgba(255,255,255,0.05)";
  const categoryTextColor = CATEGORY_TEXT_COLORS[t.category] || T.textSecondary;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 0",
        borderBottom: `1px solid ${T.divider}`,
        transition: "background-color 0.2s ease",
      }}
      className="transaction-item-row"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Category Icon Badge */}
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: categoryColor,
            border: `1px solid rgba(255, 255, 255, 0.03)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
            boxShadow: `0 4px 12px ${categoryTextColor}10`,
          }}
        >
          {CATEGORY_ICONS[t.category] || "💰"}
        </div>
        
        {/* Title and Category Tag */}
        <div>
          <div
            style={{
              fontSize: 14.5,
              fontWeight: 600,
              color: T.textPrimary,
              letterSpacing: "-0.01em",
            }}
          >
            {t.title}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: categoryTextColor,
                background: categoryColor,
                padding: "2px 8px",
                borderRadius: 99,
                fontWeight: 600,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
              }}
            >
              {t.category}
            </span>
            <span style={{ fontSize: 11, color: T.textMuted }}>
              · {t.date}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Amount Badge */}
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            fontFamily: "var(--font-heading)",
            color: isIncome ? "var(--color-success)" : "var(--color-danger)",
          }}
        >
          {isIncome ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
        </span>
        
        {/* Delete Action button */}
        <button
          onClick={() => onDelete(t._id || t.id)}
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            color: T.textMuted,
            cursor: "pointer",
            fontSize: 11,
            width: 24,
            height: 24,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            outline: "none",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.background = "#ef4444";
            e.currentTarget.style.borderColor = "#ef4444";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = T.textMuted;
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

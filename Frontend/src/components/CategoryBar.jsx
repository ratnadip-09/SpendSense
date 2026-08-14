import { useState } from "react";
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
  Food: "#F87171",
  Transport: "#FBBF24",
  Shopping: "#A78BFA",
  Health: "#34D399",
  Housing: "#60A5FA",
  Entertainment: "#F472B6",
  Salary: "#34D399",
  Other: "#9CA3AF",
};

// Inline SVGs for Edit, Save (Check), and Cancel (Close)
const EditIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function CategoryBar({
  transactions = [],
  categoryBudgets = {},
  onUpdateCategoryBudget,
}) {
  const [editingCat, setEditingCat] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Accumulate expenses
  const expensesByCategory = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      expensesByCategory[t.category] =
        (expensesByCategory[t.category] || 0) + t.amount;
    });

  // Total expenses for the progress bar distribution at top
  const totalExpenses =
    Object.values(expensesByCategory).reduce((a, b) => a + b, 0) || 1;

  // Union of categories with expenses OR categories with a custom budget limit
  const activeCategories = new Set([
    ...Object.keys(expensesByCategory),
    ...Object.keys(categoryBudgets),
  ]);

  // Construct list objects
  const categoryItems = Array.from(activeCategories).map((cat) => {
    const amt = expensesByCategory[cat] || 0;
    const limit = categoryBudgets[cat] !== undefined ? categoryBudgets[cat] : null;
    return {
      category: cat,
      amount: amt,
      limit: limit,
    };
  });

  // Sort by spent amount descending, alphabetical for ties
  categoryItems.sort((a, b) => {
    if (b.amount !== a.amount) {
      return b.amount - a.amount;
    }
    return a.category.localeCompare(b.category);
  });

  const handleSave = async (category) => {
    const val = editValue.trim() === "" ? 0 : Number(editValue);
    if (isNaN(val) || val < 0) return;
    
    const success = await onUpdateCategoryBudget(category, val);
    if (success) {
      setEditingCat(null);
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: "20px 22px",
        boxShadow: "none",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: T.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 700,
          marginBottom: 16,
          fontFamily: "var(--font-heading)",
        }}
      >
        By Category Limits
      </div>

      {/* Group Progress visual segment bar at top */}
      <div
        style={{
          display: "flex",
          height: 10,
          borderRadius: 99,
          overflow: "hidden",
          marginBottom: 20,
          background: "rgba(0, 0, 0, 0.03)",
          border: "1px solid rgba(0, 0, 0, 0.01)",
        }}
      >
        {Object.keys(expensesByCategory).length === 0 ? (
          <div style={{ width: "100%", background: "rgba(0, 0, 0, 0.03)" }} />
        ) : (
          categoryItems
            .filter((item) => item.amount > 0)
            .map(({ category: cat, amount: amt }) => (
              <div
                key={cat}
                title={`${cat}: ₹${amt}`}
                style={{
                  width: `${(amt / totalExpenses) * 100}%`,
                  background: CATEGORY_COLORS[cat] || "#6366F1",
                  transition: "width 0.6s",
                  minWidth: 3,
                  boxShadow: `0 0 8px ${CATEGORY_COLORS[cat]}40`,
                }}
              />
            ))
        )}
      </div>

      {/* Legend & Budget List Details */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {categoryItems.length === 0 ? (
          <div
            style={{
              fontSize: 13,
              color: T.textMuted,
              fontStyle: "italic",
              textAlign: "center",
              padding: "8px 0",
            }}
          >
            No expenses recorded.
          </div>
        ) : (
          categoryItems.map(({ category: cat, amount: amt, limit }) => {
            const isEditing = editingCat === cat;
            const percentSpent = limit ? (amt / limit) * 100 : 0;
            const isOver = limit && amt > limit;
            const isNear = limit && amt > limit * 0.8 && amt <= limit;
            
            let progressColor = CATEGORY_COLORS[cat] || "#6366F1";
            if (isOver) progressColor = "var(--color-danger)";
            else if (isNear) progressColor = "var(--color-warning)";

            return (
              <div
                key={cat}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  paddingBottom: 10,
                  borderBottom: `1px solid ${T.divider}`,
                }}
              >
                {/* Item header line: Name vs values or input */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {/* Left text with icon */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 99,
                        background: CATEGORY_COLORS[cat] || "#6366F1",
                        boxShadow: `0 0 6px ${CATEGORY_COLORS[cat]}80`,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13.5,
                        color: T.textSecondary,
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ marginRight: 6 }}>{CATEGORY_ICONS[cat] || "📦"}</span>
                      {cat}
                    </span>
                  </div>

                  {/* Right editor or display */}
                  {isEditing ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <span style={{ position: "absolute", left: 8, fontSize: 11, color: T.textSecondary, fontWeight: 700 }}>₹</span>
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="No limit"
                          style={{
                            width: 80,
                            padding: "4px 8px 4px 18px",
                            borderRadius: 6,
                            border: "1px solid var(--border-subtle)",
                            background: "var(--input-bg)",
                            color: "var(--text-primary)",
                            fontSize: 12,
                            fontWeight: 600,
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave(cat);
                            if (e.key === "Escape") setEditingCat(null);
                          }}
                        />
                      </div>
                      <button
                        onClick={() => handleSave(cat)}
                        style={{
                          border: "none",
                          background: "var(--color-success)",
                          color: "#fff",
                          borderRadius: 6,
                          width: 24,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                        title="Save"
                      >
                        <CheckIcon />
                      </button>
                      <button
                        onClick={() => setEditingCat(null)}
                        style={{
                          border: "1px solid var(--border-subtle)",
                          background: "var(--bg-card)",
                          color: "var(--text-secondary)",
                          borderRadius: 6,
                          width: 24,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                        title="Cancel"
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.textPrimary }}>
                          ₹{amt.toLocaleString("en-IN")}
                        </div>
                        <div style={{ fontSize: 10.5, color: T.textMuted, fontWeight: 500 }}>
                          {limit ? `Limit: ₹${limit.toLocaleString("en-IN")}` : "No budget limit"}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingCat(cat);
                          setEditValue(limit ? String(limit) : "");
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: T.textMuted,
                          padding: "6px",
                          borderRadius: 6,
                          display: "flex",
                          alignItems: "center",
                          transition: "all 0.2s",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.color = "var(--color-primary)";
                          e.currentTarget.style.background = "rgba(99, 102, 241, 0.08)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.color = T.textMuted;
                          e.currentTarget.style.background = "none";
                        }}
                        title="Set/Edit Limit"
                      >
                        <EditIcon />
                      </button>
                    </div>
                  )}
                </div>

                {/* Micro Progress Bar under category details */}
                {limit !== null && (
                  <div style={{ width: "100%", marginTop: 8 }}>
                    <div
                      style={{
                        height: 5,
                        borderRadius: 3,
                        background: "rgba(0, 0, 0, 0.04)",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min(percentSpent, 100)}%`,
                          background: progressColor,
                          borderRadius: 3,
                          transition: "width 0.5s ease-out",
                          boxShadow: `0 0 6px ${progressColor}40`,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 10,
                        color: isOver ? "var(--color-danger)" : isNear ? "var(--color-warning)" : T.textMuted,
                        marginTop: 4,
                        fontWeight: 600,
                      }}
                    >
                      <span>{percentSpent.toFixed(0)}% spent</span>
                      {isOver ? (
                        <span>Over by ₹{(amt - limit).toLocaleString("en-IN")}</span>
                      ) : (
                        <span>₹{(limit - amt).toLocaleString("en-IN")} left</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

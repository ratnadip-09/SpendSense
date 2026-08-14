import { useState } from "react";
import { T } from "../constants/theme";

const EditIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transition: "color 0.2s" }}
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#10b981"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const CancelIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ef4444"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function PulseRing({ spent, budget, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget);

  const [prevBudget, setPrevBudget] = useState(budget);
  if (budget !== prevBudget) {
    setPrevBudget(budget);
    setTempBudget(budget);
  }

  const pct = Math.min(spent / (budget || 1), 1);
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const color = pct > 0.9 ? "var(--color-danger)" : pct > 0.7 ? "var(--color-warning)" : "var(--color-primary)";

  const handleSave = async () => {
    const val = parseFloat(tempBudget);
    if (!isNaN(val) && val >= 0) {
      const success = await onUpdate(val);
      if (success !== false) {
        setIsEditing(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setTempBudget(budget);
      setIsEditing(false);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: 180,
        height: 180,
        margin: "0 auto",
      }}
    >
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke={T.ringTrack}
          strokeWidth="12"
        />
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
          style={{
            transition:
              "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1), stroke 0.5s",
            filter: `drop-shadow(0 0 4px ${color}50)`,
          }}
        />
        <circle cx="90" cy="90" r="58" fill={T.ringInnerFill} />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          padding: 12,
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: T.textPrimary,
            fontFamily: "var(--font-heading)",
            letterSpacing: "-0.03em",
          }}
        >
          ₹{Number(spent).toLocaleString("en-IN")}
        </span>
        <span
          style={{
            fontSize: 10,
            color: T.textMuted,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          spent
        </span>

        {isEditing ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginTop: 4,
              width: "85%",
            }}
          >
            <input
              type="number"
              value={tempBudget}
              onChange={(e) => setTempBudget(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{
                width: "100%",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid var(--border-focus)",
                borderRadius: 4,
                color: "#fff",
                fontSize: 12,
                padding: "2px 4px",
                outline: "none",
                textAlign: "center",
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
              }}
            />
            <button
              onClick={handleSave}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
              }}
            >
              <CheckIcon />
            </button>
            <button
              onClick={() => {
                setTempBudget(budget);
                setIsEditing(false);
              }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
              }}
            >
              <CancelIcon />
            </button>
          </div>
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            style={{
              fontSize: 11,
              color: T.textSecondary,
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              marginTop: 4,
              fontWeight: 500,
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#818cf8")}
            onMouseOut={(e) => (e.currentTarget.style.color = T.textSecondary)}
          >
            of ₹{Number(budget).toLocaleString("en-IN")}
            <EditIcon />
          </div>
        )}

        <span
          style={{
            fontSize: 11,
            color: color,
            fontWeight: 700,
            fontFamily: "var(--font-heading)",
            marginTop: 4,
          }}
        >
          {Math.round(pct * 100)}% used
        </span>
      </div>
    </div>
  );
}

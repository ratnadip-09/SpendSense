import { T } from "../constants/theme";

export default function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div
      className="glass-card"
      style={{
        padding: "20px 22px",
        flex: "1 1 150px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 110,
        boxShadow: "none", // overridden by glass-card styles
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: T.textSecondary,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 700,
              fontFamily: "var(--font-heading)",
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontSize: 18,
              width: 32,
              height: 32,
              borderRadius: 8,
              background: accent ? `${accent}15` : "rgba(255, 255, 255, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </span>
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: accent || T.textPrimary,
            fontFamily: "var(--font-heading)",
            letterSpacing: "-0.03em",
          }}
        >
          ₹{Number(value).toLocaleString("en-IN")}
        </div>
      </div>
      {sub && (
        <div
          style={{
            fontSize: 11.5,
            color: T.textMuted,
            marginTop: 8,
            borderTop: "1px solid rgba(255, 255, 255, 0.03)",
            paddingTop: 8,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

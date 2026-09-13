import { useState } from "react";
import { predictCategory } from "../api";
import { CATEGORIES } from "../constants/categories";
import { T } from "../constants/theme";

export default function AddEntryForm({ onAdd }) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "Food",
    date: new Date().toISOString().split("T")[0],
  });
  const [saved, setSaved] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);

  async function handleAICategorization() {
    if (!form.title.trim()) return;

    try {
      setAiLoading(true);
      const result = await predictCategory(form.title);
      const prediction = result.prediction;
      setAiPrediction(prediction);
      setForm((previous) => ({
        ...previous,
        category: prediction.category,
      }));
    } catch (error) {
      console.error("AI categorization failed:", error);
    } finally {
      setAiLoading(false);
    }
  }

  function handleSubmit() {
    if (!form.title || !form.amount) return;
    onAdd({ ...form, amount: parseFloat(form.amount), id: Date.now() });
    setForm({
      title: "",
      amount: "",
      type: "expense",
      category: "Food",
      date: new Date().toISOString().split("T")[0],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div
      className="glass-card"
      style={{
        padding: "28px 32px",
        maxWidth: 500,
        boxShadow: "none", // overridden by glass-card class
      }}
    >
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: T.textPrimary,
          marginBottom: 24,
          fontFamily: "var(--font-heading)",
          letterSpacing: "-0.01em",
        }}
      >
        Record New Transaction
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label className="label-premium">Description</label>
          <input
            className="input-premium"
            placeholder="e.g. Coffee at Starbucks"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <button
            type="button"
            onClick={handleAICategorization}
            disabled={aiLoading || !form.title.trim()}
            style={{
              marginTop: 8,
              padding: "8px 14px",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              background: "var(--input-bg)",
              color: "var(--text-primary)",
              fontSize: 13,
              fontWeight: 600,
              cursor:
                aiLoading || !form.title.trim() ? "not-allowed" : "pointer",
              opacity: aiLoading || !form.title.trim() ? 0.6 : 1,
              transition: "all 0.2s ease",
            }}
          >
            {aiLoading ? "Analyzing..." : "✨ Categorize with AI"}
          </button>
          {aiPrediction && (
            <div
              style={{
                marginTop: 10,
                padding: "10px 14px",
                borderRadius: 8,
                background: "rgba(99, 102, 241, 0.08)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                color: "var(--text-primary)",
                fontSize: 13,
              }}
            >
              <strong style={{ color: "var(--color-primary)" }}>AI Prediction:</strong> {aiPrediction.category}
              <br />
              <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>Confidence: {aiPrediction.confidence}%</span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label className="label-premium">Amount (₹)</label>
            <input
              className="input-premium"
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label className="label-premium">Date</label>
            <input
              className="input-premium"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label className="label-premium">Type</label>
            <select
              className="input-premium"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              style={{
                cursor: "pointer",
                appearance: "none",
                backgroundPosition: "right 12px center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label className="label-premium">Category</label>
            <select
              className="input-premium"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{
                cursor: "pointer",
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="btn-premium-primary"
          style={{
            background: saved ? "var(--grad-success)" : "var(--grad-primary)",
            marginTop: 8,
            height: 44,
          }}
        >
          {saved ? "✓ Transaction Recorded!" : "Save Entry"}
        </button>
      </div>
    </div>
  );
}

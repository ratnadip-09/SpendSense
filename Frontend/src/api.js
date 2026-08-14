// api.js — SpendSense Frontend ↔ Backend connector
// Place this file at: Frontend/src/api.js

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

/* ── Helper ── */
async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res  = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

/* ── Auth ── */
export async function register(name, email, password, monthlyBudget = 20000) {
  const data = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, monthlyBudget }),
  });
  localStorage.setItem("token", data.token);
  return data;
}

export async function login(email, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("token", data.token);
  return data;
}

export function logout() {
  localStorage.removeItem("token");
}

export async function getMe() {
  return request("/auth/me");
}

export async function updateBudget(updates) {
  return request("/auth/budget", {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

/* ── Transactions ── */

// Fetch transactions for a specific month and year
export async function getTransactions(month, year, extra = {}) {
  const params = new URLSearchParams({ month, year, limit: 100, ...extra });
  return request(`/transactions?${params}`);
}

export async function createTransaction(txn) {
  return request("/transactions", {
    method: "POST",
    body: JSON.stringify(txn),
  });
}

export async function updateTransaction(id, updates) {
  return request(`/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deleteTransaction(id) {
  return request(`/transactions/${id}`, { method: "DELETE" });
}

// Get summary (income, expenses, balance) for a specific month and year
export async function getSummary(month, year) {
  return request(`/transactions/summary?month=${month}&year=${year}`);
}

// Get all months that have at least one transaction — for the month picker
export async function getAvailableMonths() {
  return request("/transactions/months");
}

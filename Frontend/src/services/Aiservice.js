const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

const defaultHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: defaultHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function register(name, email, password, monthlyBudget = 20000) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: defaultHeaders(),
    body: JSON.stringify({ name, email, password, monthlyBudget }),
  });
  return res.json();
}

export async function getMe(token) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: defaultHeaders(token),
  });
  return res.json();
}

export async function getTransactions(token, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/transactions${qs ? `?${qs}` : ""}`, {
    headers: defaultHeaders(token),
  });
  return res.json();
}

export async function createTransaction(token, transaction) {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: "POST",
    headers: defaultHeaders(token),
    body: JSON.stringify(transaction),
  });
  return res.json();
}

export async function deleteTransaction(token, id) {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: "DELETE",
    headers: defaultHeaders(token),
  });
  return res.json();
}

export async function getSummary(token, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(
    `${API_BASE}/transactions/summary${qs ? `?${qs}` : ""}`,
    {
      headers: defaultHeaders(token),
    },
  );
  return res.json();
}

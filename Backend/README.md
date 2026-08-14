# SpendSense — Backend API

Node.js + Express + MongoDB REST API for the SpendSense AI Expense Tracker.

---

## Project Structure

```
backend/
├── server.js                  # Entry point
├── package.json
├── .env.example               # Copy to .env and fill in values
├── config/
│   └── db.js                  # MongoDB connection
├── models/
│   ├── User.js                # User schema
│   └── Transaction.js         # Transaction schema
├── controllers/
│   ├── authController.js      # Register, login, profile
│   └── transactionController.js # CRUD + summary
├── routes/
│   ├── auth.js                # /api/auth/*
│   └── transactions.js        # /api/transactions/*
└── middleware/
    ├── auth.js                # JWT protect middleware
    └── errorHandler.js        # Global error handler
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env
# Then edit .env with your MongoDB URI and JWT secret

# 3. Run in development (auto-restart)
npm run dev

# 4. Run in production
npm start
```

---

## Environment Variables

| Variable        | Description                              | Example                          |
|-----------------|------------------------------------------|----------------------------------|
| `PORT`          | Server port                              | `5000`                           |
| `MONGO_URI`     | MongoDB connection string                | `mongodb://localhost:27017/spendsense` |
| `JWT_SECRET`    | Secret key for signing JWTs             | `my_super_secret_key`            |
| `JWT_EXPIRES_IN`| JWT expiry duration                      | `7d`                             |
| `CLIENT_URL`    | Frontend origin for CORS                 | `http://localhost:5173`          |

---

## API Reference

All protected routes require the header:
```
Authorization: Bearer <token>
```

---

### Auth  `/api/auth`

| Method | Endpoint           | Auth | Description              |
|--------|--------------------|------|--------------------------|
| POST   | `/register`        | ❌   | Register a new user      |
| POST   | `/login`           | ❌   | Login, returns JWT token |
| GET    | `/me`              | ✅   | Get logged-in user info  |
| PATCH  | `/budget`          | ✅   | Update monthly budget    |

**POST /api/auth/register**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "secret123",
  "monthlyBudget": 20000
}
```

**POST /api/auth/login**
```json
{ "email": "rahul@example.com", "password": "secret123" }
```

**Response (both)**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": "...", "name": "Rahul Sharma", "email": "...", "monthlyBudget": 20000 }
}
```

---

### Transactions  `/api/transactions`

| Method | Endpoint         | Auth | Description                     |
|--------|------------------|------|---------------------------------|
| GET    | `/`              | ✅   | List transactions (with filters)|
| POST   | `/`              | ✅   | Create a transaction            |
| GET    | `/:id`           | ✅   | Get single transaction          |
| PUT    | `/:id`           | ✅   | Update a transaction            |
| DELETE | `/:id`           | ✅   | Delete a transaction            |
| GET    | `/summary`       | ✅   | Monthly totals + by-category    |

**GET /api/transactions** — query params

| Param      | Example         | Description                    |
|------------|-----------------|--------------------------------|
| `type`     | `expense`       | Filter by income / expense     |
| `category` | `Food`          | Filter by category             |
| `month`    | `6`             | Month number (1-12)            |
| `year`     | `2026`          | 4-digit year                   |
| `page`     | `1`             | Pagination page (default 1)    |
| `limit`    | `20`            | Results per page (default 20)  |
| `sort`     | `-date`         | Sort field, prefix `-` for desc|

**POST /api/transactions**
```json
{
  "title": "Grocery Store",
  "amount": 850,
  "type": "expense",
  "category": "Food",
  "date": "2026-06-09",
  "note": "Weekly groceries"
}
```

**GET /api/transactions/summary?month=6&year=2026**
```json
{
  "success": true,
  "data": {
    "month": 6,
    "year": 2026,
    "totalIncome": 45000,
    "totalExpense": 15119,
    "balance": 29881,
    "incomeCount": 1,
    "expenseCount": 6,
    "byCategory": [
      { "_id": "Housing", "total": 12000, "count": 1 },
      { "_id": "Shopping", "total": 1200, "count": 1 }
    ]
  }
}
```

---

## Connecting to the Frontend

In your React app, set the base URL:
```js
// src/api.js
const API = "http://localhost:5000/api";

export async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json(); // { success, token, user }
}

export async function getTransactions(token, params = {}) {
  const qs  = new URLSearchParams(params).toString();
  const res = await fetch(`${API}/transactions?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
```

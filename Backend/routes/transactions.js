// routes/transactions.js

const express = require("express");
const router  = express.Router();

const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getAvailableMonths,
} = require("../controllers/transactionController");

const { protect } = require("../middleware/auth");

router.use(protect);

router.get   ("/summary",        getSummary);          // GET /api/transactions/summary?month=6&year=2026
router.get   ("/months",         getAvailableMonths);  // GET /api/transactions/months
router.get   ("/",               getTransactions);     // GET /api/transactions?month=6&year=2026
router.post  ("/",               createTransaction);   // POST /api/transactions
router.get   ("/:id",            getTransaction);      // GET /api/transactions/:id
router.put   ("/:id",            updateTransaction);   // PUT /api/transactions/:id
router.delete("/:id",            deleteTransaction);   // DELETE /api/transactions/:id

module.exports = router;

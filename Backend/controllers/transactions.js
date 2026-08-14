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
} = require("../controllers/transactionController");

const { protect } = require("../middleware/auth");

// All transaction routes are protected
router.use(protect);

router.get   ("/summary", getSummary);          // GET  /api/transactions/summary
router.get   ("/",        getTransactions);     // GET  /api/transactions
router.post  ("/",        createTransaction);   // POST /api/transactions
router.get   ("/:id",     getTransaction);      // GET  /api/transactions/:id
router.put   ("/:id",     updateTransaction);   // PUT  /api/transactions/:id
router.delete("/:id",     deleteTransaction);   // DELETE /api/transactions/:id

module.exports = router;

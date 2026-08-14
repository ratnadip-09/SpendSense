// controllers/transactionController.js — CRUD + monthly summary

const Transaction = require("../models/Transaction");

/* ────────────────────────────────────────────
   GET /api/transactions
   Query: ?month=6&year=2026&type=expense&category=Food
          &page=1&limit=20&sort=-date
──────────────────────────────────────────── */
exports.getTransactions = async (req, res, next) => {
  try {
    const {
      type, category,
      month, year,
      page = 1, limit = 20, sort = "-date",
    } = req.query;

    const filter = { user: req.user._id };

    // Month/year separation — core feature
    if (month) filter.month = parseInt(month);
    if (year)  filter.year  = parseInt(year);

    if (type)     filter.type     = type;
    if (category) filter.category = category;

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Transaction.countDocuments(filter);

    const transactions = await Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      total,
      page:  parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data:  transactions,
    });
  } catch (err) {
    next(err);
  }
};

/* ────────────────────────────────────────────
   GET /api/transactions/:id
──────────────────────────────────────────── */
exports.getTransaction = async (req, res, next) => {
  try {
    const txn = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!txn) return res.status(404).json({ success: false, message: "Transaction not found" });
    res.status(200).json({ success: true, data: txn });
  } catch (err) {
    next(err);
  }
};

/* ────────────────────────────────────────────
   POST /api/transactions
   Body: { title, amount, type, category, date, note? }
   month & year are auto-extracted from date
──────────────────────────────────────────── */
exports.createTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, note } = req.body;

    const d = new Date(date || Date.now());

    const txn = await Transaction.create({
      user: req.user._id,
      title, amount, type, category, note,
      date,
      month: d.getMonth() + 1,
      year:  d.getFullYear(),
    });

    res.status(201).json({ success: true, data: txn });
  } catch (err) {
    next(err);
  }
};

/* ────────────────────────────────────────────
   PUT /api/transactions/:id
──────────────────────────────────────────── */
exports.updateTransaction = async (req, res, next) => {
  try {
    const allowed = ["title", "amount", "type", "category", "date", "note"];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    // Recalculate month/year if date is being updated
    if (updates.date) {
      const d = new Date(updates.date);
      updates.month = d.getMonth() + 1;
      updates.year  = d.getFullYear();
    }

    const txn = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!txn) return res.status(404).json({ success: false, message: "Transaction not found" });
    res.status(200).json({ success: true, data: txn });
  } catch (err) {
    next(err);
  }
};

/* ────────────────────────────────────────────
   DELETE /api/transactions/:id
──────────────────────────────────────────── */
exports.deleteTransaction = async (req, res, next) => {
  try {
    const txn = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!txn) return res.status(404).json({ success: false, message: "Transaction not found" });
    res.status(200).json({ success: true, message: "Transaction deleted" });
  } catch (err) {
    next(err);
  }
};

/* ────────────────────────────────────────────
   GET /api/transactions/summary?month=6&year=2026
   Returns totals + byCategory for that specific month only
──────────────────────────────────────────── */
exports.getSummary = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year  = parseInt(req.query.year)  || new Date().getFullYear();

    const [result] = await Transaction.aggregate([
      {
        // Filter strictly by this user + this month + this year
        $match: {
          user:  req.user._id,
          month: month,
          year:  year,
        },
      },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id:   "$type",
                total: { $sum: "$amount" },
                count: { $sum: 1 },
              },
            },
          ],
          byCategory: [
            { $match: { type: "expense" } },
            {
              $group: {
                _id:   "$category",
                total: { $sum: "$amount" },
                count: { $sum: 1 },
              },
            },
            { $sort: { total: -1 } },
          ],
        },
      },
    ]);

    const totalsMap = {};
    (result?.totals || []).forEach(t => { totalsMap[t._id] = { total: t.total, count: t.count }; });

    const totalIncome  = totalsMap.income?.total  || 0;
    const totalExpense = totalsMap.expense?.total  || 0;

    res.status(200).json({
      success: true,
      data: {
        month,
        year,
        totalIncome,
        totalExpense,
        balance:      totalIncome - totalExpense,
        incomeCount:  totalsMap.income?.count  || 0,
        expenseCount: totalsMap.expense?.count || 0,
        byCategory:   result?.byCategory || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ────────────────────────────────────────────
   GET /api/transactions/months
   Returns list of all months that have transactions
   So frontend can show a month picker
──────────────────────────────────────────── */
exports.getAvailableMonths = async (req, res, next) => {
  try {
    const months = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      {
        $project: {
          _id:   0,
          month: "$_id.month",
          year:  "$_id.year",
        },
      },
    ]);

    res.status(200).json({ success: true, data: months });
  } catch (err) {
    next(err);
  }
};

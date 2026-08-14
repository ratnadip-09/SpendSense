// models/Transaction.js — Transaction schema with month/year indexing

const mongoose = require("mongoose");

const CATEGORIES = [
  "Food", "Transport", "Shopping", "Health",
  "Housing", "Entertainment", "Salary", "Other",
];

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: {
        values: ["income", "expense"],
        message: "Type must be either 'income' or 'expense'",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: CATEGORIES,
        message: `Category must be one of: ${CATEGORIES.join(", ")}`,
      },
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    // Stored explicitly for fast monthly filtering
    month: {
      type: Number, // 1–12
      required: true,
    },
    year: {
      type: Number, // e.g. 2026
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [200, "Note cannot exceed 200 characters"],
    },
  },
  { timestamps: true }
);

// Auto-fill month and year from date before saving
transactionSchema.pre("save", function (next) {
  const d = new Date(this.date);
  this.month = d.getMonth() + 1;
  this.year  = d.getFullYear();
  next();
});

// Compound index for fast per-user per-month queries
transactionSchema.index({ user: 1, year: 1, month: 1, date: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);

// src/models/expense.model.js
import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    paid_by: { type: String, required: true },
    participants: { type: [String], default: [] }, // will auto-fill on create
    split_type: {
      type: String,
      enum: ["equal", "percentage", "exact"],
      default: "equal",
    },
    split_values: { type: mongoose.Schema.Types.Mixed }, // key: person, value: number
    category: {
      type: String,
      enum: ["Food", "Travel", "Utilities","Bills", "Shopping","Healthcare","Entertainment", "Groceries","Transportation", "Other"],
      default: "Other", 
    },
    isRecurring: { type: Boolean, default: false },
    recurrenceInterval: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: null,
    },
    nextDueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;

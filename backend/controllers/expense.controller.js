import Expense from "../models/expense.model.js";
import mongoose from "mongoose";

import dayjs from "dayjs";

const recurrenceDaysMap = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  yearly: 365,
};

const processRecurringExpenses = async () => {
  const today = dayjs().startOf("day");
  const tomorrow = today.add(1, 'day');

  // Find only those due today (avoids re-processing same day)
  const dueExpenses = await Expense.find({
    isRecurring: true,
    nextDueDate: {
      $gte: today.toDate(),
      $lt: tomorrow.toDate(),
    },
  });
  

  for (const expense of dueExpenses) {
    // Create new instance
    const newExpense = new Expense({
      amount: expense.amount,
      description: expense.description,
      paid_by: expense.paid_by,
      participants: expense.participants,
      split_type: expense.split_type,
      split_values: expense.split_values,
      category: expense.category,
      isRecurring: true,
      recurrenceInterval: expense.recurrenceInterval,
      nextDueDate: dayjs(today)
        .add(recurrenceDaysMap[expense.recurrenceInterval], "day")
        .toDate(),
    });

    await newExpense.save();

    // Update original instance with new nextDueDate
    expense.nextDueDate = newExpense.nextDueDate;
    await expense.save();
  }
};

// Helper: validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper: validate expense input data (for create and update)
const validateExpenseData = (data, isUpdate = false) => {
  const errors = [];

  // Only validate required fields strictly on create
  if (!isUpdate || data.amount !== undefined) {
    if (typeof data.amount !== "number" || data.amount <= 0) {
      errors.push("amount must be a positive number");
    }
  }

  if (!isUpdate || data.description !== undefined) {
    if (!data.description || typeof data.description !== "string") {
      errors.push("description is required and must be a string");
    }
  }

  if (!isUpdate || data.paid_by !== undefined) {
    if (!data.paid_by || typeof data.paid_by !== "string") {
      errors.push("paid_by is required and must be a string");
    }
  }

  if (!isUpdate || data.participants !== undefined) {
    if (!Array.isArray(data.participants) || data.participants.length === 0) {
      errors.push("participants must be a non-empty array");
    }
  }

  if (data.split_type !== undefined) {
    const validSplitTypes = ["equal", "percentage", "exact"];
    if (!validSplitTypes.includes(data.split_type)) {
      errors.push(`split_type must be one of ${validSplitTypes.join(", ")}`);
    }
  }

  // Validate split_values depending on split_type
  if (data.split_type === "percentage") {
    if (!data.split_values || typeof data.split_values !== "object") {
      errors.push("split_values must be provided for percentage split");
    } else {
      const totalPercent = Object.values(data.split_values).reduce((a, b) => a + b, 0);
      if (totalPercent !== 100) {
        errors.push("Sum of percentage split_values must be 100");
      }
    }
  }

  if (data.split_type === "exact") {
    if (!data.split_values || typeof data.split_values !== "object") {
      errors.push("split_values must be provided for exact split");
    } else {
      const totalExact = Object.values(data.split_values).reduce((a, b) => a + b, 0);
      if (data.amount !== undefined && totalExact !== data.amount) {
        errors.push("Sum of exact split_values must be equal to amount");
      }
    }
  }

  if (data.category !== undefined) {
    const validCategories = [
  "Food", "Travel", "Utilities", "Bills", "Shopping",
  "Healthcare", "Entertainment", "Groceries", "Transportation", "Other"
];

    if (!validCategories.includes(data.category)) {
      errors.push(`category must be one of ${validCategories.join(", ")}`);
    }
  }

  if (data.isRecurring !== undefined && data.isRecurring === true) {
    const validIntervals = ["daily", "weekly", "monthly", "yearly"];
    if (!data.recurrenceInterval || !validIntervals.includes(data.recurrenceInterval)) {
      errors.push(`recurrenceInterval must be one of ${validIntervals.join(", ")} when isRecurring is true`);
    }
    if (!data.nextDueDate || isNaN(new Date(data.nextDueDate).getTime())) {
      errors.push("nextDueDate must be a valid date when isRecurring is true");
    }
  }

  return errors;
};

// Create new expense
export const addExpense = async (req, res) => {
  try {
    const data = req.body;

    // Validate input data
    const errors = validateExpenseData(data);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Auto-fill participants if missing (add paid_by and keys of split_values)
    if (!data.participants || data.participants.length === 0) {
      const participantsSet = new Set();
      participantsSet.add(data.paid_by);
      if (data.split_values && typeof data.split_values === "object") {
        Object.keys(data.split_values).forEach((p) => participantsSet.add(p));
      }
      data.participants = Array.from(participantsSet);
    }

    const expense = new Expense(data);
    await expense.save();

    res.status(201).json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
    
  }
};

// Get all expenses
export const getAllExpenses = async (req, res) => {
  try {
    // Process recurring transactions first
    await processRecurringExpenses();

    const expenses = await Expense.find({}).sort({ createdAt: -1 });
    res.json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// Update an expense partially
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid expense ID" });
    }

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    const updateData = req.body;

    // Validate update data (partial allowed)
    const errors = validateExpenseData(updateData, true);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Update the fields
    Object.assign(expense, updateData);
    await expense.save();

    res.json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete an expense by id
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid expense ID" });
    }

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    await expense.deleteOne();
    res.json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
// Get a single expense by ID
export const getExpenseById = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: 'Invalid expense ID' });
  }

  try {
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.status(200).json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
export { processRecurringExpenses };

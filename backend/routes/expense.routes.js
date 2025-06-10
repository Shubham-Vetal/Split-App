import express from 'express';
import {
  addExpense,
  getAllExpenses,
  updateExpense,
  deleteExpense,
  getExpenseById, 
} from '../controllers/expense.controller.js';

const router = express.Router();

router.get('/expenses', getAllExpenses);
router.post('/expenses', addExpense);
router.put('/expenses/:id', updateExpense);
router.delete('/expenses/:id', deleteExpense);
router.get('/expenses/:id', getExpenseById);

export default router;

import axios from 'axios';

const BASE_URL = 'https://split-app-zpq4.onrender.com/api/split';

export const api = {
  // Expense APIs
  getExpenses: async () => {
    const res = await axios.get(`${BASE_URL}/expenses`);
    return res.data;
  },

  getExpenseById: async (id) => {
    try {
      const res = await axios.get(`${BASE_URL}/expenses/${id}`);
      return { success: true, data: res.data };
    } catch (err) {
      console.error('Error fetching expense by ID:', err);
      return { success: false };
    }
  },

  addExpense: async (data) => {
    const res = await axios.post(`${BASE_URL}/expenses`, data);
    return res.data;
  },

  updateExpense: async (id, data) => {
    const res = await axios.put(`${BASE_URL}/expenses/${id}`, data);
    return res.data;
  },

  deleteExpense: async (id) => {
    const res = await axios.delete(`${BASE_URL}/expenses/${id}`);
    return res.data;
  },

  // People API
  getPeople: async () => {
    const res = await axios.get(`${BASE_URL}/people`);
    return res.data;
  },

  // Balance API
  getBalances: async () => {
    const res = await axios.get(`${BASE_URL}/balances`);
    return res.data;
  },

  // Settlement API
  getSettlements: async () => {
    const res = await axios.get(`${BASE_URL}/settlements`);
    return res.data;
  },
};

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Home, Receipt, DollarSign, Users, Menu, X, BarChart2 } from 'lucide-react';

import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import AddExpense from './components/AddExpense';
import Balances from './components/Balances';
import Settlements from './components/Settlements';
import ExpenseAnalytics from './components/ExpenseAnalytics';
import { api } from './services/api'; // <--- ENSURE THIS IMPORT IS PRESENT

function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  // Define loadExpenses here, within the AppLayout component's scope
  // and BEFORE it's used in the JSX return.
  const loadExpenses = async () => {
    try {
      setLoadingExpenses(true);
      const response = await api.getExpenses();
      const expensesData = response.expenses || response.data?.expenses || [];
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
    } catch (error) {
      console.error('Failed to load expenses in AppLayout:', error);
      setExpenses([]);
    } finally {
      setLoadingExpenses(false);
    }
  };

  useEffect(() => {
    loadExpenses(); // Call loadExpenses when the component mounts
  }, []);

  const navigation = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Balances', path: '/balances', icon: DollarSign },
    { name: 'Settlements', path: '/settlements', icon: Users },
  ];

  if (loadingExpenses) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 flex-shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">ExpenseTracker</h1>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-md text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 px-6">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200">
          <div className="text-xs text-slate-500 text-center">
            Expense Management System
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Mobile topbar */}
        <div className="bg-white shadow-sm border-b border-slate-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-md text-slate-400 hover:text-slate-600"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900">
              Expense Tracker
            </h1>
            <div className="w-10" />
          </div>
        </div>

        <main className="flex-1">
          <div className="p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              {/* Pass expenses and loadExpenses as props */}
              <Route path="/expenses" element={<ExpenseList expenses={expenses} loadExpenses={loadExpenses} />} />
              {/* Pass loadExpenses as prop */}
              <Route path="/add-expense" element={<AddExpense loadExpenses={loadExpenses} />} />
              {/* Pass loadExpenses as prop */}
              <Route path="/edit-expense/:id" element={<AddExpense loadExpenses={loadExpenses} />} />

              {/* Analytics component receives expenses */}
              <Route path="/analytics" element={<ExpenseAnalytics expenses={expenses} />} />

              {/* Pass expenses to Balances and Settlements as well, assuming they need it */}
              <Route path="/balances" element={<Balances expenses={expenses} />} />
              <Route path="/settlements" element={<Settlements expenses={expenses} />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
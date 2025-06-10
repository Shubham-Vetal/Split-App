import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Users, Receipt, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [expensesResponse, balancesResponse, peopleResponse] = await Promise.all([
          api.getExpenses(),
          api.getBalances(),
          api.getPeople(),
        ]);

        setExpenses(expensesResponse.expenses || []);
        setBalances(
          balancesResponse.data
            ? Object.entries(balancesResponse.data).map(([name, balance]) => ({ name, balance }))
            : []
        );
        setPeople(peopleResponse.data || []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalOwed = balances.reduce((sum, b) => sum + Math.max(0, b.balance), 0);

  const recentExpenses = [...expenses]
    .filter((e) => e.createdAt && !isNaN(new Date(e.createdAt).getTime()))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
          title="Total Expenses"
          value={`₹${totalExpenses.toFixed(2)}`}
          bgColor="bg-emerald-100"
        />
        <StatCard
          icon={<Users className="h-6 w-6 text-blue-600" />}
          title="People"
          value={people.length}
          bgColor="bg-blue-100"
        />
        <StatCard
          icon={<Receipt className="h-6 w-6 text-amber-600" />}
          title="Total Transactions"
          value={expenses.length}
          bgColor="bg-amber-100"
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6 text-red-600" />}
          title="Money in Circulation"
          value={`₹${totalOwed.toFixed(2)}`}
          bgColor="bg-red-100"
        />
      </div>

      {/* Quick Actions & Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <ActionButton
              onClick={() => navigate('/add-expense')}
              title="Add New Expense"
              description="Record a new shared expense"
              color="emerald"
            />
            <ActionButton
              onClick={() => navigate('/settlements')}
              title="View Settlements"
              description="See who owes what to whom"
              color="blue"
            />
            <ActionButton
              onClick={() => navigate('/balances')}
              title="Check Balances"
              description="View individual balance summaries"
              color="amber"
            />
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Expenses</h3>
          <div className="space-y-3">
            {recentExpenses.length > 0 ? (
              recentExpenses.map((expense) => (
                <div
                  key={expense._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                >
                  <div>
                    <div className="font-medium text-slate-900">{expense.description}</div>
                    <div className="text-sm text-slate-500">Paid by {expense.paid_by}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">
                      ₹{expense.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {expense.createdAt && !isNaN(new Date(expense.createdAt).getTime())
                        ? new Date(expense.createdAt).toLocaleDateString()
                        : 'Unknown date'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                No expenses yet. Add your first expense to get started!
              </div>
            )}
          </div>
          {expenses.length > 3 && (
            <button
              onClick={() => navigate('/expenses')}
              className="w-full mt-4 text-center py-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              View All Expenses
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable stat card
const StatCard = ({ icon, title, value, bgColor }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center">
      <div className={`p-2 ${bgColor} rounded-lg`}>{icon}</div>
      <div className="ml-4">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

// Reusable quick action button
const ActionButton = ({ onClick, title, description, color }) => {
  const colorClasses = {
    emerald: 'hover:border-emerald-300 hover:bg-emerald-50',
    blue: 'hover:border-blue-300 hover:bg-blue-50',
    amber: 'hover:border-amber-300 hover:bg-amber-50',
    red: 'hover:border-red-300 hover:bg-red-50',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border border-slate-200 transition-colors ${
        colorClasses[color] || ''
      }`}
    >
      <div className="font-medium text-slate-900">{title}</div>
      <div className="text-sm text-slate-500">{description}</div>
    </button>
  );
};

export default Dashboard;

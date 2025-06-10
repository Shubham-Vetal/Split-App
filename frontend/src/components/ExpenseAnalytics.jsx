// src/components/ExpenseAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A0', '#19FFED', '#FFA726'];

const ExpenseAnalytics = ({ expenses }) => {
  // State for analytics data
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [spendingPatterns, setSpendingPatterns] = useState([]);
  const [categorySpending, setCategorySpending] = useState([]);
  const [topTransactions, setTopTransactions] = useState([]);

  useEffect(() => {
    if (expenses && expenses.length > 0) {
      processAnalytics(expenses);
    } else {
      // Reset analytics if no expenses
      setMonthlySummary([]);
      setSpendingPatterns([]);
      setCategorySpending([]);
      setTopTransactions([]);
    }
  }, [expenses]);

  const processAnalytics = (data) => {
    // 1. Monthly Spending Summaries
    const monthlyData = data.reduce((acc, expense) => {
      const date = new Date(expense.createdAt);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      acc[monthYear] = (acc[monthYear] || 0) + (Number(expense.amount) || 0);
      return acc;
    }, {});
    const sortedMonthlyData = Object.keys(monthlyData)
      .sort()
      .map(key => ({
        month: key,
        totalAmount: parseFloat(monthlyData[key].toFixed(2))
      }));
    setMonthlySummary(sortedMonthlyData);

    // 2. Individual vs Group Spending Patterns
    const individualGroupData = data.reduce((acc, expense) => {
      if (expense.participants && expense.participants.length > 1) {
        acc.group = (acc.group || 0) + (Number(expense.amount) || 0);
      } else {
        acc.individual = (acc.individual || 0) + (Number(expense.amount) || 0);
      }
      return acc;
    }, { individual: 0, group: 0 });
    setSpendingPatterns([
      { name: 'Individual Spending', value: parseFloat(individualGroupData.individual.toFixed(2)) },
      { name: 'Group Spending', value: parseFloat(individualGroupData.group.toFixed(2)) }
    ].filter(item => item.value > 0)); // Filter out zero values for better chart representation

    // 3. Most expensive categories or transactions
    const categoryData = data.reduce((acc, expense) => {
      const category = expense.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + (Number(expense.amount) || 0);
      return acc;
    }, {});
    const sortedCategoryData = Object.keys(categoryData)
      .map(key => ({
        name: key,
        value: parseFloat(categoryData[key].toFixed(2))
      }))
      .sort((a, b) => b.value - a.value); // Sort by amount descending
    setCategorySpending(sortedCategoryData);

    // Top 5 Most Expensive Transactions
    const sortedTransactions = [...data]
      .sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))
      .slice(0, 5)
      .map(expense => ({
        description: expense.description,
        amount: Number(expense.amount).toFixed(2),
        paid_by: expense.paid_by,
        category: expense.category || 'N/A'
      }));
    setTopTransactions(sortedTransactions);
  };

  if (!expenses || expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center text-slate-500">
        No expenses to analyze yet. Add some expenses to see your analytics!
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Monthly Spending Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Monthly Spending Summary</h3>
        {monthlySummary.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySummary} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              <Legend />
              <Bar dataKey="totalAmount" fill="#0088FE" name="Total Amount" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-slate-500">No monthly spending data available.</p>
        )}
      </div>

      {/* Individual vs Group Spending Patterns */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Individual vs. Group Spending</h3>
        {spendingPatterns.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendingPatterns}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {spendingPatterns.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-slate-500">No individual/group spending data available.</p>
        )}
      </div>

      {/* Most Expensive Categories */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Spending by Category</h3>
        {categorySpending.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categorySpending} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" name="Total Spent" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-slate-500">No category spending data available.</p>
        )}
      </div>

      {/* Top 5 Most Expensive Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Top 5 Most Expensive Transactions</h3>
        {topTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topTransactions.map((transaction, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${transaction.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.paid_by}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-slate-500">No expensive transactions to show.</p>
        )}
      </div>
    </div>
  );
};

export default ExpenseAnalytics;

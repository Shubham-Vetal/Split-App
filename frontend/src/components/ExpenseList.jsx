import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search, Receipt } from 'lucide-react'; // Remove BarChart2 import
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
// import ExpenseAnalytics from './ExpenseAnalytics'; // No longer needed as it's rendered by AppLayout route

// ExpenseList now receives 'expenses' and 'loadExpenses' as props
const ExpenseList = ({ expenses, loadExpenses }) => { // Add expenses and loadExpenses to props
  // const [expenses, setExpenses] = useState([]); // REMOVE: State for expenses is now managed in AppLayout
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  // const [loading, setLoading] = useState(true); // REMOVE: Loading state is now managed in AppLayout
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const [showRecurring, setShowRecurring] = useState(false);
  const [recurringOnly, setRecurringOnly] = useState(false);
  // const [showAnalytics, setShowAnalytics] = useState(false); // REMOVE: Analytics toggle state

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    description: '',
    amount: '',
    paid_by: '',
    category: '',
    participants: [],
    split_type: 'equal',
    isRecurring: false,
    recurrenceInterval: 'monthly',
    nextDueDate: ''
  });

  const navigate = useNavigate();

  // REMOVE: useEffect for initial loadExpenses, it's handled by AppLayout now
  // useEffect(() => {
  //   loadExpenses();
  // }, []);

  useEffect(() => {
    let filtered = expenses.filter(expense => { // 'expenses' is now a prop
      const matchesSearch =
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.paid_by?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || expense.category === filterCategory;
      const matchesRecurring = !recurringOnly || expense.isRecurring;
      return matchesSearch && matchesCategory && matchesRecurring;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'amount':
          comparison = (a.amount || 0) - (b.amount || 0);
          break;
        case 'description':
          comparison = (a.description || '').localeCompare(b.description || '');
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredExpenses(filtered);
  }, [expenses, searchTerm, filterCategory, sortBy, sortOrder, recurringOnly]); // 'expenses' is a prop dependency

  // REMOVE: local loadExpenses function as it's passed as a prop from AppLayout
  // const loadExpenses = async () => { /* ... */ };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.deleteExpense(id);
        if (loadExpenses) await loadExpenses(); // Use the prop loadExpenses
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  const handleEditClick = (expense) => {
    setEditingId(expense._id);
    setEditFormData({
      description: expense.description || '',
      amount: expense.amount || '',
      paid_by: expense.paid_by || '',
      category: expense.category || '',
      participants: expense.participants || [],
      split_type: expense.split_type || 'equal',
      isRecurring: expense.isRecurring || false,
      recurrenceInterval: expense.recurrenceInterval || 'monthly',
      nextDueDate: expense.nextDueDate ? new Date(expense.nextDueDate).toISOString().split('T')[0] : ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async (id) => {
    const payload = {
      ...editFormData,
      amount: Number(editFormData.amount),
    };

    if (!payload.description || !payload.amount || !payload.paid_by) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await api.updateExpense(id, payload);
      setEditingId(null);
      if (loadExpenses) await loadExpenses(); // Use the prop loadExpenses
    } catch (error) {
      console.error('Failed to update expense:', error);
    }
  };

  const categories = [...new Set(expenses.map(e => e.category).filter(Boolean))]; // 'expenses' is a prop

  // REMOVE: local loading check, AppLayout handles it
  // if (loading) { /* ... */ }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">
          All Expenses {/* Always show "All Expenses" now */}
        </h2>
        <div className="flex gap-3">
          {/* REMOVE: Analytics toggle button */}
          {/* <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="inline-flex items-center px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors"
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            {showAnalytics ? 'View List' : 'View Analytics'}
          </button> */}
          {/* Always show "Add Expense" button */}
          <button
            onClick={() => navigate('/add-expense')}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </button>
        </div>
      </div>

      {/* REMOVE: Conditional rendering for showAnalytics */}
      {/* {showAnalytics ? (
        <ExpenseAnalytics expenses={expenses} />
      ) : ( */}
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Filter Expenses</h3>

            {/* Toggle Filters - Horizontal Layout */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recurringOnly}
                    onChange={(e) => setRecurringOnly(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">Recurring Only</span>
                </label>
              </div>

              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRecurring}
                    onChange={(e) => setShowRecurring(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">Show Upcoming</span>
                </label>
              </div>
            </div>

            {/* Search and Dropdown Filters - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="block appearance-none w-full bg-gray-50 border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>

              {/* Sort By */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block appearance-none w-full bg-gray-50 border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="date">Sort by Date</option>
                  <option value="amount">Sort by Amount</option>
                  <option value="description">Sort by Description</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>

              {/* Sort Order */}
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="block appearance-none w-full bg-gray-50 border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchTerm || filterCategory || recurringOnly) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Search: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-1.5 inline-flex text-emerald-400 hover:text-emerald-600"
                    >
                      <span className="sr-only">Remove filter</span>
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                )}
                {filterCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Category: {filterCategory}
                    <button
                      onClick={() => setFilterCategory('')}
                      className="ml-1.5 inline-flex text-emerald-400 hover:text-emerald-600"
                    >
                      <span className="sr-only">Remove filter</span>
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                )}
                {recurringOnly && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Recurring Only
                    <button
                      onClick={() => setRecurringOnly(false)}
                      className="ml-1.5 inline-flex text-emerald-400 hover:text-emerald-600"
                    >
                      <span className="sr-only">Remove filter</span>
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Upcoming Recurring Expenses Section */}
          {showRecurring && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Upcoming Recurring Expenses</h3>
              {expenses
                .filter(e => e.isRecurring && e.nextDueDate && new Date(e.nextDueDate) >= new Date()) // Filter for recurring with future due dates
                .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))
                .map(expense => (
                  <div key={expense._id} className="py-2 border-b border-slate-100 last:border-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{expense.description}</span>
                        <span className="text-sm text-slate-500 ml-2">
                          (${expense.amount} every {expense.recurrenceInterval})
                        </span>
                      </div>
                      <div className="text-sm text-emerald-600">
                        Due: {new Date(expense.nextDueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              }
              {expenses.filter(e => e.isRecurring && e.nextDueDate && new Date(e.nextDueDate) >= new Date()).length === 0 && (
                  <p className="text-slate-500 text-center">No upcoming recurring expenses.</p>
              )}
            </div>
          )}

          {/* Expense List */}
          {!showRecurring && ( // Only show this section if showRecurring is false
            <div className="space-y-4">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <div key={expense._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    {expense.isRecurring && (
                      <div className="flex items-center gap-1 mb-2 text-xs font-medium text-emerald-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Recurring ({expense.recurrenceInterval})
                        {expense.nextDueDate && (
                          <span className="ml-2 px-2 py-1 bg-emerald-100 rounded-full">
                            Next: {new Date(expense.nextDueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {editingId === expense._id ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`editRecurring-${expense._id}`} // Unique ID for each checkbox
                                checked={editFormData.isRecurring}
                                onChange={(e) => setEditFormData({...editFormData, isRecurring: e.target.checked})}
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              <label htmlFor={`editRecurring-${expense._id}`} className="text-sm">
                                Recurring expense
                              </label>
                            </div>
                            {editFormData.isRecurring && (
                              <div className="grid grid-cols-2 gap-2">
                                <select
                                  value={editFormData.recurrenceInterval || 'monthly'}
                                  onChange={(e) => setEditFormData({...editFormData, recurrenceInterval: e.target.value})}
                                  className="border rounded px-3 py-1"
                                >
                                  <option value="daily">Daily</option>
                                  <option value="weekly">Weekly</option>
                                  <option value="monthly">Monthly</option>
                                  <option value="yearly">Yearly</option>
                                </select>
                                <input
                                  type="date"
                                  value={editFormData.nextDueDate || ''}
                                  onChange={(e) => setEditFormData({...editFormData, nextDueDate: e.target.value})}
                                  className="border rounded px-3 py-1"
                                  min={new Date().toISOString().split('T')[0]}
                                />
                              </div>
                            )}
                            <input
                              name="description"
                              value={editFormData.description}
                              onChange={handleEditChange}
                              placeholder="Description"
                              className="border rounded px-3 py-1 w-full"
                            />
                            <input
                              name="amount"
                              type="number"
                              value={editFormData.amount}
                              onChange={handleEditChange}
                              placeholder="Amount"
                              className="border rounded px-3 py-1 w-full"
                            />
                            <input
                              name="paid_by"
                              value={editFormData.paid_by}
                              onChange={handleEditChange}
                              placeholder="Paid by"
                              className="border rounded px-3 py-1 w-full"
                            />
                            <input
                              name="category"
                              value={editFormData.category}
                              onChange={handleEditChange}
                              placeholder="Category"
                              className="border rounded px-3 py-1 w-full"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditSave(expense._id)}
                                className="bg-emerald-600 text-white px-4 py-1 rounded hover:bg-emerald-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="bg-gray-300 text-black px-4 py-1 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-slate-900">{expense.description}</h3>
                              {expense.category && (
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                  {expense.category}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                              <div><span className="font-medium">Amount:</span> ${Number(expense.amount).toFixed(2)}</div>
                              <div><span className="font-medium">Paid by:</span> {expense.paid_by}</div>
                              <div><span className="font-medium">Date:</span> {new Date(expense.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div className="mt-2">
                              <span className="font-medium text-sm text-slate-600">Split between:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(expense.participants || []).map((person, index) => (
                                  <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md">
                                    {person}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEditClick(expense)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                  <div className="text-slate-400 mb-4">
                    <Receipt className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No expenses found</h3>
                  <p className="text-slate-500 mb-6">
                    {searchTerm || filterCategory ? 'Try adjusting your filters' : 'Get started by adding your first expense'}
                  </p>
                  <button
                    onClick={() => navigate('/add-expense')}
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Expense
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      {/* )} */} {/* End of conditional rendering for showAnalytics */}
    </div>
  );
};

export default ExpenseList;
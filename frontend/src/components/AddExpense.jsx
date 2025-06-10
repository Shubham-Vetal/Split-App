import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, DollarSign, Calendar, Tag } from "lucide-react";
import { api } from "../services/api";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams

// Accept loadExpenses as a prop
const AddExpense = ({ loadExpenses }) => { // Removed isEditing, editingExpense props from here
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL for edit mode
  const isEditing = !!id; // Determine if in edit mode based on ID

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitBetween, setSplitBetween] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("");
  const [newPerson, setNewPerson] = useState("");
  const [availablePeople, setAvailablePeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState("monthly");
  const [nextDueDate, setNextDueDate] = useState("");

  const commonCategories = [
    "Food",
    "Travel",
    "Utilities",
    "Bills",
    "Shopping",
    "Healthcare",
    "Entertainment",
    "Groceries",
    "Transportation",
    "Other",
  ];

  // Effect to load people and (if editing) load the specific expense
  useEffect(() => {
    loadPeople();
    if (isEditing && id) {
      const fetchExpense = async () => {
        setLoading(true);
        try {
          const response = await api.getExpense(id); // Assuming getExpense takes the ID
          const expenseData = response.expense || response.data; // Adjust based on your API
          if (expenseData) {
            setDescription(expenseData.description || "");
            setAmount(expenseData.amount?.toString() || "");
            setPaidBy(expenseData.paid_by || "");
            setSplitBetween(expenseData.participants || []);
            // Ensure date is in 'YYYY-MM-DD' format
            setDate(expenseData.date ? new Date(expenseData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
            setCategory(expenseData.category || "");
            setIsRecurring(expenseData.isRecurring || false);
            setRecurrenceInterval(expenseData.recurrenceInterval || "monthly");
            // Ensure nextDueDate is in 'YYYY-MM-DD' format
            setNextDueDate(expenseData.nextDueDate ? new Date(expenseData.nextDueDate).toISOString().split("T")[0] : "");
          }
        } catch (err) {
          console.error("Failed to load expense for editing:", err);
          setErrors({ fetch: "Failed to load expense data." });
        } finally {
          setLoading(false);
        }
      };
      fetchExpense();
    }
  }, [isEditing, id]); // Depend on isEditing and id

  const loadPeople = async () => {
    try {
      const res = await api.getPeople();
      if (res.success && Array.isArray(res.data)) {
        setAvailablePeople(res.data);
      } else {
        setAvailablePeople([]);
      }
    } catch (err) {
      console.error("Failed to load people:", err);
      setAvailablePeople([]);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!description.trim()) newErrors.description = "Description is required";
    if (!amount || parseFloat(amount) <= 0)
      newErrors.amount = "Amount must be greater than 0";
    if (!paidBy.trim()) newErrors.paidBy = "Please specify who paid";
    if (splitBetween.length === 0)
      newErrors.splitBetween =
        "Please select at least one person to split with";
    if (!date) newErrors.date = "Date is required";
    if (isRecurring && !nextDueDate)
      newErrors.nextDueDate =
        "Next due date is required for recurring expenses";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const expenseData = {
        description: description.trim(),
        amount: parseFloat(amount),
        paid_by: paidBy.trim(),
        participants: splitBetween,
        split_type: "equal",
        date,
        category: category.trim() || "Other",
        isRecurring,
        ...(isRecurring && { // Conditionally add recurrence details
          recurrenceInterval,
          nextDueDate,
        }),
      };

      if (isEditing) {
        await api.updateExpense(id, expenseData); // Use 'id' from useParams
      } else {
        await api.addExpense(expenseData);
      }

      // Call loadExpenses passed from AppLayout to refresh data
      if (loadExpenses) { // Check if prop exists before calling
        await loadExpenses();
      }

      navigate("/expenses"); // Navigate back to the list
    } catch (error) {
      console.error("Failed to save expense:", error);
      setErrors({ submit: "Failed to save expense. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const addPerson = () => {
    const person = newPerson.trim();
    if (person && !availablePeople.includes(person)) {
      setAvailablePeople((prev) => [...prev, person]);
      setSplitBetween((prev) => [...prev, person]);
      setNewPerson("");
    }
  };

  const togglePersonInSplit = (person) => {
    setSplitBetween((prev) =>
      prev.includes(person)
        ? prev.filter((p) => p !== person)
        : [...prev, person]
    );
  };

  const addPayerToSplit = () => {
    if (paidBy && !splitBetween.includes(paidBy)) {
      setSplitBetween((prev) => [...prev, paidBy]);
    }
  };

  // Show loading spinner for initial fetch when editing
  if (isEditing && loading && !description) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/expenses")}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-slate-900">
              {isEditing ? "Edit Expense" : "Add New Expense"}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
          {errors.fetch && ( // Display fetch error if any
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.fetch}</p>
            </div>
          )}

          {/* ... (rest of your form JSX remains the same) ... */}
          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description *
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg ${
                errors.description ? "border-red-300" : "border-slate-300"
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-slate-400 h-5 w-5" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full pl-10 py-3 border rounded-lg ${
                    errors.amount ? "border-red-300" : "border-slate-300"
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.date ? "border-red-300" : "border-slate-300"
                }`}
              />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg"
            >
              <option value="">Select a category</option>
              {commonCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          {/* Recurring Transaction */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="isRecurring" className="text-sm font-medium">
                This is a recurring expense
              </label>
            </div>

            {isRecurring && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Recurrence Interval *
                    </label>
                    <select
                      value={recurrenceInterval}
                      onChange={(e) => setRecurrenceInterval(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Next Due Date *
                    </label>
                    <input
                      type="date"
                      value={nextDueDate}
                      onChange={(e) => setNextDueDate(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                {errors.nextDueDate && (
                  <p className="text-sm text-red-600 pl-7">
                    {errors.nextDueDate}
                  </p>
                )}
              </>
            )}
          </div>
          {/* Paid By */}
          <div>
            <label className="block text-sm font-medium mb-2">Paid By *</label>
            <div className="flex gap-2">
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className={`flex-1 px-4 py-3 border rounded-lg ${
                  errors.paidBy ? "border-red-300" : "border-slate-300"
                }`}
              >
                <option value="">Select person</option>
                {availablePeople.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addPayerToSplit}
                disabled={!paidBy || splitBetween.includes(paidBy)}
                className="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-300"
              >
                Add to Split
              </button>
            </div>
            {errors.paidBy && (
              <p className="text-sm text-red-600">{errors.paidBy}</p>
            )}
          </div>

          {/* Split Between */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">
                Split Between * ({splitBetween.length})
              </label>
              <button
                type="button"
                onClick={() => setSplitBetween([...availablePeople])}
                disabled={availablePeople.length === 0}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-full border border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Tag className="w-4 h-4" />
                Split Equally
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                value={newPerson}
                onChange={(e) => setNewPerson(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addPerson())
                }
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                placeholder="Add new person"
              />
              <button
                type="button"
                onClick={addPerson}
                disabled={!newPerson.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-300"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availablePeople.map((person) => {
                const selected = splitBetween.includes(person);
                return (
                  <button
                    key={person}
                    type="button"
                    onClick={() => togglePersonInSplit(person)}
                    className={`flex justify-between items-center p-3 border rounded-lg ${
                      selected
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "bg-white border-slate-300"
                    }`}
                  >
                    <span>{person}</span>
                    {selected && (
                      <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
            {errors.splitBetween && (
              <p className="text-sm text-red-600">{errors.splitBetween}</p>
            )}
          </div>

          {splitBetween.length > 0 && amount && parseFloat(amount) > 0 && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Split breakdown:</p>
              <p className="font-medium">
                ₹{(parseFloat(amount) / splitBetween.length).toFixed(2)} per
                person
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate("/expenses")}
              className="flex-1 px-6 py-3 border border-slate-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg"
            >
              {loading
                ? "Saving..."
                : isEditing
                ? "Update Expense"
                : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
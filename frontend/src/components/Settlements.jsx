import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, DollarSign, Users, CheckCircle, RefreshCw, AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';  // Make sure this path is correct and api is exported

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
  </div>
);

const ErrorState = ({ onRetry }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
    <div className="text-slate-400 mb-4">
      <AlertCircle className="h-12 w-12 mx-auto" />
    </div>
    <h3 className="text-lg font-medium text-slate-900 mb-2">Failed to load settlements</h3>
    <p className="text-slate-500 mb-6">Please try again</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
    >
      <RefreshCw className="h-4 w-4 mr-2" />
      Retry
    </button>
  </div>
);

const SummaryCard = ({ icon: Icon, title, value, valueClass = 'text-slate-900', bgColor = 'bg-white' }) => (
  <div className={`${bgColor} rounded-xl shadow-sm border border-slate-200 p-6`}>
    <div className="flex items-center">
      <div className="p-3 bg-emerald-100 rounded-lg">
        <Icon className="h-6 w-6 text-emerald-600" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
      </div>
    </div>
  </div>
);

const PersonBadge = ({ name, bgColor, textColor, label }) => (
  <div className="flex items-center space-x-3">
    <div className={`${bgColor} rounded-full w-10 h-10 flex items-center justify-center`}>
      <span className={`text-sm font-medium ${textColor}`}>{name.charAt(0).toUpperCase()}</span>
    </div>
    <div>
      <p className="font-medium text-slate-900">{name}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </div>
);

const AmountArrow = ({ amount }) => (
  <div className="flex items-center space-x-2">
    <ArrowRight className="h-5 w-5 text-slate-400" />
    <div className="px-4 py-2 bg-emerald-100 rounded-lg">
      <p className="text-lg font-bold text-emerald-700">₹{amount.toFixed(2)}</p>
    </div>
    <ArrowRight className="h-5 w-5 text-slate-400" />
  </div>
);

const SettlementItem = ({ settlement, index }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <PersonBadge name={settlement.from} bgColor="bg-blue-100" textColor="text-blue-700" label="Pays" />
        <AmountArrow amount={settlement.amount} />
        <PersonBadge name={settlement.to} bgColor="bg-green-100" textColor="text-green-700" label="Receives" />
      </div>
      <div className="flex items-center space-x-3">
        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
          #{index + 1}
        </span>
      </div>
    </div>
  </div>
);

const SettlementInstructions = ({ count }) => (
  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
    <div className="flex items-center space-x-3">
      <CheckCircle className="h-6 w-6 text-emerald-600" />
      <div>
        <h3 className="font-medium text-emerald-900">Settlement Instructions</h3>
        <p className="text-sm text-emerald-700 mt-1">
          Complete these {count} transaction{count !== 1 ? 's' : ''} to settle all debts. 
          This is the minimum number of transactions needed.
        </p>
      </div>
    </div>
  </div>
);

const AllSettled = ({ onAddExpense, onViewBalances }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
    <div className="text-slate-400 mb-4">
      <CheckCircle className="h-12 w-12 mx-auto" />
    </div>
    <h3 className="text-lg font-medium text-slate-900 mb-2">All settled up!</h3>
    <p className="text-slate-500 mb-6">No settlements needed. Everyone is even.</p>
    <div className="flex justify-center gap-3">
      <button
        onClick={onAddExpense}
        className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
      >
        Add Expense
      </button>
      <button
        onClick={onViewBalances}
        className="inline-flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
      >
        View Balances
      </button>
    </div>
  </div>
);

export default function Settlements() {
  const navigate = useNavigate();

  const [settlementSummary, setSettlementSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSettlements = async () => {
    try {
      setLoading(true);
      const response = await api.getSettlements();

      if (response.success && Array.isArray(response.data)) {
        const settlements = response.data;

        // Calculate total debts by summing amounts
        const totalDebts = settlements.reduce((sum, s) => sum + s.amount, 0);

        setSettlementSummary({ settlements, totalDebts });
      } else {
        setSettlementSummary(null);
      }
    } catch (error) {
      console.error('Failed to load settlements:', error);
      setSettlementSummary(null);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadSettlements();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!settlementSummary) return <ErrorState onRetry={loadSettlements} />;

  const { settlements, totalDebts } = settlementSummary;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard
          icon={DollarSign}
          title="Total Debts to Settle"
          // Changed to Rupee symbol
          value={`₹${totalDebts.toFixed(2)}`} 
        />
        <SummaryCard
          icon={Users}
          title="Transactions Needed"
          value={settlements.length}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Optimal Settlements</h2>
          <p className="text-sm text-slate-500 mt-1">
            Minimum transactions needed to settle all debts
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadSettlements}
            className="inline-flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => navigate('/balances')}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Users className="h-4 w-4 mr-2" />
            View Balances
          </button>
        </div>
      </div>

      {/* Settlements List */}
      <div className="space-y-4">
        {settlements.length > 0 ? (
          <>
            {settlements.map((settlement, i) => (
              <SettlementItem key={i} settlement={settlement} index={i} />
            ))}
            <SettlementInstructions count={settlements.length} />
          </>
        ) : (
          <AllSettled
            onAddExpense={() => navigate('/add-expense')}
            onViewBalances={() => navigate('/balances')}
          />
        )}
      </div>
    </div>
  );
}

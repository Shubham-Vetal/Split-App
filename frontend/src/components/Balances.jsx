import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, TrendingDown, Users, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

const SummaryCards = ({ totalOwed, totalOwes, peopleCount }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center">
        <div className="p-3 bg-green-100 rounded-lg">
          <TrendingUp className="h-6 w-6 text-green-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-slate-600">Total Owed to Others</p>
          <p className="text-2xl font-bold text-green-600">${totalOwed.toFixed(2)}</p>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center">
        <div className="p-3 bg-red-100 rounded-lg">
          <TrendingDown className="h-6 w-6 text-red-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-slate-600">Total Owes to Others</p>
          <p className="text-2xl font-bold text-red-600">${totalOwes.toFixed(2)}</p>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-slate-600">People</p>
          <p className="text-2xl font-bold text-slate-900">{peopleCount}</p>
        </div>
      </div>
    </div>
  </div>
);

const BalanceItem = ({ balance }) => {
  const { person, balance: bal, owedBy, owes } = balance;
  const statusLabel = bal > 0 ? 'Owed' : bal < 0 ? 'Owes' : 'Even';
  const statusBg = bal > 0 ? 'bg-green-100 text-green-700' : bal < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700';
  const amountColor = bal > 0 ? 'text-green-600' : bal < 0 ? 'text-red-600' : 'text-slate-600';
  const description = bal > 0 ? 'Should receive' : bal < 0 ? 'Should pay' : 'All settled up';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{person}</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusBg}`}>
          {statusLabel}
        </div>
      </div>

      <div className="mb-4">
        <div className={`text-2xl font-bold ${amountColor}`}>
          ${Math.abs(bal).toFixed(2)}
        </div>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <div className="space-y-3">
        {Object.keys(owedBy).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Owed by:</h4>
            <div className="space-y-1">
              {Object.entries(owedBy).map(([person, amount]) => (
                <div key={person} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">{person}</span>
                  <span className="font-medium text-green-600">${amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.keys(owes).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Owes to:</h4>
            <div className="space-y-1">
              {Object.entries(owes).map(([person, amount]) => (
                <div key={person} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">{person}</span>
                  <span className="font-medium text-red-600">${amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.keys(owes).length === 0 && Object.keys(owedBy).length === 0 && (
          <div className="text-center py-4 text-slate-500">
            No outstanding balances
          </div>
        )}
      </div>
    </div>
  );
};

const NoBalances = ({ onAddExpense }) => (
  <div className="col-span-full bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
    <div className="text-slate-400 mb-4">
      <Users className="h-12 w-12 mx-auto" />
    </div>
    <h3 className="text-lg font-medium text-slate-900 mb-2">No balances yet</h3>
    <p className="text-slate-500 mb-6">
      Add some expenses to see balance calculations
    </p>
    <button
      onClick={onAddExpense}
      className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
    >
      Add First Expense
    </button>
  </div>
);

const Actions = ({ onRefresh, onViewSettlements }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <h2 className="text-xl font-semibold text-slate-900">Individual Balances</h2>
    <div className="flex gap-3">
      <button
        onClick={onRefresh}
        className="inline-flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </button>
      <button
        onClick={onViewSettlements}
        className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
      >
        <DollarSign className="h-4 w-4 mr-2" />
        View Settlements
      </button>
    </div>
  </div>
);

const Balances = () => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

 const loadBalances = async () => {
  try {
    setLoading(true);
    const response = await api.getBalances();
    if (response.success && response.data) {
      const balancesArray = Object.entries(response.data).map(([person, balance]) => ({
        person,
        balance,
        owedBy: {},
        owes: {},
      }));
      setBalances(balancesArray);
    } else {
      setBalances([]);
    }
  } catch (error) {
    console.error('Failed to load balances:', error);
    setBalances([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadBalances();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const totalOwed = balances.reduce((sum, b) => sum + Math.max(0, b.balance), 0);
  const totalOwes = balances.reduce((sum, b) => sum + Math.max(0, -b.balance), 0);

  return (
    <div className="space-y-6">
      <SummaryCards totalOwed={totalOwed} totalOwes={totalOwes} peopleCount={balances.length} />
      <Actions
        onRefresh={loadBalances}
        onViewSettlements={() => navigate('/settlements')}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {balances.length > 0 ? (
          balances.map(balance => <BalanceItem key={balance.person} balance={balance} />)
        ) : (
          <NoBalances onAddExpense={() => navigate('/add-expense')} />
        )}
      </div>
    </div>
  );
};

export default Balances;

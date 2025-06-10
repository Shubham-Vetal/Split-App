import Expense from "../models/expense.model.js";

// Get all unique people (paid_by + participants)
const getAllPeople = async () => {
  const expenses = await Expense.find({}, 'paid_by participants');
  const set = new Set();

  expenses.forEach(exp => {
    set.add(exp.paid_by);
    exp.participants.forEach(p => set.add(p));
  });

  return Array.from(set);
};

// Helper: Calculate net balances of all people from expenses
const calculateBalances = (expenses, people) => {
  // Initialize balances to 0
  const balances = {};
  people.forEach(p => balances[p] = 0);

  expenses.forEach(exp => {
    const { amount, paid_by, split_type, split_values = {}, participants = [] } = exp;
    const participantsList = participants.length ? participants : [paid_by];

    // Add amount to the person who paid
    balances[paid_by] += amount;

    if (split_type === 'equal') {
      const share = amount / participantsList.length;
      participantsList.forEach(p => balances[p] -= share);
    } else if (split_type === 'percentage') {
      participantsList.forEach(p => {
        const percent = split_values[p] || 0;
        balances[p] -= amount * (percent / 100);
      });
    } else if (split_type === 'exact') {
      participantsList.forEach(p => {
        const val = split_values[p] || 0;
        balances[p] -= val;
      });
    }
  });

  // Round balances to 2 decimals to avoid float precision issues
  Object.keys(balances).forEach(p => {
    balances[p] = Number(balances[p].toFixed(2));
  });

  return balances;
};

// GET /people - List of all people involved
export const getPeople = async (req, res) => {
  try {
    const people = await getAllPeople();
    res.json({ success: true, data: people });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /balances - Net balance per person
export const getBalances = async (req, res) => {
  try {
    const expenses = await Expense.find();
    const people = await getAllPeople();

    const balances = calculateBalances(expenses, people);

    res.json({ success: true, data: balances });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /settlements - Minimal set of transactions to settle debts
export const getSettlements = async (req, res) => {
  try {
    const expenses = await Expense.find();
    const people = await getAllPeople();

    const balances = calculateBalances(expenses, people);
    const simplified = simplifyTransactions(balances);

    res.json({ success: true, data: simplified });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Helper: Simplify transactions for minimal settlements
function simplifyTransactions(balances) {
  // Create arrays of people with positive and negative balances
  const arr = Object.entries(balances)
    .map(([person, balance]) => ({ person, balance }))
    .filter(({ balance }) => Math.abs(balance) > 0.01);

  const payers = arr.filter(p => p.balance > 0);
  const debtors = arr.filter(p => p.balance < 0);

  const settlements = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < payers.length) {
    const debtor = debtors[i];
    const payer = payers[j];
    const amount = Math.min(payer.balance, -debtor.balance);

    settlements.push({
      from: debtor.person,
      to: payer.person,
      amount: Number(amount.toFixed(2)),
    });

    debtor.balance += amount;
    payer.balance -= amount;

    if (Math.abs(debtor.balance) < 0.01) i++;
    if (Math.abs(payer.balance) < 0.01) j++;
  }

  return settlements;
}

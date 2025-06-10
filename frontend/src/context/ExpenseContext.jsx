// src/context/ExpenseContext.jsx
import React, { createContext, useState } from 'react';

// Create the context
export const ExpenseContext = createContext();

// Create the provider component
export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);

  // Add any functions or state updates you need here

  return (
    <ExpenseContext.Provider value={{ expenses, setExpenses }}>
      {children}
    </ExpenseContext.Provider>
  );
};

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ExpenseProvider } from "./context/ExpenseContext";
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
     <ExpenseProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </ExpenseProvider>
  </React.StrictMode>
);

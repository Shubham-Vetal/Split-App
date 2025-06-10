# Expense Tracker Application

## Overview

This application is a robust system designed to help groups of people split expenses fairly and calculate who owes money to whom. It's ideal for various scenarios like roommates splitting utility bills, friends sharing dinner costs, or travel buddies managing trip expenses. Inspired by popular mobile apps like Splitwise and Google Pay Bills Split, this system aims to simplify collective financial management.

## Features

* **Add/Edit/Delete Expenses:** Easily manage your expense records with full CRUD (Create, Read, Update, Delete) functionality.
* **Split Expenses:** Distribute costs among multiple participants, accommodating various split scenarios (e.g., equal splits).
* **Recurring Expenses:** Mark expenses as recurring with defined intervals (daily, weekly, monthly, yearly) and track their next due dates.
* **Filter & Sort Expenses:** Efficiently organize and find specific expenses by description, amount, date, category, and payer.
* **Expense Analytics:** Gain insights into spending patterns through visual charts and graphs (e.g., spending by category, monthly trends).
* **Balances Overview:** Clearly view who has paid what and the current balance of each participant within a group.
* **Settlements:** Facilitate the process of settling outstanding debts among participants, showing net balances.
* **Responsive Design:** Ensures a seamless user experience across various devices and screen sizes.

## Technologies Used

### Frontend
* **React:** A declarative, component-based JavaScript library for building interactive user interfaces.
* **React Router:** For efficient client-side routing within the single-page application.
* **Tailwind CSS:** A utility-first CSS framework that enables rapid and consistent styling directly in your markup.
* **Lucide React:** A set of beautiful, highly customizable open-source icons for a modern UI.
* **Vite:** A next-generation frontend tooling that provides an extremely fast development server and optimized build process.

### Backend
* **Node.js:** A JavaScript runtime environment that executes server-side code.
* **Express.js:** A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
* **Mongoose:** An elegant MongoDB object modeling tool for Node.js, providing a straightforward, schema-based solution to model your application data.

### Database
* **MongoDB:** A leading NoSQL database that stores data in flexible, JSON-like documents, well-suited for scalable applications.

---

## Setup Instructions for Local Development

Follow these steps to get the Expense Tracker application up and running on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js:** (LTS version recommended) Download from [nodejs.org](https://nodejs.org/en/download/)
* **npm** (Node Package Manager) or **Yarn**: Typically comes with Node.js.
* **Git:** Download from [git-scm.com](https://git-scm.com/downloads)
* **MongoDB:** Install MongoDB Community Edition and ensure your MongoDB server is running. Refer to the [official MongoDB documentation](https://docs.mongodb.com/manual/installation/) for detailed installation guides for your operating system.

### 1. Clone the Repository

Open your terminal or command prompt and clone the project:

```bash
git clone [https://github.com/Shubham-Vetal/Split-App.git](https://github.com/Shubham-Vetal/Split-App.git)
cd Split-App

2. Backend Setup
The backend handles API requests, business logic, and database interactions.

Navigate to the backend directory:

Bash

cd backend
Install backend dependencies:

Bash

npm install
# or if you use yarn:
# yarn install
Create Environment Variables:
Create a file named .env in the backend directory (at the same level as backend/package.json). This file stores sensitive information and configuration.

# backend/.env
PORT=4000
MONGO_URI=mongodb+srv://shubhamvetal3915:eHiFvhgtI4Z1dl95@cluster0.pdepceu.mongodb.net/split-app

Important: Ensure your MONGODB_URI points to a running MongoDB instance.

Run the Backend Server:

Bash

npm run dev # Or 'node index.js' if your main server file is index.js
The backend server should start, typically listening on http://localhost:4000.

3. Frontend Setup
The frontend is your React application, providing the user interface.

Navigate to the frontend directory:
Bash
cd ../frontend
Install frontend dependencies:

Bash
npm install

Create Environment Variables (for Frontend):
Create a file named .env in your frontend directory (at the same level as frontend/package.json). This tells the frontend where your backend API is.

# frontend/.env
VITE_BASE_URL=http://localhost:4000
(Note: For Vite projects, environment variables should be prefixed with VITE_.)

Run the Frontend Development Server:
Bash
npm run dev # This is the standard command for Vite development server
This will usually open your application in your web browser at http://localhost:5173 (Vite's default port) or similar.

4. Running the Complete Application
For the application to function correctly, both your backend server and frontend development server must be running simultaneously in separate terminal windows.

Backend: npm run devt (in the backend directory)
Frontend: npm run dev (in the frontend directory)

API Endpoints
The application exposes the following RESTful API endpoints for managing expenses and settlements. All API endpoints are prefixed with http://localhost:4000/api/split.

Expenses Management
Method	Endpoint	Description	Request Body (JSON)	Success Response (JSON)	Error Response (JSON)
GET	/expenses	Retrieves all expenses. Recurring expenses due today are processed before listing.	None	{"success": true, "expenses": [...]}	{"success": false, "message": "Server error"}
GET	/expenses/:id	Retrieves a single expense by its ID.	None	{"success": true, "expense": {...}}	{"success": false, "message": "Expense not found"}
POST	/expenses	Creates a new expense.	See Add Expense Request Body below.	{"success": true, "expense": {...}}	{"success": false, "errors": [...]} (validation) or {"success": false, "message": "Server error"}
PUT	/expenses/:id	Updates an existing expense by its ID.	See Update Expense Request Body below.	{"success": true, "expense": {...}}	{"success": false, "message": "Expense not found"} or {"success": false, "errors": [...]}
DELETE	/expenses/:id	Deletes an expense by its ID.	None	{"success": true, "message": "Expense deleted successfully"}	{"success": false, "message": "Expense not found"}


Settlement & Balance Endpoints
Method	Endpoint	Description	Request Body (JSON)	Success Response (JSON)	Error Response (JSON)
GET	/people	Retrieves a list of all unique individuals involved in expenses (payers and participants).	None	{"success": true, "data": ["Alice", "Bob"]}	{"success": false, "message": "Server error"}
GET	/balances	Calculates and returns the net balance for each person. A positive balance means the person is owed money, a negative balance means they owe money.	None	{"success": true, "data": {"Alice": 50.00, "Bob": -50.00}}	{"success": false, "message": "Server error"}
GET	/settlements	Calculates the minimal set of transactions required to settle all debts among participants.	None	{"success": true, "data": [{"from": "Bob", "to": "Alice", "amount": 50.00}]}	{"success": false, "message": "Server error"}


Calculate Individual Balances:
For each expense, the amount is added to the paid_by person's balance.
The amount is then distributed among the participants based on the split_type (equal, percentage, or exact). Each participant's share is subtracted from their balance.
equal split: amount / number of participants.
percentage split: Each participant's split_values percentage of the amount.
exact split: Each participant's split_values exact amount.
Balances are rounded to two decimal places to handle floating-point precision.
A positive balance means the person is a creditor (they are owed money).
A negative balance means the person is a debtor (they owe money).
Simplify Transactions (Minimizing Transfers):

The algorithm separates all participants into two groups: debtors (those with negative balances) and creditors (those with positive balances).
It then iteratively matches the highest debtor (owes the most) with the highest creditor (is owed the most).
The transaction amount is the minimum of the absolute values of their respective balances.
This amount is transferred, and their respective balances are updated.
The process continues until all balances are effectively zero, resulting in the most efficient set of transactions.
Example Scenario:
Let's say we have three people: Alice, Bob, and Charlie.

Expense 1: Alice pays $100 for dinner for Alice, Bob, Charlie (equal split).
Alice paid: +$100
Each owes: $100 / 3 = $33.33
Alice's balance: $100 - $33.33 = +$66.67
Bob's balance: -$33.33
Charlie's balance: -$33.33
Expense 2: Bob pays $50 for groceries for Bob and Charlie (equal split).
Bob paid: +$50 (new total: $50 - $33.33 = $16.67)
Each owes: $50 / 2 = $25
Bob's balance: $16.67 - $25 = -$8.33
Charlie's balance: -$33.33 - $25 = -$58.33
Final Balances:

Alice: +$66.67 (Creditor)
Bob: -$8.33 (Debtor)
Charlie: -$58.33 (Debtor)
Simplified Settlements:

Charlie owes Alice $58.33. Charlie's balance becomes $0, Alice's becomes $66.67 - $58.33 = $8.34.
Bob owes Alice $8.33. Bob's balance becomes $0, Alice's becomes $8.34 - $8.33 = $0.01 (due to rounding).
Resulting Settlements:

Charlie pays Alice: $58.33
Bob pays Alice: $8.33
Known Limitations and Assumptions
Authentication & User Accounts: The current application identifies users by simple names (strings). There is no user authentication, authorization, or persistent user accounts. Anyone can add or modify expenses under any name.
Currency: All transactions are assumed to be in a single currency; no multi-currency support or conversion is implemented.
Recurring Expenses Processing: Recurring expenses are processed when the GET /api/expenses endpoint is called. This means if getAllExpenses isn't called for several days, multiple instances might be created at once for overdue recurring expenses. For a production environment, a dedicated cron job or external scheduler would be a more robust approach to handle recurring expense generation.
Split Types Implementation: While the backend validates for percentage and exact splits, the frontend might currently primarily support equal splits in the UI. Ensure the frontend's expense addition/editing forms fully support all backend split types if desired.
Partial Updates Complexity: The PUT /api/expenses/:id endpoint allows partial updates. However, complex partial updates (e.g., changing split_type while also requiring split_values to be updated or removed) require careful handling in the frontend to ensure data integrity and re-validation.
Error Handling Detail: Error responses currently provide generic "Server error" messages for internal issues. Implementing more specific error codes or detailed messages would enhance API debugging and frontend error handling.
No Direct Person Management: There's no dedicated API endpoint for adding or deleting people. People are automatically created/managed based on their appearance in paid_by or participants fields of expenses.
Database Schema
This section outlines the structure of the data stored in MongoDB.

expenses Collection
This is the primary collection storing individual expense records. Each document represents a single expense.

Field	Type	Description	Required	Example Value
_id	ObjectId	Unique identifier for the expense document.	Yes	65c02b74c3d2e1f0e4b8a9c7
description	String	A brief, clear description of the expense.	Yes	"Dinner at ABC Restaurant"
amount	Number	The total monetary value of the expense.	Yes	45.75
paid_by	String	The name of the person who initially paid for the expense.	Yes	"Alice"
participants	Array<String>	A list of names of all people involved in splitting this expense.	Yes	["Alice", "Bob", "Charlie"]
split_type	String	How the expense is divided. Currently, only 'equal' is fully supported.	Yes	"equal"
date	Date	The date when the expense occurred.	Yes	2025-06-10T14:30:00.000Z
category	String	An optional category for the expense (e.g., 'Food', 'Transport', 'Rent').	No	"Food"
isRecurring	Boolean	Flag indicating if this expense is recurring.	No	false
recurrenceInterval	String	If isRecurring is true, specifies interval: 'daily', 'weekly', 'monthly', 'yearly'.	No	"monthly"
nextDueDate	Date	If isRecurring is true, the next expected payment date.	No	2025-07-10T00:00:00.000Z
createdAt	Date	Timestamp recorded when the document was first created.	Yes	2025-06-08T10:00:00.000Z
updatedAt	Date	Timestamp recorded when the document was last updated.	Yes	2025-06-09T11:00:00.000Z


people Collection (Implicit/Managed)
This collection typically holds a list of unique names of all individuals who have participated in or paid for expenses. It's often managed implicitly by the application logic to ensure consistency and provide auto-completion for user input.

Field	Type	Description	Required
_id	ObjectId	Unique identifier for the person.	Yes
name	String	The unique name of a person.	Yes



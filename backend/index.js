import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import expenseRoutes from "./routes/expense.routes.js";
import settlementRoutes from "./routes/settlement.routes.js";
import cron from "node-cron";
import { processRecurringExpenses } from "./controllers/expense.controller.js";

dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json());

// Mount all routes under /api/split
app.use("/api/split", expenseRoutes);
app.use("/api/split", settlementRoutes);

cron.schedule("0 0 * * *", async () => {
  console.log("🔁 Running daily recurring expense processor...");
  try {
    await processRecurringExpenses();
    console.log("Recurring expenses processed successfully.");
  } catch (err) {
    console.error("Error processing recurring expenses:", err.message);
  }
});




app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

import mongoose from "mongoose";

const BudgetSchema = new mongoose.Schema({
  month: { type: String, required: true }, // e.g., "2025-04"
  category: { type: String, required: true }, // e.g., "Food"
  amount: { type: Number, required: true }, // e.g., 100
  createdAt: { type: Date, default: Date.now },
});

// Index for faster queries by month and category
BudgetSchema.index({ month: 1, category: 1 });

export default mongoose.models.Budget || mongoose.model("Budget", BudgetSchema);
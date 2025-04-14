import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    enum: ["Food", "Transport", "Entertainment", "Bills", "Other"],
    required: true,
  },
  description: {
    type: String,
    required: true,
    minlength: 2,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
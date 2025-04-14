import mongoose from 'mongoose';


const TransactionSchema = new mongoose.Schema({
  amount: Number,
  date: Date,
  description: String,
  category: {
    type: String,
    enum: ['Food', 'Bills', 'Travel', 'Entertainment', 'Others']
  }
  
});
export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

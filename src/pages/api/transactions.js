import connectToDatabase from "../../lib/mongoose";
import Transaction from "../../app/models/Transaction";

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === "GET") {
    try {
      const { month } = req.query; // e.g., "2025-04"
      let query = {};
      if (month) {
        const [year, monthNum] = month.split("-");
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0);
        query.date = { $gte: startDate, $lte: endDate };
      }
      const transactions = await Transaction.find(query).sort({ createdAt: -1 });
      res.status(200).json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Error fetching transactions" });
    }
  } else if (req.method === "POST") {
    try {
      const { date, category, description, amount } = req.body;
      const transaction = new Transaction({
        date: new Date(date),
        category,
        description,
        amount: Number(amount),
      });
      await transaction.save();
      res.status(201).json({ message: "Transaction added", id: transaction._id });
    } catch (error) {
      console.error("Error adding transaction:", error);
      res.status(500).json({ error: "Error adding transaction" });
    }
  } else if (req.method === "DELETE") {
    try {
      const { id } = req.query;
      await Transaction.findByIdAndDelete(id);
      res.status(200).json({ message: "Transaction deleted", id });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ error: "Error deleting transaction" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
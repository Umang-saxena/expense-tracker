import connectToDatabase from "../../lib/mongoose";
import Transaction from "../../app/models/Transaction";

export default async function handler(req, res) {
    try {
        // Ensure database connection
        await connectToDatabase();

        if (req.method === "POST") {
            const { date, category, description, amount } = req.body;

            // Basic validation
            if (!date || !category || !description || !amount) {
                return res.status(400).json({ message: "All fields are required" });
            }

            // Create new transaction
            const transaction = new Transaction({
                date: new Date(date),
                category,
                description,
                amount: parseFloat(amount),
            });

            // Save to database
            await transaction.save();

            return res.status(201).json({
                message: "Transaction added",
                id: transaction._id,
            });
        } else if (req.method === "GET") {
            // Fetch all transactions
            const transactions = await Transaction.find({}).sort({ createdAt: -1 });

            return res.status(200).json(transactions);
        } else if (req.method === "DELETE") {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ message: "Transaction ID is required" });
            }

            // Delete transaction
            const result = await Transaction.findByIdAndDelete(id);

            if (!result) {
                return res.status(404).json({ message: "Transaction not found" });
            }

            return res.status(200).json({ message: "Transaction deleted", id });
        } else {
            return res.status(405).json({ message: "Method not allowed" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}
import connectToDatabase from "../../lib/mongoose";
import Budget from "../../app/models/Budget";

export default async function handler(req, res) {
    await connectToDatabase();

    if (req.method === "GET") {
        try {
            const { month } = req.query; // e.g., "2025-04"
            const budgets = await Budget.find(month ? { month } : {}).sort({
                createdAt: -1,
            });
            res.status(200).json(budgets);
        } catch (error) {
            console.error("Error fetching budgets:", error);
            res.status(500).json({ error: "Error fetching budgets" });
        }
    } else if (req.method === "POST") {
        try {
            const { month, category, amount } = req.body;
            // Check if budget exists for month/category
            const existing = await Budget.findOne({ month, category });
            if (existing) {
                existing.amount = Number(amount);
                await existing.save();
                res.status(200).json({ message: "Budget updated", id: existing._id });
            } else {
                const budget = new Budget({
                    month,
                    category,
                    amount: Number(amount),
                });
                await budget.save();
                res.status(201).json({ message: "Budget added", id: budget._id });
            }
        } catch (error) {
            console.error("Error saving budget:", error);
            res.status(500).json({ error: "Error saving budget" });
        }
    } else if (req.method === "DELETE") {
        try {
            const { id } = req.query;
            await Budget.findByIdAndDelete(id);
            res.status(200).json({ message: "Budget deleted", id });
        } catch (error) {
            console.error("Error deleting budget:", error);
            res.status(500).json({ error: "Error deleting budget" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}

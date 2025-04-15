"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from "recharts";

const categories = ["Food", "Transport", "Entertainment", "Bills", "Other"];

// Colors matching src/app/page.js
const categoryColors = {
    Food: "#4f46e5", // Indigo
    Transport: "#22c55e", // Green
    Entertainment: "#ef4444", // Red
    Bills: "#f59e0b", // Amber
    Other: "#6b7280", // Gray
};

export default function Dashboard() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch transactions
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get("/api/transactions");
                setTransactions(response.data);
            } catch (error) {
                console.error("Error fetching transactions:", error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    // Calculate total expenses
    const totalExpenses = transactions.reduce((sum, txn) => sum + Number(txn.amount), 0).toFixed(2);

    // Calculate category breakdown
    const categoryBreakdown = categories.map((category) => ({
        category,
        total: transactions
            .filter((txn) => txn.category === category)
            .reduce((sum, txn) => sum + Number(txn.amount), 0)
            .toFixed(2),
    }));

    // Prepare pie chart data
    const pieData = categories
        .map((category) => ({
            name: category,
            value: transactions
                .filter((txn) => txn.category === category)
                .reduce((sum, txn) => sum + Number(txn.amount), 0),
        }))
        .filter((data) => data.value > 0); // Exclude zero values

    // Get most recent transactions (last 5)
    const recentTransactions = transactions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    return (
        <main className="flex min-h-screen flex-col items-center p-24">
            <h1 className="text-2xl font-bold mb-8">Expense Dashboard</h1>

            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : transactions.length === 0 ? (
                <p className="text-gray-500">No transactions found.</p>
            ) : (
                <div className="w-full max-w-4xl space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Total Expenses Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Total Expenses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-semibold">${totalExpenses}</p>
                            </CardContent>
                        </Card>

                        {/* Category Breakdown Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Category Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {categoryBreakdown.map((item) => (
                                        <li key={item.category} className="flex justify-between">
                                            <span>{item.category}</span>
                                            <span>${item.total}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Pie Chart and Recent Transactions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pie Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Expenses by Category</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {pieData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                label
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={categoryColors[entry.name]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-gray-500">No data to display.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Transactions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Transactions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentTransactions.length > 0 ? (
                                            recentTransactions.map((txn) => (
                                                <TableRow key={txn._id.toString()}>
                                                    <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
                                                    <TableCell>{txn.category}</TableCell>
                                                    <TableCell>{txn.description}</TableCell>
                                                    <TableCell className="text-right">
                                                        ${Number(txn.amount).toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center">
                                                    No recent transactions.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </main>
    );
}
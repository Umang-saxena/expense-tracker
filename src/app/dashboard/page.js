"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import TransactionsTable from "@/components/TransactionsTable";
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
    Food: "#4f46e5",
    Transport: "#22c55e",
    Entertainment: "#ef4444",
    Bills: "#f59e0b",
    Other: "#6b7280",
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
        .filter((data) => data.value > 0);

    // Get most recent transactions (last 5)
    const recentTransactions = transactions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    return (
        <main className="flex min-h-screen flex-col items-center p-5">
            <Navbar />
            <h1 className="text-2xl font-bold mb-8">Expense Dashboard</h1>

            {loading ? (
                <div className="w-full max-w-4xl space-y-8">
                    {/* Skeleton for Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-[150px]" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-[120px] w-full" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-[150px]" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-[120px] w-full" />
                            </CardContent>
                        </Card>
                    </div>
                    {/* Skeleton for Pie Chart and Table */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-[150px]" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-[300px] w-full" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-[150px]" />
                            </CardHeader>
                            <CardContent>
                                <TransactionsTable
                                    transactions={[]}
                                    loading={true}
                                    onDelete={null}
                                    caption="Recent Transactions"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : transactions.length === 0 ? (
                <p className="text-gray-500">No transactions found.</p>
            ) : (
                <div className="w-full max-w-4xl space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Total Expenses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-semibold">${totalExpenses}</p>
                            </CardContent>
                        </Card>
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
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Transactions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TransactionsTable
                                    transactions={recentTransactions}
                                    loading={false}
                                    onDelete={null}
                                    caption="Recent Transactions"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </main>
    );
}
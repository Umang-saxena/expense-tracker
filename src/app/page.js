"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import TransactionForm from "@/components/TransactionForm";
import TransactionsTable from "@/components/TransactionsTable";
import ChartWrapper from "@/components/ChartWrapper";
import axios from "axios";

const categories = ["Food", "Transport", "Entertainment", "Bills", "Other"];

// Colors for each category in the chart
const categoryColors = {
  Food: "#4f46e5",
  Transport: "#22c55e",
  Entertainment: "#ef4444",
  Bills: "#f59e0b",
  Other: "#6b7280",
};

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/transactions");
        setTransactions(response.data);
      } catch (error) {
        console.error("Error fetching transactions:", error.response?.data || error.message);
        toast("Error.", {
          description: "Failed to load transactions.",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // Handle form submission
  const onSubmit = async (values) => {
    console.log("Form values:", values);
    try {
      const response = await axios.post("/api/transactions", values);
      console.log("Transaction saved:", response.data);
      const updatedResponse = await axios.get("/api/transactions");
      setTransactions(updatedResponse.data);
      toast("Event has been created.", {
        description: "Transaction has been added successfully.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error saving transaction:", error.response?.data || error.message);
      toast("Error.", {
        description: "Failed to save transaction.",
        duration: 5000,
      });
    }
  };

  // Handle delete transaction
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/transactions?id=${id}`);
      console.log("Transaction deleted:", response.data);
      const updatedResponse = await axios.get("/api/transactions");
      setTransactions(updatedResponse.data);
      toast("Delete Successful !!", {
        description: "Transaction has been deleted successfully.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error deleting transaction:", error.response?.data || error.message);
      toast("Error.", {
        description: "Failed to delete transaction.",
        duration: 5000,
      });
    }
  };

  // Prepare data for the chart
  const chartData = transactions.reduce((acc, txn) => {
    const date = new Date(txn.date).toISOString().split("T")[0];
    const existing = acc.find((item) => item.date === date);

    if (existing) {
      existing[txn.category] = (existing[txn.category] || 0) + Number(txn.amount);
    } else {
      const newEntry = { date };
      categories.forEach((cat) => {
        newEntry[cat] = cat === txn.category ? Number(txn.amount) : 0;
      });
      acc.push(newEntry);
    }

    return acc;
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-15">
      <Navbar />
      <h1 className="text-2xl font-bold mb-8">Expense Tracker</h1>

      {/* Form and Chart Container */}
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
        {/* Form for adding transactions */}
        <div className="w-full md:w-1/2">
          {loading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
            <TransactionForm
              onSubmit={onSubmit}
              defaultValues={{ date: "", category: "", description: "", amount: "" }}
              useNativeSelect={false}
              resetAfterSubmit={true}
            />
          )}
        </div>

        {/* Chart */}
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-semibold mb-4">Expenses by Category</h2>
          <ChartWrapper
            type="bar"
            data={chartData}
            loading={loading}
            categories={categories}
            categoryColors={categoryColors}
            config={{ xAxisKey: "date", stacked: true }}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="mt-8 w-[90%] mx-auto">
        <h3 className="text-lg font-semibold my-4">Transaction History</h3>
        <TransactionsTable
          transactions={transactions}
          loading={loading}
          onDelete={handleDelete}
          caption="Transaction History"
        />
      </div>
    </main>
  );
}
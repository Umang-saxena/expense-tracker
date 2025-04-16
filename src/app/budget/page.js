"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Navbar from "@/components/Navbar";

const categories = ["Food", "Transport", "Entertainment", "Bills", "Other"];

// Schema for budget form
const budgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, { message: "Select a valid month (YYYY-MM)." }),
  category: z.enum(categories, { message: "Select a category." }),
  amount: z
    .string()
    .nonempty({ message: "Amount is required." })
    .refine(
      (value) => {
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0;
      },
      { message: "Amount must be non-negative." }
    ),
});

// Schema for transaction form (same as Homepage)
const transactionSchema = z.object({
  date: z
    .string()
    .nonempty({ message: "Date is required." })
    .refine(
      (date) => {
        const inputDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return inputDate <= today;
      },
      { message: "Date cannot be in the future." }
    ),
  category: z.enum(categories, { message: "Please select a category." }),
  description: z.string().min(2, { message: "Description must be at least 2 characters." }),
  amount: z
    .string()
    .nonempty({ message: "Amount is required." })
    .refine(
      (value) => {
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0;
      },
      { message: "Amount cannot be negative." }
    ),
});

export default function BudgetPlanner() {
  // States
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");

  // Set initial month client-side
  useEffect(() => {
    if (!selectedMonth) {
      const currentMonth = new Date().toISOString().slice(0, 7); // e.g., "2025-04"
      setSelectedMonth(currentMonth);
    }
  }, [selectedMonth]);

  // Budget form
  const budgetForm = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      month: selectedMonth,
      category: "",
      amount: "",
    },
  });

  // Transaction form
  const transactionForm = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: "",
      category: "",
      description: "",
      amount: "",
    },
  });

  // Fetch data
  useEffect(() => {
    if (!selectedMonth) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [transRes, budgetRes] = await Promise.all([
          axios.get(`/api/transactions?month=${selectedMonth}`),
          axios.get(`/api/budgets?month=${selectedMonth}`),
        ]);
        setTransactions(transRes.data);
        setBudgets(budgetRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast("Error.", {
          description: "Failed to load data.",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth]);

  // Handle budget submission
  const onBudgetSubmit = async (values) => {
    try {
      const response = await axios.post("/api/budgets", values);
      console.log("Budget saved:", response.data);
      const budgetRes = await axios.get(`/api/budgets?month=${selectedMonth}`);
      setBudgets(budgetRes.data);
      toast("Budget Saved.", {
        description: `Set ${values.category} budget for ${values.month} to $${Number(
          values.amount
        ).toFixed(2)}.`,
        duration: 5000,
      });
      budgetForm.reset({ month: selectedMonth, category: "", amount: "" });
    } catch (error) {
      console.error("Error saving budget:", error);
      toast("Error.", {
        description: "Failed to Save Budget.",
        duration: 5000,
      });
    }
  };

  // Handle transaction submission
  const onTransactionSubmit = async (values) => {
    console.log("Transaction values:", values);
    try {
      const response = await axios.post("/api/transactions", values);
      console.log("Transaction saved:", response.data);
      const transRes = await axios.get(`/api/transactions?month=${selectedMonth}`);
      setTransactions(transRes.data);
      toast("Transaction Saved.", {
        description: `Added "${values.description}" for $${Number(values.amount).toFixed(2)}.`,
        duration: 5000,
      });
      transactionForm.reset();
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast("Error.", {
        description: "Failed to Save Transaction.",
        duration: 5000,
      });
    }
  };

  // Handle delete transaction
  const handleDeleteTransaction = async (id) => {
    try {
      const response = await axios.delete(`/api/transactions?id=${id}`);
      console.log("Transaction deleted:", response.data);
      const transRes = await axios.get(`/api/transactions?month=${selectedMonth}`);
      setTransactions(transRes.data);
      toast("Transaction deleted.", {
        description: "Delete Successful.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast("Error.", {
        description: "Failed to Delete Transaction.",
        duration: 5000,
      });
    }
  };

  // Handle delete budget
  const handleDeleteBudget = async (id) => {
    try {
      const response = await axios.delete(`/api/budgets?id=${id}`);
      console.log("Budget deleted:", response.data);
      const budgetRes = await axios.get(`/api/budgets?month=${selectedMonth}`);
      setBudgets(budgetRes.data);
      toast("Budget Deleted.", {
        description: "Budget delete successful.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast("Error.", {
        description: "Failed to Delete Budget.",
        duration: 5000,
      });
    }
  };

  // Budget vs actual chart data
  const chartData = categories.map((category) => {
    const budget = budgets.find((b) => b.category === category)?.amount || 0;
    const actual = transactions
      .filter((t) => t.category === category)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { category, budget, actual };
  });

  // Spending insights
  const insights = categories
    .map((category) => {
      const budget = budgets.find((b) => b.category === category)?.amount || 0;
      const actual = transactions
        .filter((t) => t.category === category)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      if (budget === 0) return null;
      if (actual > budget) {
        return `Over budget on ${category} by $${(actual - budget).toFixed(2)}.`;
      } else if (actual < budget) {
        return `Under budget on ${category} by $${(budget - actual).toFixed(2)}.`;
      } else {
        return `On budget for ${category}.`;
      }
    })
    .filter(Boolean);

  // Avoid rendering until month is set
  if (!selectedMonth) {
    return null;
  }

  return (
    <div>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center p-24">
        <h1 className="text-2xl font-bold mb-8">Budget Planner</h1>

        <div className="w-full max-w-4xl space-y-8">
          {/* Month Selector */}
          <div>
            <label className="text-lg font-semibold">Select Month</label>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-2 w-[200px]"
            />
          </div>

          {/* Budget Section (Left) and Chart (Right) */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Budget Form, Budgets Table, Insights */}
            <div className="space-y-8">
              {/* Budget Form */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Set Monthly Budget</h2>
                <Form {...budgetForm}>
                  <form onSubmit={budgetForm.handleSubmit(onBudgetSubmit)} className="space-y-4">
                    <FormField
                      control={budgetForm.control}
                      name="month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Month</FormLabel>
                          <FormControl>
                            <Input type="month" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={budgetForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="w-full border border-gray-300 rounded-md p-2 text-white bg-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select a Category</option>
                              {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={budgetForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 100"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Save Budget
                    </Button>
                  </form>
                </Form>
              </div>

              {/* Current Budgets */}
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  Current Budgets for {selectedMonth}
                </h2>
                {loading ? (
                  <Skeleton className="h-[120px] w-full" />
                ) : budgets.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Budget Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {budgets.map((budget) => (
                        <TableRow key={budget._id.toString()}>
                          <TableCell>{budget.category}</TableCell>
                          <TableCell>${Number(budget.amount).toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (window.confirm("Delete this budget?")) {
                                  handleDeleteBudget(budget._id.toString());
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-500">No budgets set for this month.</p>
                )}
              </div>

              {/* Spending Insights */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Spending Insights</h2>
                {loading ? (
                  <Skeleton className="h-[100px] w-full " />
                ) : insights.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-2  ">
                    {insights.map((insight, index) => (
                      <li key={index} className="text-white bg-gray-800 p-2 rounded-md">
                        {insight}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No insights available.</p>
                )}
              </div>
            </div>

            {/* Right: Budget vs Actual Chart */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Budget vs Actual Spending</h2>
              {loading ? (
                <Skeleton className="w-full h-[300px]" />
              ) : chartData.some((d) => d.budget || d.actual) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="budget" fill="#4f46e5" name="Budget" />
                    <Bar dataKey="actual" fill="#ef4444" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500">No data to display.</p>
              )}
            </div>
          </div>

          {/* Transaction Section (Below) */}
          <div className="space-y-8">
            {/* Transaction Form */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Add Transaction</h2>
              <Form {...transactionForm}>
                <form
                  onSubmit={transactionForm.handleSubmit(onTransactionSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={transactionForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={transactionForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full border border-gray-300 rounded-md p-2 text-white bg-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select a Category</option>
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={transactionForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Paid for tea" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={transactionForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g., 252"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Add Transaction
                  </Button>
                </form>
              </Form>
            </div>

            {/* Transactions Table */}
            <Table>
              <TableCaption>Transactions for {selectedMonth}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(3)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-4 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[150px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[80px] ml-auto" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-[80px] ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : transactions.length > 0 ? (
                  transactions.map((txn) => (
                    <TableRow key={txn._id.toString()}>
                      <TableCell>
                        {new Date(txn.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>{txn.category}</TableCell>
                      <TableCell>{txn.description}</TableCell>
                      <TableCell className="text-right">
                        ${Number(txn.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (window.confirm("Delete this transaction?")) {
                              handleDeleteTransaction(txn._id.toString());
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
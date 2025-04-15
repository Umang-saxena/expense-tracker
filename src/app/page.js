"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"




import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import axios from "axios";

const categories = ["Food", "Transport", "Entertainment", "Bills", "Other"];


// Define the form schema for transactions
const formSchema = z.object({
  date: z
    .string()
    .nonempty({ message: "Date is required." })
    .refine(
      (date) => {
        const inputDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day
        return inputDate <= today;
      },
      { message: "Date cannot be in the future." }
    ),
  category: z.enum(categories, {
    message: "Please select a category.",
  }),
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

// Colors for each category in the chart
const categoryColors = {
  Food: "#4f46e5", // Indigo
  Transport: "#22c55e", // Green
  Entertainment: "#ef4444", // Red
  Bills: "#f59e0b", // Amber
  Other: "#6b7280", // Gray
};

export default function Home() {
  // Initialize form with react-hook-form and zod
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: "",
      category: "",
      description: "",
      amount: "",
    },
  });

  // State to store transactions
  const [transactions, setTransactions] = useState([]);

  // Fetch transactions from MongoDB
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get("/api/transactions");
        setTransactions(response.data);
      } catch (error) {
        console.error("Error fetching transactions:", error.response?.data || error.message);
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

      // Refresh transactions
      const updatedResponse = await axios.get("/api/transactions");
      setTransactions(updatedResponse.data);

      // Reset form
      form.reset();
      toast("Event has been created.",{
        description: "Transaction has been added successfully.",
        duration: 5000,
      })

          
    } catch (error) {
      console.error("Error saving transaction:", error.response?.data || error.message);
    }
  };


  // Handle delete transaction
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/transactions?id=${id}`);
      console.log("Transaction deleted:", response.data);

      // Refresh transactions
      const updatedResponse = await axios.get("/api/transactions");
      setTransactions(updatedResponse.data);
      toast("Delete Successful !!",{
        description: "Transaction has been deleted successfully.",
        duration: 5000,
      })
    } catch (error) {
      console.error("Error deleting transaction:", error.response?.data || error.message);
    }
  };

  // Prepare data for the stacked bar chart
  const chartData = transactions.reduce((acc, txn) => {
    const date = new Date(txn.date).toISOString().split("T")[0]; // Format as YYYY-MM-DD
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
    <main className="flex min-h-screen flex-col items-center p-5">
      <h1 className="text-2xl font-bold mb-8">Expense Tracker</h1>

      {/* Form and Chart Container */}
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
        {/* Form for adding transactions */}
        <div className="w-full md:w-1/2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 w-full"
            >
              <FormField
                control={form.control}
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
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
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
                control={form.control}
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

        {/* Stacked Bar Chart */}
        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-semibold mb-4">Expenses by Category</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {categories.map((category) => (
                  <Bar
                    key={category}
                    dataKey={category}
                    stackId="a"
                    fill={categoryColors[category]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data to display.</p>
          )}
        </div>
      </div>

      {/* Table for displaying transactions */}
        <h3 className="text-lg font-semibold mx-4 my-4">Transaction History</h3>
      <Table className="mt-8 w-90% mx-auto ">
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
          {transactions.length > 0 ? (
            transactions.map((txn) => (
              <TableRow key={txn._id.toString()}>
                <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
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
                      if (window.confirm("Are you sure you want to delete this transaction?")) {
                        handleDelete(txn._id.toString());
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
    </main>
  );
}
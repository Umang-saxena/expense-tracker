import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CategoryDropdown from "./CategoryDropdown";

const categories = ["Food", "Transport", "Entertainment", "Bills", "Other"];

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

export default function TransactionForm({ onSubmit, defaultValues = {}, useNativeSelect = false, resetAfterSubmit = true }) {
  const form = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: "",
      category: "",
      description: "",
      amount: "",
      ...defaultValues,
    },
  });

  const handleSubmit = async (values) => {
    await onSubmit(values);
    if (resetAfterSubmit) {
      form.reset({ ...defaultValues });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                <CategoryDropdown field={field} useNativeSelect={useNativeSelect} />
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
                <Input type="number" step="0.01" placeholder="e.g., 252" {...field} />
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
  );
}
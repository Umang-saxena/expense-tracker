import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  
  const categories = ["Food", "Transport", "Entertainment", "Bills", "Other"];
  
  export default function CategoryDropdown({ field, useNativeSelect = false }) {
    if (useNativeSelect) {
      return (
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
      );
    }
  
    return (
      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
    );
  }
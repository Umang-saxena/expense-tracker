import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ChartWrapper({
  type = "bar",
  data = [],
  loading = false,
  categories = [],
  categoryColors = {},
  config = {},
}) {
  if (loading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  if (!data || data.length === 0) {
    return <p className="text-gray-500">No data to display.</p>;
  }

  if (type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey={config.dataKey || "value"}
            nameKey={config.nameKey || "name"}
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={categoryColors[entry[config.nameKey || "name"]] || "#888888"}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Bar chart (stacked or side-by-side)
  const isStacked = config.stacked !== false; // Default to stacked
  const xAxisKey = config.xAxisKey || "date";
  const barKeys = config.barKeys || categories;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
        <Legend />
        {barKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            stackId={isStacked ? "a" : undefined}
            fill={categoryColors[key] || `#888888${(index + 1) * 10}`}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
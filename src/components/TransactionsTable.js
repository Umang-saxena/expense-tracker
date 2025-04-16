import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsTable({ transactions, loading, onDelete = null, caption = "Transactions" }) {
  return (
    <Table className="w-full">
      <TableCaption>{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Date</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          {onDelete && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px] ml-auto" /></TableCell>
                {onDelete && <TableCell><Skeleton className="h-8 w-[80px] ml-auto" /></TableCell>}
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
              <TableCell className="text-right">${Number(txn.amount).toFixed(2)}</TableCell>
              {onDelete && (
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (window.confirm("Delete this transaction?")) {
                        onDelete(txn._id.toString());
                      }
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={onDelete ? 5 : 4} className="text-center">
              No transactions found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
import { between } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useSQLiteContext } from "expo-sqlite";
import Papa from "papaparse";
import { useMemo, useState } from "react";
import * as schema from "../db/schema.ts";

export function useExportTransactions() {
  const db = useSQLiteContext();
  const drizzleDb = useMemo(() => drizzle(db, { schema }), [db]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async (startDate: Date, endDate: Date) => {
    const data = await drizzleDb
      .select()
      .from(schema.transaction)
      .where(
        between(
          schema.transaction.createdAt,
          startDate.getTime().toString(),
          endDate.getTime().toString(),
        ),
      )
      .orderBy(schema.transaction.createdAt);

    return data.map((item) => ({
      ...item,
      createdAt: new Date(parseInt(item.createdAt)),
      updatedAt: new Date(parseInt(item.updatedAt)),
    }));
  };

  const exportFile = async (startDate: Date, endDate: Date) => {
    setLoading(true);

    const transactions = await fetchTransactions(startDate, endDate);

    // 1. Generate CSV string
    const csvString = Papa.unparse(
      transactions.map((transaction) => ({
        ...transaction,
        receiptImageUri: transaction.receiptImageUri || "N/A", // Handle null values
      })),
    );

    const fileName = `${startDate.toISOString().split("T")[0]}_to_${
      endDate.toISOString().split("T")[0]
    }_transactions.csv`;
    const targetDirectory = `${Paths.cache.uri}/${fileName}`;
    const file = new File(targetDirectory);
    await file.write(csvString, { encoding: "utf8" });

    try {
      // 4. Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "text/csv",
          dialogTitle: "Export Data",
          UTI: "public.comma-separated-values-text", // iOS specific
        });
      }
    } catch (error) {
      console.error("Error exporting CSV:", error);
    } finally {
      setLoading(false);
    }
  };

  return { exportFile, loading };
}

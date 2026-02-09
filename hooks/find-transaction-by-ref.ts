import { Transaction } from "@/types/transaction.ts";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import * as schema from "../db/schema.ts";

export function useFindTransactionByReference(
  referenceNumber: string | undefined,
) {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTransactionByReferenceNumber = useCallback(async () => {
    if (!referenceNumber) {
      return null;
    }

    console.log(
      `Fetching transaction with reference number: ${referenceNumber}`,
    );

    const data = await drizzleDb
      .select()
      .from(schema.transaction)
      .where(
        and(
          eq(schema.transaction.referenceNumber, referenceNumber),
          eq(schema.transaction.isDeleted, 0),
        ),
      );

    console.log(data);

    if (!data || (data as []).length === 0) {
      setTransaction(null);
      setLoading(false);
      return null;
    }

    setTransaction({
      ...data[0],
      createdAt: new Date(parseInt(data[0].createdAt)),
      updatedAt: new Date(data[0].updatedAt),
    });
    setLoading(false);
  }, [drizzleDb, referenceNumber]);

  useEffect(() => {
    fetchTransactionByReferenceNumber();
  }, [fetchTransactionByReferenceNumber]);

  return {
    loading,
    transaction,
  };
}

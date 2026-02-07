import { DEFAULT_LIMIT } from "@/constants/limits.ts";
import { Transaction } from "@/types/transaction.ts";
import { and, eq, gt, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as schema from "../db/schema.ts";

export function useTransactions() {
  const db = useSQLiteContext();
  const drizzleDb = useMemo(() => drizzle(db, { schema }), [db]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(
    async ({
      transactionId,
      limit,
      after,
    }: {
      transactionId?: string;
      limit?: number;
      after?: Date;
    }) => {
      try {
        const filters = [eq(schema.transaction.isDeleted, 0)];

        if (transactionId) {
          filters.push(like(schema.transaction.transactionId, transactionId));
        }

        if (after) {
          filters.push(
            gt(schema.transaction.createdAt, after.getTime().toString()),
          );
        }

        const baseQuery = drizzleDb.select().from(schema.transaction);

        const data = await baseQuery
          .orderBy(schema.transaction.createdAt)
          .limit(limit ?? DEFAULT_LIMIT)
          .where(and(...filters));

        if (after) {
          setTransactions((transactions) => [
            ...transactions,
            ...data.map((item) => ({
              ...item,
              createdAt: new Date(parseInt(item.createdAt)),
              updatedAt: new Date(parseInt(item.updatedAt)),
            })),
          ]);
        } else {
          setTransactions(
            data.map((item) => ({
              ...item,
              createdAt: new Date(parseInt(item.createdAt)),
              updatedAt: new Date(parseInt(item.updatedAt)),
            })),
          );
        }
      } catch (err) {
        console.log("Error fetching transactions:", err);
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [drizzleDb],
  );

  useEffect(() => {
    fetchTransactions({});
  }, [fetchTransactions]);

  return { transactions, loading: loading, refetch: fetchTransactions };
}

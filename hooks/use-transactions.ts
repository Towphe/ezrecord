import { DEFAULT_LIMIT } from "@/constants/limits.ts";
import { Transaction } from "@/types/transaction.ts";
import { and, asc, desc, eq, gt, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as schema from "../db/schema.ts";

type FetchTransactionsParams = {
  transactionId?: string;
  limit?: number;
  after?: Date;
  sortOrder?: "asc" | "desc";
  paymentMethod?: "cash" | "gcash" | "maya" | "bpi" | "all";
};

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
      sortOrder = "desc",
      paymentMethod = "all",
    }: FetchTransactionsParams) => {
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

        if (paymentMethod !== "all") {
          filters.push(eq(schema.transaction.paymentMethod, paymentMethod));
        }

        const baseQuery = drizzleDb.select().from(schema.transaction);

        const data = await baseQuery
          .orderBy(
            sortOrder === "asc"
              ? asc(schema.transaction.createdAt)
              : desc(schema.transaction.createdAt),
          )
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

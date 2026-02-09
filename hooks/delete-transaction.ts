import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "../db/schema.ts";

export function useDeleteTransaction(transactionId: string) {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const deleteTransaction = async () => {
    try {
      const transaction = await drizzleDb
        .select()
        .from(schema.transaction)
        .where(eq(schema.transaction.transactionId, transactionId))
        .get();

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      const updatedTransaction = {
        isDeleted: 1,
      };

      const result = await drizzleDb
        .update(schema.transaction)
        .set(updatedTransaction)
        .where(eq(schema.transaction.transactionId, transactionId))
        .returning();

      return result;
    } catch (err) {
      console.error(err);
    }
  };

  return { deleteTransaction };
}

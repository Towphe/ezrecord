import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "../db/schema.ts";

export function useEditTransaction(transactionId: string) {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const editTransaction = async (data: {
    paymentMethod?: string;
    referenceNumber?: string;
  }) => {
    try {
      const transaction = await drizzleDb
        .select()
        .from(schema.transaction)
        .where(eq(schema.transaction.transactionId, transactionId))
        .get();

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      // update only the fields that are provided
      const updatedTransaction = {
        paymentMethod: data.paymentMethod ?? transaction.paymentMethod,
        referenceNumber:
          data.referenceNumber ?? transaction.referenceNumber ?? undefined,
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

  return { editTransaction };
}

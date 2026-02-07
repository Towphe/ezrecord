import { Payment } from "@/types/payment.ts";
import { SelectedProduct } from "@/types/product-selection.ts";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "../db/schema.ts";

export function useCreateTransaction() {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const createTransaction = async (data: {
    selectedProducts: SelectedProduct[];
    totalAmount: number;
    paymentMethod: string;
    paymentInfo: Payment;
  }) => {
    const { selectedProducts, paymentMethod, totalAmount, paymentInfo } = data;

    // subtract product quantities from inventory
    for (const product of selectedProducts) {
      const dbProduct = await drizzleDb
        .select()
        .from(schema.product)
        .where(eq(schema.product.productId, product.productId))
        .limit(1);

      if (dbProduct.length === 0) {
        throw new Error(`Product with ID ${product.productId} not found`);
      }

      const currentQuantity = dbProduct[0].quantity;
      const newQuantity = currentQuantity - product.quantity;

      if (newQuantity < 0) {
        throw new Error(
          `Insufficient quantity for product ID ${product.productId}`,
        );
      }

      // update quantity in database
      await drizzleDb
        .update(schema.product)
        .set({ quantity: newQuantity })
        .where(eq(schema.product.productId, product.productId));
    }

    // create transaction record
    const transactionResult = await drizzleDb
      .insert(schema.transaction)
      .values({
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        referenceNumber: paymentInfo.referenceNumber,
      })
      .returning();

    const transaction = transactionResult[0];

    // create transaction-product records
    for (const product of selectedProducts) {
      await drizzleDb.insert(schema.transactionProduct).values({
        transactionId: transaction.transactionId,
        productId: product.productId,
        amount: product.unitPrice * product.quantity,
        quantity: product.quantity,
      });
    }

    return { transaction };
  };

  return { createTransaction };
}

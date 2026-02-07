import {
  Transaction,
  TransactionProduct,
  UntreatedTransactionProduct,
} from "@/types/transaction.ts";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import * as schema from "../db/schema.ts";

export function useTransaction(transactionId: string) {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [products, setProducts] = useState<TransactionProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransaction = async (name?: string) => {
    try {
      const data = await drizzleDb
        .select()
        .from(schema.transaction)
        .where(
          and(
            eq(schema.transaction.transactionId, transactionId),
            eq(schema.transaction.isDeleted, 0),
          ),
        );

      setTransaction({
        ...data[0],
        createdAt: new Date(parseInt(data[0].createdAt)),
        updatedAt: new Date(data[0].updatedAt),
      });

      const productsData = await drizzleDb
        .select({
          transactionProductId: schema.transactionProduct.transactionProductId,
          transactionId: schema.transactionProduct.transactionId,
          productId: schema.transactionProduct.productId,
          name: schema.product.name,
          amount: schema.transactionProduct.amount,
          unitPrice: schema.product.price,
          quantity: schema.transactionProduct.quantity,
          isDeleted: schema.transactionProduct.isDeleted,
          createdAt: schema.transactionProduct.createdAt,
          updatedAt: schema.transactionProduct.updatedAt,
        })
        .from(schema.transactionProduct)
        .innerJoin(
          schema.product,
          eq(schema.transactionProduct.productId, schema.product.productId),
        )
        .where(
          and(
            eq(schema.transactionProduct.transactionId, transactionId),
            eq(schema.transactionProduct.isDeleted, 0),
          ),
        );

      setProducts(
        productsData.map((item: UntreatedTransactionProduct) => ({
          ...item,
          createdAt: new Date(parseInt(item.createdAt)),
          updatedAt: new Date(parseInt(item.updatedAt)),
        })),
      );
    } catch (err) {
      console.log("Error fetching transactions:", err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, []);

  return { transaction, products, loading, refetch: fetchTransaction };
}

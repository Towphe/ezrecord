import { METHOD_COLORS } from "@/constants/statistics.ts";
import { and, count, eq, gt, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as schema from "../db/schema.ts";

type Statistics = {
  totalPayments: number;
  paymentMethods: { value: number; color: string }[];
  topProducts: {
    productId: string;
    name: string;
    totalQuantity: number;
  }[];
};

function mapPaymentMethodToColor(paymentMethod: string): string {
  return METHOD_COLORS[paymentMethod] || METHOD_COLORS["other"];
}

export function useStatistics() {
  const db = useSQLiteContext();
  const drizzleDb = useMemo(() => drizzle(db, { schema }), [db]);

  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTotalPayments = async (days: number = 30) => {
    const now = new Date();
    const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const total = await drizzleDb
      .select({
        totalAmount: sum(schema.transaction.totalAmount),
      })
      .from(schema.transaction)
      .where(
        and(
          eq(schema.transaction.isDeleted, 0),
          gt(schema.transaction.createdAt, pastDate.getTime().toString()),
        ),
      );

    return parseFloat(total[0].totalAmount || "0");
  };

  const fetchTopProducts = async (days: number = 30, limit: number = 5) => {
    const now = new Date();
    const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const topProducts = await drizzleDb
      .select({
        productId: schema.product.productId,
        name: schema.product.name,
        totalQuantity: sum(schema.transactionProduct.quantity),
      })
      .from(schema.transactionProduct)
      .innerJoin(
        schema.product,
        eq(schema.transactionProduct.productId, schema.product.productId),
      )
      .where(
        and(
          eq(schema.transactionProduct.isDeleted, 0),
          gt(
            schema.transactionProduct.createdAt,
            pastDate.getTime().toString(),
          ),
        ),
      )
      .limit(limit);

    return topProducts;
  };

  const fetchPaymentMethods = async (days: number = 30) => {
    const now = new Date();
    const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const paymentMethods = await drizzleDb
      .select({
        paymentMethod: schema.transaction.paymentMethod,
        count: count(schema.transaction.paymentMethod),
      })
      .from(schema.transaction)
      .groupBy(schema.transaction.paymentMethod)
      .where(
        and(
          eq(schema.transaction.isDeleted, 0),
          gt(schema.transaction.createdAt, pastDate.getTime().toString()),
        ),
      );

    return paymentMethods.map((item) => ({
      value: item.count,
      color: mapPaymentMethodToColor(item.paymentMethod),
    }));
  };

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    try {
      const totalPayments = await fetchTotalPayments();
      const paymentMethods = await fetchPaymentMethods();
      const topProducts = await fetchTopProducts();

      setStatistics({
        totalPayments: totalPayments,
        paymentMethods: paymentMethods,
        topProducts: topProducts.map((product) => ({
          productId: product.productId,
          name: product.name,
          totalQuantity: product.totalQuantity
            ? parseFloat(product.totalQuantity.toString())
            : 0,
        })),
      });
    } finally {
      setLoading(false);
    }
  }, [drizzleDb]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return { statistics, loading, fetchStatistics };
}

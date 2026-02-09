import { METHOD_COLORS } from "@/constants/statistics.ts";
import { and, count, eq, gt, lt, sum } from "drizzle-orm";
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

async function fetchTotalPayments(
  drizzleDb: ReturnType<typeof drizzle>,
  startDate: Date,
  endDate: Date,
) {
  const total = await drizzleDb
    .select({
      totalAmount: sum(schema.transaction.totalAmount),
    })
    .from(schema.transaction)
    .where(
      and(
        eq(schema.transaction.isDeleted, 0),
        lt(schema.transaction.createdAt, endDate.getTime().toString()),
        gt(schema.transaction.createdAt, startDate.getTime().toString()),
      ),
    );

  return parseFloat(total[0].totalAmount || "0");
}

async function fetchTopProducts(
  drizzleDb: ReturnType<typeof drizzle>,
  startDate: Date,
  endDate: Date,
  limit: number = 5,
) {
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
        lt(schema.transactionProduct.createdAt, endDate.getTime().toString()),
        gt(schema.transactionProduct.createdAt, startDate.getTime().toString()),
      ),
    )
    .limit(limit);

  return topProducts;
}

async function fetchPaymentMethods(
  drizzleDb: ReturnType<typeof drizzle>,
  startDate: Date,
  endDate: Date,
) {
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
        lt(schema.transaction.createdAt, endDate.getTime().toString()),
        gt(schema.transaction.createdAt, startDate.getTime().toString()),
      ),
    );

  return paymentMethods.map((item) => ({
    value: item.count,
    color: mapPaymentMethodToColor(item.paymentMethod),
  }));
}

export function useStatistics() {
  const db = useSQLiteContext();
  const drizzleDb = useMemo(() => drizzle(db, { schema }), [db]);

  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatistics = useCallback(
    async (startDate: Date, endDate: Date) => {
      setLoading(true);
      try {
        const totalPayments = await fetchTotalPayments(
          drizzleDb,
          startDate,
          endDate,
        );
        const paymentMethods = await fetchPaymentMethods(
          drizzleDb,
          startDate,
          endDate,
        );
        const topProducts = await fetchTopProducts(
          drizzleDb,
          startDate,
          endDate,
        );

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
    },
    [drizzleDb],
  );

  useEffect(() => {}, []);

  return { statistics, loading, fetchStatistics };
}

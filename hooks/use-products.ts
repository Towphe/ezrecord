import { DEFAULT_LIMIT } from "@/constants/limits.ts";
import { Product } from "@/types/products.ts";
import { and, eq, gt, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as schema from "../db/schema.ts";

export function useProducts() {
  const db = useSQLiteContext();
  const drizzleDb = useMemo(() => drizzle(db, { schema }), [db]);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(
    async ({
      name,
      limit,
      after,
    }: {
      name?: string;
      limit?: number;
      after?: Date;
    }) => {
      try {
        const filters = [eq(schema.product.isDeleted, 0)];

        if (name) {
          filters.push(like(schema.product.name, `%${name}%`));
        }

        if (after) {
          filters.push(
            gt(schema.product.createdAt, after.getTime().toString()),
          );
        }

        const data = await drizzleDb
          .select()
          .from(schema.product)
          .where(and(...filters))
          .orderBy(schema.product.createdAt)
          .limit(limit ?? DEFAULT_LIMIT);

        if (after) {
          setProducts((products) => [
            ...products,
            ...data.map((item) => ({
              ...item,
              createdAt: new Date(parseInt(item.createdAt)),
              updatedAt: new Date(parseInt(item.updatedAt)),
            })),
          ]);
        } else {
          setProducts(
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
    fetchProducts({});
  }, [fetchProducts]);

  return { products, loading, refetch: fetchProducts };
}

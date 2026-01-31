import { Product } from "@/types/products.ts";
import { and, desc, eq, like } from "drizzle-orm";
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
    async (name?: string) => {
      try {
        const baseQuery = drizzleDb.select().from(schema.product);

        const withoutDeleted = (query: any) =>
          and(eq(schema.product.isDeleted, 0), query);

        const data =
          name && name !== ""
            ? await baseQuery.where(
                withoutDeleted(like(schema.product.name, `%${name}%`)),
              )
            : await baseQuery
                .where(eq(schema.product.isDeleted, 0))
                .orderBy(desc(schema.product.createdAt))
                .limit(10);

        console.log(data);
        setProducts(data);
      } catch (err) {
        console.log("Error fetching products:", err);
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [drizzleDb],
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, refetch: fetchProducts };
}

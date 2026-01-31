import { Product } from "@/types/products.ts";
import { desc, like } from "drizzle-orm";
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

        const data =
          name && name !== ""
            ? await baseQuery.where(like(schema.product.name, `%${name}%`))
            : await baseQuery.orderBy(desc(schema.product.createdAt)).limit(10);
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

import { Product } from "@/types/products.ts";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import * as schema from "../db/schema.ts";

export function useProduct(productId: string) {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProduct = async (name?: string) => {
    try {
      const data = await drizzleDb
        .select()
        .from(schema.product)
        .where(
          and(
            eq(schema.product.productId, productId),
            eq(schema.product.isDeleted, 0),
          ),
        );

      setProduct(data[0] || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  return { product, loading, refetch: fetchProduct };
}

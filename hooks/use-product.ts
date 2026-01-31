import { Product } from "@/types/products.ts";
import { eq } from "drizzle-orm";
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
        .where(eq(schema.product.productId, productId));

      setProduct(data[0] || null);
    } catch (err) {
      console.log("Error fetching products:", err);
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

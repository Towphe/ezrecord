import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "../db/schema.ts";

export function useDeleteProduct(productId: string) {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const deleteProduct = async () => {
    try {
      const product = await drizzleDb
        .select()
        .from(schema.product)
        .where(eq(schema.product.productId, productId))
        .get();

      if (!product) {
        throw new Error("Product not found");
      }

      const updatedProduct = {
        isDeleted: 1,
      };

      const result = await drizzleDb
        .update(schema.product)
        .set(updatedProduct)
        .where(eq(schema.product.productId, productId))
        .returning();

      return result;
    } catch (err) {
      console.error(err);
    }
  };

  return { deleteProduct };
}

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "../db/schema.ts";

export function useEditProduct(productId: string) {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const editProduct = async (data: {
    name?: string;
    description?: string;
    price?: number;
    quantity?: number;
  }) => {
    try {
      const product = await drizzleDb
        .select()
        .from(schema.product)
        .where(eq(schema.product.productId, productId))
        .get();

      if (!product) {
        throw new Error("Product not found");
      }

      // update only the fields that are provided
      const updatedProduct = {
        name: data.name ?? product.name,
        description: data.description ?? product.description,
        price: data.price ?? product.price,
        quantity: data.quantity ?? product.quantity,
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

  return { editProduct };
}

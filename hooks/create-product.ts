import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "../db/schema.ts";

export function useCreateProduct() {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const createProduct = async (data: {
    name: string;
    description?: string;
    price: number;
    quantity: number;
  }) => {
    try {
      const result = await drizzleDb
        .insert(schema.product)
        .values({
          name: data.name,
          description: data.description,
          price: data.price,
          quantity: data.quantity,
        })
        .returning();
      return result;
    } catch (err) {
      console.error(err);
    }
  };

  return { createProduct };
}

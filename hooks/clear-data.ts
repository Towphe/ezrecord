import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "../db/schema.ts";

export function useClearData() {
  // clears all data in SQLite database
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const clearData = async () => {
    try {
      await drizzleDb.delete(schema.transactionProduct).run();
      await drizzleDb.delete(schema.transaction).run();
      await drizzleDb.delete(schema.product).run();
      await drizzleDb.delete(schema.user).run();
    } catch (err) {
      console.error(err);
    }
  };

  return { clearData };
}

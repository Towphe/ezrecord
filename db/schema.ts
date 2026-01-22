import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v4 as uuid } from "uuid";

export const user = sqliteTable("user", {
  userId: text("user_id")
    .$defaultFn(() => uuid())
    .primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  isDeleted: integer("is_deleted").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => Date.now().toString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => Date.now().toString()),
});

export const product = sqliteTable("product", {
  productId: text("product_id")
    .$defaultFn(() => uuid())
    .primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
  isDeleted: integer("is_deleted").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => Date.now().toString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => Date.now().toString()),
});

export const transaction = sqliteTable("transaction", {
  transactionId: text("transaction_id")
    .$defaultFn(() => uuid())
    .primaryKey(),
  totalAmount: real("total_amount").notNull(),
  paymentMethod: text("payment_method").notNull(),
  isDeleted: integer("is_deleted").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => Date.now().toString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => Date.now().toString()),
});

export const transactionProduct = sqliteTable("transaction_product", {
  transactionProductId: text("transaction_product_id")
    .$defaultFn(() => uuid())
    .primaryKey(),
  transactionId: text("transaction_id")
    .notNull()
    .references(() => transaction.transactionId),
  productId: text("product_id")
    .notNull()
    .references(() => product.productId),
  amount: real("amount").notNull(),
  quantity: integer("quantity").notNull(),
  isDeleted: integer("is_deleted").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => Date.now().toString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => Date.now().toString()),
});

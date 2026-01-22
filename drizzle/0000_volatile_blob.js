// JS wrapper for the SQL migration. Expo/Metro can't import .sql files directly,
// so export the SQL as a string to be consumable by the app bundler.
const m0000 = `CREATE TABLE \`product\` (
\t\`product_id\` text PRIMARY KEY NOT NULL,
\t\`name\` text NOT NULL,
\t\`description\` text,
\t\`quantity\` integer NOT NULL,
\t\`price\` real NOT NULL,
\t\`is_deleted\` integer DEFAULT 0 NOT NULL,
\t\`created_at\` text NOT NULL,
\t\`updated_at\` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE \`transaction\` (
\t\`transaction_id\` text PRIMARY KEY NOT NULL,
\t\`total_amount\` real NOT NULL,
\t\`payment_method\` text NOT NULL,
\t\`is_deleted\` integer DEFAULT 0 NOT NULL,
\t\`created_at\` text NOT NULL,
\t\`updated_at\` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE \`transaction_product\` (
\t\`transaction_product_id\` text PRIMARY KEY NOT NULL,
\t\`transaction_id\` text NOT NULL,
\t\`product_id\` text NOT NULL,
\t\`amount\` real NOT NULL,
\t\`quantity\` integer NOT NULL,
\t\`is_deleted\` integer DEFAULT 0 NOT NULL,
\t\`created_at\` text NOT NULL,
\t\`updated_at\` text NOT NULL,
\tFOREIGN KEY (\`transaction_id\`) REFERENCES \`transaction\`(\`transaction_id\`) ON UPDATE no action ON DELETE no action,
\tFOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`product_id\`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE \`user\` (
\t\`user_id\` text PRIMARY KEY NOT NULL,
\t\`first_name\` text NOT NULL,
\t\`last_name\` text NOT NULL,
\t\`email\` text NOT NULL,
\t\`is_deleted\` integer DEFAULT 0 NOT NULL,
\t\`created_at\` text NOT NULL,
\t\`updated_at\` text NOT NULL
);
`;

export default m0000;

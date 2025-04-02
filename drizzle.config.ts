// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/db/schema.ts",
    dbCredentials: {
        url: "postgres://postgres:Database1234@localhost:5432/postgres",
    },
});

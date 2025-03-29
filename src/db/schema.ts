import { pgTable, text, numeric, date, timestamp, pgEnum, uuid } from 'drizzle-orm/pg-core';

export const statementTypeEnum = pgEnum('statement_type', ['applecard', 'chase', 'mastercard'])
export const expenseTypeEnum = pgEnum('expense_type', ['shopping', 'food', 'groceries', 'subscriptions']);

export const transactions = pgTable('transactions', {
    id: uuid('id').primaryKey().defaultRandom(),
    date: date('date').notNull(),
    statementType: statementTypeEnum('statementtype').notNull(),
    expenseType: expenseTypeEnum('expensetype').notNull(),
    vendor: text('vendor').notNull(),
    price: numeric('price').notNull(),
    location: text('location').notNull(),
})

export const balances = pgTable('balances', {
    id: uuid('id').primaryKey().defaultRandom(),
    timestamp: timestamp('timestamp').notNull(),
    statementType: statementTypeEnum('statementtype').notNull(),
    balance: numeric('balance').notNull()
})

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Balance = typeof balances.$inferSelect;
export type NewBalance = typeof balances.$inferInsert;

export type DB = {
    transactions: typeof transactions;
    balances: typeof balances;
}
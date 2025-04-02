import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, desc, sql } from 'drizzle-orm';
import { transactions, balances } from './schema';
import { StatementType, ExpenseType } from '../lib/api';

// Create a database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL!
});
const db = drizzle(pool);

// TRANSACTION OPERATIONS
export async function insertTransaction(
    date: Date,
    statementtype: StatementType,
    expensetype: ExpenseType,
    vendor: string,
    price: number,
    location: string
) {
    const transaction = {
        date: date.toISOString(),
        statementType: statementtype,
        expenseType: expensetype,
        vendor,
        price: price.toString(),
        location
    };

    const result = await db.insert(transactions).values(transaction).returning();
    return result[0];
}

export async function getAllTransactions() {
    return await db.select().from(transactions);
}

export async function getTransactionsByType(statementType: StatementType) {
    return await db
        .select()
        .from(transactions)
        .where(eq(transactions.statementType, statementType));
}

export async function updateTransaction(
    id: string,
    updates: Partial<Omit<typeof transactions.$inferInsert, 'id'>>
) {
    return await db
        .update(transactions)
        .set(updates)
        .where(eq(transactions.id, id))
        .returning();
}

export async function deleteTransaction(id: string) {
    return await db
        .delete(transactions)
        .where(eq(transactions.id, id))
        .returning();
}

// BALANCE OPERATIONS
export async function insertBalance(
    statementtype: StatementType,
    balance: number
) {
    const balanceRecord = {
        timestamp: new Date(),
        statementType: statementtype,
        balance: balance.toString()
    };

    const result = await db.insert(balances).values(balanceRecord).returning();
    return result[0];
}

export async function getAllBalances() {
    return await db.select().from(balances);
}

export async function getLatestBalanceByType(statementType: StatementType) {
    return await db
        .select()
        .from(balances)
        .where(eq(balances.statementType, statementType))
        .orderBy(desc(balances.timestamp))
        .limit(1);
}

export async function updateBalance(
    id: string,
    newBalance: number
) {
    return await db
        .update(balances)
        .set({ balance: newBalance.toString() })
        .where(eq(balances.id, id))
        .returning();
}

export async function deleteBalance(id: string) {
    return await db
        .delete(balances)
        .where(eq(balances.id, id))
        .returning();
}

// Calculate total balance across all accounts
export async function getTotalBalance(): Promise<number> {
    const statementTypes: StatementType[] = ['applecard', 'chase', 'mastercard'];
    let total = 0;

    for (const type of statementTypes) {
        const latest = await getLatestBalanceByType(type);
        if (latest.length > 0) {
            total += Number(latest[0].balance);
        }
    }

    return total;
}

export async function getTotalAccounts(): Promise<number> {
    const result = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${balances.statementType})` })
        .from(balances);

    return result[0]?.count ?? 0;
}

// Connect to database and handle errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
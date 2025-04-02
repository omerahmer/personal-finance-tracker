import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { desc, sql } from 'drizzle-orm';
import { transactions, balances } from '../../../db/schema';
import { NextRequest, NextResponse } from 'next/server';
import { StatementType, ExpenseType, ExpensePOSTRequest, ExpenseGETResponse } from '@/lib/api';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool);

async function getTotalBalance(): Promise<number> {
    const statementTypes: StatementType[] = ['applecard', 'chase', 'mastercard'];
    let total = 0;

    for (const type of statementTypes) {
        const latest = await db
            .select({ balance: sql<number>`CAST(balance AS DOUBLE PRECISION)` })
            .from(balances)
            .where(sql`${balances.statementType} = ${type}`)
            .orderBy(desc(balances.timestamp))
            .limit(1);

        if (latest.length > 0) {
            total += latest[0].balance;
        }
    }

    return total;
}

async function getTotalAccounts(): Promise<number> {
    const result = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${balances.statementType})` })
        .from(balances);

    return result[0]?.count ?? 0;
}

export async function GET(request: NextRequest) {
    console.log('/api/expense');
    console.log(request);

    const searchParams = request.nextUrl.searchParams;
    const start = new Date(searchParams.get('start') || '1970-01-01');
    const end = new Date(searchParams.get('end') || '2030-01-01');

    const expenseResponse: ExpenseGETResponse = {
        spending: 0,
        transactions: [],
        accounts: 0,
        netWorth: '0'
    };

    const totalSpending = await db
        .select({ totalPrice: sql<number>`SUM(${transactions.price})` })
        .from(transactions)
        .where(
            sql`${transactions.date} >= ${start.toISOString()} AND ${transactions.date} <= ${end.toISOString()}`
        );

    const transactionRecords = await db
        .select()
        .from(transactions)
        .where(
            sql`${transactions.date} >= ${start.toISOString()} AND ${transactions.date} <= ${end.toISOString()}`
        )
        .orderBy(desc(transactions.date));

    const netWorth = await getTotalBalance();
    const accounts = await getTotalAccounts();

    expenseResponse.spending = Number(totalSpending[0]?.totalPrice || 0);
    expenseResponse.transactions = transactionRecords.map((transaction) => ({
        id: transaction.id,
        date: transaction.date,
        statementType: transaction.statementType as StatementType,
        expenseType: transaction.expenseType as ExpenseType,
        vendor: transaction.vendor,
        price: Number(transaction.price),
        location: transaction.location,
    }));
    expenseResponse.netWorth = netWorth.toFixed(2);
    expenseResponse.accounts = accounts;

    console.log('Transactions:', expenseResponse.transactions);
    return NextResponse.json(expenseResponse);
}

export async function POST(request: NextRequest) {
    const body: ExpensePOSTRequest = await request.json();
    const { statementType, transactions: transactionList } = body;

    const transactionData = transactionList.map((transaction) => ({
        id: transaction.id,
        date: transaction.date,
        statementType: statementType as StatementType,
        expenseType: transaction.expenseType as ExpenseType,
        vendor: transaction.vendor,
        price: transaction.price.toString(),
        location: transaction.location,
    }));

    await db.insert(transactions).values(transactionData);
    return NextResponse.json(body);
}

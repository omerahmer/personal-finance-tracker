import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { desc, sql } from 'drizzle-orm';
import { transactions } from '../../../db/schema';
import { NextRequest, NextResponse } from 'next/server';
import { StatementType, ExpenseType, ExpensePOSTRequest, ExpenseGETResponse } from '@/lib/api';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool);

export async function GET(request: NextRequest) {
    console.log('/api/expense');
    console.log(request);

    const searchParams = request.nextUrl.searchParams;
    const start = new Date(searchParams.get('start') || '1970-01-01');
    const end = new Date(searchParams.get('end') || '2030-01-01');

    const expenseResponse: ExpenseGETResponse = { spending: 0, transactions: [] };

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

    console.log('Transactions:', expenseResponse.transactions);
    return NextResponse.json(expenseResponse);
}

export async function POST(request: NextRequest) {
    const body: ExpensePOSTRequest = await request.json();
    const { statementType, transactions: transactionList } = body;

    const transactionData = transactionList.map((transaction) => ({
        id: transaction.id,
        date: transaction.date,
        statementType: statementType as "applecard" | "chase" | "mastercard",
        expenseType: transaction.expenseType as "shopping" | "food" | "groceries" | "subscriptions",
        vendor: transaction.vendor,
        price: transaction.price.toString(),
        location: transaction.location,
    }));

    await db.insert(transactions).values(transactionData);
    return NextResponse.json(body);
}

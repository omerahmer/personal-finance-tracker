import { BalancePOSTRequest } from '@/lib/api';
import { balances } from '@/db/schema';
import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { v4 } from 'uuid';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool);

export async function POST(request: NextRequest) {
    console.log('/api/balance');
    console.log(request);

    const balanceRequest: BalancePOSTRequest = await request.json();

    try {
        // Convert to batch insert using Drizzle
        const insertData = balanceRequest.map(item => ({
            id: v4(),
            timestamp: new Date(item.timestamp),
            statementType: item.statementType,
            balance: item.balance.toString(),
        }));

        const res = await db.insert(balances).values(insertData).returning();
        return NextResponse.json(res);

    } catch (error) {
        console.error('Error inserting balances:', error);
        return NextResponse.json(
            { error: 'Failed to insert balances' },
            { status: 500 }
        );
    }
}
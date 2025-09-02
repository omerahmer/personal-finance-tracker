'use client'

import { ExpenseGETResponse } from '@/lib/api';
import InfoCard from './info-card';
import { Skeleton } from './ui/skeleton';
import { Banknote, DollarSign, Hash, Landmark } from 'lucide-react';

import useSWR from 'swr';

export default function InfoCardContainer() {
    const { data, isLoading } = useSWR('/api/expense', (url) =>
        fetch(url).then((res) => res.json())
    );

    return (
        <>
            <InfoCard
                title="Total Spending"
                value={
                    isLoading ? (
                        <Skeleton className="w-full h-4" />
                    ) : (
                        '$' + ((data as ExpenseGETResponse)?.spending ?? 0)
                    )
                }
                Icon={Banknote}
            />
            <InfoCard
                title="Transactions"
                value={
                    isLoading ? (
                        <Skeleton className="w-full h-4" />
                    ) : (
                        '$' + ((data as ExpenseGETResponse)?.spending ?? 0)
                    )
                }
                Icon={Hash}
            />
            <InfoCard
                title="Net Worth"
                value={
                    isLoading ? (
                        <Skeleton className="w-full h-4" />
                    ) : (
                            '$' + ((data as ExpenseGETResponse)?.netWorth ?? 0)
                    )
                }
                Icon={DollarSign}
            />
            <InfoCard
                title="Accounts"
                value={
                    isLoading ? (
                        <Skeleton className="w-full h-4" />
                    ) : (
                        ((data as ExpenseGETResponse)?.accounts ?? 0)
                    )
                }
                Icon={Landmark}
            />
        </>
    );
}
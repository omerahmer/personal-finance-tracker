/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { uploadAtom } from '@/atom/upload-atom';

import { Check, Loader2, MoveLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UploadForm from '@/components/upload-form';
import { Textarea } from '@/components/ui/textarea';
import { StatusCodes } from 'http-status-codes';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { z } from 'zod';

import { StatementType } from '@/lib/api';
import { StatementMappings } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NewTransaction } from '@/db/schema';

function ScanPage() {
    const [uploadData] = useAtom(uploadAtom);
    const [rawTextareaData, setRawTextareaData] = useState('');
    const [statementType, setStatementType] = useState<StatementType>();
    const [processing, setProcessing] = useState(false);
    const router = useRouter();

    async function onSubmit() {
        try {
            setProcessing(true);

            const parsed = JSON.parse(rawTextareaData);

            // Map into Drizzle schema shape
            const transactions = parsed.map((tx: NewTransaction) => ({
                date: new Date(tx.date).toISOString(), // ensure timestamp
                statementType,
                expenseType: tx.expenseType,
                vendor: tx.vendor,
                price: tx.price.toString(), // Drizzle numeric
                location: tx.location ?? 'Unknown', // schema requires not null
            }));

            const res = await fetch(`/api/expense`, {
                method: 'POST',
                body: JSON.stringify({
                    statementType,
                    transactions,
                }),
            });

            setProcessing(false);

            if (res.status === StatusCodes.OK) {
                router.push('/');
            } else {
                toast.error('Oh no! Something went wrong.', {
                    description: 'Failed to parse JSON or insert into DB',
                });
            }
        } catch (err) {
            setProcessing(false);
            toast.error('Invalid JSON', {
                description: 'Please check your transaction JSON before submitting.',
            });
        }
    }

    return (
        <div className="p-6 border rounded-lg border-muted">
            <div className="mb-4">
                <h2 className="text-3xl font-semibold">Scan Statement</h2>
                <p className="text-sm text-muted-foreground">
                    Scan a bank or credit card statement
                </p>
            </div>

            <UploadForm setStatementType={setStatementType} />

            {uploadData.length > 0 && (
                <div className="flex flex-col mt-4 gap-y-4">
                    <hr className="h-[2px] border-0 bg-muted" />
                    <h3 className="text-2xl font-semibold text-secondary-foreground">
                        Your Expenses
                    </h3>

                    <Textarea
                        cols={100}
                        rows={20}
                        onChange={(e) => setRawTextareaData(e.target.value)}
                        defaultValue={JSON.stringify(uploadData, null, 2)}
                    />

                    <div className="flex flex-row gap-x-2">
                        <Button variant="outline" className="w-1/4 mb-4" onClick={() => router.push('/')}>
                            <X className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button className="w-full" onClick={onSubmit}>
                            {processing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4 mr-2" />
                            )}
                            Yes, that looks right
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function BalancePage() {

    const formSchema = z.object({
        statementType: z.string({
            required_error: 'Please select a statement type.',
        }),
        balance: z.coerce.number({
            required_error: 'Balance is required',
            invalid_type_error: 'Balance must be a number',
        }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        const balanceRes = await fetch('/api/balance', {
            method: 'POST',
            body: JSON.stringify([
                {
                    ...data,
                    timestamp: new Date().toISOString(), // FIX: use ISO string
                },
            ]),
        });

        if (balanceRes.status !== StatusCodes.OK) {
            toast.error('Oh no! Something went wrong.', {
                description: 'Failed to update balance.',
            });
            return;
        }

        toast.success('Success!', {
            description: `Updated ${data.statementType} balance to $${data.balance}`,
        });
    }

    return (
        <div className="p-6 border rounded-lg border-muted">
            <div className="mb-4">
                <h2 className="text-3xl font-semibold">Record Balance</h2>
                <p className="text-sm text-muted-foreground">
                    Update the current balance for one or more of your accounts
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="statementType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Statement Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a source" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {StatementMappings.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="balance"
                        render={({ }) => (
                            <FormItem>
                                <FormLabel>Balance</FormLabel>
                                <div className="flex flex-row items-center">
                                    <p className="mr-2 text-muted-foreground">$</p>
                                    <Input placeholder="0.00" {...form.register('balance')} />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        </div>
    );
}

export default function NewPage() {
    return (
        <div className="flex flex-col max-w-screen-sm m-8 gap-y-4">
            <Link href="/">
                <Button variant="outline" className="mb-4">
                    <MoveLeft className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="font-semibold text-muted-foreground">Back</span>
                </Button>
            </Link>

            <Tabs defaultValue="scan">
                <TabsList className="mb-4">
                    <TabsTrigger value="scan">Scan Statement</TabsTrigger>
                    <TabsTrigger value="balance">Record Balance</TabsTrigger>
                </TabsList>

                <TabsContent value="scan">
                    <ScanPage />
                </TabsContent>

                <TabsContent value="balance">
                    <BalancePage />
                </TabsContent>
            </Tabs>
        </div>
    );
}
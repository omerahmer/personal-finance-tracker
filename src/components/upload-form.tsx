/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
    Form,
    FormControl,
    FormDescription,
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
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { FormattedExpense, StatementType, UrlResponse } from '@/lib/api';
import { StatusCodes } from 'http-status-codes';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import { StatementMappings } from '@/lib/utils';
import { atom } from 'jotai';

const uploadAtom = atom<FormattedExpense[]>([]);

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const formSchema = z.object({
    statementType: z.string({
        required_error: 'Please select a statement type.',
    }),
    statementFile: z
        .custom<File[]>()
        .refine((files) => ACCEPTED_IMAGE_TYPES.includes(files[0].type), {
            message: 'Allowed types: .jpg, .jpeg, .png and .webp',
        }),
});

export default function UploadForm({ setStatementType }: { setStatementType: (statmentType: StatementType) => void }) {
    const [processing, setProcessing] = useState(false);
    const [uploadData, setUploadData] = useAtom(uploadAtom);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        const statementType = data.statementType;
        setStatementType(statementType as StatementType);
        const file = data.statementFile[0];

        console.log('Statement type:', statementType);
        console.log('File name:', file.name);

        setProcessing(true);

        try {
            const urlResponse = await fetch(`/api/upload`, {
                method: 'POST',
                body: JSON.stringify({ name: file.name }),
            });

            if (!urlResponse.ok) throw new Error('Failed to get upload URL');

            const urlJson: UrlResponse = await urlResponse.json();

            const uploadRes = await fetch(urlJson.uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type || 'application/octet-stream',
                },
            });

            if (uploadRes.status === StatusCodes.OK) {
                toast.success(`Successfully uploaded ${file.name}!`);
            } else {
                throw new Error(`Failed to upload ${file.name}`);
            }

            console.log('Extracting expense information from statement...');

            const expenseRes = await fetch('/api/extract', {
                method: 'POST',
                body: JSON.stringify({ file: urlJson, type: statementType }),
            });

            if (!expenseRes.ok) {
                throw new Error('Failed to parse expense report.');
            }

            const extractedData = (await expenseRes.json()) as FormattedExpense[];
            setUploadData(extractedData);

            toast.success('Expense extraction successful!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Something went wrong!';
            toast.error(errorMessage);
        } finally {
            setProcessing(false);
        }
    }

    return (
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
                            <FormDescription>Choose a statement type from one of the sources above.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="statementFile"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Screenshot</FormLabel>
                            <Input type="file" {...form.register('statementFile', { required: true })} />
                            <FormDescription>This is your statement.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={processing}>
                    {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <span>{processing ? 'Processing' : 'Process'}</span>
                </Button>
            </form>
        </Form>
    );
}

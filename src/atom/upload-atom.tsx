import { FormattedExpense } from '@/lib/api';
import { atom } from 'jotai';

export const uploadAtom = atom<FormattedExpense[]>([]);
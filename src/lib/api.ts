export const BUCKET = ''
export const EXPIRATION = 3600

export type UploadRequest = {
    name: string,
}

export type UrlResponse = {
    name: string;
    key: string;
    bucket: string;
    getUrl: string;
    uploadUrl: string;
    expires: number;
}

export type StatementType =
    | 'applecard'
    | 'chase'
    | 'mastercard';

export type ExpenseType =
    | 'shopping'
    | 'food'
    | 'groceries'
    | 'subscriptions';

export type FormattedExpense = {
    id: string;
    date: string;
    statementType: StatementType;
    expenseType: ExpenseType;
    vendor: string;
    price: number;
    location: string;
}

export type Balance = {
    id: string;
    timestamp: Date;
    statementType: StatementType;
    balance: number;
}

export type ExtractRequest = {
    file: UrlResponse;
    type: StatementType;
}

export type ExpenseGETResponse = {
    spending: number;
    transactions: FormattedExpense[];
}

export type ExpensePOSTRequest = {
    statementType: string;
    transactions: FormattedExpense[];
}

export type BalanceGETResponse = {
    total: number;
    balances: Balance[];
}

export type BalancePOSTRequest = Balance[];
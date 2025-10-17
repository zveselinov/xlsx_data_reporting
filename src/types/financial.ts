export interface FinancialRecord {
  date: string;
  time: string;
  payments: number;
  paymentsEur: number;
  receipts: number;
  receiptsEur: number;
  description: string;
  correspondent: string;
  interimBalance: number;
  interimBalanceEur: number;
  paymentBasis: string;
  additionalNotes: string;
  reference: string;
  debitAdvice: string;
}

export interface CategorySummary {
  category: string;
  payments: number;
  receipts: number;
  paymentsEur: number;
  receiptsEur: number;
}

export interface CorrespondentSummary {
  correspondent: string;
  payments: number;
  receipts: number;
  paymentsEur: number;
  receiptsEur: number;
}

export interface DateSummary {
  date: string;
  payments: number;
  receipts: number;
  paymentsEur: number;
  receiptsEur: number;
  byCategory?: Map<string, { payments: number; receipts: number }>;
  byCorrespondent?: Map<string, { payments: number; receipts: number }>;
}

export interface AnalyticsData {
  records: FinancialRecord[];
  totalPayments: number;
  totalReceipts: number;
  totalPaymentsEur: number;
  totalReceiptsEur: number;
  byDate: DateSummary[];
  byCategory: CategorySummary[];
  byCorrespondent: CorrespondentSummary[];
  selectedCategories?: string[];
  selectedCorrespondents?: string[];
}

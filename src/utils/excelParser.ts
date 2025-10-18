import * as XLSX from 'xlsx';
import { FinancialRecord, AnalyticsData, CategorySummary, CorrespondentSummary, DateSummary } from '../types/financial';

export const parseExcelFile = (file: File): Promise<AnalyticsData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        const records: FinancialRecord[] = [];

        for (let i = 2; i < jsonData.length; i++) {
          const row: any = jsonData[i];

          if (!row || row.length === 0 || !row[0]) continue;

          const record: FinancialRecord = {
            date: row[0] ? formatExcelDate(row[0]) : '',
            time: row[1] ? formatExcelTime(row[1]) : '',
            payments: parseFloat(row[2]) || 0,
            paymentsEur: parseFloat(row[3]) || 0,
            receipts: parseFloat(row[4]) || 0,
            receiptsEur: parseFloat(row[5]) || 0,
            description: row[6] ? String(row[6]).trim() : '',
            correspondent: row[7] ? String(row[7]).trim() : '',
            interimBalance: parseFloat(row[8]) || 0,
            interimBalanceEur: parseFloat(row[9]) || 0,
            paymentBasis: row[10] ? String(row[10]) : '',
            additionalNotes: row[11] ? String(row[11]) : '',
            reference: row[12] ? String(row[12]) : '',
            debitAdvice: row[13] ? String(row[13]) : '',
          };

          records.push(record);
        }

        const analytics = calculateAnalytics(records);
        resolve(analytics);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

const calculateAnalytics = (records: FinancialRecord[]): AnalyticsData => {
  const totalPayments = records.reduce((sum, r) => sum + r.payments, 0);
  const totalReceipts = records.reduce((sum, r) => sum + r.receipts, 0);
  const totalPaymentsEur = records.reduce((sum, r) => sum + r.paymentsEur, 0);
  const totalReceiptsEur = records.reduce((sum, r) => sum + r.receiptsEur, 0);

  const byDate = calculateByDate(records);
  const byCategory = calculateByCategory(records);
  const byCorrespondent = calculateByCorrespondent(records);

  return {
    records,
    totalPayments,
    totalReceipts,
    totalPaymentsEur,
    totalReceiptsEur,
    byDate,
    byCategory,
    byCorrespondent,
  };
};

const calculateByDate = (records: FinancialRecord[]): DateSummary[] => {
  const dateMap = new Map<string, DateSummary>();

  records.forEach((record) => {
    const date = record.date;
    if (!dateMap.has(date)) {
      dateMap.set(date, {
        date,
        payments: 0,
        receipts: 0,
        paymentsEur: 0,
        receiptsEur: 0,
        byCategory: new Map(),
        byCorrespondent: new Map(),
      });
    }

    const summary = dateMap.get(date)!;
    summary.payments += record.payments;
    summary.receipts += record.receipts;
    summary.paymentsEur += record.paymentsEur;
    summary.receiptsEur += record.receiptsEur;

    const category = extractCategory(record.description);
    if (!summary.byCategory!.has(category)) {
      summary.byCategory!.set(category, { payments: 0, receipts: 0 });
    }
    const catData = summary.byCategory!.get(category)!;
    catData.payments += record.payments;
    catData.receipts += record.receipts;

    const correspondent = record.correspondent && record.correspondent.trim() !== '' ? record.correspondent : 'Без контрагент';
    if (!summary.byCorrespondent!.has(correspondent)) {
      summary.byCorrespondent!.set(correspondent, { payments: 0, receipts: 0 });
    }
    const corrData = summary.byCorrespondent!.get(correspondent)!;
    corrData.payments += record.payments;
    corrData.receipts += record.receipts;
  });

  return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
};

const calculateByCategory = (records: FinancialRecord[]): CategorySummary[] => {
  const categoryMap = new Map<string, CategorySummary>();

  records.forEach((record) => {
    const category = extractCategory(record.description);
    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        category,
        payments: 0,
        receipts: 0,
        paymentsEur: 0,
        receiptsEur: 0,
      });
    }

    const summary = categoryMap.get(category)!;
    summary.payments += record.payments;
    summary.receipts += record.receipts;
    summary.paymentsEur += record.paymentsEur;
    summary.receiptsEur += record.receiptsEur;
  });

  return Array.from(categoryMap.values()).sort((a, b) =>
    (b.payments + b.receipts) - (a.payments + a.receipts)
  );
};

const calculateByCorrespondent = (records: FinancialRecord[]): CorrespondentSummary[] => {
  const correspondentMap = new Map<string, CorrespondentSummary>();

  records.forEach((record) => {
    const correspondent = record.correspondent && record.correspondent.trim() !== '' ? record.correspondent : 'Без контрагент';
    if (!correspondentMap.has(correspondent)) {
      correspondentMap.set(correspondent, {
        correspondent,
        payments: 0,
        receipts: 0,
        paymentsEur: 0,
        receiptsEur: 0,
      });
    }

    const summary = correspondentMap.get(correspondent)!;
    summary.payments += record.payments;
    summary.receipts += record.receipts;
    summary.paymentsEur += record.paymentsEur;
    summary.receiptsEur += record.receiptsEur;
  });

  return Array.from(correspondentMap.values()).sort((a, b) =>
    (b.payments + b.receipts) - (a.payments + a.receipts)
  );
};

const extractCategory = (description: string): string => {
  if (!description || description.trim() === '') return 'Без описание';
  return description.trim();
};

const formatExcelDate = (value: any): string => {
  if (typeof value === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 86400000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }
  return String(value);
};

const formatExcelTime = (value: any): string => {
  if (typeof value === 'number') {
    const totalSeconds = Math.round(value * 86400);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return String(value);
};

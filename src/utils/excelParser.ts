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
            date: row[0] ? String(row[0]) : '',
            time: row[1] ? String(row[1]) : '',
            payments: parseFloat(row[2]) || 0,
            paymentsEur: parseFloat(row[3]) || 0,
            receipts: parseFloat(row[4]) || 0,
            receiptsEur: parseFloat(row[5]) || 0,
            description: row[6] ? String(row[6]) : '',
            correspondent: row[7] ? String(row[7]) : 'Неизвестен',
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
      });
    }

    const summary = dateMap.get(date)!;
    summary.payments += record.payments;
    summary.receipts += record.receipts;
    summary.paymentsEur += record.paymentsEur;
    summary.receiptsEur += record.receiptsEur;
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
    const correspondent = record.correspondent || 'Неизвестен';
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
  if (!description) return 'Некатегоризирани';

  const lowerDesc = description.toLowerCase();

  if (lowerDesc.includes('лихва') || lowerDesc.includes('interest')) return 'ПЛАЩАНЕ НА ЛИХВА';
  if (lowerDesc.includes('главница') || lowerDesc.includes('principal')) return 'ПОГАСЯВАНЕ НА ГЛАВНИЦА';
  if (lowerDesc.includes('такса обслужван') || lowerDesc.includes('service fee')) return 'ТАКСА ОБСЛУЖВАНЕ';
  if (lowerDesc.includes('комисион') || lowerDesc.includes('commission')) return 'КОМИСИОННИ';
  if (lowerDesc.includes('заплата') || lowerDesc.includes('salary')) return 'Заплати';
  if (lowerDesc.includes('наем') || lowerDesc.includes('rent')) return 'Наем';
  if (lowerDesc.includes('данък') || lowerDesc.includes('tax')) return 'Данъци';
  if (lowerDesc.includes('услуга') || lowerDesc.includes('service')) return 'Услуги';
  if (lowerDesc.includes('комунал') || lowerDesc.includes('utility')) return 'Комунални';
  if (lowerDesc.includes('стока') || lowerDesc.includes('product')) return 'Стоки';
  if (lowerDesc.includes('транспорт') || lowerDesc.includes('transport')) return 'Транспорт';
  if (lowerDesc.includes('реклама') || lowerDesc.includes('marketing')) return 'Реклама';
  if (lowerDesc.includes('материал') || lowerDesc.includes('material')) return 'Материали';
  if (lowerDesc.includes('осигуровка') || lowerDesc.includes('insurance')) return 'Осигуровки';
  if (lowerDesc.includes('превод') || lowerDesc.includes('transfer')) return 'Преводи';
  if (lowerDesc.includes('внос') || lowerDesc.includes('deposit')) return 'Внос';
  if (lowerDesc.includes('теглене') || lowerDesc.includes('withdrawal')) return 'Теглене';

  return 'Други';
};

import * as XLSX from 'xlsx';
import { AnalyticsData } from '../types/financial';

export const exportToExcel = (analytics: AnalyticsData) => {
  const workbook = XLSX.utils.book_new();

  const recordsData = analytics.records.map((record) => ({
    'Дата': record.date,
    'Час': record.time,
    'Плащания (BGN)': record.payments,
    'Плащания (EUR)': record.paymentsEur,
    'Постъпления (BGN)': record.receipts,
    'Постъпления (EUR)': record.receiptsEur,
    'Описание': record.description,
    'Контрагент': record.correspondent,
    'Основание': record.paymentBasis,
    'Референция': record.reference,
  }));

  const recordsSheet = XLSX.utils.json_to_sheet(recordsData);
  XLSX.utils.book_append_sheet(workbook, recordsSheet, 'Данни');

  const summaryData = [
    { 'Показател': 'Общо плащания (BGN)', 'Стойност': analytics.totalPayments.toFixed(2) },
    { 'Показател': 'Общо плащания (EUR)', 'Стойност': analytics.totalPaymentsEur.toFixed(2) },
    { 'Показател': 'Общо постъпления (BGN)', 'Стойност': analytics.totalReceipts.toFixed(2) },
    { 'Показател': 'Общо постъпления (EUR)', 'Стойност': analytics.totalReceiptsEur.toFixed(2) },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Общи суми');

  const byDateData = analytics.byDate.map((item) => ({
    'Дата': item.date,
    'Плащания (BGN)': item.payments.toFixed(2),
    'Постъпления (BGN)': item.receipts.toFixed(2),
    'Плащания (EUR)': item.paymentsEur.toFixed(2),
    'Постъпления (EUR)': item.receiptsEur.toFixed(2),
  }));

  const byDateSheet = XLSX.utils.json_to_sheet(byDateData);
  XLSX.utils.book_append_sheet(workbook, byDateSheet, 'По дати');

  const byCategoryData = analytics.byCategory.map((item) => ({
    'Категория': item.category,
    'Плащания (BGN)': item.payments.toFixed(2),
    'Постъпления (BGN)': item.receipts.toFixed(2),
    'Плащания (EUR)': item.paymentsEur.toFixed(2),
    'Постъпления (EUR)': item.receiptsEur.toFixed(2),
  }));

  const byCategorySheet = XLSX.utils.json_to_sheet(byCategoryData);
  XLSX.utils.book_append_sheet(workbook, byCategorySheet, 'По категории');

  const byCorrespondentData = analytics.byCorrespondent.map((item) => ({
    'Контрагент': item.correspondent,
    'Плащания (BGN)': item.payments.toFixed(2),
    'Постъпления (BGN)': item.receipts.toFixed(2),
    'Плащания (EUR)': item.paymentsEur.toFixed(2),
    'Постъпления (EUR)': item.receiptsEur.toFixed(2),
  }));

  const byCorrespondentSheet = XLSX.utils.json_to_sheet(byCorrespondentData);
  XLSX.utils.book_append_sheet(workbook, byCorrespondentSheet, 'По контрагенти');

  XLSX.writeFile(workbook, 'financial-data.xlsx');
};

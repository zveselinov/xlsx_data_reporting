import { AnalyticsData, FinancialRecord, CategorySummary, CorrespondentSummary, DateSummary } from '../types/financial';

export const filterAnalytics = (
  analytics: AnalyticsData,
  selectedCategories: string[],
  selectedCorrespondents: string[]
): AnalyticsData => {
  if (selectedCategories.length === 0 && selectedCorrespondents.length === 0) {
    return analytics;
  }

  const filteredRecords = analytics.records.filter((record) => {
    const categoryMatch = selectedCategories.length === 0 ||
      selectedCategories.some(cat => {
        const category = extractCategoryFromDescription(record.description);
        return category === cat;
      });

    const correspondentMatch = selectedCorrespondents.length === 0 ||
      selectedCorrespondents.includes(record.correspondent);

    return categoryMatch && correspondentMatch;
  });

  const totalPayments = filteredRecords.reduce((sum, r) => sum + r.payments, 0);
  const totalReceipts = filteredRecords.reduce((sum, r) => sum + r.receipts, 0);
  const totalPaymentsEur = filteredRecords.reduce((sum, r) => sum + r.paymentsEur, 0);
  const totalReceiptsEur = filteredRecords.reduce((sum, r) => sum + r.receiptsEur, 0);

  const byDate = calculateByDate(filteredRecords);
  const byCategory = calculateByCategory(filteredRecords, selectedCategories);
  const byCorrespondent = calculateByCorrespondent(filteredRecords, selectedCorrespondents);

  return {
    records: filteredRecords,
    totalPayments,
    totalReceipts,
    totalPaymentsEur,
    totalReceiptsEur,
    byDate,
    byCategory,
    byCorrespondent,
    selectedCategories,
    selectedCorrespondents,
  };
};

const calculateByDate = (records: FinancialRecord[]): DateSummary[] => {
  return records.map((record) => {
    const category = extractCategoryFromDescription(record.description);
    const byCategory = new Map<string, { payments: number; receipts: number }>();
    byCategory.set(category, { payments: record.payments, receipts: record.receipts });

    const byCorrespondent = new Map<string, { payments: number; receipts: number }>();
    byCorrespondent.set(record.correspondent, { payments: record.payments, receipts: record.receipts });

    return {
      date: record.date,
      payments: record.payments,
      receipts: record.receipts,
      paymentsEur: record.paymentsEur,
      receiptsEur: record.receiptsEur,
      byCategory,
      byCorrespondent,
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
};

const calculateByCategory = (records: FinancialRecord[], selectedCategories: string[]): CategorySummary[] => {
  const categoryMap = new Map<string, CategorySummary>();

  records.forEach((record) => {
    const category = extractCategoryFromDescription(record.description);
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

  let categories = Array.from(categoryMap.values());

  if (selectedCategories.length > 0) {
    categories = categories.filter(c => selectedCategories.includes(c.category));
  }

  return categories.sort((a, b) => (b.payments + b.receipts) - (a.payments + a.receipts));
};

const calculateByCorrespondent = (records: FinancialRecord[], selectedCorrespondents: string[]): CorrespondentSummary[] => {
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

  let correspondents = Array.from(correspondentMap.values());

  if (selectedCorrespondents.length > 0) {
    correspondents = correspondents.filter(c => selectedCorrespondents.includes(c.correspondent));
  }

  return correspondents.sort((a, b) => (b.payments + b.receipts) - (a.payments + a.receipts));
};

const extractCategoryFromDescription = (description: string): string => {
  return description.trim();
};

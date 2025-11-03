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

    const category = extractCategoryFromDescription(record.description);
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

  return Array.from(dateMap.values()).sort((a, b) => {
    const parseDate = (dateStr: string) => {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
      return new Date(dateStr);
    };

    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    return dateA.getTime() - dateB.getTime();
  });
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
  if (!description || description.trim() === '') return 'Без описание';
  return description.trim();
};

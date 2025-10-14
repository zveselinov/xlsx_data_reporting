import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalyticsData } from '../types/financial';

export const exportToPDF = async (analytics: AnalyticsData, chartImages: { [key: string]: string }) => {
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Финансов доклад', 105, 15, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Обща информация', 14, 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Общо плащания: ${analytics.totalPayments.toFixed(2)} BGN`, 14, 40);
  doc.text(`Общо плащания: ${analytics.totalPaymentsEur.toFixed(2)} EUR`, 14, 47);
  doc.text(`Общо постъпления: ${analytics.totalReceipts.toFixed(2)} BGN`, 14, 54);
  doc.text(`Общо постъпления: ${analytics.totalReceiptsEur.toFixed(2)} EUR`, 14, 61);

  let yPosition = 75;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Разпределение по дати', 14, yPosition);
  yPosition += 5;

  const dateTableData = analytics.byDate.slice(0, 10).map((item) => [
    item.date,
    item.payments.toFixed(2),
    item.receipts.toFixed(2),
    item.paymentsEur.toFixed(2),
    item.receiptsEur.toFixed(2),
  ]);

  autoTable(doc, {
    head: [['Дата', 'Плащания (BGN)', 'Постъпления (BGN)', 'Плащания (EUR)', 'Постъпления (EUR)']],
    body: dateTableData,
    startY: yPosition,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.addPage();
  yPosition = 15;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Разпределение по категории', 14, yPosition);
  yPosition += 5;

  const categoryTableData = analytics.byCategory.slice(0, 10).map((item) => [
    item.category,
    item.payments.toFixed(2),
    item.receipts.toFixed(2),
  ]);

  autoTable(doc, {
    head: [['Категория', 'Плащания (BGN)', 'Постъпления (BGN)']],
    body: categoryTableData,
    startY: yPosition,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
  });

  const finalY = (doc as any).lastAutoTable.finalY;
  yPosition = finalY + 15;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Разпределение по контрагенти', 14, yPosition);
  yPosition += 5;

  const correspondentTableData = analytics.byCorrespondent.slice(0, 10).map((item) => [
    item.correspondent,
    item.payments.toFixed(2),
    item.receipts.toFixed(2),
  ]);

  autoTable(doc, {
    head: [['Контрагент', 'Плащания (BGN)', 'Постъпления (BGN)']],
    body: correspondentTableData,
    startY: yPosition,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
  });

  if (chartImages.timeChart) {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Времева диаграма', 105, 15, { align: 'center' });
    doc.addImage(chartImages.timeChart, 'PNG', 15, 25, 180, 100);
  }

  if (chartImages.categoryChart) {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Разпределение по категории', 105, 15, { align: 'center' });
    doc.addImage(chartImages.categoryChart, 'PNG', 40, 25, 130, 130);
  }

  if (chartImages.correspondentChart) {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Разпределение по контрагенти', 105, 15, { align: 'center' });
    doc.addImage(chartImages.correspondentChart, 'PNG', 15, 25, 180, 120);
  }

  doc.save('financial-report.pdf');
};

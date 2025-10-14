import { useState, useCallback, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { SummaryTables } from './components/SummaryTables';
import { Charts } from './components/Charts';
import { FilterPanel } from './components/FilterPanel';
import { parseExcelFile } from './utils/excelParser';
import { exportToPDF } from './utils/pdfExport';
import { exportToExcel } from './utils/excelExport';
import { filterAnalytics } from './utils/filterAnalytics';
import { AnalyticsData } from './types/financial';
import { FileSpreadsheet, Download, RefreshCw } from 'lucide-react';

function App() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [chartImages, setChartImages] = useState<{ [key: string]: string }>({});
  const [fileName, setFileName] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCorrespondents, setSelectedCorrespondents] = useState<string[]>([]);

  const filteredAnalytics = useMemo(() => {
    if (!analytics) return null;
    return filterAnalytics(analytics, selectedCategories, selectedCorrespondents);
  }, [analytics, selectedCategories, selectedCorrespondents]);

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setFileName(file.name);
    setSelectedCategories([]);
    setSelectedCorrespondents([]);

    try {
      const data = await parseExcelFile(file);
      setAnalytics(data);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Грешка при обработка на файла. Моля, проверете формата.');
    } finally {
      setLoading(false);
    }
  };

  const handleChartsReady = useCallback((images: { [key: string]: string }) => {
    setChartImages(images);
  }, []);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleCorrespondentToggle = (correspondent: string) => {
    setSelectedCorrespondents((prev) =>
      prev.includes(correspondent)
        ? prev.filter((c) => c !== correspondent)
        : [...prev, correspondent]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedCorrespondents([]);
  };

  const handleExportPDF = async () => {
    if (!filteredAnalytics) return;

    try {
      await exportToPDF(filteredAnalytics, chartImages);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Грешка при генериране на PDF файла.');
    }
  };

  const handleExportExcel = () => {
    if (!filteredAnalytics) return;

    try {
      exportToExcel(filteredAnalytics);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Грешка при генериране на Excel файла.');
    }
  };

  const handleReset = () => {
    setAnalytics(null);
    setChartImages({});
    setFileName('');
    setSelectedCategories([]);
    setSelectedCorrespondents([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FileSpreadsheet className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">
              Финансов анализатор
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Качете XLSX/XLS файл за автоматичен анализ и визуализация на данните
          </p>
        </header>

        {!analytics ? (
          <div className="max-w-2xl mx-auto">
            <FileUpload onFileSelect={handleFileSelect} loading={loading} />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Резултати от анализа
                  </h2>
                  <p className="text-gray-600">
                    Файл: <span className="font-medium">{fileName}</span>
                  </p>
                  <p className="text-gray-600">
                    Общо записи: <span className="font-medium">{analytics.records.length}</span>
                  </p>
                  {filteredAnalytics && filteredAnalytics.records.length !== analytics.records.length && (
                    <p className="text-blue-600 font-medium mt-1">
                      Филтрирани записи: {filteredAnalytics.records.length}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
                  >
                    <Download className="h-5 w-5" />
                    Изтегли PDF
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
                  >
                    <Download className="h-5 w-5" />
                    Изтегли Excel
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-md"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Нов файл
                  </button>
                </div>
              </div>
            </div>

            <FilterPanel
              analytics={analytics}
              selectedCategories={selectedCategories}
              selectedCorrespondents={selectedCorrespondents}
              onCategoryToggle={handleCategoryToggle}
              onCorrespondentToggle={handleCorrespondentToggle}
              onClearFilters={handleClearFilters}
            />

            {filteredAnalytics && (
              <>
                <SummaryTables analytics={filteredAnalytics} />

                <Charts analytics={filteredAnalytics} onChartsReady={handleChartsReady} />
              </>
            )}
          </div>
        )}

        <footer className="mt-16 text-center text-gray-600 text-sm">
          <p>
            Всички данни се обработват локално в браузъра. Вашите файлове не се качват на сървър.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

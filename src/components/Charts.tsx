import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { AnalyticsData } from '../types/financial';
import { useEffect, useRef } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartsProps {
  analytics: AnalyticsData;
  onChartsReady: (images: { [key: string]: string }) => void;
}

export const Charts: React.FC<ChartsProps> = ({ analytics, onChartsReady }) => {
  const timeChartRef = useRef<any>(null);
  const categoryChartRef = useRef<any>(null);
  const correspondentChartRef = useRef<any>(null);
  const isDarkMode = document.documentElement.classList.contains('dark');

  useEffect(() => {
    const timer = setTimeout(() => {
      const images: { [key: string]: string } = {};

      if (timeChartRef.current) {
        images.timeChart = timeChartRef.current.toBase64Image();
      }
      if (categoryChartRef.current) {
        images.categoryChart = categoryChartRef.current.toBase64Image();
      }
      if (correspondentChartRef.current) {
        images.correspondentChart = correspondentChartRef.current.toBase64Image();
      }

      onChartsReady(images);
    }, 1000);

    return () => clearTimeout(timer);
  }, [analytics, onChartsReady]);

  const generateTimeChartData = () => {
    const labels = analytics.byDate.map((d) => d.date);
    const datasets: any[] = [];

    const hasFilters = (analytics.selectedCategories && analytics.selectedCategories.length > 0) ||
                       (analytics.selectedCorrespondents && analytics.selectedCorrespondents.length > 0);

    if (!hasFilters) {
      datasets.push({
        label: 'Плащания (BGN)',
        data: analytics.byDate.map((d) => d.payments),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.3,
      });
      datasets.push({
        label: 'Постъпления (BGN)',
        data: analytics.byDate.map((d) => d.receipts),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.3,
      });
    } else {
      const colors = [
        { border: 'rgb(59, 130, 246)', bg: 'rgba(59, 130, 246, 0.5)' },
        { border: 'rgb(34, 197, 94)', bg: 'rgba(34, 197, 94, 0.5)' },
        { border: 'rgb(239, 68, 68)', bg: 'rgba(239, 68, 68, 0.5)' },
        { border: 'rgb(251, 146, 60)', bg: 'rgba(251, 146, 60, 0.5)' },
        { border: 'rgb(168, 85, 247)', bg: 'rgba(168, 85, 247, 0.5)' },
        { border: 'rgb(236, 72, 153)', bg: 'rgba(236, 72, 153, 0.5)' },
        { border: 'rgb(132, 204, 22)', bg: 'rgba(132, 204, 22, 0.5)' },
        { border: 'rgb(234, 179, 8)', bg: 'rgba(234, 179, 8, 0.5)' },
      ];

      if (analytics.selectedCategories && analytics.selectedCategories.length > 0) {
        analytics.selectedCategories.forEach((category, idx) => {
          const color = colors[idx % colors.length];
          datasets.push({
            label: `${category} - Плащания`,
            data: analytics.byDate.map((d) => {
              const catData = d.byCategory?.get(category);
              return catData ? catData.payments : 0;
            }),
            borderColor: color.border,
            backgroundColor: color.bg,
            tension: 0.3,
            borderDash: [5, 5],
          });
          datasets.push({
            label: `${category} - Постъпления`,
            data: analytics.byDate.map((d) => {
              const catData = d.byCategory?.get(category);
              return catData ? catData.receipts : 0;
            }),
            borderColor: color.border,
            backgroundColor: color.bg,
            tension: 0.3,
          });
        });
      }

      if (analytics.selectedCorrespondents && analytics.selectedCorrespondents.length > 0) {
        analytics.selectedCorrespondents.forEach((correspondent, idx) => {
          const color = colors[idx % colors.length];
          datasets.push({
            label: `${correspondent} - Плащания`,
            data: analytics.byDate.map((d) => {
              const corrData = d.byCorrespondent?.get(correspondent);
              return corrData ? corrData.payments : 0;
            }),
            borderColor: color.border,
            backgroundColor: color.bg,
            tension: 0.3,
            borderDash: [5, 5],
          });
          datasets.push({
            label: `${correspondent} - Постъпления`,
            data: analytics.byDate.map((d) => {
              const corrData = d.byCorrespondent?.get(correspondent);
              return corrData ? corrData.receipts : 0;
            }),
            borderColor: color.border,
            backgroundColor: color.bg,
            tension: 0.3,
          });
        });
      }
    }

    return { labels, datasets };
  };

  const timeChartData = generateTimeChartData();

  const displayCategories = analytics.byCategory.length > 0 ? analytics.byCategory : [];
  const topCategories = displayCategories.slice(0, 10);
  const otherCategories = displayCategories.slice(10);
  const otherTotal = otherCategories.reduce((sum, cat) => sum + cat.payments + cat.receipts, 0);

  const categoryChartData = {
    labels: [
      ...topCategories.map((c) => c.category),
      otherCategories.length > 0 ? 'Други' : null,
    ].filter(Boolean),
    datasets: [
      {
        label: 'Общо суми (BGN)',
        data: [
          ...topCategories.map((c) => c.payments + c.receipts),
          otherCategories.length > 0 ? otherTotal : null,
        ].filter((v) => v !== null),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(132, 204, 22, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const topCorrespondents = analytics.byCorrespondent.slice(0, 10);
  const otherCorrespondents = analytics.byCorrespondent.slice(10);
  const otherCorrespondentTotal = otherCorrespondents.reduce(
    (sum, cor) => sum + cor.payments + cor.receipts,
    0
  );

  const correspondentChartData = {
    labels: [
      ...topCorrespondents.map((c) => c.correspondent),
      otherCorrespondents.length > 0 ? 'Други' : null,
    ].filter(Boolean),
    datasets: [
      {
        label: 'Плащания (BGN)',
        data: [
          ...topCorrespondents.map((c) => c.payments),
          otherCorrespondents.length > 0
            ? otherCorrespondents.reduce((sum, c) => sum + c.payments, 0)
            : null,
        ].filter((v) => v !== null),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
      },
      {
        label: 'Постъпления (BGN)',
        data: [
          ...topCorrespondents.map((c) => c.receipts),
          otherCorrespondents.length > 0
            ? otherCorrespondents.reduce((sum, c) => sum + c.receipts, 0)
            : null,
        ].filter((v) => v !== null),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Времева диаграма</h3>
        <div className="h-80">
          <Line
            ref={timeChartRef}
            data={timeChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    color: isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(31, 41, 55)',
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: isDarkMode ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
                  },
                  grid: {
                    color: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)',
                  },
                },
                y: {
                  ticks: {
                    color: isDarkMode ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
                  },
                  grid: {
                    color: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Разпределение по категории
        </h3>
        <div className="h-96 flex justify-center">
          <Pie
            ref={categoryChartRef}
            data={categoryChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    color: isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(31, 41, 55)',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Разпределение по контрагенти
        </h3>
        <div className="h-96">
          <Bar
            ref={correspondentChartRef}
            data={correspondentChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    color: isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(31, 41, 55)',
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                    color: isDarkMode ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
                  },
                  grid: {
                    color: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)',
                  },
                },
                y: {
                  ticks: {
                    color: isDarkMode ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
                  },
                  grid: {
                    color: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)',
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

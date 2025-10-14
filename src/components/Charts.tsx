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

  const timeChartData = {
    labels: analytics.byDate.map((d) => d.date),
    datasets: [
      {
        label: 'Плащания (BGN)',
        data: analytics.byDate.map((d) => d.payments),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Постъпления (BGN)',
        data: analytics.byDate.map((d) => d.receipts),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.3,
      },
    ],
  };

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
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Времева диаграма</h3>
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
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
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
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
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
                },
              },
              scales: {
                x: {
                  ticks: {
                    maxRotation: 45,
                    minRotation: 45,
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

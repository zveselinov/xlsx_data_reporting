import { Filter, X } from 'lucide-react';
import { AnalyticsData } from '../types/financial';

interface FilterPanelProps {
  analytics: AnalyticsData;
  selectedCategories: string[];
  selectedCorrespondents: string[];
  onCategoryToggle: (category: string) => void;
  onCorrespondentToggle: (correspondent: string) => void;
  onClearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  analytics,
  selectedCategories,
  selectedCorrespondents,
  onCategoryToggle,
  onCorrespondentToggle,
  onClearFilters,
}) => {
  const hasActiveFilters = selectedCategories.length > 0 || selectedCorrespondents.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Филтри</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
            Изчисти филтрите
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm uppercase tracking-wide">
            Категории ({selectedCategories.length} избрани)
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {analytics.byCategory.map((item) => (
              <label
                key={item.category}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(item.category)}
                  onChange={() => onCategoryToggle(item.category)}
                  className="mt-1 h-4 w-4 text-blue-600 dark:text-blue-400 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{item.category}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Плащания: {item.payments.toFixed(2)} BGN • Постъпления: {item.receipts.toFixed(2)} BGN
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm uppercase tracking-wide">
            Контрагенти ({selectedCorrespondents.length} избрани)
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {analytics.byCorrespondent.map((item) => (
              <label
                key={item.correspondent}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCorrespondents.includes(item.correspondent)}
                  onChange={() => onCorrespondentToggle(item.correspondent)}
                  className="mt-1 h-4 w-4 text-blue-600 dark:text-blue-400 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate" title={item.correspondent}>
                    {item.correspondent}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Плащания: {item.payments.toFixed(2)} BGN • Постъпления: {item.receipts.toFixed(2)} BGN
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
              >
                {category}
                <button
                  onClick={() => onCategoryToggle(category)}
                  className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedCorrespondents.map((correspondent) => (
              <span
                key={correspondent}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
              >
                {correspondent}
                <button
                  onClick={() => onCorrespondentToggle(correspondent)}
                  className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

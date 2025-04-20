import { useState, useEffect } from 'react';

interface StatusFilterProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

// Status display configuration
const STATUS_LABELS: Record<string, string> = {
  all: 'All Listings',
  active: 'Active',
  on_hold: 'On Hold',
  unconfirmed: 'Unconfirmed',
  shipping_to_scentra: 'Shipping to Scentra',
  verifying: 'Verifying',
  shipping_to_buyer: 'Shipping to Buyer',
  completed: 'Completed',
  removed: 'Removed'
};

export default function StatusFilter({ currentFilter, onFilterChange }: StatusFilterProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <button
            key={status}
            onClick={() => onFilterChange(status)}
            className={`px-4 py-2 rounded-full text-sm ${
              currentFilter === status
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

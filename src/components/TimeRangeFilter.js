// components/TimeRangeFilter.js
import React from "react";

const TimeRangeFilter = ({ selected, onChange }) => {
  const ranges = [
    { label: "7D", value: 7 },
    { label: "14D", value: 14 },
    { label: "30D", value: 30 },
    { label: "All", value: "all" },
  ];

  return (
    <div className="flex gap-2">
      {ranges.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={`px-3 py-1 text-sm rounded-md font-medium transition ${
            selected === r.value
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
};

export default TimeRangeFilter;

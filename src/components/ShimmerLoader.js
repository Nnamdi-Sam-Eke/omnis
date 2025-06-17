import React from 'react';

const ShimmerLoader = ({ height = 'h-6', width = 'w-full', rounded = 'rounded-md' }) => {
  return (
    <div
      className={`relative overflow-hidden bg-gray-300 dark:bg-gray-700 ${height} ${width} ${rounded}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
};

export default ShimmerLoader;

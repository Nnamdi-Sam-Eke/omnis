import React from 'react';

const ShimmerLoader = ({ height = 'h-6', width = 'w-full', rounded = 'rounded-md' }) => {
  return (
    <div
      className={`relative overflow-hidden bg-gray-300 dark:bg-gray-700 ${height} ${width} ${rounded}`}
    >
      <div className="absolute inset-0 animate-shimmer-wave bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.6),transparent)]" />
    </div>
  );
};

export default ShimmerLoader;

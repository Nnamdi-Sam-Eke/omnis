// src/components/SkeletonLoader.js
import React from 'react';

const SkeletonLoader = ({ height = 'h-6', width = 'w-full' }) => (
  <div className={`bg-gray-300 dark:bg-gray-700 animate-pulse rounded ${height} ${width}`} />
);

export default SkeletonLoader;

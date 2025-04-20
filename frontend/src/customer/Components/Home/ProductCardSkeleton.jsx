import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <div className="animate-pulse bg-white shadow-lg rounded-lg p-4 w-[280px]">
      {/* Image skeleton */}
      <div className="bg-gray-200 h-[320px] w-full rounded-lg mb-4"></div>
      
      {/* Title skeleton */}
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      
      {/* Price skeleton */}
      <div className="flex gap-2 mb-2">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
      
      {/* Size skeleton */}
      <div className="flex gap-2 mt-2">
        <div className="h-8 bg-gray-200 rounded-full w-8"></div>
        <div className="h-8 bg-gray-200 rounded-full w-8"></div>
        <div className="h-8 bg-gray-200 rounded-full w-8"></div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton; 
// src/ui/LoadingSkeleton.tsx
import React from "react";

interface LoadingSkeletonProps {
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className = "" }) => {
  return (
    <div
      className={`rounded-xl min-h-[20px] w-full animate-shimmer ${className}`}
    />
  );
};

export default LoadingSkeleton;

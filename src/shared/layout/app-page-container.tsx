"use client";

import React from "react";
import { cn } from "@shared/utils";
import { PageContainer, PageContainerProps } from "./app-page-container-detail";
import { Skeleton } from "@shared/ui/skeleton";

export interface EnhancedPageContainerProps extends PageContainerProps {
  breadcrumb?: Array<{
    label: string;
    href?: string;
    icon?: React.ReactNode;
  }>;
  helpText?: string;
  loading?: boolean;
  error?: string | null;
}

export const EnhancedPageContainer: React.FC<EnhancedPageContainerProps> = ({
  // breadcrumb,
  helpText,
  loading,
  error,
  className,
  ...props
}) => {
  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return <PageError error={error} />;
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Help Text */}
      {helpText && (
        <div className="px-4 py-2 bg-muted/50 border-b">
          <p className="text-sm text-muted-foreground">{helpText}</p>
        </div>
      )}
      
      <PageContainer {...props} />
    </div>
  );
};

// Page Skeleton Component
export const PageSkeleton: React.FC = () => {
  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Title Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-64" />
      </div>
      
      {/* Action Bar Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="flex-1 space-y-4">
        {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((id) => (
          <Skeleton key={id} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
};

// Page Error Component
export const PageError: React.FC<{ error: string }> = ({ error }) => {
  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <div className="text-6xl">😞</div>
        <h2 className="text-2xl font-semibold">Oops, something went wrong</h2>
        <p className="text-muted-foreground max-w-md">
          {error}
        </p>
        <button 
          onClick={() => globalThis.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Reload
        </button>
      </div>
    </div>
  );
};
"use client";

import React from "react";
import { UnifiedLayout } from "@/shared/layout/app-layout";
import { consoleLayoutConfig } from "@/shared/layout/app-layout-config";

interface ConsoleLayoutProps {
  children: React.ReactNode;
  className?: string;
}

// TODO: Use UnifiedLayout instead of ConsoleLayout
export const ConsoleLayout: React.FC<ConsoleLayoutProps> = ({ 
  children, 
  className 
}) => {
  return (
    <UnifiedLayout config={consoleLayoutConfig} className={className}>
      {children}
    </UnifiedLayout>
  );
};

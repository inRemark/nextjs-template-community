"use client";

import React from "react";
import { UnifiedLayout } from "@/shared/layout/app-layout";
import { adminLayoutConfig } from "@/shared/layout/app-layout-config";

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

// TODO: Use UnifiedLayout instead of ConsoleLayout
export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  className 
}) => {
  return (
    <UnifiedLayout config={adminLayoutConfig} className={className}>
      {children}
    </UnifiedLayout>
  );
};

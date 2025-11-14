"use client";

import React from "react";
import { cn } from "@shared/utils";
import { TopHeader } from "./app-header";
import { HeaderConfig } from "./app-layout-config";

interface MainLayoutProps {
  children: React.ReactNode;
  onMenuToggle: () => void;
  showMenuButton: boolean;
  headerConfig?: HeaderConfig;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  onMenuToggle,
  showMenuButton,
  headerConfig,
  className
}) => {
  return (
    <div className={cn(
      "flex-1 min-w-0 flex flex-col",
      "bg-background",
      className
    )}>

      <TopHeader 
        onMenuToggle={onMenuToggle}
        showMenuButton={showMenuButton}
        headerConfig={headerConfig}
      />
      
      <div className={cn(
        "flex-1 min-h-0 overflow-y-auto"
      )}>
        {/* <div className="container mx-auto px-4 py-8 max-w-7xl"> */}
          {children}
        {/* </div> */}
      </div>
    </div>
  );
};
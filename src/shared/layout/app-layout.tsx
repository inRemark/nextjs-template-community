"use client";

import React, { useState, useCallback } from "react";
import { useBreakpoint } from "@shared/theme";
import { cn } from "@shared/utils";
import { TooltipProvider } from "@shared/ui/tooltip";
import { Sidebar } from "./app-sidebar";
import { MainLayout } from "./app-main-layout";
import { ConfigurableSidebarContent } from "@/shared/layout/app-sidebar-content";
import { LayoutConfig } from "./app-layout-config";

interface UnifiedLayoutProps {
  children: React.ReactNode;
  config: LayoutConfig;
  className?: string;
}

export const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({ 
  children, 
  config,
  className 
}) => {
  const { isMobile, isDesktop } = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleSidebarCollapse = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  }, []);

  let effectiveCollapsed: boolean;
  if (isDesktop) {
    effectiveCollapsed = sidebarOpen ? sidebarCollapsed : true;
  } else {
    effectiveCollapsed = false;
  }

  return (
    <TooltipProvider>
      <div className={cn("h-screen w-full flex overflow-hidden", config.className, className)}>
        {/* sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          collapsed={effectiveCollapsed}
          onToggle={handleSidebarToggle}
          // onCollapse={handleSidebarCollapse}
          isMobile={isMobile}
        >
          <ConfigurableSidebarContent
            collapsed={effectiveCollapsed}
            onCollapse={handleSidebarCollapse}
            isMobile={isMobile}
            config={config}
          />
        </Sidebar>
        
        {/* Main content area */}
        <MainLayout 
          onMenuToggle={handleSidebarToggle}
          showMenuButton={isMobile}
          headerConfig={config.headerConfig}
        >
          {children}
        </MainLayout>
      </div>
    </TooltipProvider>
  );
};

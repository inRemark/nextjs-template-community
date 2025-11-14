"use client";

import React from "react";
import { cn } from "@shared/utils";
import { NavigationMenu } from "./app-sidebar-navigation-menu";
import { UserSection } from "./app-sidebar-user-section";
import { LayoutConfig } from "./app-layout-config";

interface ConfigurableSidebarContentProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  isMobile: boolean;
  config: LayoutConfig;
  className?: string;
}

export const ConfigurableSidebarContent: React.FC<ConfigurableSidebarContentProps> = ({
  collapsed,
  onCollapse,
  isMobile,
  config,
  className
}) => {
  const { brand, menuConfig } = config;

  return (
    <div className={cn(
      "h-full flex flex-col",
      "bg-gradient-to-b from-background to-muted/20",
      className
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 border-b",
        "border-border/50",
        collapsed && !isMobile ? "justify-center px-2 py-4" : "p-4"
      )}>
        <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
          <brand.icon className="w-5 h-5 text-primary-foreground" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="flex-1 min-w-0">
            <h1 className={cn(
              "text-lg font-semibold",
              "text-foreground"
            )}>
              {brand.name}
            </h1>
            <p className={cn(
              "text-xs",
              "text-muted-foreground"
            )}>
              {brand.description}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto">
        <NavigationMenu 
          collapsed={collapsed && !isMobile} 
          menuConfig={menuConfig}
        />
      </div>


      {/* User Section */}
      <div className={cn(
        "border-t",
        "border-border/50"
      )}>
        <UserSection 
          collapsed={collapsed && !isMobile} 
          showCollapseButton={!isMobile}
          onCollapse={onCollapse}
        />
      </div>
    </div>
  );
};

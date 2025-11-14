"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@shared/utils";
import { MenuItem as MenuItemType } from "./console-menu-config";
import { Badge } from "@shared/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@shared/ui/tooltip";

interface MenuItemProps {
  item: MenuItemType;
  collapsed: boolean;
  isActive: boolean;
  className?: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  item,
  collapsed,
  isActive,
  className
}) => {
  const Icon = item.icon;

  const menuItemContent = (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-lg py-2 text-sm transition-all",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive && [
          "bg-primary text-primary-foreground",
          "hover:bg-primary/80 hover:text-primary-foreground"
        ],
        collapsed ? "justify-center px-2" : "px-3",
        className
      )}
    >
      {/* Icon */}
      <Icon className={cn(
        "h-4 w-4 flex-shrink-0",
        isActive 
          ? "text-primary-foreground" 
          : "text-muted-foreground group-hover:text-accent-foreground"
      )} />

      {/* Label and Badge */}
      {!collapsed && (
        <>
          <span className="flex-1 font-medium">
            {item.label}
          </span>
          
          {/* Badge */}
          {item.badge && (
            <Badge 
              variant={isActive ? "secondary" : "default"} 
              className={cn(
                "h-5 px-1.5 text-xs",
                isActive && "bg-primary-foreground/20 text-primary-foreground"
              )}
            >
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );

  // Tooltip
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {menuItemContent}
        </TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          <div className="space-y-1">
            <div>{item.label}</div>
            {item.description && (
              <div className="text-xs text-muted-foreground">
                {item.description}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return menuItemContent;
};
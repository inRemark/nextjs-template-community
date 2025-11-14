"use client";

import React from "react";
import { cn } from "@shared/utils";
import { MenuGroup as MenuGroupType } from "./console-menu-config";
import { MenuItem } from "./menu-item";
import { Separator } from "@shared/ui/separator";

interface MenuGroupProps {
  group: MenuGroupType;
  collapsed: boolean;
  currentPath: string;
  showSeparator?: boolean;
  className?: string;
}

export const MenuGroup: React.FC<MenuGroupProps> = ({
  group,
  collapsed,
  currentPath,
  showSeparator = false,
  className
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {/* Group Title */}
      {!collapsed && (
        <div className="px-1 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {group.title}
          </h3>
        </div>
      )}

      {/* Menu Item List */}
      <div className="space-y-1">
        {group.items.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            collapsed={collapsed}
            isActive={currentPath === item.href}
          />
        ))}
      </div>

      {/* Group Separator */}
      {showSeparator && !collapsed && (
        <div className="px-1 py-2">
          <Separator className="bg-border/50" />
        </div>
      )}
    </div>
  );
};
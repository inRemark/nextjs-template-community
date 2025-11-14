"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@shared/utils";
import { MenuGroup } from "./menu-group";
import { MenuConfig } from "./console-menu-config";

interface NavigationMenuProps {
  collapsed: boolean;
  menuConfig: MenuConfig;
  className?: string;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  collapsed,
  menuConfig,
  className
}) => {
  const pathname = usePathname();

  return (
    <nav className={cn(
      "flex-1 py-4 space-y-1",
      collapsed ? "px-2" : "px-4",
      className
    )}>
      {menuConfig.groups.map((group, groupIndex) => (
        <MenuGroup
          key={group.id}
          group={group}
          collapsed={collapsed}
          currentPath={pathname}
          showSeparator={groupIndex < menuConfig.groups.length - 1}
        />
      ))}
    </nav>
  );
};
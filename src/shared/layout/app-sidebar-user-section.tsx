"use client";

import React from "react";
import { cn } from "@shared/utils";
import { Button } from "@shared/ui/button";
import { 
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

interface UserSectionProps {
  collapsed: boolean;
  className?: string;
  showCollapseButton?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export const UserSection: React.FC<UserSectionProps> = ({
  collapsed,
  className,
  showCollapseButton = false,
  onCollapse
}) => {


  // Sidebar user actions
  const controlButtons = (
    <div className="space-y-3">
      
      {/* Collapse Button */}
      {showCollapseButton && onCollapse && (
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-9 h-9",
              "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              "transition-all duration-200"
            )}
            onClick={() => onCollapse(!collapsed)}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className={cn(
      "space-y-3",
      collapsed ? "px-2 py-3" : "px-4 py-3",
      className
    )}>
      {controlButtons}
    </div>
  );
};
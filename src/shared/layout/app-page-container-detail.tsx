import React from "react";
import { cn } from "@shared/utils";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { Search, Plus, Filter, Grid, List } from "lucide-react";
import { useBreakpoint } from "@shared/theme";

export interface PageContainerProps {
  // Page title
  title: string;
  
  // Page description
  description?: string;
  
  // Search related
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  
  // Action buttons
  actions?: React.ReactNode;
  
  // Primary action button
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
  };
  
  // Filters
  filters?: React.ReactNode;
  
  // View mode
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
  
  // Sidebar
  sidebar?: React.ReactNode;

  // Main content
  children: React.ReactNode;
  
  // Styles
  className?: string;
  
  // Whether to show the search bar
  showSearch?: boolean;
  
  // Whether to show the filters
  showFilters?: boolean;
  
  // Whether to show the view toggle
  showViewToggle?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  description,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  actions,
  primaryAction,
  filters,
  viewMode = "grid",
  onViewModeChange,
  sidebar,
  children,
  className,
  showSearch = true,
  showFilters = false,
  showViewToggle = false,
}) => {
  const { isMobile } = useBreakpoint();

  return (
    <div className={cn("h-full flex flex-col flex-grow-1", className)}>
      {/* Page head */}
      <div className="flex-none border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="p-4 lg:p-6">
          {/* Title area */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{title}</h1>
              {description && (
                <p className="text-sm lg:text-base text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            {/* Action buttons area */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
              {primaryAction && (
                <Button
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled}
                  className="gap-2"
                >
                  {primaryAction.icon || <Plus className="w-4 h-4" />}
                  {!isMobile && primaryAction.label}
                </Button>
              )}
            </div>
          </div>

          {/* Search and filter area */}
          <div className="flex items-center gap-3">
            {/* Search box */}
            {showSearch && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-9 h-9 bg-muted/20 border-border/50 focus:bg-background/60"
                />
              </div>
            )}

            {/* Filters */}
            {showFilters && (
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                {!isMobile && "Filters"}
              </Button>
            )}

            {/* View toggle */}
            {showViewToggle && onViewModeChange && (
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("list")}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Filters content */}
          {filters && (
            <div className="mt-4 pt-4 border-t">
              {filters}
            </div>
          )}
        </div>
      </div>

      {/* Page body */}
      <div className="flex-1 min-h-0 flex w-full">
        {/* Sidebar */}
        {sidebar && (
          <div className="w-80 flex-none border-r bg-muted/20">
            {sidebar}
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 min-w-0 w-full overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}; 
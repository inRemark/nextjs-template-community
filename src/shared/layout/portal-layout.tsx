"use client";
import React from "react";
import { PortalHeader } from "./portal-header";
import { PortalFooter } from "./portal-footer";
import { Breadcrumb, BreadcrumbItem } from "./breadcrumb";

interface PortalLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
  breadcrumbMaxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  showHero?: boolean;
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  '3xl': 'max-w-8xl',
  '4xl': 'max-w-[896px]',
  full: 'max-w-full'
};

// use GlobalSearch hook inside the layout content
const PortalLayoutContent: React.FC<PortalLayoutProps> = ({ 
  children, 
  title,
  description,
  breadcrumb,
  breadcrumbMaxWidth = '2xl',
  showHero = false,
  className = ""
}) => {
  const { isSearchOpen, closeSearch } = useGlobalSearch();

  return (
    <div className={`min-h-screen flex flex-col bg-background ${className}`}>
      <PortalHeader />
      <main className="flex-1 bg-background">
                {/* Breadcrumb area */}
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="bg-background">
            <div className={`${maxWidthClasses[breadcrumbMaxWidth]} mx-auto px-4 py-6`}>
              <Breadcrumb items={breadcrumb} />
            </div>
          </div>
        )}
        
        {/* Title/Description area */}
        {(title || description) && !showHero && (
          <div className="bg-gradient-to-b from-muted/20 to-background dark:from-muted/10 dark:to-background border-b">
            <div className="container mx-auto px-4 py-12 text-center">
              {title && (
                <h1 className="text-4xl font-bold text-foreground mb-4">{title}</h1>
              )}
              {description && (
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{description}</p>
              )}
            </div>
          </div>
        )}
        <div className="bg-background min-h-full">
          {children}
        </div>
      </main>
      <PortalFooter />
      
      <GlobalSearch isOpen={isSearchOpen} onClose={closeSearch} />
    </div>
  );
};

// Wrap the layout content with GlobalSearchProvider
export const PortalLayout: React.FC<PortalLayoutProps> = (props) => {
  return (
    <GlobalSearchProvider>
      <PortalLayoutContent {...props} />
    </GlobalSearchProvider>
  );
};
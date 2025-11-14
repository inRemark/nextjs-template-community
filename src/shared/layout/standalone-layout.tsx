"use client";

import React from "react";
import { SimpleHeader } from "./standalone-header";
import { SimpleFooter } from "./standalone-footer";

interface StandaloneLayoutProps {
  title?: string;
  description?: string;
  showBackToPortal?: boolean;
  showUserMenu?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const StandaloneLayout: React.FC<StandaloneLayoutProps> = ({ 
  title,
  description,
  showBackToPortal = true,
  showUserMenu = false,
  children, 
  className = "" 
}) => {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <SimpleHeader 
        showBackToPortal={showBackToPortal}
        showUserMenu={showUserMenu}
      />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {(title || description) && (
              <div className="mb-8">
                {title && (
                  <h1 className="text-3xl font-bold mb-2">{title}</h1>
                )}
                {description && (
                  <p className="text-lg text-muted-foreground">{description}</p>
                )}
              </div>
            )}
            {children}
          </div>
        </div>
      </main>
      <SimpleFooter />
    </div>
  );
};
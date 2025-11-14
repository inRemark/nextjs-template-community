"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@shared/ui/button";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  showBackToPortal?: boolean;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  showBackToPortal = true,
  children,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/20 via-background to-muted/10 dark:from-muted/10 dark:via-background dark:to-muted/5">
      {/* top navigation area */}
      <header className="w-full bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Brand logo */}
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">VSeek</span>
            </Link>

            {/* Back to home button */}
            {showBackToPortal && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to home</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Auth card container */}
          <div className="bg-background rounded-xl shadow-lg border p-8">
            {/* Title area */}
            <div className="text-center mb-8">
              {/* Brand logo */}
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-primary/10 to-chart-1/10 rounded-full p-3 border border-primary/20">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
              {subtitle && (
                <p className="text-muted-foreground text-sm">{subtitle}</p>
              )}
            </div>

            {/* Form content */}
            {children}
          </div>
        </div>
      </main>

      {/* Footer area */}
      <footer className="w-full bg-background/50 border-t">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 VSeek. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@shared/ui/button";
import { Sparkles } from "lucide-react";
import { UserMenuDropdown } from "./standalone-user-menu-dropdown";

interface SimpleHeaderProps {
  showBackToPortal?: boolean;
  showUserMenu?: boolean;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  showBackToPortal = true,
  showUserMenu = false
}) => {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold">VSeek</span>
          </Link>
          
          {/* Navigation Actions */}
          <div className="flex items-center gap-4">
            {showBackToPortal && (
              <Button variant="ghost" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            )}
            
            {showUserMenu ? (
              <UserMenuDropdown />
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/console">Go to Console</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
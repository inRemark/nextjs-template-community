"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@shared/ui/button";
import { LogOut, User, Settings, ShoppingBag } from "lucide-react";
import { useAuth } from '@features/auth/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/dropdown-menu";

interface PortalHeaderAuthProps {
  headerTranslations: Record<string, string>;
  navTranslations?: Record<string, string>;
  isMobile?: boolean;
}

export const PortalHeaderAuth: React.FC<PortalHeaderAuthProps> = ({ 
  headerTranslations,
  navTranslations = {},
  isMobile = false 
}) => {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return isMobile ? (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300"></div>
      </div>
    ) : (
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300"></div>
    );
  }

  if (user) {
    if (isMobile) {
      return (
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/profile?tab=profile">
              <User className="w-4 h-4 mr-2" />
              {headerTranslations["profile"] || "Profile"}
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/profile?tab=settings">
              <Settings className="w-4 h-4 mr-2" />
              {headerTranslations["settings"] || "Settings"}
            </Link>
          </Button>
          <div className="border-t pt-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-600"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {headerTranslations["logout"] || "Logout"}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <User className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <Link href="/profile?tab=activity">
              {headerTranslations["profile"] || "Profile"}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <ShoppingBag className="mr-2 h-4 w-4" />
            <Link href="/profile?tab=orders">
              {headerTranslations["orders"] || "Orders"}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <Link href="/profile?tab=profile">
              {headerTranslations["settings"] || "Settings"}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 cursor-pointer"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {headerTranslations["logout"] || "Logout"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return isMobile ? (
    <Button variant="ghost" className="w-full justify-start" asChild>
      <Link href="/auth/login">
        {navTranslations["login"] || headerTranslations["login"] || "Login"}
      </Link>
    </Button>
  ) : (
    <>
      <Button variant="ghost" asChild>
        <Link href="/auth/login">
          {headerTranslations["login"] || "Login"}
        </Link>
      </Button>
    </>
  );
};

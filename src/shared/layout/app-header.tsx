"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@shared/utils";
import { Button } from "@shared/ui/button";
import { Menu, Bell, Settings, User, HelpCircle, LogOut } from "lucide-react";
import { Breadcrumb } from "./breadcrumb";
import { HeaderConfig } from "./app-layout-config";
import { ThemeToggle } from "@shared/theme/theme-toggle";
import { useAuth } from '@features/auth/hooks/use-auth';
import { logger } from '@logger';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@shared/ui/dropdown-menu";

interface TopHeaderProps {
  onMenuToggle: () => void;
  showMenuButton: boolean;
  headerConfig?: HeaderConfig;
  className?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onMenuToggle,
  showMenuButton,
  headerConfig,
  className
}) => {
  const { logout } = useAuth();
  const notificationsPath = headerConfig?.notificationsPath || '/console/notifications';
  const profilePath = headerConfig?.profilePath || '/console/profile';
  const settingsPath = headerConfig?.settingsPath || '/console/settings';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      logger.error('Logout failed:', error);
    }
  };
  return (
    <header className={cn(
      "h-14 flex-shrink-0 flex items-center gap-4 px-4",
      "border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
      className
    )}>
      {/* menu button (mobile) */}
      {showMenuButton && (
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 shrink-0"
          onClick={onMenuToggle}
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      {/* Breadcrumb  */}
      <div className="flex-1 min-w-0">
        <Breadcrumb />
      </div>

      {/* Action area */}
      <div className="flex items-center gap-2 shrink-0">
        
        {/* <PointsDisplay /> */}

        <ThemeToggle />

        {/* Notification button */}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-muted-foreground hover:text-foreground relative"
          asChild
        >
          <Link href={notificationsPath}>
            <Bell className="w-4 h-4" />
            {/* 通知点 */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </Link>
        </Button>

        {/* 设置下拉菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <Link href={profilePath}>个人资料</Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <Link href={settingsPath}>设置</Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <Link href="/help">帮助</Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
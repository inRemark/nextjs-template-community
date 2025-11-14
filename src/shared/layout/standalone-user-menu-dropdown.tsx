"use client";
import { logger } from '@logger';
import React from "react";
import Link from "next/link";
import { Button } from "@shared/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@shared/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@shared/ui/avatar";
import { 
  User, 
  Settings, 
  HelpCircle, 
  Bell, 
  LogOut,
  ChevronDown
} from "lucide-react";

const mockUser = {
  name: "userName",
  email: "userName@example.com",
  avatar: "",
  initials: "userName"
};

const userMenuItems = [
  {
    label: "Profile",
    href: "/profile",
    icon: User
  },
  {
    label: "Settings",
    href: "/profile/settings",
    icon: Settings
  },
  {
    label: "Notifications",
    href: "/console/notifications", 
    icon: Bell
  },
  {
    label: "Help",
    href: "/help",
    icon: HelpCircle
  }
];

export const UserMenuDropdown: React.FC = () => {
  const handleLogout = () => {
    logger.info("Logout");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
            <AvatarFallback className="text-xs">
              {mockUser.initials.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline">{mockUser.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-3 p-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
            <AvatarFallback>{mockUser.initials.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">{mockUser.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {mockUser.email}
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {userMenuItems.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href} className="flex items-center">
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
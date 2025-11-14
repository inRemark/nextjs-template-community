"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@shared/utils";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// route to breadcrumb mapping
const routeMap: Record<string, BreadcrumbItem[]> = {
  "/": [], // Portal page does not show breadcrumb
  "/pricing": [], // Standalone page does not show breadcrumb
  "/about": [],
  "/help": [],
  "/blog": [],
  
  "/admin/mail/history": [
    { label: "管理后台", href: "/admin" },
    { label: "邮件管理", href: "/admin/mail" },
    { label: "发送历史", href: "/admin/mail/history" }
  ],
  "/admin/mail/test": [
    { label: "管理后台", href: "/admin" },
    { label: "邮件管理", href: "/admin/mail" },
    { label: "测试发送", href: "/admin/mail/test" }
  ],
  "/admin/mail/queue": [
    { label: "管理后台", href: "/admin" },
    { label: "邮件管理", href: "/admin/mail" },
    { label: "队列进度", href: "/admin/mail/queue" }
  ],
  
  // 用户功能页面
  "/profile": [
    { label: "控制台", href: "/console" },
    { label: "个人资料", href: "/profile" }
  ],
  "/profile/settings": [
    { label: "控制台", href: "/console" },
    { label: "个人资料", href: "/profile" },
    { label: "个人设置", href: "/profile/settings" }
  ],
  "/console/notifications": [
    { label: "控制台", href: "/console" },
    { label: "通知中心", href: "/console/notifications" }
  ]
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items: propItems,
  className
}) => {
  const pathname = usePathname();

  // Use the passed items or get from route map
  const items = propItems || routeMap[pathname] || [
    { label: "首页", href: "/", icon: <Home className="w-4 h-4" /> }
  ];

  if (items.length === 0) return null;

  return (
    <nav className={cn("flex items-center space-x-1 text-sm", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const key = item.href || item.label || index;

        return (
          <React.Fragment key={key}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.icon}
                {item.label}
              </Link>
            ) : (
              <span className={cn(
                "flex items-center gap-1",
                isLast ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {item.icon}
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
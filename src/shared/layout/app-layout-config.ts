import { LucideIcon, Settings, Search } from "lucide-react";
import { consoleMenuConfig } from "./console-menu-config";
import { adminMenuConfig } from "./admin-menu-config";

export interface LayoutBrand {
  name: string;
  icon: LucideIcon;
  description: string;
  href?: string;
}

export interface LayoutHeader {
  showTitle?: boolean;
  showBreadcrumb?: boolean;
  customActions?: React.ReactNode;
}

export interface HeaderConfig {
  notificationsPath: string;
  profilePath: string;
  settingsPath: string;
}

export interface LayoutConfig {
  brand: LayoutBrand;
  menuConfig: typeof consoleMenuConfig;
  header?: LayoutHeader;
  headerConfig?: HeaderConfig;
  className?: string;
}

// console layout 配置
export const consoleLayoutConfig: LayoutConfig = {
  brand: {
    name: "VSeek",
    icon: Search,
    description: "App Console",
    href: "/console"
  },
  menuConfig: consoleMenuConfig,
  header: {
    showTitle: true,
    showBreadcrumb: true
  },
  headerConfig: {
    notificationsPath: '/console/notifications',
    profilePath: '/console/profile',
    settingsPath: '/console/settings'
  }
};

// Admin layout config
export const adminLayoutConfig: LayoutConfig = {
  brand: {
    name: "VSeek",
    icon: Settings,
    description: "Admin Console",
    href: "/admin"
  },
  menuConfig: adminMenuConfig,
  header: {
    showTitle: true,
    showBreadcrumb: false
  },
  headerConfig: {
    notificationsPath: '/admin/notifications',
    profilePath: '/admin/profile',
    settingsPath: '/admin/settings'
  },
  className: ""
};


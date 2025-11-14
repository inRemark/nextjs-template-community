import {
  Home,
  Gift,
  Users,
  FileText,
  LucideIcon
} from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string;
  description?: string;
  children?: MenuItem[];
}

export interface MenuGroup {
  id: string;
  title: string;
  items: MenuItem[];
}

export interface MenuConfig {
  groups: MenuGroup[];
}

export const consoleMenuConfig: MenuConfig = {
  groups: [
    {
      id: "overview",
      title: "概览",
      items: [
        {
          id: "dashboard-overview",
          label: "控制台概览",
          icon: Home,
          href: "/console",
          description: "个人数据概览"
        }
      ]
    },
    {
      id: "dashboard",
      title: "内容管理",
      items: [
        {
          id: "articles",
          label: "我的文章",
          icon: FileText,
          href: "/console/articles",
          description: "查看和管理文章"
        }
      ]
    },
    {
      id: "referral",
      title: "推荐奖励",
      items: [
        {
          id: "referral-center",
          label: "推荐中心",
          icon: Users,
          href: "/console/referral",
          description: "邀请好友获得奖励"
        },
        {
          id: "points",
          label: "我的积分",
          icon: Gift,
          href: "/console/points",
          description: "积分余额和交易记录"
        }
      ]
    }
  ]
};
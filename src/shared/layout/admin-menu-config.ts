import { 
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  Mail,
  Send,
  Clock,
  Inbox,
  ShoppingCart,
  CreditCard,
  Package,
  TrendingUp,
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

export const adminMenuConfig: MenuConfig = {
  groups: [
    {
      id: "overview",
      title: "概览",
      items: [
        {
          id: "admin-dashboard",
          label: "仪表板",
          icon: LayoutDashboard,
          href: "/admin",
          description: "管理后台概览"
        }
      ]
    },
    {
      id: "content-management",
      title: "内容管理",
      items: [
        {
          id: "articles",
          label: "文章管理",
          icon: FileText,
          href: "/admin/articles",
          description: "管理文章内容"
        }
      ]
    },
    {
      id: "order-payment",
      title: "订单与支付",
      items: [
        {
          id: "orders",
          label: "订单管理",
          icon: ShoppingCart,
          href: "/admin/orders",
          description: "查看和管理所有订单"
        },
        {
          id: "payments",
          label: "支付管理",
          icon: CreditCard,
          href: "/admin/payments",
          description: "查看支付记录和退款"
        },
        {
          id: "invoices",
          label: "发票管理",
          icon: FileText,
          href: "/admin/invoices",
          description: "发票列表与详情"
        },
        {
          id: "products",
          label: "产品管理",
          icon: Package,
          href: "/admin/products",
          description: "管理产品和价格配置"
        }
      ]
    },
    {
      id: "data-management",
      title: "数据管理",
      items: [
        {
          id: "user-management",
          label: "用户管理",
          icon: Users,
          href: "/admin/users",
          description: "管理用户账户和角色"
        },
        {
          id: "referral-monitoring",
          label: "用户推荐",
          icon: Users,
          href: "/admin/referral",
          description: "推荐系统数据监控"
        },
        {
          id: "analytics-revenue",
          label: "收入分析",
          icon: TrendingUp,
          href: "/admin/analytics/revenue",
          description: "按时间维度查看收入"
        },
        {
          id: "analytics-products",
          label: "产品分析",
          icon: Package,
          href: "/admin/analytics/products",
          description: "产品销量与销售额"
        },
        {
          id: "analytics-reports",
          label: "财务报表",
          icon: FileText,
          href: "/admin/analytics/reports",
          description: "订单与退款统计"
        }
      ]
    },
    {
      id: "mail-management",
      title: "邮件管理",
      items: [
        {
          id: "mail-history",
          label: "发送历史",
          icon: Mail,
          href: "/admin/mail/history",
          description: "查看邮件发送历史记录"
        },
        {
          id: "mail-test",
          label: "测试发送",
          icon: Send,
          href: "/admin/mail/test",
          description: "测试邮件发送功能"
        },
        {
          id: "mail-queue",
          label: "队列进度",
          icon: Clock,
          href: "/admin/mail/queue",
          description: "邮件队列状态和进度"
        }
      ]
    },
    {
      id: "system-management",
      title: "系统管理",
      items: [
        {
          id: "system-settings",
          label: "系统设置",
          icon: Settings,
          href: "/admin/settings",
          description: "系统配置管理"
        },
        {
          id: "system-logs",
          label: "系统日志",
          icon: Inbox,
          href: "/admin/sys-logs",
          description: "支付回调/API/错误日志"
        }
      ]
    },
  ]
};

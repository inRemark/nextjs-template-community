# Help Module

帮助中心功能模块，提供帮助文档、常见问题、快速操作等功能。

## 📁 目录结构

```
help/
├── types/          # 类型定义
│   └── help.ts     # 帮助中心相关类型
└── index.ts        # 模块导出
```

## 🎯 功能说明

### 类型定义

- `HelpCategory` - 帮助分类
- `HelpArticle` - 帮助文章
- `HelpSearchResult` - 搜索结果
- `QuickAction` - 快速操作
- `PopularArticle` - 热门文章
- `HelpStats` - 统计信息
- `ContactSupport` - 联系支持
- `HelpPageData` - 页面数据

## 📝 使用示例

### 导入类型

```typescript
import { HelpPageData, HelpArticle } from '@/features/help';

const helpData: HelpPageData = {
  categories: [],
  popularArticles: [],
  quickActions: [],
  recentArticles: [],
  stats: {
    totalArticles: 0,
    totalViews: 0,
    averageRating: 0,
    popularTopics: [],
    recentUpdates: []
  },
  contactSupport: {
    channels: [],
    businessHours: '',
    responseTime: '',
    languages: []
  }
};
```

## 🔗 相关页面

- `/app/help/page.tsx` - 帮助中心首页
- `/app/api/help/route.ts` - 帮助中心 API

## 📌 注意事项

1. 当前使用模拟数据，生产环境需要对接真实 API
2. 支持文章搜索、分类浏览、热门文章等功能
3. 可扩展支持视频教程、相关文章推荐等高级功能

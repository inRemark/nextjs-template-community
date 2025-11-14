# 验证器迁移指南

## 📋 迁移概述

验证器文件已按照新的组织架构进行了重新组织，从 `lib/validators/` 迁移到各功能模块的 `validators/` 目录下。

## 🗂️ 新的文件结构

```
src/
├── lib/
│   └── validators/           # 共享验证器
│       ├── base.ts          # 基础验证模式和通用函数
│       ├── index.ts         # 统一导出
│       └── MIGRATION_GUIDE.md
├── features/
│   ├── admin/
│   │   └── validators/      # 管理后台验证器
│   │       ├── problems.ts
│   │       ├── solutions.ts
│   │       ├── reviews.ts
│   │       └── index.ts
│   ├── auth/
│   │   └── validators/      # 认证验证器
│   │       ├── auth.ts
│   │       └── index.ts
│   ├── problems/
│   │   └── validators/      # 问题验证器
│   │       ├── problems.ts
│   │       └── index.ts
│   ├── solutions/
│   │   └── validators/      # 解决方案验证器
│   │       ├── solutions.ts
│   │       └── index.ts
│   ├── reviews/
│   │   └── validators/      # 评价验证器
│   │       ├── reviews.ts
│   │       └── index.ts
│   └── comparisons/
│       └── validators/      # 对比验证器
│           ├── comparisons.ts
│           └── index.ts
```

## 🔄 迁移映射

### 旧文件 → 新文件

| 旧文件 | 新文件 | 说明 |
|--------|--------|------|
| `lib/validators/admin.ts` | `features/admin/validators/` | 管理后台相关验证器 |
| `lib/validators/auth.validator.ts` | `features/auth/validators/auth.ts` | 认证相关验证器 |
| `lib/validators/enhanced.ts` | `lib/validators/base.ts` | 基础验证模式 |

### 导入路径更新

| 旧导入 | 新导入 |
|--------|--------|
| `@/lib/validators/admin` | `@/features/admin/validators` |
| `@/lib/validators/auth.validator` | `@/features/auth/validators` |
| `@/lib/validators/enhanced` | `@/lib/validators/base` |

## 📝 使用示例

### 管理后台验证器

```typescript
// 导入问题验证器
import { problemSchema, type ProblemFormData } from '@/features/admin/validators';

// 导入解决方案验证器
import { solutionSchema, type SolutionFormData } from '@/features/admin/validators';

// 导入评价验证器
import { reviewModerationSchema } from '@/features/admin/validators';
```

### 认证验证器

```typescript
// 导入认证验证器
import { 
  registerSchema, 
  loginSchema, 
  validateLoginRequest,
  validateRegisterRequest 
} from '@/features/auth/validators';
```

### 共享验证器

```typescript
// 导入基础验证模式
import { baseSchemas, validationHelpers } from '@/lib/validators';

// 使用基础验证模式
const mySchema = z.object({
  title: baseSchemas.text,
  description: baseSchemas.optionalText,
  email: baseSchemas.email,
});
```

## ✅ 迁移完成状态

- [x] 创建新的验证器文件结构
- [x] 迁移管理后台验证器
- [x] 迁移认证验证器
- [x] 重构增强验证器为共享验证器
- [x] 更新所有导入引用
- [x] 删除旧文件
- [x] 修复语法错误

## 🎯 优势

1. **模块化**：每个功能模块有自己的验证器
2. **可维护性**：验证逻辑与功能模块紧密耦合
3. **可复用性**：共享验证器供各模块使用
4. **类型安全**：完整的TypeScript类型支持
5. **一致性**：统一的验证模式和错误消息

## 🔧 后续工作

1. 根据实际使用情况调整验证规则
2. 添加更多功能模块的验证器
3. 完善错误消息的国际化
4. 添加验证器的单元测试

# 认证与授权系统

## 概述

本认证与授权系统为VSeek应用提供用户注册、登录、JWT Token管理和基于角色的访问控制(RBAC)功能。

## 功能特性

1. 用户注册与登录
2. JWT Token生成与验证
3. Token刷新机制
4. 用户会话管理
5. 基于角色的访问控制(RBAC)
6. 密码加密与验证
7. 输入验证
8. 权限检查中间件
9. React自定义Hook
10. 客户端组件保护

## 目录结构

```
src/lib/auth/
├── auth.service.ts       # 核心认证服务
├── auth.middleware.ts    # 认证中间件
├── auth.types.ts        # 类型定义
├── auth.error.ts        # 错误处理
├── auth.hooks.ts        # React自定义Hook
├── auth.validator.ts    # 输入验证
├── auth.utils.ts        # 工具函数
├── rbac.service.ts      # RBAC服务
└── README.md            # 说明文档
```

## API接口

### 认证接口

1. `POST /api/auth` - 用户注册
2. `PUT /api/auth` - 用户登录
3. `POST /api/auth/refresh` - 刷新Token
4. `POST /api/auth/logout` - 用户登出
5. `POST /api/auth/logout-all` - 登出所有设备
6. `GET /api/auth/me` - 获取当前用户信息
7. `PATCH /api/auth/me` - 更新当前用户信息

### 用户管理接口（仅管理员）

1. `GET /api/users` - 获取用户列表
2. `PATCH /api/users` - 更新用户角色

## 使用说明

### 客户端使用

1. 使用`authAPI`对象调用认证相关API
2. 使用`useAuth` Hook管理认证状态
3. 使用`<ProtectedRoute>`组件保护需要认证的页面
4. 使用`<RoleGuard>`组件保护需要特定角色的页面
5. 使用`<PermissionGuard>`组件保护需要特定权限的页面
6. 使用`usePermission` Hook检查用户权限
7. 使用`withAuth`高阶组件包装需要认证的页面

### 服务端使用

1. 在API路由中使用`authMiddleware`进行认证检查
2. 使用`requireRole`中间件进行角色检查
3. 使用`adminMiddleware`进行管理员权限检查
4. 使用`requirePermission`中间件进行权限检查
5. 使用`hasPermission`函数检查用户权限
6. 使用`checkPermission`函数验证用户权限

## 环境变量

```
JWT_ACCESS_SECRET=your_access_token_secret_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

## RBAC权限模型

系统定义了两种用户角色：

1. **USER（普通用户）**:
   - 客户管理：读取、写入
   - 模板管理：读取、写入
   - 邮件管理：读取、写入
   - 报告查看：读取

2. **ADMIN（管理员）**:
   - 拥有普通用户的所有权限
   - 用户管理：读取、写入、删除
   - 系统设置：读取、写入
   - 报告管理：读取、写入

权限检查可以在API路由和服务层进行，确保用户只能访问其角色允许的资源。

## 测试

运行测试：
```bash
npm test auth.service.test.ts
```
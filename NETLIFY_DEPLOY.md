# NBA News Hub - Netlify 部署指南

## 部署前准备

### 1. 账户准备
- 注册 [Netlify](https://www.netlify.com) 账户
- 注册 [GitHub](https://github.com) 账户（推荐）

### 2. 项目结构检查
确保项目包含以下文件：
- `netlify.toml` - Netlify配置文件
- `functions/` - Netlify Functions目录
- `public/` - 静态文件目录
- `package.json` - 项目配置

## 部署方法

### 方法一：Git集成部署（推荐）

1. **上传到GitHub**
   ```bash
   # 在项目目录下初始化Git
   git init
   git add .
   git commit -m "Initial commit for Netlify deployment"
   
   # 创建GitHub仓库并推送
   git remote add origin https://github.com/你的用户名/nba-news-scraper.git
   git branch -M main
   git push -u origin main
   ```

2. **连接Netlify**
   - 登录Netlify控制台
   - 点击 "New site from Git"
   - 选择GitHub，授权访问
   - 选择nba-news-scraper仓库
   - 配置构建设置：
     - Build command: `npm run build`
     - Publish directory: `public`
     - Functions directory: `functions`

3. **部署设置**
   - 点击 "Deploy site"
   - 等待部署完成（通常1-3分钟）

### 方法二：手动部署

1. **准备部署包**
   - 打包项目文件（排除node_modules）
   - 确保包含所有必要文件

2. **上传到Netlify**
   - 登录Netlify控制台
   - 拖拽项目文件夹到部署区域
   - 等待部署完成

## 配置说明

### netlify.toml 配置文件
```toml
[build]
  publish = "public"          # 静态文件目录
  functions = "functions"     # Functions目录

[functions]
  node_bundler = "esbuild"   # Node.js打包器

[[redirects]]
  from = "/api/*"            # API路由重定向
  to = "/.netlify/functions/:splat"
  status = 200

[dev]
  framework = "#static"      # 开发环境配置
  port = 3000
```

### API端点映射
- `/api/news` → `/.netlify/functions/news`
- `/api/refresh` → `/.netlify/functions/refresh`

## 环境变量（可选）

如果需要配置环境变量：
1. 在Netlify控制台进入项目设置
2. 点击 "Environment variables"
3. 添加所需变量

## 自定义域名（可选）

1. 在Netlify控制台选择 "Domain settings"
2. 点击 "Add custom domain"
3. 输入你的域名
4. 配置DNS设置

## 故障排除

### 常见问题

1. **Functions无法访问**
   - 检查`netlify.toml`配置
   - 确认`functions`目录存在
   - 查看部署日志

2. **API调用失败**
   - 检查CORS设置
   - 验证外部API可访问性
   - 查看Function日志

3. **静态文件404**
   - 确认`public`目录配置
   - 检查文件路径

### 查看日志
- Netlify控制台 → Site overview → Functions → 查看日志
- 部署页面 → Deploy log

## 性能优化

### 1. 缓存设置
在`netlify.toml`中添加：
```toml
[[headers]]
  for = "/api/*"
  [headers.values]
    Cache-Control = "public, max-age=300"  # 5分钟缓存
```

### 2. 函数优化
- 减少依赖包大小
- 使用缓存机制
- 优化API调用频率

## 监控和维护

### 1. 性能监控
- Netlify Analytics（付费功能）
- 自定义性能监控

### 2. 错误监控
- 查看Function日志
- 设置错误通知

### 3. 更新部署
- Git推送自动触发部署
- 手动重新部署

## 成本说明

### 免费额度
- 每月100GB带宽
- 每月125,000次Function调用
- 每月300分钟构建时间

### 付费升级
- Pro: $19/月
- Business: $99/月

## 支持和帮助

- [Netlify文档](https://docs.netlify.com/)
- [Netlify社区论坛](https://community.netlify.com/)
- [GitHub Issues](https://github.com/你的用户名/nba-news-scraper/issues) 
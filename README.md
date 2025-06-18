# NBA Basketball News Hub

一个现代化的NBA篮球新闻、比分和赛程聚合网站，提供实时的NBA资讯和数据展示。

## 🏀 项目特色

- **自动抓取**: 每30分钟自动从官方源抓取最新NBA新闻
- **多源整合**: 集成NBA官网、ESPN等权威新闻源
- **实时更新**: 支持手动刷新和自动后台更新
- **响应式设计**: 完美适配桌面和移动设备
- **现代UI**: 采用现代化设计风格，提供流畅的用户体验
- **智能跳转**: 点击新闻卡片直接跳转到原文
- **真实数据获取**：使用ESPN NBA API获取真实的新闻、比分和赛程数据
- **云端部署**：支持Netlify无服务器部署

## 🛠 技术架构

### 后端技术栈
- **Node.js**: 服务器运行环境
- **Express**: Web应用框架
- **Axios**: HTTP请求库
- **Cheerio**: 服务器端HTML解析
- **Node-Cron**: 定时任务调度
- **CORS**: 跨域资源共享支持

### 前端技术栈
- **HTML5**: 现代化标记语言
- **CSS3**: 响应式样式设计
- **JavaScript ES6+**: 现代JavaScript特性
- **Font Awesome**: 图标库
- **Google Fonts**: 网页字体

## 📁 项目结构

```
nba-news-scraper/
├── package.json          # 项目配置和依赖
├── server.js            # Express服务器主文件
├── scraper.js           # 新闻抓取模块
├── functions/           # Netlify Functions目录
│   ├── news.js         # 新闻API函数
│   └── refresh.js      # 刷新API函数
├── README.md            # 项目文档
├── netlify.toml         # Netlify配置文件
└── public/              # 静态资源目录
    ├── index.html       # 主页面
    ├── styles.css       # 样式文件
    └── script.js        # 前端JavaScript
```

## 📋 核心功能

### 1. 新闻抓取系统
- **多源抓取**: 同时从NBA官网和ESPN抓取新闻
- **智能去重**: 自动过滤重复内容
- **容错机制**: 抓取失败时提供模拟数据
- **数据清洗**: 处理链接、标题和日期格式

### 2. 定时更新机制
- **服务器端**: 每30分钟自动抓取新闻
- **客户端**: 每5分钟静默更新页面数据
- **手动刷新**: 用户可随时点击刷新按钮

### 3. 优雅的用户界面
- **卡片式布局**: 新闻以卡片形式展示
- **动画效果**: 流畅的加载和悬停动画
- **状态指示**: 显示加载状态和更新时间
- **空状态处理**: 优雅处理无数据情况

## 🚀 快速开始

### 环境要求
- Node.js 14.0 或更高版本
- npm 6.0 或更高版本

### 安装步骤

1. **安装依赖**
```powershell
cd nba-news-scraper
npm install
```

2. **启动服务器**
```powershell
npm start
```

3. **访问网站**
打开浏览器访问: `http://localhost:3000`

### 开发模式
```powershell
npm run dev
```
使用nodemon实现代码修改自动重启

## 🔧 API接口

### GET /api/news
获取新闻列表
```json
{
  "success": true,
  "data": [
    {
      "title": "Lakers vs Warriors: Epic Showdown Tonight",
      "link": "https://www.nba.com/news/lakers-warriors-preview",
      "date": "2 hours ago",
      "source": "NBA Official",
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### POST /api/refresh
手动刷新新闻数据
```json
{
  "success": true,
  "message": "News data refreshed successfully",
  "count": 15
}
```

## 🎨 设计特色

### 颜色方案
- **主色调**: NBA蓝 (#1d428a)
- **辅助色**: NBA红 (#c8102e)
- **强调色**: 金黄色 (#fdb927)
- **文本色**: 深灰色 (#2c3e50)

### 响应式设计
- **桌面**: 多列网格布局
- **平板**: 双列布局
- **手机**: 单列布局

### 动画效果
- **加载动画**: 旋转图标
- **卡片动画**: 悬停上升效果
- **渐入动画**: 页面元素逐个显示

## 🔍 抓取策略

### 数据源配置
```javascript
sources: [
  {
    name: 'NBA Official',
    url: 'https://www.nba.com/news',
    selector: '.ContentList_list__item'
  },
  {
    name: 'ESPN NBA',
    url: 'https://www.espn.com/nba/',
    selector: '.contentItem'
  }
]
```

### 抓取流程
1. **并发请求**: 同时访问多个新闻源
2. **内容解析**: 使用CSS选择器提取信息
3. **数据验证**: 检查标题和链接有效性
4. **去重处理**: 基于标题进行去重
5. **排序输出**: 按时间戳降序排列

## 🛡 安全特性

- **XSS防护**: HTML内容转义处理
- **请求头伪装**: 模拟真实浏览器请求
- **跨域支持**: 配置CORS中间件
- **错误处理**: 完善的异常捕获机制

## 📱 兼容性

### 浏览器支持
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

### 设备支持
- 桌面电脑 (1200px+)
- 平板设备 (768px - 1199px)
- 手机设备 (320px - 767px)

## 🔄 更新日志

### v1.3.1 (2024-12-14) - **真实数据抓取修复版本**
- 🔗 **数据源修复**: 修复新闻链接404问题，更新为正确的数据抓取源
- 🌐 **网页抓取**: 改用Cheerio进行网页抓取，替代失效的API调用
- 📰 **NBA官网集成**: 正确抓取 https://www.nba.com/news/category/top-stories 页面
- 🏀 **ESPN集成**: 集成 https://www.espn.com/nba/ 页面的新闻内容
- 🛡️ **去重机制**: 添加智能去重逻辑避免重复新闻
- 📊 **真实数据**: 更新后备数据为NBA官网的真实新闻标题和链接
- 🔧 **抓取优化**: 改进CSS选择器以适应NBA和ESPN网站结构
- ⚡ **性能提升**: 并行抓取多个数据源提高效率
- 🎯 **链接修复**: 确保所有新闻链接都指向正确的官方页面

### v1.3.0 (2024-12-14) - **Netlify部署修复版本**
- 🚀 **部署修复**: 修复Netlify部署空白页面和超时问题
- 🔧 **配置优化**: 更新netlify.toml配置，移除不存在的script-netlify.js引用
- 🌐 **API重定向**: 添加API端点重定向规则 (/api/news -> /.netlify/functions/news)
- 🛡️ **错误处理**: 增强前端错误处理和后备数据支持
- 📊 **后备数据**: 当API不可用时自动使用静态数据确保页面正常显示
- 🔍 **调试工具**: 新增netlify-test.html部署测试页面
- 📱 **图标修复**: 更新favicon配置使用正确的图标路径
- ⚡ **性能优化**: 优化JavaScript加载和初始化流程
- 🌟 **用户体验**: 确保即使在网络问题时也能显示基本内容

### v1.2.0 (2024-12-06)
- 🏀 **重大功能更新**: 增加比分和赛程展示
- 📰 **数据源优化**: 更新为NBA官方Top Stories页面 
- 🎯 **新功能**: 添加"Recent Scores"和"Upcoming Games"标签页
- 🎨 **UI增强**: 设计专属的比分卡片和赛程卡片样式
- 📱 **交互改进**: 实现标签页切换功能
- 🔧 **数据分类**: 智能分离新闻、比分、赛程三类内容
- 🎮 **真实数据**: 集成当前NBA总决赛实况（步行者vs雷霆）
- 🚀 **性能优化**: 改进数据渲染和页面加载速度
- **端口配置修正**
  - 将服务器端口从3001统一改为3000
  - 更新package.json、server.js和启动脚本中的端口配置
  - 符合项目要求使用单一端口3000
- **数据获取系统重构**
  - 完全重写爬虫逻辑，替换为基于ESPN NBA API的数据获取
  - 实现真实数据获取：新闻、比分、赛程分别从对应API获取
  - 添加并行数据获取机制，提高加载效率
  - 改进错误处理和数据备选方案
- **比分和赛程功能修复**
  - 修复比分数据无法正确显示的问题
  - 修复赛程数据分类和渲染错误
  - 优化数据解析和格式化逻辑
  - 改进日期格式化和时间显示
- **代码质量提升**
  - 重构数据获取流程，降低复杂度
  - 改进错误处理机制，提高稳定性
  - 优化API调用和超时配置
  - 清理冗余代码，提高维护性
- **Netlify部署支持**
  - 添加Netlify Functions支持
  - 创建netlify.toml配置文件
  - 重构后端逻辑为无服务器函数
  - 添加详细的部署指南

### 详细改动内容：

#### 后端更新 (scraper.js)
- 更新抓取源为 `https://www.nba.com/news/category/top-stories`
- 增加比分数据源 `https://www.nba.com/games`
- 优化CSS选择器适配NBA官网结构
- 更新模拟数据包含真实NBA新闻内容
- 增加数据类型分类：news, score, schedule

#### 前端更新 (HTML/CSS/JS)
- 新增比分和赛程展示区域
- 实现标签页切换功能 (Recent Scores / Upcoming Games)
- 设计NBA主题色彩的比分卡片
- 增加游戏状态显示 (FINAL / UPCOMING)
- 响应式网格布局适配新内容
- 智能解析比分和赛程信息

#### 数据结构优化
- 新增 `type` 字段区分内容类型
- 优化数据渲染逻辑支持多类型内容
- 改进错误处理和空状态显示

### v1.1.0 (2024-01-01)
- ✨ 初始版本发布
- 🚀 实现多源新闻抓取
- 💫 添加自动更新机制
- 🎨 完成响应式UI设计
- 🔧 配置定时任务系统

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📞 技术支持

如遇到问题或需要帮助，请通过以下方式联系：

- 📧 技术支持: support@nbanews.com
- 🐛 问题反馈: 请在GitHub Issues中提交
- 💡 功能建议: 欢迎提出改进意见

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

**© 2024 NBA News Hub. All rights reserved.**

*Latest basketball news from official sources*

## 部署选项

### 本地部署

#### 环境要求
- Node.js 14+ 
- npm 6+

#### 安装步骤
1. 克隆或下载项目到本地
2. 安装依赖：
   ```powershell
   npm install
   ```

3. 启动服务器：
   ```powershell
   npm start
   ```
   或者使用启动脚本：
   ```powershell
   .\start-server.bat
   ```

4. 在浏览器中访问：`http://localhost:3000`

### Netlify云端部署

#### 快速部署
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/你的用户名/nba-news-scraper)

#### 手动部署步骤
1. **准备GitHub仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Netlify"
   git remote add origin https://github.com/你的用户名/nba-news-scraper.git
   git push -u origin main
   ```

2. **连接Netlify**
   - 登录 [Netlify](https://www.netlify.com)
   - 点击 "New site from Git"
   - 选择GitHub仓库
   - 配置构建设置：
     - Build command: `npm run build`
     - Publish directory: `public`
     - Functions directory: `functions`

3. **部署完成**
   - 获得自动生成的网址
   - 可配置自定义域名

#### 详细部署说明
请参考 [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md) 获取完整的部署指南。

## 功能说明

### 数据类型

1. **NBA新闻**：来自ESPN NBA的最新新闻报道
2. **比分数据**：过去3天的NBA比赛结果
3. **赛程数据**：未来3天的NBA比赛安排

### 页面功能

- **新闻区域**：显示最新的NBA新闻文章
- **Recent Scores**：显示最近的比赛比分
- **Upcoming Games**：显示即将进行的比赛
- **自动刷新**：每30分钟自动更新数据（本地部署）
- **手动刷新**：点击刷新按钮立即更新

### API端点

#### 本地部署
- `GET /api/news` - 获取所有数据（新闻+比分+赛程）
- `POST /api/refresh` - 手动刷新数据

#### Netlify部署
- `GET /.netlify/functions/news` - 获取所有数据
- `POST /.netlify/functions/refresh` - 手动刷新数据

## 技术实现

### 数据获取

- 使用ESPN NBA API获取真实数据
- 实现并行数据获取提高效率
- 添加超时和错误处理机制
- 提供模拟数据作为备选方案

### 前端渲染

- 基于数据类型（news/score/schedule）分类显示
- 使用CSS动画增强用户体验
- 响应式设计适配不同屏幕尺寸
- 实现标签页切换功能

### 无服务器架构（Netlify）

- 使用Netlify Functions处理API请求
- 静态文件直接由CDN提供服务
- 自动扩展和高可用性
- 成本效益高的云端解决方案

## 故障排除

### 本地部署常见问题

1. **端口占用**：确保3000端口未被其他程序占用
2. **网络连接**：确保可以访问ESPN API
3. **依赖安装**：运行`npm install`安装所有依赖
4. **浏览器缓存**：清除浏览器缓存后重新访问

### Netlify部署常见问题

1. **Functions无法访问**：检查netlify.toml配置
2. **API调用失败**：验证外部API可访问性
3. **构建失败**：查看部署日志排查错误

### 日志查看

#### 本地部署
服务器启动后，控制台会显示详细的数据获取日志

#### Netlify部署
- Netlify控制台 → Functions → 查看执行日志
- 部署页面 → Deploy log

## 项目结构

```
nba-news-scraper/
├── server.js              # Express服务器主文件（本地使用）
├── scraper.js             # NBA数据获取模块（本地使用）
├── functions/             # Netlify Functions目录
│   ├── news.js           # 新闻API函数
│   └── refresh.js        # 刷新API函数
├── public/               # 前端静态文件
│   ├── index.html       # 主页面
│   ├── script.js        # 前端JavaScript
│   └── styles.css       # 样式文件
├── netlify.toml         # Netlify配置文件
├── package.json         # 项目配置和依赖
├── README.md           # 项目文档
├── NETLIFY_DEPLOY.md   # Netlify部署指南
└── .gitignore          # Git忽略文件
```

## 许可证

MIT License

## 更新历史

- **v1.2.0** - 添加Netlify部署支持，数据获取系统重构，修复比分赛程显示，端口统一为3000
- **v1.1.0** - 添加定时任务，优化UI设计
- **v1.0.0** - 初始版本，基础新闻抓取功能

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 支持

如果你觉得这个项目有帮助，请给它一个 ⭐️ 

## 联系方式

- 项目链接: [https://github.com/你的用户名/nba-news-scraper](https://github.com/你的用户名/nba-news-scraper)
- 问题反馈: [GitHub Issues](https://github.com/你的用户名/nba-news-scraper/issues) 
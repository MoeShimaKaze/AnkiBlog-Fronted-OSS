# AnkiBlog Fronted

AnkiBlog 的 Web 前端，React 18 + TypeScript + Vite 构建，配套后端为 [AnkiBlog-OSS](https://github.com/MoeShimaKaze/AnkiBlog-OSS)（Spring Boot 3.3）。

## 功能概览

**公开站点**

- 首页、文章列表与详情（Markdown 渲染、代码高亮、目录）
- 商品列表、商品详情与分类浏览
- 生活记录：妆容、每日穿搭、穿搭详情、衣橱
- 待办清单、目标进度
- 自定义页面（支持自定义 CSS / JS，Markdown 与 HTML 双模式）
- 全站搜索、友情链接、社交链接
- 用户注册、登录、邮箱验证、密码找回

**用户中心**

- 个人仪表盘、个人资料、头像与背景设置
- 我的评论、点赞、收藏
- 我的待办、订阅管理

**管理后台**

- 仪表盘统计、缓存管理、文件管理
- 文章 / 商品 / 自定义页面编辑，含 Milkdown 所见即所得与 CodeMirror 源码模式
- 快照（文章快照、商品快照）查看与回滚
- 评论审核、用户管理、订阅管理、点赞管理
- 妆容、穿搭、衣橱、购买记录、记账、打卡、待办管理
- 站点配置、背景图、友情链接、社交链接、页面类型、页面标题

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | React 18 + TypeScript 5 |
| 构建 | Vite 4 |
| UI | Ant Design 5 + TailwindCSS 3 |
| 状态 | Redux Toolkit + React Context |
| 路由 | React Router 6 |
| HTTP | Axios（统一封装于 `services/api.ts`） |
| 编辑器 | Milkdown 7、CodeMirror 6、`@uiw/react-md-editor` |
| Markdown | `react-markdown` + `remark-gfm` + `rehype-highlight` |
| 图表 | Ant Design Charts / 自绘组件 |
| 移动端打包 | Capacitor 7 |

## 目录结构

```text
src/
├── pages/
│   ├── public/       # 公开页面：Home、Article、Product、Makeup、Outfit、Todo…
│   ├── user/         # 登录后页面：Dashboard、Management、Profile
│   ├── admin/        # 管理后台：Content、Editor、Snapshot、Settings、Users、CheckIn
│   └── error/
├── components/       # 按业务分组的复用组件
├── services/         # API 调用层，每个业务模块一个文件
├── hooks/            # api / auth / business / common / customPage / dashboard / ui
├── types/            # 与后端 DTO 对应的 TypeScript 类型
├── store/            # Redux store 与 slices
├── context/          # 主题、自定义页面等 Context
├── router/           # 路由表（publicRoutes / userRoutes / adminRoutes）
├── utils/
├── constants/ · config/
└── styles/
```

## 快速开始

### 1. 环境要求

- Node.js 18+
- 已启动的 [AnkiBlog-OSS](https://github.com/MoeShimaKaze/AnkiBlog-OSS) 后端

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.development`（或直接使用仓库内已提供的 `.env.development`）：

```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

生产构建使用 `.env.production`，默认走相对路径 `/api`，由反向代理转发到后端。

### 4. 启动

```bash
npm run dev
```

开发服务器默认监听 **443** 端口（见 `vite.config.js`），如需改用 5173，请同步修改 `vite.config.js` 的 `server.port`。

### 5. 构建

```bash
npm run type-check   # 类型检查
npm run lint         # ESLint，零告警
npm run build        # 产物输出到 dist/
npm run preview      # 本地预览构建产物
```

## 开发约定

- **API 调用只放在 `services/`**，组件内不得直接使用 `axios`。
- 请求统一走 `services/api.ts` 的实例，拦截器负责注入 access token、401 自动刷新、刷新失败跳转登录。
- 后端响应为 `SNAKE_CASE`，**请求体字段为 camelCase**（Web MVC 按 Java 字段名绑定），混用会导致 400。
- 统一响应结构：`{ success, message, data, timestamp }`；分页为 `PageResponse<T>`，页码从 0 开始。
- 业务类型统一放 `types/`，不在组件内重复定义。
- 新增路由集中在 `router/index.tsx`，按 `publicRoutes` / `userRoutes` / `adminRoutes` 分类。
- 权限控制不能只靠前端路由隐藏，必须由后端 `@PreAuthorize` 兜底。
- 样式优先使用 Ant Design 组件与 Tailwind 工具类，复杂覆盖样式局部化，避免污染全局。

## 关于背景图

开源版本使用 `public/background_placeholder.png` 作为全站占位背景（一张紫色渐变图），替换了原项目中 29 张第三方画师作品。

如需自定义背景：

1. 将自己的图片放入 `public/`，建议命名为 `background_placeholder.png` 直接覆盖；
2. 或全局搜索 `background_placeholder.png`，替换为实际路径。

站点运行时也支持在「后台 → 站点配置 → 背景图」中上传图片或配置随机图 API。

## 相关仓库

| 仓库 | 说明 |
| --- | --- |
| [AnkiBlog-OSS](https://github.com/MoeShimaKaze/AnkiBlog-OSS) | Spring Boot 后端 |
| [AnkiBlog-Fronted-OSS](https://github.com/MoeShimaKaze/AnkiBlog-Fronted-OSS) | React + TypeScript 前端（本仓库） |
| [AnkiBlog-Mobile-OSS](https://github.com/MoeShimaKaze/AnkiBlog-Mobile-OSS) | Flutter 移动端 |

## 许可证

[MIT](LICENSE)

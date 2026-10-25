# AGENTS.md

This file provides guidance to AI coding agents (Codex / Claude Code / Cursor 等) when working with code in this repository.

## 开源仓库说明（重要）

本仓库是 **AnkiBlog 的开源（脱敏）版本**，对应私有开发仓库的 Web 前端部分。

### 仓库拆分

AnkiBlog 由三个独立仓库组成，本仓库只包含前端：

| 仓库 | 内容 | 技术栈 |
| --- | --- | --- |
| [AnkiBlog-OSS](https://github.com/MoeShimaKaze/AnkiBlog-OSS) | 后端服务 | Spring Boot 3.3 + Java 17 + Maven |
| `AnkiBlog-Fronted-OSS`（本仓库） | Web 前端 | React 18 + TypeScript 5 + Vite 4 + Ant Design 5 |
| [AnkiBlog-Mobile-OSS](https://github.com/MoeShimaKaze/AnkiBlog-Mobile-OSS) | 移动端客户端 | Flutter / Dart |

三端通过后端 HTTP API 协作。本仓库不包含后端代码，需要时请单独 clone 对应仓库。

### 脱敏约定

本仓库在发布前已做以下处理，**修改代码时必须保持这些约定**：

1. **禁止硬编码后端地址**。所有请求必须通过 `VITE_API_BASE_URL` 环境变量或 `services/api.ts` 的默认值 `/api` 获取，不得在组件或 service 中写死域名。
2. **禁止提交真实凭据**。`.env` 系列文件中只放公开的本地开发配置，任何 token、密钥、第三方服务凭据都不得写入仓库。
3. **禁止提交个人域名、邮箱、手机号、内网地址、本机绝对路径**。示例值统一使用 `example.com`、`localhost`。
4. **禁止提交第三方版权素材**。`public/` 下的背景图已替换为自制的渐变占位图 `background_placeholder.png`，不得重新引入无水印授权的外部图片。
5. **禁止提交构建产物与本地配置**：`node_modules/`、`dist/`、`.env.local`、IDE 配置、`android/`、`ios/`。

如发现遗留敏感信息，请立刻停止改动并提交 Issue，不要直接在公开 PR 中附上原文。

## 工作流规范

### 会话启动前置步骤

每次开始工作前，依次读取：

1. `AGENTS.md`（本文档）—— 项目架构与编码规范
2. `README.md` —— 功能范围、目录结构与启动方式

### 开发流程（四步制）

任何非 trivial 的功能开发或修改必须遵循以下流程，**不可跳过**：

1. **需求评审**：与用户沟通明确需求范围、优先级、边界条件
2. **输出 PRD**：编写产品需求文档，包含功能描述、用户交互流程、验收标准
3. **输出技术方案**：基于 PRD 输出技术实现方案，包含涉及文件、API 映射、状态设计、关键算法
4. **用户确认 → 开发**：针对技术方案中不明确或存在模糊的内容，**必须向用户提问并确认**，明确后方可进入代码实现

> 规则：未经用户确认技术方案，不得直接开始编码。

## 项目概览

AnkiBlog 是一个个人博客 + 生活记录 + 商品收藏的全栈系统。本仓库是其 Web 前端，同时覆盖公开站点、用户中心和管理后台三种角色视图。

功能域包括：

- **博客内容**：文章列表与详情、评论、标签、自定义页面（自定义 CSS/JS）
- **产品收藏**：商品列表与详情、分类、购买记录
- **用户系统**：注册登录、邮箱验证、个人资料、JWT 双 token 自动刷新
- **生活记录**：妆容、穿搭、衣橱、每日穿搭、待办清单、目标进度、记账、打卡
- **站点管理**：站点配置、背景图、友情链接、社交链接、页面标题、订阅通知
- **管理后台**：仪表盘、内容编辑、快照回滚、缓存管理、文件管理

## 常用命令

| 任务 | 命令 |
| --- | --- |
| 启动开发服务器（端口 443） | `npm run dev` |
| 生产构建 | `npm run build` |
| 类型检查 | `npm run type-check` |
| Lint 检查 | `npm run lint` |
| 自动修复 Lint | `npm run lint:fix` |
| 预览构建产物 | `npm run preview` |
| 清理构建产物 | `npm run clean` |
| 构建并分析包体积 | `npm run build:analyze` |

## 前端架构

### 技术栈

- **框架**：React 18、TypeScript 5、Vite 4
- **UI**：Ant Design 5、TailwindCSS 3
- **状态管理**：Redux Toolkit（`store/slices/`）+ React Context（主题、自定义页面）
- **路由**：React Router 6，路由集中在 `router/index.tsx`
- **HTTP**：Axios，统一封装在 `services/api.ts`
- **Markdown**：Milkdown 7 编辑器，`react-markdown` + `remark-gfm` + `rehype-highlight` 渲染
- **代码编辑**：CodeMirror 6（`@uiw/react-codemirror`）
- **移动打包**：Capacitor 7
- **路径别名**：`@/` 指向 `src/`

### 目录结构

```text
src/
├── pages/            # public / user / admin / error 四个分区
├── components/       # 按业务分组的复用组件
├── services/         # API 调用层，每模块一个文件
├── hooks/            # api / auth / business / common / customPage / dashboard / ui
├── types/            # 与后端 DTO 对应的类型定义
├── store/            # Redux store 与 slices
├── context/          # 主题、自定义页面 Context
├── router/           # 路由表
├── utils/            # 格式化、校验、存储、安全工具
├── constants/        # 常量
├── config/           # 环境与站点配置
└── styles/           # 全局与模块样式
```

### API 约定

- `services/api.ts` 负责请求拦截、响应拦截、JWT 自动刷新和登录跳转。
- `baseURL` 取自 `import.meta.env.VITE_API_BASE_URL`，缺省回退到 `/api`。
- 后端统一响应结构：`{ success: boolean, message: string, data: T, timestamp: string }`。
- service 函数必须显式声明返回类型，如 `Promise<ApiResponse<MakeupLog>>` 或 `Promise<ApiResponse<PageResponse<Article>>>`。
- **后端响应字段为 `SNAKE_CASE`，但请求体字段为 camelCase**（Web MVC 按 Java 字段名绑定）。新增接口时需确认实际字段，避免类型与运行时不一致。
- 分页参数与 Spring Pageable 对齐，**页码从 0 开始**。

## 编码规范

### 目录与模块边界

- 页面组件放在 `pages/{public,user,admin,error}/` 对应分区；可复用组件放在 `components/`，按业务模块或 UI 类型分组。
- API 调用只放在 `services/`；组件中不要直接调用 `axios`，统一通过 `services/api.ts` 的实例。
- 业务类型放在 `types/`，与后端 DTO 和 API 响应结构对应；不要在多个组件中重复定义同一业务类型。
- 跨页面状态放入 Redux slice 或 Context；页面局部 UI 状态优先使用 `useState` / `useReducer`。
- 新增路由集中维护在 `router/index.tsx`，并按 `publicRoutes`、`userRoutes`、`adminRoutes` 分类。

### 组件与 Hooks

- 组件使用函数组件，命名采用 PascalCase；自定义 Hook 使用 `useXxx` 命名。
- 页面组件负责装配数据、状态和布局；复杂展示逻辑拆到 `components/` 中的业务组件。
- 可复用业务请求逻辑优先抽成 Hook，放到 `hooks/api/`、`hooks/business/` 或对应已有分组。
- `useEffect` 中的异步加载要处理 loading 和错误反馈；依赖数组应准确，不通过禁用 lint 掩盖依赖问题。
- 事件处理函数使用 `handleXxx` 命名，API 加载函数可使用 `loadXxx` / `fetchXxx`。

### TypeScript

- 避免新增 `any`；确实无法确定类型时使用 `unknown` 并在边界收窄。
- Service 函数必须声明明确返回类型。
- 分页接口统一使用 `PageResponse<T>`。
- 请求失败应在页面或 Hook 层给出 `message.error` 等用户反馈，service 层保持纯 API 调用，不直接操作 UI。

### 样式与 UI

- UI 优先使用 Ant Design 组件和项目已有的玻璃拟态/暗色风格，不引入新的 UI 库。
- TailwindCSS 可用于布局和简单样式；复杂 Ant Design 覆盖样式优先局部化，避免污染全局。
- 移动端适配要结合现有断点写法，避免只在桌面宽度验证。
- 图标优先使用 `@ant-design/icons`，保持视觉风格一致。

### 状态、权限与路由

- 管理页面必须挂到 `adminRoutes`，用户页面挂到 `userRoutes`，公开页面挂到 `publicRoutes`。
- 权限控制不能只依赖前端路由隐藏；新增管理功能必须有后端权限注解配合。
- 登录态、token、刷新逻辑复用 `services/api.ts`、`store/slices/authSlice` 和 `utils/storage`，不要另写一套 token 管理。
- 需要页面标题时复用 `usePageTitle`，保持与现有页面一致。

## 参考规范

- 主参考：阿里巴巴前端规约，结合本项目 React + TypeScript + Vite + Ant Design 实际结构执行。
- 补充参考：React 官方 TypeScript 指南、typescript-eslint 推荐规则、Airbnb React/JSX 风格指南、Google TypeScript Style Guide。

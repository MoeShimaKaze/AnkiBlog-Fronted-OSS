# CLAUDE.md

本文件为 Claude Code / 其他 AI 编码助手提供本仓库的协作指引。

完整内容与 `AGENTS.md` 保持一致。为避免两份文档长期分叉，请以 `AGENTS.md` 作为唯一权威来源，本文件只保留最关键的约束摘要与跳转说明。

> **请先阅读 [`AGENTS.md`](./AGENTS.md)。**

## 仓库定位

本仓库 `AnkiBlog-Fronted-OSS` 是 AnkiBlog 开源版本的 **Web 前端**（React 18 + TypeScript 5 + Vite 4 + Ant Design 5），后端为 [AnkiBlog-OSS](https://github.com/MoeShimaKaze/AnkiBlog-OSS)，移动端为 [AnkiBlog-Mobile-OSS](https://github.com/MoeShimaKaze/AnkiBlog-Mobile-OSS)。三端通过后端 HTTP API 协作。

## 必须遵守的硬性约束

1. **开发流程四步制**：需求评审 → PRD → 技术方案 → 用户确认 → 开发，不可跳过；未经确认不得开始编码。
2. **禁止硬编码后端地址**：统一使用 `import.meta.env.VITE_API_BASE_URL`，缺省 `/api`。
3. **禁止提交真实凭据、个人域名、邮箱、内网地址、本机绝对路径**；示例值用 `example.com`、`localhost`。
4. **禁止提交第三方版权素材**：`public/` 背景图已替换为自制占位图 `background_placeholder.png`。
5. **禁止提交构建产物与本地配置**：`node_modules/`、`dist/`、`.env.local`、IDE 配置、`android/`、`ios/`。
6. **API 调用只放 `services/`**，组件内不得直接使用 `axios`。
7. **权限控制不能只靠前端**，必须有后端 `@PreAuthorize` 兜底。

## 关键事实（易踩坑）

- 后端响应是 **SNAKE_CASE**，但**请求体是 camelCase**（Web MVC 按 Java 字段名绑定），混用会导致 400 或字段为 null。
- 分页页码从 **0** 开始。
- 统一响应结构：`{ success, message, data, timestamp }`。
- 开发服务器默认端口 **443**，预览端口 3000。
- 路径别名 `@/` → `src/`。

## 常用命令

```bash
npm install          # 安装依赖
npm run dev          # 开发服务器
npm run type-check   # 类型检查
npm run lint         # ESLint
npm run build        # 生产构建
```

## 延伸阅读

- 功能范围与启动方式：[`README.md`](./README.md)
- 架构、目录、编码规范、路由与权限：[`AGENTS.md`](./AGENTS.md)

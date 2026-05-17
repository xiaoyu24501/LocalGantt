# LocalGantt（本地甘特图）

<!-- 顶部徽章栏 -->


<p align="center">
  <img src="[https://img.shields.io/badge/License-MIT-yellow.svg](https://img.shields.io/badge/License-MIT-yellow.svg)" alt="License">
  <img src="[https://img.shields.io/badge/PRs-welcome-brightgreen.svg](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)" alt="PRs Welcome">
  <img src="[https://img.shields.io/badge/node-%3E%3D_24.0.0-blue.svg](https://img.shields.io/badge/node-%3E%3D_24.0.0-blue.svg)" alt="Node Version">
  <img src="[https://img.shields.io/badge/Local--First-Data_Privacy-blueviolet](https://img.shields.io/badge/Local--First-Data_Privacy-blueviolet)" alt="Local First">
</p>

---

[English](README.md)

LocalGantt 是一个轻量级离线项目管理工具，用来维护任务、依赖、迭代、进度记录和燃尽图，不需要部署后端服务。

它适合产品经理、项目经理、开发人员、算法工程师和个人创作者，尤其适合希望用本地 JSON 数据掌控项目计划的人。

## 功能亮点

- 本地优先：项目数据保存在浏览器中，可导出为 JSON 文件。
- 甘特图：查看任务日期、负责人、进度和依赖关系。
- 燃尽图：按任务记录的实际工时计算迭代剩余工时。
- 任务依赖：支持 FS、SS、FF、SF 四种依赖类型。
- 进度记录：为任务记录进度说明和今日花费工时。
- 需求、资源、迭代管理：用较低成本维护基础项目数据。
- 中英文界面：支持简体中文和英文，导出项目时会保存语言字段。
- 无需后端：适合本地规划、个人复盘、小团队同步和方案演示。

## AI 辅助规划

LocalGantt 包含一个可选的 AI-facing skill：

```text
ai/skills/localgantt-project-planner
```

这个 skill 可以帮助 AI 把模糊的项目想法变成结构化的 LocalGantt 项目计划。它尤其适合这类需求：

- “帮我规划一个 RAG 知识库项目。”
- “把一个 AI Agent 项目拆成任务和依赖。”
- “为模型评测平台生成甘特图计划。”
- “检查这个 LocalGantt JSON 里的计划风险。”

它可以引导 AI 完成：

- 把模糊需求补全成可交付成果和验收标准。
- 拆解需求、任务、资源、迭代和依赖关系。
- 分配合理的预计工时和负责人。
- 基于模板规划 AI、机器学习、数据、软件和产品项目。
- 检查排期风险、依赖风险、资源过载和工时超支。
- 生成可导入 LocalGantt 的 JSON。
- 使用内置脚本校验项目 JSON。

### 如何使用这个 Skill

如果你的 AI 环境支持 skills，可以安装或引用这个目录：

```text
ai/skills/localgantt-project-planner
```

然后让 AI 使用 LocalGantt project planner skill。示例提示词：

```text
请使用 LocalGantt project planner skill，把这个想法变成可导入的项目 JSON：
做一个面向内部工程文档的 RAG 系统。团队：1 个产品经理、1 个后端工程师、1 个算法工程师、1 个前端工程师。周期：2 个迭代。
```

```text
请使用 LocalGantt project planner skill，检查这个导出的 LocalGantt JSON，找出依赖、资源、估算和 AI 评测风险。
```

```text
请使用 LocalGantt project planner skill，为一个模型评测平台创建项目计划，包含需求、任务、依赖、预计工时和迭代分配。
```

这个 skill 不是运行 LocalGantt 应用的必需项。它是给 AI 代理使用的配套工作流，用来生成、审查或修复 LocalGantt 项目数据。


### AI Agent 与 MCP 联动（赋能 Cursor / OpenClaw / Dify）

`LocalGantt` 天生为 AI 时代设计。通过内置的 [AI Skill Prompt](./ai/skills/localgantt-project-planner)，你可以把任何大模型（Claude、GPT）瞬间变成一个硬核的“项目规划专家（Project Planner Agent）”，自动帮你拆解任务并直接在 LocalGantt 中无缝渲染。

#### 如何快速接入：在 Cursor (AI 编程神器) 中使用

让 Cursor 彻底理解你的项目上下文，自动帮你更新或生成甘特图。

1. 复制 `ai/skills/localgantt-project-planner/README.md` 中的 Prompt 内容。
2. 将其添加到你项目的 `.cursorrules` 文件中，或者直接粘贴到 **Cursor 的 System Prompt** 设置里。
   3.**对话示例：***“帮我分析一下当前仓库的代码，把接下来的 RAG 迭代功能拆解为一个为期 2 周的敏捷迭代（Sprint），并直接输出 LocalGantt 的标准 JSON 数据。”*
3. 复制生成的 JSON，在 LocalGantt 界面一键导入，路线图秒级呈现。

#### 如何快速接入：在 OpenClaw / 本地 Agent 自动化框架中使用

如果你正在使用 **OpenClaw** 等本地框架构建自动化 Agent 或 AI 数字人：

1. 在 OpenClaw 中新建一个自定义 **Tool (工具) 或 Skill (技能)**。
2. 注入我们提供的 System Instruction，将 Agent 的输出格式严格限制为 LocalGantt 兼容的 JSON。
3. 你可以写一个 Agent 自动监听本地的 CSV 数据或需求文档，AI 拆解排期后直接自动化更新你的本地项目看板。

#### 如何快速接入：在 Dify 等工作流应用中使用

1. 在 Dify 中创建一个新的 Agent 或 Workflow（工作流）。
2. 在工作流的末尾添加一个**代码块**或**提示词节点**。
3. 将 LocalGantt 的 Schema 规范丢给 AI。这样你就能轻松搭建一个“智能 PM 助理”，聊天几句它就会直接给你一个可以直接导入 LocalGantt 的配置文件。


## 适合谁使用？

LocalGantt 适合以下用户：

- 产品经理：快速拆任务、排迭代、跟踪需求交付。
- 项目经理：维护简洁的计划、依赖和风险视图。
- 开发人员：用轻量工具记录任务进度和实际工时。
- 算法工程师：规划实验、数据处理流程、模型迭代和里程碑。
- 个人开发者：掌控本地数据，不依赖云端服务。

## 快速开始

环境要求：

- 推荐 Node.js 24 或更高版本。
- npm。

从仓库根目录启动：

```bash
npm install --prefix LocalGantt
npm run dev
```

或进入应用目录启动：

```bash
cd LocalGantt
npm install
npm run dev
```

构建：

```bash
npm run build
```

代码检查：

```bash
npm run lint
```

## 典型工作流

1. 创建或导入项目。
2. 添加需求、资源和迭代。
3. 新增任务，填写预计工时、日期、负责人和依赖关系。
4. 在甘特图中检查计划和依赖。
5. 执行过程中记录任务进度和实际工时。
6. 用燃尽图查看迭代剩余工时变化。
7. 导出项目 JSON，用于备份或分享。

## 数据说明

导出的项目文件是 JSON，当前包含：

- `schemaVersion`：项目数据结构版本。
- `locale`：界面语言，取值为 `zh-CN` 或 `en-US`。
- `projectName`：项目名称。
- `projectDescription`：项目简介。
- `requirements`：需求列表。
- `resources`：资源列表。
- `sprints`：迭代列表。
- `tasks`：任务列表，包含 `estimatedHours` 预计工时。
- `dependencies`：任务依赖列表。
- `taskRecords`：进度记录，包含实际花费 `hours`。

导入规则：

- 如果 JSON 包含 `locale`，导入后按该语言展示。
- 如果 JSON 不包含 `locale`，保持当前页面语言。
- 旧版本项目文件会尽量自动补齐缺失字段。

## 隐私说明

LocalGantt 不需要后端服务。项目数据保存在浏览器本地，并通过 JSON 文件手动导入导出。

## 开发

常用命令：

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

CI 会对 `LocalGantt` 应用运行 lint 和 build。

## 不适合哪些场景？

这个项目刻意保持轻量，不是 Jira、Linear、Microsoft Project 或企业级项目管理系统的替代品。

它不提供：

- 多人实时协作。
- 云端同步。
- 权限管理。
- Issue 评论或代码评审流程。
- 服务端审计历史。

## 许可证

MIT。详见仓库根目录的 `LICENSE` 文件。

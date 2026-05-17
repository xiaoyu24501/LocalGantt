# LocalGantt

<!-- 顶部徽章栏 -->

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/Node-%3E%3D24-blue" alt="Node Version">
  <img src="https://img.shields.io/badge/Local--First-Data_Privacy-blueviolet" alt="Local First">
</p>

---

[简体中文](README_CN.md)

LocalGantt is a lightweight offline project planning tool for people who need a practical view of work, dependencies, progress, and delivery risk without setting up a server.

It is designed for product managers, project managers, developers, algorithm engineers, and solo builders who want a local, JSON-backed planning workflow.

🌐 **[Live Demo 在线体验请点击此处](https://xiaoyu24501.github.io/LocalGantt/)** | 📄 [Documentation](./README_CN.md) Local-first, JSON-backed ...

## Highlights

- Offline first: project data is stored in the browser and can be exported as JSON.
- Gantt view: see task dates, assignees, progress, and dependency lines.
- Sprint burndown: track remaining work by recorded hours.
- Task dependencies: supports FS, SS, FF, and SF dependency types.
- Progress records: record progress notes and actual hours for each task.
- Requirements, resources, and sprints: keep lightweight planning data in one place.
- Bilingual UI: Simplified Chinese and English, with language persisted in exported project files.
- No backend required: good for local planning, personal workflows, and small project reviews.

## AI-Assisted Planning

LocalGantt includes an optional AI-facing skill at:

```text
ai/skills/localgantt-project-planner
```

This skill helps an AI agent turn vague project ideas into structured LocalGantt plans. It is especially useful when a user starts with a broad request such as:

- "Plan a RAG knowledge base project."
- "Break down an AI agent workflow into tasks."
- "Create a Gantt plan for a model evaluation platform."
- "Review this LocalGantt JSON and find risks."

The skill can guide an AI agent to:

- Expand vague requirements into clear deliverables and acceptance criteria.
- Decompose work into requirements, tasks, resources, sprints, and dependencies.
- Assign practical estimated hours and owners.
- Build AI/ML/data project plans using reusable templates.
- Review schedule risk, dependency risk, resource overload, and overrun records.
- Generate importable LocalGantt JSON.
- Validate project JSON with the bundled script.

### How To Use The Skill

If your AI environment supports skills, install or reference the folder:

```text
ai/skills/localgantt-project-planner
```

Then ask the AI to use the LocalGantt project planner skill. Example prompts:

```text
Use the LocalGantt project planner skill to turn this idea into an importable project JSON:
Build a RAG system for internal engineering docs. Team: 1 PM, 1 backend engineer, 1 ML engineer, 1 frontend engineer. Timeline: 2 sprints.
```

```text
Use the LocalGantt project planner skill to review this exported LocalGantt JSON. Find dependency, staffing, estimate, and AI evaluation risks.
```

```text
Use the LocalGantt project planner skill to create a project plan for a model evaluation platform. Include requirements, tasks, dependencies, estimated hours, and sprint assignments.
```

The skill is not required to run the LocalGantt app. It is a companion workflow for AI agents that generate, review, or repair LocalGantt project data.

### AI Agent & MCP Integration (Boost with Cursor / OpenClaw / Dify)

`LocalGantt` is natively designed for the AI era. With the built-in [AI Skill Prompt](./ai/skills/localgantt-project-planner), you can turn any LLM (Claude, GPT) into a powerful Project Planner Agent that automatically generates structured project data and renders it directly in LocalGantt.

#### How to Integrate In Cursor (AI IDE)

You can let Cursor understand your project context and automatically update or generate gantt charts.

1. Copy the content from `ai/skills/localgantt-project-planner/README.md`.
2. Add it to your `.cursorrules` file or paste it into the **Cursor System Prompt**.
   3.**Prompt Example:***"Hey Claude, analyze this repository and help me break down the upcoming RAG features into a 2-week agile sprint. Output the raw LocalGantt JSON directly."*
3. Copy the JSON output, import it into LocalGantt, and watch your roadmap visualize instantly.

#### How to Integrate In OpenClaw / Local Agent Frameworks

If you are running a local automation agent using frameworks like [OpenClaw]([https://github.com/YourOpenClawLink](https://github.com/YourOpenClawLink)):

1. Register a new custom **Tool / Skill** within OpenClaw.
2. Use the system instruction provided in our `ai/skills` folder to restrict the Agent's tool output format to LocalGantt-compliant JSON.
3. Configure the Agent to read your local CSV or project files, auto-schedule tasks, and write the result directly to your local data folder.

#### How to Integrate In Dify / Flow-based LLM Apps

1. Create a New App (Agent or Workflow) in Dify.
2. Add a **Code Block** or **Template Node** at the end of your workflow.
3. Inject our system schema so the Dify Agent strictly outputs the project structure. Now you can build an automatic PM Bot that chats with you and exports a download-ready LocalGantt file!

## Who Is It For?

LocalGantt is designed for:

- Product managers who need a quick delivery plan without heavyweight tooling.
- Project managers who want a simple offline schedule and dependency view.
- Developers who prefer project notes close to implementation work.
- Algorithm engineers who need to plan experiments, pipelines, and milestones.
- Solo builders who want a JSON-backed project tracker they fully control.

## Quick Start

Requirements:

- Node.js 24 or later is recommended.
- npm.

From the repository root:

```bash
npm install --prefix LocalGantt
npm run dev
```

Or from the app directory:

```bash
cd LocalGantt
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

## Typical Workflow

1. Create or import a project.
2. Add requirements, resources, and sprints.
3. Add tasks with estimated hours, dates, assignees, and dependencies.
4. Use the Gantt view to inspect schedule and dependencies.
5. Record task progress and actual hours during execution.
6. Use the burndown chart to review remaining sprint hours.
7. Export the project JSON for backup or sharing.

## Project Data

Exported project files are JSON. The current schema includes:

- `schemaVersion`: project data schema version.
- `locale`: UI language, `zh-CN` or `en-US`.
- `projectName`: project name.
- `projectDescription`: project description.
- `requirements`: requirement list.
- `resources`: resource list.
- `sprints`: sprint list.
- `tasks`: task list, including `estimatedHours`.
- `dependencies`: task dependency list.
- `taskRecords`: progress records, including actual `hours`.

Import behavior:

- If `locale` exists, the app switches to that language after import.
- If `locale` is missing, the current UI language is preserved.
- Older project files are normalized automatically where possible.

## Privacy

LocalGantt does not require a backend. Project data is kept in browser storage and exported/imported manually as JSON files.

## Development

Useful commands:

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

The CI workflow runs lint and build for the `LocalGantt` app.

## When Not To Use It

This project is intentionally small. It is not a replacement for Jira, Linear, Microsoft Project, or enterprise PM systems.

It does not provide:

- Multi-user collaboration.
- Cloud sync.
- Permission management.
- Issue comments or review workflows.
- Server-side audit history.

## License

MIT. See the repository-level `LICENSE` file.

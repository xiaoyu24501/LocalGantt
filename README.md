# LocalGantt

[简体中文](README_CN.md)

LocalGantt is a lightweight offline project planning tool for people who need a practical view of work, dependencies, progress, and delivery risk without setting up a server.

It is designed for product managers, project managers, developers, algorithm engineers, and solo builders who want a local, JSON-backed planning workflow.

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

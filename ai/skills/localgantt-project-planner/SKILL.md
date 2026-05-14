---
name: localgantt-project-planner
description: Use this skill when planning, generating, reviewing, repairing, or summarizing LocalGantt project JSON for software, AI, data, ML, product, or project-management workflows. It helps convert project goals into LocalGantt requirements, sprints, tasks, dependencies, estimated hours, progress records, and risk analysis.
---

# LocalGantt Project Planner

Use this skill to work with LocalGantt project files and to produce project plans that can be imported into LocalGantt.

## Core Workflow

1. Clarify the project goal, timeframe, roles, and level of detail.
2. Decide whether the user needs a full project JSON, a partial update, a review, or a progress summary.
3. Read `references/schema.md` before generating or modifying LocalGantt JSON.
4. If the user gives a vague project idea, read `references/planning-method.md` before producing tasks or JSON.
5. For AI/ML/data projects, read `references/ai-project-templates.md` and adapt only the relevant template.
6. For hour estimates, sequencing, or staffing, read `references/estimation-guide.md`.
7. Generate concise, importable JSON when the user asks for data output.
8. For reviews, lead with risks and actionable fixes, not a generic summary.
9. When a JSON file path is available, validate it with `scripts/validate-localgantt-json.mjs`.

## Vague Request Handling

If the user only gives a broad goal such as "build a RAG app" or "make an evaluation platform":

1. Do not jump directly to final JSON unless the user explicitly asks for it.
2. Infer a reasonable scope and state assumptions.
3. Expand the goal into requirements, acceptance criteria, deliverables, risks, and milestones.
4. Decompose into tasks only after requirements are concrete enough.
5. Assign roles and hours using explicit reasoning.
6. Ask at most 3 blocking questions if assumptions would materially change the plan.
7. If the user wants immediate output, produce a practical draft and mark assumptions clearly.

## Output Rules

- Keep LocalGantt internal enum values in Chinese:
  - `priority`: `低`, `中`, `高`
  - `status`: `待办`, `进行中`, `已完成`, `暂停`
  - dependency `type`: `FS`, `SS`, `FF`, `SF`
- Use stable IDs:
  - requirements: `R-001`
  - resources: `P-001`
  - sprints: `S-01`
  - tasks: `T-001`
  - dependencies: `DEP-001`
  - records: `REC-001`
- Every task must have `estimatedHours > 0`.
- Every task should have `requirementId`, `assigneeId`, `sprintId`, `start`, and `end`.
- Avoid dependency cycles.
- Prefer realistic dependency chains over connecting every task to every other task.
- For AI projects, include evaluation, data, risk, and deployment/rollback tasks when relevant.

## Review Checklist

Check LocalGantt projects for:

- Missing or duplicate IDs.
- Tasks without estimated hours.
- Tasks without owners or sprint assignments.
- Invalid dependency references.
- Dependency cycles.
- Tasks that end before they start.
- Sprint overload by estimated hours.
- Actual recorded hours greater than estimated hours.
- Tasks with progress records but no meaningful notes.
- AI project gaps: no evaluation set, no baseline, no error analysis, no monitoring, or no rollback plan.

## When Producing Plans

For product/project users, keep language outcome-oriented:

- requirement = deliverable or user/business capability
- task = concrete work item
- dependency = real execution constraint
- estimated hours = practical planning estimate, not story points

For engineering/AI users, include technical gates:

- data readiness
- baseline implementation
- evaluation criteria
- experiment tracking
- integration
- monitoring
- release decision

## References

- Data schema and examples: `references/schema.md`
- AI project planning templates: `references/ai-project-templates.md`
- Planning method for vague requirements: `references/planning-method.md`
- Estimation and resource allocation: `references/estimation-guide.md`
- Worked examples: `references/requirement-examples.md`

## Validation

Run:

```bash
node ai/skills/localgantt-project-planner/scripts/validate-localgantt-json.mjs path/to/project.json
```

The script checks import-critical structure, references, IDs, dates, hours, and dependency cycles.

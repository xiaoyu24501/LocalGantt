# Planning Method: From Vague Idea to LocalGantt Plan

Use this reference when a user gives an unclear goal and expects the AI to turn it into requirements, tasks, dependencies, hours, and a Gantt-style plan.

This method uses general project-management and agile principles: progressive elaboration, value-based delivery, stakeholder alignment, acceptance criteria, risk management, iteration planning, capacity awareness, and inspect-and-adapt feedback loops.

## 1. Clarify the Planning Frame

Identify or infer:

- Objective: what outcome the project should create.
- Users/stakeholders: who benefits, approves, operates, or maintains it.
- Deliverables: what tangible outputs must exist.
- Timebox: target date, sprint length, or planning horizon.
- Constraints: budget, team size, tools, data access, compliance, deployment environment.
- Definition of done: what evidence proves the work is complete.

If information is missing, make reasonable assumptions for a draft. Ask only when a missing answer changes the plan materially.

## 2. Expand Requirements

Turn broad goals into requirement objects. A strong requirement should include:

- A short title.
- Business/user value.
- Scope boundary.
- Acceptance criteria.
- Major risks or constraints.

Requirement writing pattern:

```text
As/For [user or stakeholder], we need [capability] so that [value].
Done means [observable acceptance criteria].
Out of scope: [explicit exclusions].
```

For LocalGantt JSON:

- Put the short title in `requirements[].title`.
- Put value, acceptance criteria, assumptions, and out-of-scope notes in `requirements[].description`.
- Use priority:
  - `高`: core delivery or risk-reduction requirement.
  - `中`: important but not launch-blocking.
  - `低`: polish, optional automation, or later optimization.

## 3. Decompose Work into Tasks

Decompose requirements into tasks that are concrete enough to estimate and assign.

Good task properties:

- Has one clear owner role.
- Produces a visible output.
- Can be estimated in hours.
- Usually fits within 0.5 to 3 working days.
- Has dependencies only when sequencing truly matters.

Common task categories:

- Discovery: clarify scope, users, constraints.
- Design: architecture, UX, data contract, API contract.
- Build: implementation, integration, automation.
- Quality: tests, evaluation, validation, review.
- Release: deployment, rollout, monitoring, rollback.
- Learning loop: error analysis, retrospective, tuning.

Avoid vague task names:

- Bad: "Do AI part"
- Better: "Build baseline retrieval pipeline"

- Bad: "Improve model"
- Better: "Run error analysis on failed evaluation cases"

## 4. Sequence Dependencies

Use dependencies to express execution constraints, not preferences.

Default to `FS`:

- Data collection must finish before evaluation set construction.
- Baseline must finish before experiment comparison.
- Deployment plan must finish before release.

Use other dependency types sparingly:

- `SS`: tasks can start together but one needs the other to begin.
- `FF`: two tasks must complete together.
- `SF`: rare; avoid unless the workflow genuinely needs it.

Dependency sanity checks:

- No cycles.
- No self-dependencies.
- Do not connect every task linearly if tasks can run in parallel.
- Keep milestone-critical paths clear.

## 5. Plan Iterations

Use agile-style iteration planning:

- Each sprint should produce useful evidence or an inspectable increment.
- Put high-risk unknowns early.
- Favor thin vertical slices over large phase gates.
- Include evaluation and feedback tasks inside the sprint, not only at the end.

For AI projects, an iteration should usually answer at least one of:

- Can the data support the use case?
- Is baseline quality good enough to continue?
- Which failure modes dominate?
- Is the workflow safe and observable enough for pilot?

## 6. Assign Resources

Create resources as real people when known, otherwise use role placeholders:

- Product Manager
- Project Manager
- Frontend Engineer
- Backend Engineer
- ML Engineer
- Data Engineer
- Algorithm Engineer
- QA / Evaluation
- DevOps / Platform

Resource assignment rules:

- Assign each task to the role that owns the output.
- Do not assign cross-functional work to "PM" just because scope is unclear.
- Split tasks if ownership changes.
- Keep review/approval tasks assigned to the reviewer role.

## 7. Add Risks and Feedback Loops

For project realism, include tasks that reduce uncertainty:

- Spike/prototype for unknown technical risk.
- Evaluation set creation before optimization.
- Error analysis after experiments.
- User review before release.
- Monitoring and rollback before production launch.

For LocalGantt, risks can appear in:

- requirement descriptions
- task notes
- dedicated risk-reduction tasks

## 8. Final Output Options

Depending on the user request, output one of:

- A planning summary only.
- Requirements and task breakdown table.
- Importable LocalGantt JSON.
- Risk review for existing JSON.
- JSON patch/update recommendations.

When producing JSON, follow `schema.md` exactly.

# Requirement Expansion Examples

Use these examples to transform vague user goals into concrete LocalGantt planning artifacts.

## Example 1: "Build a RAG Knowledge Base"

Vague input:

```text
We want to build a RAG knowledge base for internal documents.
```

Clarifying assumptions:

- Internal users need searchable, cited answers.
- Documents are already available but not cleaned.
- First release is a pilot, not full enterprise rollout.
- Team has PM, backend engineer, ML engineer, frontend engineer, and QA/evaluation support.

Requirements:

- `R-001 Document ingestion and indexing`
  - Value: make internal documents retrievable.
  - Acceptance: selected document set can be parsed, chunked, embedded, and indexed.
- `R-002 Retrieval and answer quality evaluation`
  - Value: measure whether the system answers correctly.
  - Acceptance: test question set, scoring rubric, baseline report.
- `R-003 User-facing Q&A workflow`
  - Value: users can ask questions and inspect citations.
  - Acceptance: answer UI with source snippets and fallback behavior.
- `R-004 Pilot readiness`
  - Value: safe launch to a limited group.
  - Acceptance: monitoring, known limitations, rollback plan.

Task examples:

- Define pilot use cases and acceptance criteria.
- Collect sample documents and representative questions.
- Build ingestion and chunking pipeline.
- Create baseline vector index.
- Build evaluation set and scoring rubric.
- Implement answer generation with citations.
- Run error analysis and tune retrieval.
- Add monitoring and pilot release checklist.

Important dependencies:

- Evaluation set depends on use cases.
- Retrieval tuning depends on baseline index and evaluation set.
- Pilot release depends on monitoring and error analysis.

## Example 2: "Make an Agent to Handle Emails"

Vague input:

```text
I want an AI agent that can process my emails automatically.
```

Clarifying assumptions:

- First version drafts suggested replies, not fully autonomous sending.
- Human approval is required before external actions.
- Email provider integration is available.

Requirements:

- `R-001 Email triage and classification`
  - Acceptance: classify priority, topic, and required action.
- `R-002 Draft response workflow`
  - Acceptance: generate draft replies with source context and editable output.
- `R-003 Tool and approval boundaries`
  - Acceptance: explicit permissions, audit trace, no unapproved sending.
- `R-004 Evaluation and rollout`
  - Acceptance: scenario test set, human review, pilot release plan.

Task examples:

- Define allowed and forbidden agent actions.
- Specify email tool API contract.
- Implement read-only email ingestion.
- Build classification baseline.
- Implement draft generation.
- Add trace logging and replay.
- Build evaluation scenarios.
- Test approval and failure handling.

Important dependencies:

- Permission boundary before tool implementation.
- Tool API before orchestration.
- Evaluation scenarios before pilot.

## Example 3: "Build a Model Evaluation Platform"

Vague input:

```text
We need a platform to evaluate model quality.
```

Clarifying assumptions:

- Users compare multiple model versions.
- Both automatic metrics and human review are needed.
- Reports should support release decisions.

Requirements:

- `R-001 Evaluation dataset management`
  - Acceptance: versioned datasets with metadata and ownership.
- `R-002 Evaluation runner`
  - Acceptance: run model outputs against datasets and collect metrics.
- `R-003 Review and reporting`
  - Acceptance: comparison report, failure categories, release recommendation.
- `R-004 Release gates`
  - Acceptance: threshold rules and regression checks.

Task examples:

- Define quality dimensions and failure taxonomy.
- Design dataset schema and versioning.
- Implement evaluation runner.
- Add metric calculation.
- Add human review workflow.
- Generate comparison report.
- Define release gate thresholds.
- Integrate with CI or release workflow.

Important dependencies:

- Failure taxonomy before dataset expansion.
- Runner before reporting.
- Metrics before release gates.

## Example 4: "Build an Internal Project Management Tool"

Vague input:

```text
We want a lightweight internal project management tool.
```

Clarifying assumptions:

- First version is single-user or small-team.
- Offline or simple local persistence is acceptable.
- Focus is planning and progress tracking, not enterprise workflow.

Requirements:

- `R-001 Project data model`
  - Acceptance: requirements, resources, sprints, tasks, dependencies, records.
- `R-002 Planning UI`
  - Acceptance: create/edit tasks and dependencies.
- `R-003 Progress and reporting`
  - Acceptance: progress records, burndown chart, export/import.
- `R-004 Release readiness`
  - Acceptance: lint/build CI, docs, license, basic validation.

Task examples:

- Define project JSON schema.
- Build task dialog.
- Build dependency editor.
- Implement import/export.
- Implement burndown calculation.
- Add bilingual UI.
- Add README and CI.

Important dependencies:

- Schema before import/export.
- Task data model before Gantt view.
- Progress records before burndown.

## Example 5: "Add Monitoring to an Existing Model"

Vague input:

```text
Our model is already deployed. We need monitoring and alerts.
```

Clarifying assumptions:

- Production logs are accessible.
- Monitoring starts with quality, latency, cost, and failure categories.
- First release alerts internal maintainers only.

Requirements:

- `R-001 Monitoring metrics and thresholds`
  - Acceptance: agreed metrics, alert thresholds, owner mapping.
- `R-002 Data collection pipeline`
  - Acceptance: logs or traces collected with privacy constraints.
- `R-003 Dashboard and alerts`
  - Acceptance: dashboard and initial alert rules.
- `R-004 Incident response`
  - Acceptance: runbook and rollback/escalation process.

Task examples:

- Define monitoring metrics.
- Review privacy and logging constraints.
- Implement trace/log collection.
- Build dashboard.
- Configure alert thresholds.
- Write incident runbook.
- Run simulated incident drill.

Important dependencies:

- Metrics before dashboard.
- Logging constraints before data collection.
- Runbook before alert rollout.

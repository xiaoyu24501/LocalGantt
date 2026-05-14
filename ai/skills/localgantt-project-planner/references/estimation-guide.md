# Estimation and Resource Allocation Guide

Use this reference when assigning estimated hours, sprint dates, resources, or dependency sequences.

## Estimation Principles

Estimate in hours because LocalGantt tracks both estimated and recorded work hours.

Good estimates should be:

- Specific to the output, not the job title.
- Small enough to be reviewed.
- Honest about uncertainty.
- Consistent across similar tasks.
- Adjusted for integration, evaluation, and review work.

Avoid making every task `8` hours. That hides risk and makes the burndown less useful.

## Useful Hour Ranges

These are starting points, not rules.

| Task type | Typical range |
| --- | ---: |
| Clarify scope / acceptance criteria | 2-6h |
| UX or workflow sketch | 4-12h |
| API/data contract | 4-10h |
| Small frontend/backend implementation | 6-16h |
| Medium feature implementation | 16-32h |
| Data ingestion prototype | 8-20h |
| Data cleaning / labeling sample | 8-24h |
| Evaluation set design | 8-24h |
| Baseline model/retrieval implementation | 12-32h |
| Experiment run and comparison | 8-24h |
| Error analysis | 6-16h |
| Integration test / QA pass | 6-20h |
| Deployment / release checklist | 4-16h |
| Monitoring / alerting setup | 8-24h |
| Documentation / handoff | 3-10h |

## Split Task Heuristics

Split a task when:

- It exceeds 32 hours.
- More than one role owns the output.
- It contains both discovery and implementation.
- It contains both build and validation.
- It has an internal dependency.
- It would be hard to record meaningful progress notes.

Keep a task whole when:

- It has one owner.
- It produces one inspectable output.
- It is under 16 hours.
- The sequence would be artificial if split.

## Estimating AI/ML Work

AI tasks have high uncertainty. Account for:

- Data access and cleaning.
- Baseline setup.
- Evaluation design.
- Repeated experiments.
- Error analysis.
- Safety/guardrail work.
- Integration and observability.

For uncertain AI tasks:

- Add a short spike task first.
- Estimate the spike separately.
- Add a follow-up implementation task only after assumptions are explicit.

Example:

- `T-004 Build retrieval experiment spike`: 8h
- `T-005 Implement selected retrieval strategy`: 20h
- `T-006 Run evaluation and error analysis`: 12h

## Resource Allocation

Start with role capacity:

- PM/Product: 4-6h/day for project work.
- Engineer: 5-7h/day for focused implementation.
- ML/Data/Algorithm Engineer: 4-6h/day if experiments require waiting/review cycles.
- QA/Evaluation: 4-6h/day depending on manual review volume.

Allocation rules:

- Put product scope and acceptance criteria on PM/Product.
- Put architecture and implementation on engineering roles.
- Put model/data experiments on ML/Data/Algorithm roles.
- Put release and monitoring on Platform/DevOps or owning engineer.
- Put quality gates on QA/Evaluation or reviewer roles.

Avoid resource overload:

- Sum estimated hours per sprint per resource.
- Compare against capacity × sprint working days.
- If overloaded, move lower-priority tasks or add parallel resources.

## Dependency and Schedule Estimation

Scheduling rules:

- Put high-risk discovery early.
- Do baseline before optimization.
- Do evaluation design before model/retrieval tuning.
- Do monitoring before release.
- Do documentation/handoff near release, but not after everything.

Parallelization:

- PM can refine acceptance criteria while engineers spike implementation.
- Evaluation set construction can overlap with baseline implementation after criteria are agreed.
- Frontend shell can start while backend API contract is finalized if mocked data is acceptable.

## Confidence Notes

When returning a plan, include short assumptions for estimates:

- "Assumes existing authentication is available."
- "Assumes data access is granted before Sprint 1 starts."
- "Assumes one ML engineer and one backend engineer."
- "Does not include production compliance review."

If assumptions are weak, add risk-reduction tasks instead of inflating all estimates.

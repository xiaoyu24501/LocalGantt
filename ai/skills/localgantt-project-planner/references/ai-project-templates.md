# AI Project Planning Templates

Use these templates as starting points. Adapt them to the user's scope, team, and timeline.

## RAG Application

Common requirements:

- Knowledge ingestion and indexing.
- Retrieval quality evaluation.
- Answer generation and citation UX.
- Guardrails and monitoring.
- Release and rollback.

Typical task chain:

1. Define use cases and answer quality criteria.
2. Collect representative documents and user questions.
3. Build ingestion and chunking pipeline.
4. Create baseline retrieval index.
5. Build evaluation set and scoring rubric.
6. Implement retrieval experiments.
7. Integrate generation prompt and citations.
8. Add safety checks and fallback behavior.
9. Run error analysis and tune retrieval/generation.
10. Ship pilot and monitor feedback.

Critical dependencies:

- Evaluation set should start before retrieval tuning.
- Generation integration depends on baseline retrieval.
- Release depends on safety checks and evaluation pass.

## Agent Workflow

Common requirements:

- Tool/API contract.
- Task planner or orchestration logic.
- Memory/state handling.
- Human approval boundaries.
- Evaluation and trace review.

Typical task chain:

1. Define target workflows and success criteria.
2. Specify tool interfaces and permission boundaries.
3. Build deterministic tool wrappers.
4. Implement agent orchestration.
5. Add trace logging and replay.
6. Build scenario evaluation set.
7. Test failure handling and human approval.
8. Run end-to-end pilots.
9. Add monitoring and rollout controls.

Critical dependencies:

- Tool wrappers before orchestration.
- Evaluation scenarios before pilot.
- Approval boundaries before production usage.

## Fine-Tuning Project

Common requirements:

- Dataset definition.
- Data cleaning and labeling.
- Baseline model evaluation.
- Training run.
- Offline evaluation.
- Deployment decision.

Typical task chain:

1. Define task, labels, and acceptance metrics.
2. Collect and clean training examples.
3. Split train/dev/test datasets.
4. Establish baseline model and evaluation.
5. Prepare fine-tuning configuration.
6. Run training experiment.
7. Evaluate quality, regressions, and cost.
8. Run human review on edge cases.
9. Prepare deployment and rollback plan.

Critical dependencies:

- Baseline before training.
- Clean split before training.
- Human review before deployment.

## ML/Data Pipeline

Common requirements:

- Data source contract.
- Pipeline implementation.
- Data quality checks.
- Backfill plan.
- Monitoring.

Typical task chain:

1. Define source data and freshness requirements.
2. Implement ingestion.
3. Add data validation checks.
4. Build transformation pipeline.
5. Backfill historical data.
6. Create monitoring dashboards.
7. Document recovery procedures.
8. Release and verify production run.

Critical dependencies:

- Validation before backfill.
- Monitoring before production release.

## Evaluation System

Common requirements:

- Metric design.
- Test set management.
- Evaluation runner.
- Reporting.
- Regression gates.

Typical task chain:

1. Define quality dimensions and failure taxonomy.
2. Build representative test set.
3. Implement evaluation runner.
4. Add automated metrics.
5. Add human review workflow for ambiguous cases.
6. Generate comparison reports.
7. Define release gates.
8. Integrate evaluation into CI or release workflow.

Critical dependencies:

- Failure taxonomy before test set expansion.
- Evaluation runner before release gates.

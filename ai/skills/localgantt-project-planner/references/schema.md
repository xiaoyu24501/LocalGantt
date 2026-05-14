# LocalGantt JSON Schema Reference

Use this reference when creating, updating, or repairing LocalGantt project JSON.

## Top-Level Shape

```json
{
  "schemaVersion": 1,
  "locale": "zh-CN",
  "projectName": "Project name",
  "projectDescription": "Short project description",
  "requirements": [],
  "resources": [],
  "sprints": [],
  "tasks": [],
  "dependencies": [],
  "taskRecords": []
}
```

## Required Top-Level Fields

- `schemaVersion`: number. Current version is `1`.
- `locale`: optional, `zh-CN` or `en-US`.
- `projectName`: string.
- `projectDescription`: string.
- `requirements`: array.
- `resources`: array.
- `sprints`: array.
- `tasks`: array.
- `dependencies`: array.
- `taskRecords`: array.

## Requirements

```json
{
  "id": "R-001",
  "title": "Requirement title",
  "description": "Requirement description",
  "priority": "高"
}
```

Rules:

- `priority` must be `低`, `中`, or `高`.
- Use requirements to describe deliverables, not tiny tasks.

## Resources

```json
{
  "id": "P-001",
  "name": "Frontend Engineer",
  "role": "Frontend",
  "capacity": 7
}
```

Rules:

- `capacity` is hours per working day.
- For early planning, role names are acceptable before individual names are known.

## Sprints

```json
{
  "id": "S-01",
  "name": "Sprint 1",
  "start": "2026-06-01",
  "end": "2026-06-14"
}
```

Rules:

- Dates use `YYYY-MM-DD`.
- `end` must be on or after `start`.

## Tasks

```json
{
  "id": "T-001",
  "title": "Task title",
  "notes": "",
  "requirementId": "R-001",
  "assigneeId": "P-001",
  "sprintId": "S-01",
  "start": "2026-06-01",
  "end": "2026-06-03",
  "estimatedHours": 16,
  "progress": 0,
  "status": "待办"
}
```

Rules:

- `estimatedHours` must be greater than `0`.
- `progress` is `0` to `100`.
- `status` must be `待办`, `进行中`, `已完成`, or `暂停`.
- Keep task titles action-oriented and concrete.
- Do not use progress records as task definitions.

## Dependencies

```json
{
  "id": "DEP-001",
  "fromTaskId": "T-001",
  "toTaskId": "T-002",
  "type": "FS"
}
```

Types:

- `FS`: finish-to-start.
- `SS`: start-to-start.
- `FF`: finish-to-finish.
- `SF`: start-to-finish.

Rules:

- `fromTaskId` and `toTaskId` must point to existing tasks.
- `fromTaskId` and `toTaskId` must be different.
- Avoid cycles.

## Task Records

```json
{
  "id": "REC-001",
  "taskId": "T-001",
  "at": "2026-06-01T10:00:00.000Z",
  "hours": 2.5,
  "progress": 20,
  "notes": "Completed baseline implementation."
}
```

Rules:

- `hours` is actual work time spent in this record.
- `progress` is task progress after this record.
- `notes` should describe what changed, what was learned, or what remains.

## Import Compatibility

LocalGantt normalizes older JSON where possible:

- Missing `schemaVersion` becomes current version.
- Missing `locale` preserves the current UI language.
- Missing `estimatedHours` defaults to `8`.
- Missing record `hours` defaults to `0`.

AI-generated JSON should still include all current fields explicitly.

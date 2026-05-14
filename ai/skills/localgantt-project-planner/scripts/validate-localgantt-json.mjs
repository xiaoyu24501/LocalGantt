#!/usr/bin/env node
import fs from "node:fs";

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node validate-localgantt-json.mjs path/to/project.json");
  process.exit(1);
}

const fail = (message) => {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
};

let project;
try {
  project = JSON.parse(fs.readFileSync(filePath, "utf8"));
} catch (error) {
  fail(`Cannot read or parse JSON: ${error.message}`);
  process.exit();
}

const requiredArrays = ["requirements", "resources", "sprints", "tasks", "dependencies", "taskRecords"];
if (typeof project !== "object" || project === null || Array.isArray(project)) {
  fail("Project must be a JSON object.");
}
if (typeof project.schemaVersion !== "number") {
  fail("schemaVersion must be a number.");
}
if (project.locale !== undefined && project.locale !== "zh-CN" && project.locale !== "en-US") {
  fail("locale must be zh-CN or en-US when present.");
}
for (const key of requiredArrays) {
  if (!Array.isArray(project[key])) fail(`${key} must be an array.`);
}

const byId = (items, label) => {
  const map = new Map();
  for (const item of items || []) {
    if (!item || typeof item !== "object") {
      fail(`${label} item must be an object.`);
      continue;
    }
    if (typeof item.id !== "string" || !item.id) {
      fail(`${label} item is missing id.`);
      continue;
    }
    if (map.has(item.id)) fail(`Duplicate ${label} id: ${item.id}`);
    map.set(item.id, item);
  }
  return map;
};

const requirements = byId(project.requirements, "requirement");
const resources = byId(project.resources, "resource");
const sprints = byId(project.sprints, "sprint");
const tasks = byId(project.tasks, "task");
const dependencies = byId(project.dependencies, "dependency");
byId(project.taskRecords, "taskRecord");

const isDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
const validPriorities = new Set(["低", "中", "高"]);
const validStatuses = new Set(["待办", "进行中", "已完成", "暂停"]);
const validDependencyTypes = new Set(["FS", "SS", "FF", "SF"]);

for (const req of project.requirements || []) {
  if (!validPriorities.has(req.priority)) fail(`Requirement ${req.id} has invalid priority.`);
}

for (const sprint of project.sprints || []) {
  if (!isDate(sprint.start) || !isDate(sprint.end)) fail(`Sprint ${sprint.id} must use YYYY-MM-DD dates.`);
  if (isDate(sprint.start) && isDate(sprint.end) && sprint.end < sprint.start) fail(`Sprint ${sprint.id} ends before it starts.`);
}

for (const task of project.tasks || []) {
  if (!requirements.has(task.requirementId)) fail(`Task ${task.id} references missing requirement ${task.requirementId}.`);
  if (!resources.has(task.assigneeId)) fail(`Task ${task.id} references missing resource ${task.assigneeId}.`);
  if (!sprints.has(task.sprintId)) fail(`Task ${task.id} references missing sprint ${task.sprintId}.`);
  if (!isDate(task.start) || !isDate(task.end)) fail(`Task ${task.id} must use YYYY-MM-DD dates.`);
  if (isDate(task.start) && isDate(task.end) && task.end < task.start) fail(`Task ${task.id} ends before it starts.`);
  if (!(Number(task.estimatedHours) > 0)) fail(`Task ${task.id} must have estimatedHours > 0.`);
  if (!(Number(task.progress) >= 0 && Number(task.progress) <= 100)) fail(`Task ${task.id} progress must be 0..100.`);
  if (!validStatuses.has(task.status)) fail(`Task ${task.id} has invalid status.`);
}

const graph = new Map();
for (const dep of project.dependencies || []) {
  if (!validDependencyTypes.has(dep.type)) fail(`Dependency ${dep.id} has invalid type.`);
  if (!tasks.has(dep.fromTaskId)) fail(`Dependency ${dep.id} references missing fromTaskId ${dep.fromTaskId}.`);
  if (!tasks.has(dep.toTaskId)) fail(`Dependency ${dep.id} references missing toTaskId ${dep.toTaskId}.`);
  if (dep.fromTaskId === dep.toTaskId) fail(`Dependency ${dep.id} references the same task on both sides.`);
  if (!graph.has(dep.fromTaskId)) graph.set(dep.fromTaskId, []);
  graph.get(dep.fromTaskId).push(dep.toTaskId);
}

const visiting = new Set();
const visited = new Set();
const visit = (taskId) => {
  if (visiting.has(taskId)) return true;
  if (visited.has(taskId)) return false;
  visiting.add(taskId);
  for (const next of graph.get(taskId) || []) {
    if (visit(next)) return true;
  }
  visiting.delete(taskId);
  visited.add(taskId);
  return false;
};
for (const taskId of graph.keys()) {
  if (visit(taskId)) {
    fail("Dependencies contain a cycle.");
    break;
  }
}

for (const record of project.taskRecords || []) {
  if (!tasks.has(record.taskId)) fail(`Task record ${record.id} references missing task ${record.taskId}.`);
  if (!(Number(record.hours) >= 0)) fail(`Task record ${record.id} hours must be >= 0.`);
  if (!(Number(record.progress) >= 0 && Number(record.progress) <= 100)) fail(`Task record ${record.id} progress must be 0..100.`);
}

if (!process.exitCode) {
  console.log("LocalGantt JSON validation passed.");
}

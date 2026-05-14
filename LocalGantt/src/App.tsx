import React, { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { Line } from "@ant-design/charts";
import {
  Button as AntButton,
  Card as AntCard,
  ConfigProvider,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tooltip,
  Tag,
  Table,
  Tabs as AntTabs,
  TimePicker,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import enUS from "antd/locale/en_US";
import zhCN from "antd/locale/zh_CN";
import type { ColumnsType } from "antd/es/table";

const STORAGE_KEY = "local-gantt-app-v1";
const LOCALE_STORAGE_KEY = "local-gantt-locale";
const SCHEMA_VERSION = 1;

type Priority = "低" | "中" | "高";
type WorkStatus = "待办" | "进行中" | "已完成" | "暂停";
type DisplayStatus = WorkStatus | "延期";
type DependencyType = "FS" | "SS" | "FF" | "SF";
type AppLocale = "zh-CN" | "en-US";

type Requirement = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
};

type Resource = {
  id: string;
  name: string;
  role: string;
  capacity: number;
};

type Sprint = {
  id: string;
  name: string;
  start: string;
  end: string;
};

type Task = {
  id: string;
  title: string;
  notes: string;
  requirementId: string;
  assigneeId: string;
  sprintId: string;
  start: string;
  end: string;
  estimatedHours: number;
  progress: number;
  status: WorkStatus;
};

type TaskRecord = {
  id: string;
  taskId: string;
  at: string;
  hours: number;
  progress: number;
  notes: string;
};

type Dependency = {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  type: DependencyType;
};

type PredecessorDraft = {
  id: string;
  fromTaskId: string;
  type: DependencyType;
};

type TaskDialogDraft = Task & {
  predecessors: PredecessorDraft[];
};

type AppData = {
  schemaVersion: number;
  projectName: string;
  projectDescription: string;
  locale?: AppLocale;
  requirements: Requirement[];
  resources: Resource[];
  sprints: Sprint[];
  tasks: Task[];
  dependencies: Dependency[];
  taskRecords: TaskRecord[];
};

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const extractNumericId = (value: string) => {
  const match = String(value || "").match(/(\d+)(?!.*\d)/);
  return match ? Number(match[1]) : 0;
};

const today = new Date();
const isValidDate = (d: Date) => !Number.isNaN(d.getTime());
const toDate = (d: string) => {
  const dt = new Date(`${d}T00:00:00`);
  return isValidDate(dt) ? dt : new Date();
};
const toISO = (date: Date) => (isValidDate(date) ? date.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
const diffDays = (a: string, b: string) => {
  const da = toDate(a);
  const db = toDate(b);
  return Math.round((db.getTime() - da.getTime()) / 86400000);
};
const pad2 = (n: number) => String(n).padStart(2, "0");
const toLocalDateTimeInput = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
const timestamp = (d: Date) =>
  `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}-${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
const fileSafe = (name: string) => name.trim().replace(/[\\/:*?"<>|]/g, "-");
const Textarea = Input.TextArea;

type TaskConstraint = {
  minStart?: string;
  minEnd?: string;
  hints: string[];
};

type DependencyAnchor = "left" | "right";
type GanttDependencyPath = {
  id: string;
  path: string;
};
type IdSpec = {
  prefix: string;
  minDigits: number;
};

const TASK_ID_SPEC: IdSpec = { prefix: "T", minDigits: 3 };
const REQUIREMENT_ID_SPEC: IdSpec = { prefix: "R", minDigits: 3 };
const RESOURCE_ID_SPEC: IdSpec = { prefix: "P", minDigits: 3 };
const SPRINT_ID_SPEC: IdSpec = { prefix: "S", minDigits: 2 };

const copy = {
  "zh-CN": {
    langToggle: "English",
    edit: "编辑",
    saveProject: "保存项目",
    openProject: "打开项目",
    gantt: "甘特图",
    dashboard: "燃尽图",
    tasks: "任务",
    requirements: "需求",
    resources: "资源",
    sprints: "迭代",
    assignee: "负责人",
    unassigned: "未分配",
    selectSprint: "选择迭代",
    selectStatus: "选择状态",
    selectAssignee: "选择负责人",
    selectRequirement: "选择需求",
    selectPriority: "选择优先级",
    selectPredecessor: "选择前置任务",
    type: "类型",
    search: "搜索",
    pleaseSelect: "请选择",
    allStatus: "全部状态",
    allPriority: "全部优先级",
    allRoles: "全部角色",
    all: "全部",
    filter: "筛选",
    status: "状态",
    priority: "优先级",
    role: "角色",
    addTask: "新增任务",
    addRequirement: "新增需求",
    addResource: "新增资源",
    addSprint: "新增迭代",
    id: "ID",
    task: "任务",
    requirement: "需求",
    dependency: "依赖",
    dateRange: "起止日期",
    hours: "工时",
    progress: "进度",
    actions: "操作",
    title: "标题",
    taskCount: "任务数",
    description: "描述",
    name: "名称",
    personName: "姓名",
    start: "开始",
    end: "结束",
    noTasks: "暂无任务",
    noRequirements: "暂无需求",
    noResources: "暂无资源",
    noSprints: "暂无迭代",
    editTask: "编辑任务",
    editRequirement: "编辑需求",
    editResource: "编辑资源",
    editSprint: "编辑迭代",
    record: "记录",
    projectSettings: "项目设置",
    save: "保存",
    cancel: "取消",
    delete: "删除",
    confirmDeleteTask: "确认删除任务？",
    confirmDeleteRequirement: "确认删除需求？",
    confirmDeleteResource: "确认删除资源？",
    confirmDeleteSprint: "确认删除迭代？",
    dependencyConstraint: "依赖约束",
    remove: "移除",
    addDependencyTask: "新增依赖任务",
    notes: "说明",
    taskStatus: "状态",
    startDate: "开始日期",
    endDate: "结束日期",
    progressRange0: "进度%(0-100)",
    estimatedHours: "预计工时",
    linkedRequirement: "关联需求",
    sprint: "所属迭代",
    dependencyTasks: "依赖任务",
    recordTime: "记录时间",
    estimatedTotalHours: "预计总工时",
    recordedHours: "已记录工时",
    taskProgressRange: "任务进度%(1-100)",
    todayHours: "今日花费工时",
    progressNotes: "进度说明",
    history: "历史记录",
    now: "现在",
    hourUnit: "小时",
    totalHoursPrefix: "累计总工时",
    hourOverrunWarning: "，已超过预计总工时，请注意！",
    noHistory: "暂无历史记录",
    projectName: "项目名称",
    projectDescription: "项目简介",
    noBurndownData: "当前迭代暂无数据",
    remainingHours: "剩余工时",
    importResult: "导入结果",
    importFailed: "导入失败",
    importFailedMessage: "请确认选择的是有效的项目 JSON 文件。",
    formWarningTitle: "请完善表单",
    statusTodo: "待办",
    statusDoing: "进行中",
    statusDone: "已完成",
    statusPaused: "暂停",
    statusDelayed: "延期",
    priorityLow: "低",
    priorityMedium: "中",
    priorityHigh: "高",
    unknownTask: "未知任务",
  },
  "en-US": {
    langToggle: "中文",
    edit: "Edit",
    saveProject: "Save Project",
    openProject: "Open Project",
    gantt: "Gantt",
    dashboard: "Burndown",
    tasks: "Tasks",
    requirements: "Requirements",
    resources: "Resources",
    sprints: "Sprints",
    assignee: "Assignee",
    unassigned: "Unassigned",
    selectSprint: "Select sprint",
    selectStatus: "Select status",
    selectAssignee: "Select assignee",
    selectRequirement: "Select requirement",
    selectPriority: "Select priority",
    selectPredecessor: "Select predecessor",
    type: "Type",
    search: "Search",
    pleaseSelect: "Select",
    allStatus: "All statuses",
    allPriority: "All priorities",
    allRoles: "All roles",
    all: "All",
    filter: "Filter",
    status: "Status",
    priority: "Priority",
    role: "Role",
    addTask: "Add Task",
    addRequirement: "Add Requirement",
    addResource: "Add Resource",
    addSprint: "Add Sprint",
    id: "ID",
    task: "Task",
    requirement: "Requirement",
    dependency: "Dependencies",
    dateRange: "Dates",
    hours: "Hours",
    progress: "Progress",
    actions: "Actions",
    title: "Title",
    taskCount: "Tasks",
    description: "Description",
    name: "Name",
    personName: "Name",
    start: "Start",
    end: "End",
    noTasks: "No tasks",
    noRequirements: "No requirements",
    noResources: "No resources",
    noSprints: "No sprints",
    editTask: "Edit Task",
    editRequirement: "Edit Requirement",
    editResource: "Edit Resource",
    editSprint: "Edit Sprint",
    record: "Record",
    projectSettings: "Project Settings",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    confirmDeleteTask: "Delete task?",
    confirmDeleteRequirement: "Delete requirement?",
    confirmDeleteResource: "Delete resource?",
    confirmDeleteSprint: "Delete sprint?",
    dependencyConstraint: "Dependency constraints",
    remove: "Remove",
    addDependencyTask: "Add dependency",
    notes: "Notes",
    taskStatus: "Status",
    startDate: "Start date",
    endDate: "End date",
    progressRange0: "Progress %(0-100)",
    estimatedHours: "Estimated hours",
    linkedRequirement: "Linked requirement",
    sprint: "Sprint",
    dependencyTasks: "Dependencies",
    recordTime: "Record time",
    estimatedTotalHours: "Estimated total hours",
    recordedHours: "Recorded hours",
    taskProgressRange: "Task progress %(1-100)",
    todayHours: "Hours today",
    progressNotes: "Progress notes",
    history: "History",
    now: "Now",
    hourUnit: "hours",
    totalHoursPrefix: "Total hours ",
    hourOverrunWarning: ", exceeds estimated hours. Please check.",
    noHistory: "No history",
    projectName: "Project name",
    projectDescription: "Project description",
    noBurndownData: "No data for this sprint",
    remainingHours: "Remaining hours",
    importResult: "Import Result",
    importFailed: "Import Failed",
    importFailedMessage: "Please select a valid project JSON file.",
    formWarningTitle: "Complete the form",
    statusTodo: "To do",
    statusDoing: "In progress",
    statusDone: "Done",
    statusPaused: "Paused",
    statusDelayed: "Delayed",
    priorityLow: "Low",
    priorityMedium: "Medium",
    priorityHigh: "High",
    unknownTask: "Unknown task",
  },
} as const;

const maxIsoDate = (a?: string, b?: string) => {
  if (!a) return b;
  if (!b) return a;
  return toDate(a) > toDate(b) ? a : b;
};
const normalizeHours = (value: unknown) => Math.max(0, Math.round((Number(value) || 0) * 10) / 10);
const formatHours = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1);
const formatEntityId = (spec: IdSpec, numericId: number) => `${spec.prefix}-${String(numericId).padStart(spec.minDigits, "0")}`;
const nextEntityId = (items: Array<{ id: string }>, spec: IdSpec) => formatEntityId(spec, items.reduce((max, item) => Math.max(max, extractNumericId(item.id)), 0) + 1);

function normalizeEntityIds<T extends { id: string }>(items: T[], spec: IdSpec) {
  const usedNumbers = new Set<number>();
  const idMap: Record<string, string> = {};
  let nextNumber = 1;

  const takeNumber = (preferred: number) => {
    let value = preferred > 0 && !usedNumbers.has(preferred) ? preferred : nextNumber;
    while (value <= 0 || usedNumbers.has(value)) {
      value += 1;
    }
    usedNumbers.add(value);
    nextNumber = Math.max(nextNumber, value + 1);
    return value;
  };

  const normalizedItems = items.map((item) => {
    const numericId = takeNumber(extractNumericId(item.id));
    const nextId = formatEntityId(spec, numericId);
    idMap[item.id] = nextId;
    return {
      ...item,
      id: nextId,
    };
  });

  return { items: normalizedItems, idMap };
}

const remapLinkedId = (value: string, idMap: Record<string, string>, validIds: Set<string>) => {
  if (!value) return "";
  const mapped = idMap[value] ?? value;
  return validIds.has(mapped) ? mapped : "";
};

const normalizeTaskCompletion = (task: Task, completionDate?: string): Task => {
  const normalizedProgress = Math.max(0, Math.min(100, Math.round(Number(task.progress) || 0)));
  const shouldComplete = task.status === "已完成" || normalizedProgress >= 100;
  if (!shouldComplete) {
    return {
      ...task,
      progress: normalizedProgress,
    };
  }
  const finishedOn = completionDate || toISO(new Date());
  const nextStart = toDate(task.start) > toDate(finishedOn) ? finishedOn : task.start;
  return {
    ...task,
    start: nextStart,
    end: finishedOn,
    progress: 100,
    status: "已完成",
  };
};

function getTaskConstraint(
  predecessors: Array<{ fromTaskId: string; type: DependencyType }>,
  taskLookup: Record<string, Task>,
): TaskConstraint {
  let minStart: string | undefined;
  let minEnd: string | undefined;
  const hints: string[] = [];

  for (const predecessor of predecessors) {
    const task = taskLookup[predecessor.fromTaskId];
    if (!task) continue;
    if (predecessor.type === "FS") {
      const value = toISO(addDays(toDate(task.end), 1));
      minStart = maxIsoDate(minStart, value);
      hints.push(`${task.id} 完成后的次日才能开始: ${value}`);
    } else if (predecessor.type === "SS") {
      const value = task.start;
      minStart = maxIsoDate(minStart, value);
      hints.push(`${task.id} 开始后才能开始: ${value}`);
    } else if (predecessor.type === "FF") {
      const value = task.end;
      minEnd = maxIsoDate(minEnd, value);
      hints.push(`${task.id} 完成前不能结束: ${value}`);
    } else if (predecessor.type === "SF") {
      const value = task.start;
      minEnd = maxIsoDate(minEnd, value);
      hints.push(`${task.id} 开始前不能结束: ${value}`);
    }
  }

  return { minStart, minEnd, hints };
}

function applyTaskConstraint<T extends { start: string; end: string }>(task: T, constraint: TaskConstraint): T {
  const fallback = task.start || task.end || toISO(new Date());
  const duration = Math.max(0, diffDays(task.start || fallback, task.end || fallback));
  let start = task.start || fallback;
  let end = task.end || start;

  if (constraint.minStart && toDate(start) < toDate(constraint.minStart)) {
    start = constraint.minStart;
    end = toISO(addDays(toDate(start), duration));
  }

  const effectiveMinEnd = maxIsoDate(constraint.minEnd, start);
  if (effectiveMinEnd && toDate(end) < toDate(effectiveMinEnd)) {
    end = effectiveMinEnd;
  }

  if (toDate(end) < toDate(start)) {
    end = start;
  }

  if (start === task.start && end === task.end) {
    return task;
  }

  return {
    ...task,
    start,
    end,
  };
}

function hasDependencyCycle(dependencies: Dependency[]) {
  const graph = new Map<string, string[]>();
  for (const dependency of dependencies) {
    if (!graph.has(dependency.fromTaskId)) {
      graph.set(dependency.fromTaskId, []);
    }
    graph.get(dependency.fromTaskId)?.push(dependency.toTaskId);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (taskId: string): boolean => {
    if (visiting.has(taskId)) return true;
    if (visited.has(taskId)) return false;
    visiting.add(taskId);
    for (const nextId of graph.get(taskId) || []) {
      if (visit(nextId)) return true;
    }
    visiting.delete(taskId);
    visited.add(taskId);
    return false;
  };

  for (const taskId of graph.keys()) {
    if (visit(taskId)) return true;
  }
  return false;
}

function applyDependencySchedule(tasks: Task[], dependencies: Dependency[]) {
  if (!tasks.length || !dependencies.length || hasDependencyCycle(dependencies)) {
    return tasks;
  }

  let nextTasks = tasks.map((task) => ({ ...task }));
  const maxIterations = Math.max(tasks.length * dependencies.length, 1) + 2;

  for (let i = 0; i < maxIterations; i += 1) {
    let changed = false;
    const taskLookup = Object.fromEntries(nextTasks.map((task) => [task.id, task]));
    nextTasks = nextTasks.map((task) => {
      const constraint = getTaskConstraint(
        dependencies
          .filter((dependency) => dependency.toTaskId === task.id)
          .map((dependency) => ({ fromTaskId: dependency.fromTaskId, type: dependency.type })),
        taskLookup,
      );
      const scheduled = applyTaskConstraint(task, constraint);
      if (scheduled.start !== task.start || scheduled.end !== task.end) {
        changed = true;
      }
      return scheduled;
    });
    if (!changed) break;
  }

  return nextTasks;
}

function getDependencyAnchors(type: DependencyType): { from: DependencyAnchor; to: DependencyAnchor } {
  if (type === "FS") {
    return { from: "right", to: "left" };
  }
  if (type === "SS") {
    return { from: "left", to: "left" };
  }
  if (type === "FF") {
    return { from: "right", to: "right" };
  }
  return { from: "left", to: "right" };
}

function buildDependencyPath({
  startX,
  startY,
  endX,
  endY,
  fromAnchor,
  toAnchor,
}: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  fromAnchor: DependencyAnchor;
  toAnchor: DependencyAnchor;
}) {
  if (startY === endY) {
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  }

  const stub = 12;
  const visibleGap = 6;
  const loopGap = 20;
  const startVisibleX = startX + (fromAnchor === "right" ? visibleGap : -visibleGap);
  const endVisibleX = endX + (toAnchor === "right" ? visibleGap : -visibleGap);
  const startStubX = startVisibleX + (fromAnchor === "right" ? stub : -stub);
  const endStubX = endVisibleX + (toAnchor === "right" ? stub : -stub);

  // When the successor starts on the same day the predecessor ends, a direct fold
  // looks like the arrow is "going backwards". Route it outward first to form an S/ji shape.
  const needsOutwardLoop =
    (fromAnchor === "right" && toAnchor === "left" && endVisibleX <= startVisibleX + stub) ||
    (fromAnchor === "left" && toAnchor === "right" && endVisibleX >= startVisibleX - stub);

  if (needsOutwardLoop) {
    const outwardX =
      fromAnchor === "right"
        ? Math.max(startVisibleX, endVisibleX) + stub + loopGap
        : Math.min(startVisibleX, endVisibleX) - stub - loopGap;
    const midY = startY + (endY - startY) / 2;
    const rawPoints: Array<[number, number]> = [
      [startVisibleX, startY],
      [startStubX, startY],
      [outwardX, startY],
      [outwardX, midY],
      [endStubX, midY],
      [endStubX, endY],
      [endVisibleX, endY],
    ];
    const points = rawPoints.filter((point, index, arr) => index === 0 || point[0] !== arr[index - 1][0] || point[1] !== arr[index - 1][1]);
    return points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  }

  const trunkX = toAnchor === "left" ? Math.min(startStubX, endStubX) : Math.max(startStubX, endStubX);

  const rawPoints: Array<[number, number]> = [
    [startVisibleX, startY],
    [startStubX, startY],
    [trunkX, startY],
    [trunkX, endY],
    [endStubX, endY],
    [endVisibleX, endY],
  ];
  const points = rawPoints.filter((point, index, arr) => index === 0 || point[0] !== arr[index - 1][0] || point[1] !== arr[index - 1][1]);

  return points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
}

function Button({
  variant,
  type,
  children,
  ...props
}: Omit<React.ComponentProps<typeof AntButton>, "variant"> & { variant?: "outline" | "default" }) {
  return (
    <AntButton type={variant === "outline" ? "default" : (type ?? "primary")} {...props}>
      {children}
    </AntButton>
  );
}

const seedData: AppData = {
  schemaVersion: SCHEMA_VERSION,
  projectName: "自定义项目",
  projectDescription: "最小单位本地化管理项目和更新进度",
  locale: "zh-CN",
  requirements: [
    { id: "R-001", title: "登录系统", description: "支持用户登录、注册和基础权限", priority: "高" },
    { id: "R-002", title: "卡片练习", description: "支持卡片翻转、练习记录和进度统计", priority: "高" },
  ],
  resources: [
    { id: "P-001", name: "Jill", role: "Product", capacity: 6 },
    { id: "P-002", name: "Frontend Dev", role: "Frontend", capacity: 7 },
    { id: "P-003", name: "Backend Dev", role: "Backend", capacity: 7 },
    { id: "P-004", name: "QA", role: "Testing", capacity: 6 },
  ],
  sprints: [
    { id: "S-01", name: "迭代 1", start: toISO(today), end: toISO(addDays(today, 13)) },
  ],
  tasks: [
    { id: "T-001", title: "登录页原型", notes: "", requirementId: "R-001", assigneeId: "P-001", sprintId: "S-01", start: toISO(today), end: toISO(addDays(today, 2)), estimatedHours: 12, progress: 80, status: "进行中" },
    { id: "T-002", title: "登录前端开发", notes: "", requirementId: "R-001", assigneeId: "P-002", sprintId: "S-01", start: toISO(addDays(today, 3)), end: toISO(addDays(today, 7)), estimatedHours: 32, progress: 20, status: "进行中" },
    { id: "T-003", title: "登录接口开发", notes: "", requirementId: "R-001", assigneeId: "P-003", sprintId: "S-01", start: toISO(addDays(today, 3)), end: toISO(addDays(today, 6)), estimatedHours: 24, progress: 30, status: "进行中" },
    { id: "T-004", title: "登录联调测试", notes: "", requirementId: "R-001", assigneeId: "P-004", sprintId: "S-01", start: toISO(addDays(today, 8)), end: toISO(addDays(today, 10)), estimatedHours: 16, progress: 0, status: "待办" },
  ],
  dependencies: [
    { id: "DEP-001", fromTaskId: "T-001", toTaskId: "T-002", type: "FS" },
    { id: "DEP-002", fromTaskId: "T-001", toTaskId: "T-003", type: "FS" },
    { id: "DEP-003", fromTaskId: "T-002", toTaskId: "T-004", type: "FS" },
    { id: "DEP-004", fromTaskId: "T-003", toTaskId: "T-004", type: "FS" },
  ],
  taskRecords: [],
};

function normalizeData(raw: unknown): AppData {
  const base = seedData;
  const src = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};

  const projectName = typeof src.projectName === "string" && src.projectName.trim() ? src.projectName : base.projectName;
  const projectDescription =
    typeof src.projectDescription === "string" && src.projectDescription.trim() ? src.projectDescription : base.projectDescription;
  const schemaVersion = typeof src.schemaVersion === "number" && src.schemaVersion > 0 ? Math.floor(src.schemaVersion) : SCHEMA_VERSION;
  const locale = src.locale === "zh-CN" || src.locale === "en-US" ? src.locale : undefined;
  const rawRequirements = Array.isArray(src.requirements)
    ? (src.requirements as Array<Record<string, unknown>>).map(
        (requirement): Requirement => ({
          id: typeof requirement.id === "string" ? requirement.id : uid("REQ"),
          title: typeof requirement.title === "string" ? requirement.title : "",
          description: typeof requirement.description === "string" ? requirement.description : "",
          priority: requirement.priority === "高" || requirement.priority === "中" || requirement.priority === "低" ? requirement.priority : "中",
        }),
      )
    : base.requirements;
  const rawResources = Array.isArray(src.resources)
    ? (src.resources as Array<Record<string, unknown>>).map(
        (resource): Resource => ({
          id: typeof resource.id === "string" ? resource.id : uid("P"),
          name: typeof resource.name === "string" ? resource.name : "",
          role: typeof resource.role === "string" ? resource.role : "",
          capacity: Math.max(0, Number(resource.capacity) || 0),
        }),
      )
    : base.resources;
  const rawSprints = Array.isArray(src.sprints)
    ? (src.sprints as Array<Record<string, unknown>>).map(
        (sprint): Sprint => ({
          id: typeof sprint.id === "string" ? sprint.id : uid("S"),
          name: typeof sprint.name === "string" ? sprint.name : "",
          start: typeof sprint.start === "string" ? sprint.start : toISO(today),
          end: typeof sprint.end === "string" ? sprint.end : toISO(today),
        }),
      )
    : base.sprints;
  const rawTasks = Array.isArray(src.tasks)
    ? (src.tasks as Array<Record<string, unknown>>).map((t) => ({
        ...(t as Task),
        id: typeof t.id === "string" ? t.id : uid("T"),
        notes: typeof t.notes === "string" ? t.notes : "",
        requirementId: typeof t.requirementId === "string" ? t.requirementId : "",
        assigneeId: typeof t.assigneeId === "string" ? t.assigneeId : "",
        sprintId: typeof t.sprintId === "string" ? t.sprintId : "",
        start: typeof t.start === "string" ? t.start : toISO(today),
        end: typeof t.end === "string" ? t.end : toISO(today),
        estimatedHours: normalizeHours(t.estimatedHours) || 8,
        progress: Math.max(0, Math.min(100, Math.round(Number(t.progress) || 0))),
        status: (t.status === "待办" || t.status === "进行中" || t.status === "已完成" || t.status === "暂停" ? t.status : "待办") as WorkStatus,
      }))
    : base.tasks;
  const { items: requirements, idMap: requirementIdMap } = normalizeEntityIds(rawRequirements, REQUIREMENT_ID_SPEC);
  const { items: resources, idMap: resourceIdMap } = normalizeEntityIds(rawResources, RESOURCE_ID_SPEC);
  const { items: sprints, idMap: sprintIdMap } = normalizeEntityIds(rawSprints, SPRINT_ID_SPEC);
  const { items: normalizedTaskIds, idMap: taskIdMap } = normalizeEntityIds(rawTasks, TASK_ID_SPEC);
  const validRequirementIds = new Set(requirements.map((item) => item.id));
  const validResourceIds = new Set(resources.map((item) => item.id));
  const validSprintIds = new Set(sprints.map((item) => item.id));
  const tasks = normalizedTaskIds.map((task) => ({
    ...task,
    requirementId: remapLinkedId(task.requirementId, requirementIdMap, validRequirementIds),
    assigneeId: remapLinkedId(task.assigneeId, resourceIdMap, validResourceIds),
    sprintId: remapLinkedId(task.sprintId, sprintIdMap, validSprintIds),
  }));
  const validTaskIds = new Set(tasks.map((item) => item.id));
  const rawDependencies: Array<Record<string, unknown>> = Array.isArray(src.dependencies)
    ? (src.dependencies as Array<Record<string, unknown>>)
    : (base.dependencies as Array<Record<string, unknown>>);
  const dependencies = rawDependencies
    .map(
      (dependency): Dependency => ({
        id: typeof dependency.id === "string" ? dependency.id : uid("DEP"),
        fromTaskId: typeof dependency.fromTaskId === "string" ? dependency.fromTaskId : "",
        toTaskId: typeof dependency.toTaskId === "string" ? dependency.toTaskId : "",
        type: dependency.type === "FS" || dependency.type === "SS" || dependency.type === "FF" || dependency.type === "SF" ? dependency.type : "FS",
      }),
    )
    .map((dependency: Dependency) => ({
      ...dependency,
      fromTaskId: remapLinkedId(dependency.fromTaskId, taskIdMap, validTaskIds),
      toTaskId: remapLinkedId(dependency.toTaskId, taskIdMap, validTaskIds),
    }))
    .filter((dependency) => dependency.fromTaskId && dependency.toTaskId && dependency.fromTaskId !== dependency.toTaskId);
  const rawTaskRecords: Array<Record<string, unknown>> = Array.isArray(src.taskRecords)
    ? (src.taskRecords as Array<Record<string, unknown>>)
    : (base.taskRecords as Array<Record<string, unknown>>);
  const taskRecords = rawTaskRecords
    .map(
      (record): TaskRecord => ({
        id: typeof record.id === "string" ? record.id : uid("REC"),
        taskId: typeof record.taskId === "string" ? record.taskId : "",
        at: typeof record.at === "string" ? record.at : new Date().toISOString(),
        hours: normalizeHours(record.hours),
        progress: Math.max(0, Math.min(100, Math.round(Number(record.progress) || 0))),
        notes: typeof record.notes === "string" ? record.notes : "",
      }),
    )
    .map((record: TaskRecord) => ({
      ...record,
      taskId: remapLinkedId(record.taskId, taskIdMap, validTaskIds),
    }))
    .filter((record) => record.taskId);
  const scheduledTasks = applyDependencySchedule(tasks.map((task) => normalizeTaskCompletion(task)), dependencies);

  return {
    schemaVersion,
    projectName,
    projectDescription,
    locale,
    requirements,
    resources,
    sprints,
    tasks: scheduledTasks,
    dependencies,
    taskRecords,
  };
}

function analyzeImportedData(raw: unknown): { data: AppData; message: string } {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("文件内容不是有效的项目对象。");
  }

  const src = raw as Record<string, unknown>;
  const knownKeys = ["schemaVersion", "projectName", "projectDescription", "locale", "requirements", "resources", "sprints", "tasks", "dependencies", "taskRecords"];
  if (!knownKeys.some((key) => key in src)) {
    throw new Error("这不是 LocalGantt 的项目 JSON 文件。");
  }

  const invalidArrayFields = ["requirements", "resources", "sprints", "tasks", "dependencies", "taskRecords"].filter(
    (key) => key in src && !Array.isArray(src[key]),
  );
  if (invalidArrayFields.length) {
    throw new Error(`以下字段格式不正确：${invalidArrayFields.join("、")}。`);
  }

  const data = normalizeData(raw);
  const fallbackFields = knownKeys.filter((key) => !(key in src));
  const lines = [
    "导入成功",
    `项目：${data.projectName || seedData.projectName}`,
    `简介：${data.projectDescription || seedData.projectDescription}`,
    `需求：${data.requirements.length} 条`,
    `资源：${data.resources.length} 条`,
    `迭代：${data.sprints.length} 条`,
    `任务：${data.tasks.length} 条`,
    `依赖：${data.dependencies.length} 条`,
    `记录：${data.taskRecords.length} 条`,
  ];

  if (fallbackFields.length) {
    lines.push(`缺少字段，已按默认值补齐：${fallbackFields.join("、")}`);
  }

  return { data, message: lines.join("\n") };
}

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return normalizeData(raw ? JSON.parse(raw) : seedData);
  } catch {
    return normalizeData(seedData);
  }
}

function saveData(data: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("保存项目数据失败", error);
  }
}

export default function PersonalOfflineGanttApp() {
  const [data, setData] = useState(loadData);
  const [locale, setLocale] = useState<AppLocale>(() => {
    try {
      return localStorage.getItem(LOCALE_STORAGE_KEY) === "en-US" ? "en-US" : "zh-CN";
    } catch {
      return "zh-CN";
    }
  });
  const [selectedSprintId, setSelectedSprintId] = useState(data.sprints[0]?.id || "");
  const [view, setView] = useState<"gantt" | "dashboard">("gantt");
  const [manageTab, setManageTab] = useState<"tasks" | "requirements" | "resources" | "sprints">("tasks");
  const [hoverTaskId, setHoverTaskId] = useState<string | null>(null);
  const [ganttDependencyPaths, setGanttDependencyPaths] = useState<GanttDependencyPath[]>([]);
  const [ganttOverlaySize, setGanttOverlaySize] = useState({ width: 0, height: 0 });
  const [listSearch, setListSearch] = useState("");
  const [listFilter, setListFilter] = useState("All");
  const [dialog, setDialog] = useState<
    | null
    | { kind: "task"; mode: "add" | "edit"; draft: TaskDialogDraft }
    | { kind: "requirement"; mode: "add" | "edit"; draft: Requirement }
    | { kind: "resource"; mode: "add" | "edit"; draft: Resource }
    | { kind: "sprint"; mode: "add" | "edit"; draft: Sprint }
    | { kind: "record"; taskId: string; draft: { at: string; progress: number; hours: number; notes: string } }
    | { kind: "settings"; draft: { projectName: string; projectDescription: string } }
  >(null);
  const dataRef = useRef(data);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const ganttWrapRef = useRef<HTMLDivElement | null>(null);
  const ganttOverlayRef = useRef<HTMLDivElement | null>(null);
  const t = (key: keyof typeof copy["zh-CN"]) => copy[locale][key];
  const statusText = (status: DisplayStatus) =>
    status === "待办"
      ? t("statusTodo")
      : status === "进行中"
        ? t("statusDoing")
        : status === "已完成"
          ? t("statusDone")
          : status === "暂停"
            ? t("statusPaused")
            : t("statusDelayed");
  const priorityText = (priority: Priority) => (priority === "高" ? t("priorityHigh") : priority === "中" ? t("priorityMedium") : t("priorityLow"));

  const update = (next: AppData) => {
    dataRef.current = next;
    setData(next);
  };

  const resMap = useMemo(() => Object.fromEntries(data.resources.map((r) => [r.id, r])), [data.resources]);
  const sprintMap = useMemo(() => Object.fromEntries(data.sprints.map((s) => [s.id, s])), [data.sprints]);
  const reqMap = useMemo(() => Object.fromEntries(data.requirements.map((r) => [r.id, r])), [data.requirements]);
  const taskMap = useMemo(() => Object.fromEntries(data.tasks.map((t) => [t.id, t])), [data.tasks]);

  useEffect(() => {
    dataRef.current = data;
    saveData(data);
  }, [data]);
  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch (error) {
      console.error("保存语言设置失败", error);
    }
  }, [locale]);

  const allDates = useMemo(() => {
    const sprint = sprintMap[selectedSprintId];
    if (sprint) {
      const days = diffDays(sprint.start, sprint.end) + 1;
      return Array.from({ length: Math.max(days, 1) }, (_, i) => toISO(addDays(toDate(sprint.start), i)));
    }
    if (!data.tasks.length) return [];
    const min = data.tasks.reduce((m, t) => (toDate(t.start) < toDate(m) ? t.start : m), data.tasks[0].start);
    const max = data.tasks.reduce((m, t) => (toDate(t.end) > toDate(m) ? t.end : m), data.tasks[0].end);
    const days = diffDays(min, max) + 1;
    return Array.from({ length: Math.max(days, 1) }, (_, i) => toISO(addDays(toDate(min), i)));
  }, [data.tasks, selectedSprintId, sprintMap]);

  const burndown = useMemo(() => {
    const sprint = sprintMap[selectedSprintId];
    if (!sprint) return [];
    const sprintTasks = data.tasks.filter((t) => t.sprintId === selectedSprintId);
    const sprintTaskIds = new Set(sprintTasks.map((task) => task.id));
    const totalEstimatedHours = sprintTasks.reduce((sum, task) => sum + normalizeHours(task.estimatedHours), 0);
    const days = diffDays(sprint.start, sprint.end) + 1;
    return Array.from({ length: Math.max(days, 1) }, (_, i) => {
      const date = toISO(addDays(toDate(sprint.start), i));
      const recordedHours =
        i === 0
          ? 0
          : data.taskRecords
              .filter((record) => sprintTaskIds.has(record.taskId) && toLocalDateTimeInput(new Date(record.at)).slice(0, 10) <= date)
              .reduce((sum, record) => sum + normalizeHours(record.hours), 0);
      return { date: date.slice(5), remainingHours: Math.max(0, totalEstimatedHours - recordedHours) };
    });
  }, [data.taskRecords, data.tasks, selectedSprintId, sprintMap]);

  const ganttTasks = useMemo(() => {
    const sprint = sprintMap[selectedSprintId];
    if (!sprint) return data.tasks;
    return data.tasks.filter((t) => t.sprintId === selectedSprintId);
  }, [data.tasks, selectedSprintId, sprintMap]);

  const patchRequirement = (id: string, next: Partial<Requirement>) => update({ ...data, requirements: data.requirements.map((x) => (x.id === id ? { ...x, ...next } : x)) });
  const patchResource = (id: string, next: Partial<Resource>) => update({ ...data, resources: data.resources.map((x) => (x.id === id ? { ...x, ...next } : x)) });
  const patchSprint = (id: string, next: Partial<Sprint>) => update({ ...data, sprints: data.sprints.map((x) => (x.id === id ? { ...x, ...next } : x)) });
  const removeTask = (id: string) =>
    update({
      ...data,
      tasks: data.tasks.filter((x) => x.id !== id),
      dependencies: data.dependencies.filter((d) => d.fromTaskId !== id && d.toTaskId !== id),
    });
  const removeRequirement = (id: string) =>
    data.tasks.some((task) => task.requirementId === id)
      ? void message.warning("请先将关联的任务取消关联或删除后再操作")
      : update({
          ...data,
          requirements: data.requirements.filter((x) => x.id !== id),
        });
  const removeResource = (id: string) =>
    data.tasks.some((task) => task.assigneeId === id)
      ? void message.warning("请先将关联的任务取消关联或删除后再操作")
      : update({
          ...data,
          resources: data.resources.filter((x) => x.id !== id),
        });
  const removeSprint = (id: string) => {
    if (data.tasks.some((task) => task.sprintId === id)) {
      void message.warning("请先将关联的任务取消关联或删除后再操作");
      return;
    }
    const nextSprints = data.sprints.filter((x) => x.id !== id);
    const next: AppData = {
      ...data,
      sprints: nextSprints,
      tasks: data.tasks,
    };
    update(next);
    if (selectedSprintId === id) setSelectedSprintId(nextSprints[0]?.id || "");
  };

  const exportJson = () => {
    const latest = dataRef.current;
    const exported: AppData = { ...latest, schemaVersion: SCHEMA_VERSION, locale };
    saveData(exported);
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const ts = timestamp(new Date());
    const name = exported.projectName?.trim();
    a.download = name ? `LocalGantt-${fileSafe(name)}-${ts}.json` : `LocalGantt-project-${ts}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const { data: next, message } = analyzeImportedData(parsed);
      const nextLocale = next.locale || locale;
      dataRef.current = next;
      setData(next);
      saveData(next);
      setLocale(nextLocale);
      setSelectedSprintId(next.sprints?.[0]?.id || "");
      switchView("gantt");
      switchManageTab("tasks");
      Modal.info({ title: t("importResult"), content: <div style={{ whiteSpace: "pre-line" }}>{message}</div> });
    } catch (error) {
      console.error("导入项目失败", error);
      Modal.error({
        title: t("importFailed"),
        content: error instanceof Error ? error.message : t("importFailedMessage"),
      });
    } finally {
      input.value = "";
    }
  };

  const resetListFilters = () => {
    setListSearch("");
    setListFilter("All");
  };
  const switchView = (nextView: "gantt" | "dashboard") => {
    setView(nextView);
    resetListFilters();
  };
  const switchManageTab = (nextTab: "tasks" | "requirements" | "resources" | "sprints") => {
    setManageTab(nextTab);
    resetListFilters();
  };

  const q = listSearch.trim().toLowerCase();
  const match = (v: string) => (q ? v.toLowerCase().includes(q) : true);

  const taskFilterOptions: Array<{ value: string; label: string }> = [
    { value: "All", label: t("allStatus") },
    { value: "待办", label: t("statusTodo") },
    { value: "进行中", label: t("statusDoing") },
    { value: "延期", label: t("statusDelayed") },
    { value: "已完成", label: t("statusDone") },
    { value: "暂停", label: t("statusPaused") },
  ];
  const requirementFilterOptions: Array<{ value: string; label: string }> = [
    { value: "All", label: t("allPriority") },
    { value: "高", label: t("priorityHigh") },
    { value: "中", label: t("priorityMedium") },
    { value: "低", label: t("priorityLow") },
  ];
  const resourceRoles = useMemo(() => Array.from(new Set(data.resources.map((r) => r.role).filter(Boolean))), [data.resources]);
  const resourceFilterOptions = useMemo<Array<{ value: string; label: string }>>(
    () => [{ value: "All", label: copy[locale].allRoles }, ...resourceRoles.map((r) => ({ value: r, label: r }))],
    [locale, resourceRoles],
  );
  const sprintFilterOptions: Array<{ value: string; label: string }> = [{ value: "All", label: t("all") }];

  const todayIso = toISO(today);
  const taskDisplayStatus = (t: Task): DisplayStatus => (t.status === "进行中" && t.end < todayIso ? "延期" : t.status);
  const filteredTasks = (() => {
    const status = listFilter === "All" ? null : listFilter;
    return data.tasks.filter((t) => {
      const statusOk =
        !status ? true : status === "延期" ? taskDisplayStatus(t) === "延期" : (t.status as string) === status;
      return statusOk && (match(t.id) || match(t.title));
    });
  })();
  const filteredRequirements = (() => {
    const priority = listFilter === "All" ? null : (listFilter as Priority);
    return data.requirements.filter((r) => (priority ? r.priority === priority : true) && (match(r.id) || match(r.title) || match(r.description)));
  })();
  const filteredResources = (() => {
    const role = listFilter === "All" ? null : listFilter;
    return data.resources.filter((r) => (role ? r.role === role : true) && (match(r.id) || match(r.name) || match(r.role)));
  })();
  const filteredSprints = data.sprints.filter((s) => match(s.id) || match(s.name));
  const requirementTaskCount = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of data.tasks) {
      if (!t.requirementId) continue;
      map[t.requirementId] = (map[t.requirementId] || 0) + 1;
    }
    return map;
  }, [data.tasks]);
  const dependencyMap = useMemo(() => {
    const map: Record<string, Array<Dependency & { task?: Task }>> = {};
    for (const dep of data.dependencies) {
      if (!map[dep.toTaskId]) map[dep.toTaskId] = [];
      map[dep.toTaskId].push({ ...dep, task: taskMap[dep.fromTaskId] });
    }
    return map;
  }, [data.dependencies, taskMap]);
  const highlightedDependencyIds = useMemo(() => {
    if (!hoverTaskId) return new Set<string>();
    return new Set(
      data.dependencies
        .filter((dependency) => dependency.fromTaskId === hoverTaskId || dependency.toTaskId === hoverTaskId)
        .map((dependency) => dependency.id),
    );
  }, [data.dependencies, hoverTaskId]);
  const dayWidth = 44;
  const rowHeight = 40;
  const ganttHeaderHeight = 40;
  const titleColWidth = 240;
  const assigneeColWidth = 140;
  const timelineWidth = Math.max(allDates.length, 1) * dayWidth;
  const ganttStart = allDates[0] || toISO(today);
  const taskDialogConstraint = useMemo(() => {
    if (!dialog || dialog.kind !== "task") return null;
    return getTaskConstraint(dialog.draft.predecessors, taskMap);
  }, [dialog, taskMap]);

  useEffect(() => {
    if (view !== "gantt") return;
    const wrapper = ganttWrapRef.current;
    const overlay = ganttOverlayRef.current;
    if (!wrapper || !overlay) return;
    const body = wrapper.querySelector(".ant-table-body");
    if (!(body instanceof HTMLElement)) return;

    const measure = () => {
      const overlayRect = overlay.getBoundingClientRect();
      const nextSize = {
        width: Math.round(overlayRect.width),
        height: Math.round(overlayRect.height),
      };
      setGanttOverlaySize((current) => (current.width === nextSize.width && current.height === nextSize.height ? current : nextSize));

      const barMap: Record<string, DOMRect> = {};
      wrapper.querySelectorAll<HTMLElement>(".gantt-task-bar[data-task-id]").forEach((bar) => {
        const taskId = bar.dataset.taskId;
        if (taskId) {
          barMap[taskId] = bar.getBoundingClientRect();
        }
      });

      const nextPaths = data.dependencies
        .map((dependency) => {
          const fromBar = barMap[dependency.fromTaskId];
          const toBar = barMap[dependency.toTaskId];
          if (!fromBar || !toBar) return null;

          const anchors = getDependencyAnchors(dependency.type);
          const startX = (anchors.from === "left" ? fromBar.left : fromBar.right) - overlayRect.left;
          const endX = (anchors.to === "left" ? toBar.left : toBar.right) - overlayRect.left;
          const startY = fromBar.top + fromBar.height / 2 - overlayRect.top;
          const endY = toBar.top + toBar.height / 2 - overlayRect.top;

          return {
            id: dependency.id,
            path: buildDependencyPath({
              startX,
              startY,
              endX,
              endY,
              fromAnchor: anchors.from,
              toAnchor: anchors.to,
            }),
          };
        })
        .filter((item): item is GanttDependencyPath => Boolean(item));

      setGanttDependencyPaths(nextPaths);
    };

    const rafId = window.requestAnimationFrame(measure);
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resizeObserver?.observe(body);
    resizeObserver?.observe(wrapper);
    body.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      body.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [data.dependencies, ganttTasks, view]);

  const updateTaskDraft = (updater: (draft: TaskDialogDraft) => TaskDialogDraft) => {
    setDialog((current) => {
      if (!current || current.kind !== "task") return current;
      const nextDraft = updater(current.draft);
      const constrained = applyTaskConstraint(nextDraft, getTaskConstraint(nextDraft.predecessors, taskMap));
      return {
        ...current,
        draft: constrained,
      };
    });
  };

  const openAddTask = () =>
    setDialog({
      kind: "task",
      mode: "add",
      draft: {
        id: nextEntityId(data.tasks, TASK_ID_SPEC),
        title: "新任务",
        notes: "",
        requirementId: data.requirements[0]?.id || "",
        assigneeId: data.resources[0]?.id || "",
        sprintId: data.sprints[0]?.id || "",
        start: toISO(today),
        end: toISO(addDays(today, 2)),
        estimatedHours: 8,
        progress: 0,
        status: "待办",
        predecessors: [],
      },
    });
  const openEditTask = (t: Task) =>
    setDialog({
      kind: "task",
      mode: "edit",
      draft: {
        ...t,
        predecessors: data.dependencies
          .filter((d) => d.toTaskId === t.id)
          .map((d) => ({ id: d.id, fromTaskId: d.fromTaskId, type: d.type })),
      },
    });
  const openRecordTask = (t: Task) =>
    setDialog({
      kind: "record",
      taskId: t.id,
      draft: {
        at: toLocalDateTimeInput(new Date()),
        progress: Math.max(1, Math.min(100, Number.isFinite(t.progress) ? Math.round(t.progress) : 1)),
        hours: 0,
        notes: "",
      },
    });
  const openAddRequirement = () =>
    setDialog({ kind: "requirement", mode: "add", draft: { id: nextEntityId(data.requirements, REQUIREMENT_ID_SPEC), title: "新需求", description: "", priority: "中" } });
  const openEditRequirement = (r: Requirement) => setDialog({ kind: "requirement", mode: "edit", draft: { ...r } });
  const openAddResource = () => setDialog({ kind: "resource", mode: "add", draft: { id: nextEntityId(data.resources, RESOURCE_ID_SPEC), name: "", role: "", capacity: 6 } });
  const openEditResource = (r: Resource) => setDialog({ kind: "resource", mode: "edit", draft: { ...r } });
  const openAddSprint = () =>
    setDialog({ kind: "sprint", mode: "add", draft: { id: nextEntityId(data.sprints, SPRINT_ID_SPEC), name: "新迭代", start: toISO(today), end: toISO(addDays(today, 13)) } });
  const openEditSprint = (s: Sprint) => setDialog({ kind: "sprint", mode: "edit", draft: { ...s } });

  const openSettings = () =>
    setDialog({
      kind: "settings",
      draft: {
        projectName: data.projectName || "",
        projectDescription: data.projectDescription || "",
      },
    });

  const saveDialog = () => {
    if (!dialog) return;
    const warn = (content: string) => Modal.warning({ title: t("formWarningTitle"), content });
    if (dialog.kind === "record") {
      if (!dialog.draft.at) return warn("请选择记录时间。");
      if (normalizeHours(dialog.draft.hours) <= 0) return warn("请输入今日花费工时。");
      if (!dialog.draft.notes.trim()) return warn("请输入进度说明。");
      const target = data.tasks.find((t) => t.id === dialog.taskId);
      if (!target) {
        setDialog(null);
        return;
      }
      const nextProgress = Math.max(1, Math.min(100, Math.round(Number(dialog.draft.progress) || 1)));
      const atIso = dialog.draft.at ? new Date(dialog.draft.at).toISOString() : new Date().toISOString();
      const record: TaskRecord = {
        id: uid("REC"),
        taskId: dialog.taskId,
        at: atIso,
        hours: normalizeHours(dialog.draft.hours),
        progress: nextProgress,
        notes: dialog.draft.notes || "",
      };
      const completionDate = atIso.slice(0, 10);
      const nextTasks = data.tasks.map((t) =>
        t.id !== dialog.taskId
          ? t
          : nextProgress >= 100
            ? normalizeTaskCompletion({ ...t, progress: 100, status: "已完成" as WorkStatus }, completionDate)
            : { ...t, progress: nextProgress },
      );
      update({ ...data, tasks: applyDependencySchedule(nextTasks, data.dependencies), taskRecords: [...data.taskRecords, record] });
      setDialog(null);
      return;
    }
    if (dialog.kind === "task") {
      if (!dialog.draft.title.trim()) return warn("请输入任务标题。");
      if (!dialog.draft.requirementId) return warn("请选择需求。");
      if (!dialog.draft.assigneeId) return warn("请选择负责人。");
      if (!dialog.draft.sprintId) return warn("请选择迭代。");
      if (!dialog.draft.start || !dialog.draft.end) return warn("请选择开始和结束日期。");
      if (normalizeHours(dialog.draft.estimatedHours) <= 0) return warn("请输入预计工时。");
      const { predecessors, ...taskBase } = dialog.draft;
      const cleaned = data.dependencies.filter((dep) => dep.toTaskId !== taskBase.id);
      const nextDeps: Dependency[] = [
        ...cleaned,
        ...predecessors
          .filter((p) => p.fromTaskId && p.fromTaskId !== taskBase.id)
          .map((p) => ({ id: p.id || uid("DEP"), fromTaskId: p.fromTaskId, toTaskId: taskBase.id, type: p.type || "FS" })),
      ];
      if (hasDependencyCycle(nextDeps)) {
        return warn("依赖关系不能形成循环。");
      }

      const normalizedTask = normalizeTaskCompletion(taskBase);
      const constrainedTask = applyTaskConstraint(
        normalizedTask,
        getTaskConstraint(
          predecessors
            .filter((item) => item.fromTaskId && item.fromTaskId !== taskBase.id)
            .map((item) => ({ fromTaskId: item.fromTaskId, type: item.type })),
          taskMap,
        ),
      );
      const nextTasks = dialog.mode === "add" ? [...data.tasks, constrainedTask] : data.tasks.map((t) => (t.id === constrainedTask.id ? constrainedTask : t));
      update({ ...data, tasks: applyDependencySchedule(nextTasks, nextDeps), dependencies: nextDeps });
      setDialog(null);
      return;
    }
    if (dialog.kind === "requirement") {
      const d = dialog.draft;
      if (!d.title.trim()) return warn("请输入需求标题。");
      if (dialog.mode === "add") update({ ...data, requirements: [...data.requirements, d] });
      else patchRequirement(d.id, d);
      setDialog(null);
      return;
    }
    if (dialog.kind === "resource") {
      const d = dialog.draft;
      if (!d.name.trim()) return warn("请输入资源姓名。");
      if (dialog.mode === "add") update({ ...data, resources: [...data.resources, d] });
      else patchResource(d.id, d);
      setDialog(null);
      return;
    }
    if (dialog.kind === "sprint") {
      const d = dialog.draft;
      if (!d.name.trim()) return warn("请输入迭代名称。");
      if (!d.start || !d.end) return warn("请选择开始和结束日期。");
      if (dialog.mode === "add") {
        const next = { ...data, sprints: [...data.sprints, d] };
        update(next);
        if (!selectedSprintId) setSelectedSprintId(d.id);
      } else patchSprint(d.id, d);
      setDialog(null);
      return;
    }
    if (dialog.kind === "settings") {
      const nextName = dialog.draft.projectName.trim() || seedData.projectName;
      const nextDescription = dialog.draft.projectDescription.trim() || seedData.projectDescription;
      update({ ...data, projectName: nextName, projectDescription: nextDescription });
      setDialog(null);
      return;
    }
  };

  const ganttColumns: ColumnsType<Task> = [
    {
      key: "task",
      fixed: "left",
      width: titleColWidth,
      title: (
        <div
          style={{
            height: ganttHeaderHeight,
            padding: "0 10px",
            display: "flex",
            alignItems: "center",
            fontWeight: 800,
            boxSizing: "border-box",
          }}
        >
          Task
        </div>
      ),
      onCell: () => ({ style: { padding: 0 } }),
      render: (_: unknown, t: Task) => {
        const hovered = hoverTaskId === t.id;
        return (
          <div style={{ height: rowHeight, display: "flex", alignItems: "center", gap: 8, padding: "0 10px", boxSizing: "border-box" }}>
            <button
              type="button"
              onClick={() => openEditTask(t)}
              style={{
                minWidth: 0,
                flex: "1 1 auto",
                fontWeight: 700,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                background: "transparent",
                border: "none",
                padding: 0,
                margin: 0,
                textAlign: "left",
                cursor: hovered ? "pointer" : "default",
                textDecoration: hovered ? "underline" : "none",
              }}
              title={t.notes || undefined}
            >
              {t.title}
            </button>
            <StatusTag status={taskDisplayStatus(t)} label={statusText(taskDisplayStatus(t))} />
          </div>
        );
      },
    },
    {
      key: "assignee",
      fixed: "left",
      width: assigneeColWidth,
      title: (
        <div
          style={{
            height: ganttHeaderHeight,
            padding: "0 10px",
            display: "flex",
            alignItems: "center",
            fontWeight: 800,
            boxSizing: "border-box",
          }}
        >
          {t("assignee")}
        </div>
      ),
      onCell: () => ({ style: { padding: 0 } }),
      render: (_: unknown, task: Task) => (
        <div style={{ height: rowHeight, padding: "0 10px", display: "flex", alignItems: "center", boxSizing: "border-box" }}>
          {resMap[task.assigneeId]?.name || t("unassigned")}
        </div>
      ),
    },
    {
      key: "timeline",
      width: timelineWidth,
      title: (
        <div
          style={{
            display: "flex",
            width: timelineWidth,
            height: ganttHeaderHeight,
            boxShadow: "inset 1px 0 0 var(--border)",
          }}
        >
          {allDates.map((d) => (
            <div
              key={d}
              style={{
                width: dayWidth,
                height: ganttHeaderHeight,
                boxSizing: "border-box",
                textAlign: "center",
                opacity: 1,
                borderRight: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                whiteSpace: "nowrap",
              }}
            >
              {d.slice(5)}
            </div>
          ))}
        </div>
      ),
      onCell: () => ({ style: { padding: 0 } }),
      render: (_: unknown, t: Task) => {
        const startIdx = Math.max(0, diffDays(ganttStart, t.start));
        const endIdx = Math.min(allDates.length - 1, Math.max(startIdx, diffDays(ganttStart, t.end)));
        const left = startIdx * dayWidth;
        const width = (endIdx - startIdx + 1) * dayWidth;
        return (
          <div
            className="gantt-timeline-cell"
            data-task-id={t.id}
            style={{
              position: "relative",
              width: timelineWidth,
              height: rowHeight,
              boxShadow: "inset 1px 0 0 var(--border)",
              backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent ${dayWidth - 1}px, var(--border) ${dayWidth - 1}px, var(--border) ${dayWidth}px)`,
            }}
          >
            <div
              className="gantt-task-bar"
              data-task-id={t.id}
              style={{
                position: "absolute",
                left,
                top: (rowHeight - 14) / 2,
                width,
                height: 14,
                borderRadius: 999,
                background: "color-mix(in srgb, var(--accent) 22%, transparent)",
                overflow: "hidden",
              }}
            >
              <div style={{ height: 14, width: `${Math.max(0, Math.min(100, t.progress))}%`, background: "var(--accent)" }} />
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <ConfigProvider locale={locale === "zh-CN" ? zhCN : enUS}>
      <div className="app-shell" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ textAlign: "left" }}>
          <h1 className="project-title" style={{ margin: "12px 0 4px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span>{data.projectName || seedData.projectName}</span>
            <Button variant="outline" icon={<EditOutlined />} onClick={openSettings}>
              {t("edit")}
            </Button>
          </h1>
          <div style={{ opacity: 0.85 }}>{data.projectDescription || seedData.projectDescription}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Select
            value={locale}
            onChange={(value) => setLocale(value as AppLocale)}
            options={[
              { value: "zh-CN", label: "中文简体" },
              { value: "en-US", label: "English" },
            ]}
            style={{ width: 116 }}
          />
          <Button variant="outline" onClick={exportJson}>
            {t("saveProject")}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (importInputRef.current) {
                importInputRef.current.value = "";
                importInputRef.current.click();
              }
            }}
          >
            {t("openProject")}
          </Button>
          <input ref={importInputRef} type="file" accept="application/json" style={{ display: "none" }} onChange={importJson} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <AntTabs
          activeKey={view}
          onChange={(v) => switchView(v as "gantt" | "dashboard")}
        items={[
            { key: "gantt", label: t("gantt") },
            { key: "dashboard", label: t("dashboard") },
          ]}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "nowrap" }}>

          <SelectField
            value={selectedSprintId}
            onValueChange={setSelectedSprintId}
            options={data.sprints.map((s) => ({ value: s.id, label: s.name }))}
            placeholder={t("selectSprint")}
            style={{ width: 220, minWidth: 180 }}
          />
        </div>
      </div>

      {view === "gantt" && (
        <Card>
          <div ref={ganttWrapRef} style={{ position: "relative" }}>
            <Table<Task>
              className="gantt-antd"
              columns={ganttColumns}
              dataSource={ganttTasks}
              rowKey={(t) => t.id}
              pagination={false}
              size="small"
              sticky
              tableLayout="fixed"
              scroll={{ x: titleColWidth + assigneeColWidth + timelineWidth }}
              rowClassName={(record) => (hoverTaskId === record.id ? "gantt-row-hover" : "")}
              onRow={(record) => ({
                onMouseEnter: () => setHoverTaskId(record.id),
                onMouseLeave: () => setHoverTaskId((prev) => (prev === record.id ? null : prev)),
              })}
            />
            <div
              ref={ganttOverlayRef}
              style={{
                position: "absolute",
                left: titleColWidth + assigneeColWidth,
                top: 0,
                right: 0,
                bottom: 0,
                overflow: "hidden",
                pointerEvents: "none",
              }}
            >
              <svg
                width={ganttOverlaySize.width}
                height={Math.max(ganttOverlaySize.height, rowHeight)}
                style={{ display: "block" }}
              >
                <defs>
                  <marker id="gantt-arrow-head" markerWidth="6" markerHeight="6" refX="5.5" refY="3" orient="auto">
                    <path d="M 0 0 L 6 3 L 0 6 z" fill="var(--accent)" />
                  </marker>
                  <marker id="gantt-arrow-head-active" markerWidth="6" markerHeight="6" refX="5.5" refY="3" orient="auto">
                    <path d="M 0 0 L 6 3 L 0 6 z" fill="#0958d9" />
                  </marker>
                </defs>
                {ganttDependencyPaths.map((item) => (
                  <path
                    key={item.id}
                    d={item.path}
                    className={`gantt-dependency-path${highlightedDependencyIds.has(item.id) ? " is-active" : ""}`}
                    fill="none"
                    markerEnd={highlightedDependencyIds.has(item.id) ? "url(#gantt-arrow-head-active)" : "url(#gantt-arrow-head)"}
                  />
                ))}
              </svg>
            </div>
          </div>
        </Card>
      )}

      {view === "dashboard" && (
        <Card>
          <BurnDownChart data={burndown} emptyText={t("noBurndownData")} remainingHoursLabel={t("remainingHours")} />
        </Card>
      )}

      <AntTabs
        activeKey={manageTab}
        onChange={(v) => switchManageTab(v as "tasks" | "requirements" | "resources" | "sprints")}
        items={[
          { key: "tasks", label: t("tasks") },
          { key: "requirements", label: t("requirements") },
          { key: "resources", label: t("resources") },
          { key: "sprints", label: t("sprints") },
        ]}
      />

      {manageTab === "tasks" && (
        <Card>
          <FilterBar
            search={listSearch}
            onSearchChange={setListSearch}
            searchLabel={t("search")}
            filterLabel={t("status")}
            filter={listFilter}
            onFilterChange={setListFilter}
            filterOptions={taskFilterOptions}
            addLabel={t("addTask")}
            onAdd={openAddTask}
            selectPlaceholder={t("pleaseSelect")}
          />
          <ListTable
            headers={[t("id"), t("task"), t("requirement"), t("dependency"), t("dateRange"), t("hours"), t("progress"), t("status"), t("actions")]}
            rows={filteredTasks.map((task) => ({
              key: task.id,
              cells: (() => {
                const reqName = reqMap[task.requirementId]?.title || "";
                const sprintName = sprintMap[task.sprintId]?.name || "";
                const assigneeName = resMap[task.assigneeId]?.name || t("unassigned");
                const deps = dependencyMap[task.id] || [];
                return [
                  <span key="id" style={{ whiteSpace: "nowrap" }}>
                    {task.id}
                  </span>,
                  <div key="task" style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <button
                        type="button"
                        onClick={() => openEditTask(task)}
                        title={task.notes || undefined}
                        style={{
                          minWidth: 0,
                          maxWidth: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          margin: 0,
                          cursor: "pointer",
                          fontWeight: 700,
                          textAlign: "left",
                        }}
                      >
                        {task.title}
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span title={sprintName || undefined} style={{ whiteSpace: "nowrap" }}>
                        {task.sprintId || "-"}
                      </span>
                      <span style={{ whiteSpace: "nowrap" }}>·</span>
                      <span style={{ whiteSpace: "nowrap" }}>{assigneeName}</span>
                    </div>
                  </div>,
                  <Tooltip key="req" title={reqName || undefined}>
                    <span style={{ whiteSpace: "nowrap" }}>{task.requirementId || "-"}</span>
                  </Tooltip>,
                  deps.length ? (
                    <div key="deps" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {deps.map((dep) => (
                        <Tooltip
                          key={dep.id}
                          title={
                            <div>
                              <div>{dep.task?.title || t("unknownTask")}</div>
                              <div>
                                {dep.task?.start || "-"} ~ {dep.task?.end || "-"}
                              </div>
                              <div>{t("type")}：{dep.type}</div>
                            </div>
                          }
                        >
                          <span style={{ display: "block", whiteSpace: "nowrap" }}>{dep.fromTaskId}</span>
                        </Tooltip>
                      ))}
                    </div>
                  ) : (
                    <span key="deps">-</span>
                  ),
                  <div key="dates" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <div>{task.start}</div>
                    <div>{task.end}</div>
                  </div>,
                  `${formatHours(normalizeHours(task.estimatedHours))}h`,
                  `${task.progress}%`,
                  <StatusTag key="status" status={taskDisplayStatus(task)} label={statusText(taskDisplayStatus(task))} />,
                  <div key="actions" style={{ display: "flex", gap: 8 }}>
                    {task.status === "待办" || task.status === "进行中" || task.status === "暂停" ? (
                      <Button variant="outline" onClick={() => openRecordTask(task)}>
                        {t("record")}
                      </Button>
                    ) : null}
                    <Button variant="outline" onClick={() => openEditTask(task)}>
                      {t("edit")}
                    </Button>
                    <Popconfirm title={t("confirmDeleteTask")} description={`${task.id} · ${task.title}`} okText={t("delete")} cancelText={t("cancel")} onConfirm={() => removeTask(task.id)}>
                      <Button variant="outline">{t("delete")}</Button>
                    </Popconfirm>
                  </div>,
                ];
              })(),
            }))}
            emptyText={t("noTasks")}
          />
        </Card>
      )}

      {manageTab === "requirements" && (
        <Card>
          <FilterBar
            search={listSearch}
            onSearchChange={setListSearch}
            searchLabel={t("search")}
            filterLabel={t("priority")}
            filter={listFilter}
            onFilterChange={setListFilter}
            filterOptions={requirementFilterOptions}
            addLabel={t("addRequirement")}
            onAdd={openAddRequirement}
            selectPlaceholder={t("pleaseSelect")}
          />
          <ListTable
            headers={[t("id"), t("title"), t("taskCount"), t("priority"), t("description"), t("actions")]}
            rows={filteredRequirements.map((r) => ({
              key: r.id,
              cells: [
                r.id,
                r.title,
                String(requirementTaskCount[r.id] || 0),
                priorityText(r.priority),
                <div key="desc" style={{ maxWidth: 420, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.description}
                </div>,
                <div key="actions" style={{ display: "flex", gap: 8 }}>
                  <Button variant="outline" onClick={() => openEditRequirement(r)}>
                    {t("edit")}
                  </Button>
                  <Popconfirm title={t("confirmDeleteRequirement")} description={`${r.id} · ${r.title}`} okText={t("delete")} cancelText={t("cancel")} onConfirm={() => removeRequirement(r.id)}>
                    <Button variant="outline">{t("delete")}</Button>
                  </Popconfirm>
                </div>,
              ],
            }))}
            emptyText={t("noRequirements")}
          />
        </Card>
      )}

      {manageTab === "resources" && (
        <Card>
          <FilterBar
            search={listSearch}
            onSearchChange={setListSearch}
            searchLabel={t("search")}
            filterLabel={t("role")}
            filter={listFilter}
            onFilterChange={setListFilter}
            filterOptions={resourceFilterOptions}
            addLabel={t("addResource")}
            onAdd={openAddResource}
            selectPlaceholder={t("pleaseSelect")}
          />
          <ListTable
            headers={[t("id"), t("personName"), t("role"), t("actions")]}
            rows={filteredResources.map((r) => ({
              key: r.id,
              cells: [
                r.id,
                r.name,
                r.role,
                <div key="actions" style={{ display: "flex", gap: 8 }}>
                  <Button variant="outline" onClick={() => openEditResource(r)}>
                    {t("edit")}
                  </Button>
                  <Popconfirm title={t("confirmDeleteResource")} description={`${r.id} · ${r.name}`} okText={t("delete")} cancelText={t("cancel")} onConfirm={() => removeResource(r.id)}>
                    <Button variant="outline">{t("delete")}</Button>
                  </Popconfirm>
                </div>,
              ],
            }))}
            emptyText={t("noResources")}
          />
        </Card>
      )}

      {manageTab === "sprints" && (
        <Card>
          <FilterBar
            search={listSearch}
            onSearchChange={setListSearch}
            searchLabel={t("search")}
            filterLabel={t("filter")}
            filter={listFilter}
            onFilterChange={setListFilter}
            filterOptions={sprintFilterOptions}
            addLabel={t("addSprint")}
            onAdd={openAddSprint}
            selectPlaceholder={t("pleaseSelect")}
          />
          <ListTable
            headers={[t("id"), t("name"), t("start"), t("end"), t("actions")]}
            rows={filteredSprints.map((s) => ({
              key: s.id,
              cells: [
                s.id,
                s.name,
                s.start,
                s.end,
                <div key="actions" style={{ display: "flex", gap: 8 }}>
                  <Button variant="outline" onClick={() => openEditSprint(s)}>
                    {t("edit")}
                  </Button>
                  <Popconfirm title={t("confirmDeleteSprint")} description={`${s.id} · ${s.name}`} okText={t("delete")} cancelText={t("cancel")} onConfirm={() => removeSprint(s.id)}>
                    <Button variant="outline">{t("delete")}</Button>
                  </Popconfirm>
                </div>,
              ],
            }))}
            emptyText={t("noSprints")}
          />
        </Card>
      )}

      <Modal
        open={dialog !== null}
        onCancel={() => setDialog(null)}
        onOk={saveDialog}
        okText={t("save")}
        cancelText={t("cancel")}
        width={960}
        title={
          <span>
              {dialog
                ? dialog.kind === "task"
                  ? dialog.mode === "add"
                    ? t("addTask")
                    : t("editTask")
                  : dialog.kind === "requirement"
                    ? dialog.mode === "add"
                      ? t("addRequirement")
                      : t("editRequirement")
                    : dialog.kind === "resource"
                      ? dialog.mode === "add"
                        ? t("addResource")
                        : t("editResource")
                      : dialog.kind === "sprint"
                        ? dialog.mode === "add"
                          ? t("addSprint")
                          : t("editSprint")
                        : dialog.kind === "record"
                          ? t("record")
                          : t("projectSettings")
                : ""}
          </span>
        }
      >
        {dialog?.kind === "task" && (
          <Form layout="vertical">
          <div className="task-dialog-form-grid">
            <div className="task-dialog-column">
            <Field label={t("id")}>
              <Input value={dialog.draft.id} disabled />
            </Field>
            <Field label={t("taskStatus")}>
              <SelectField
                value={dialog.draft.status}
                onValueChange={(v) => updateTaskDraft((draft) => ({ ...draft, status: v as WorkStatus }))}
                options={[
                  { value: "待办", label: t("statusTodo") },
                  { value: "进行中", label: t("statusDoing") },
                  { value: "已完成", label: t("statusDone") },
                  { value: "暂停", label: t("statusPaused") },
                ]}
                placeholder={t("selectStatus")}
              />
            </Field>
            <Field label={t("startDate")}>
              <DatePickerField
                value={dialog.draft.start}
                minDate={taskDialogConstraint?.minStart}
                maxDate={dialog.draft.end}
                onValueChange={(v) => updateTaskDraft((draft) => ({ ...draft, start: v }))}
              />
            </Field>
            <Field label={t("endDate")}>
              <DatePickerField
                value={dialog.draft.end}
                minDate={maxIsoDate(taskDialogConstraint?.minEnd, dialog.draft.start)}
                onValueChange={(v) => updateTaskDraft((draft) => ({ ...draft, end: v }))}
              />
            </Field>
            <Field label={t("assignee")}>
              <SelectField
                value={dialog.draft.assigneeId}
                onValueChange={(v) => updateTaskDraft((draft) => ({ ...draft, assigneeId: v }))}
                options={data.resources.map((r) => ({ value: r.id, label: `${r.id} · ${r.name}` }))}
                placeholder={t("selectAssignee")}
              />
            </Field>
            <Field label={t("progressRange0")}>
              <InputNumber
                min={0}
                max={100}
                value={dialog.draft.progress}
                onChange={(value) => updateTaskDraft((draft) => ({ ...draft, progress: Number(value ?? 0) }))}
                style={{ width: "100%" }}
              />
            </Field>
            </div>
            <div className="task-dialog-column">
            <Field label={t("title")}>
              <Input value={dialog.draft.title} onChange={(e) => updateTaskDraft((draft) => ({ ...draft, title: e.target.value }))} />
            </Field>
            <Field label={t("estimatedHours")}>
              <InputNumber
                min={0.1}
                step={0.5}
                value={dialog.draft.estimatedHours}
                onChange={(value) => updateTaskDraft((draft) => ({ ...draft, estimatedHours: Number(value ?? 0) }))}
                style={{ width: "100%" }}
              />
            </Field>
            <Field label={t("linkedRequirement")}>
              <SelectField
                value={dialog.draft.requirementId}
                onValueChange={(v) => updateTaskDraft((draft) => ({ ...draft, requirementId: v }))}
                options={data.requirements.map((r) => ({ value: r.id, label: `${r.id} · ${r.title}` }))}
                placeholder={t("selectRequirement")}
              />
            </Field>
            <Field label={t("sprint")}>
              <SelectField
                value={dialog.draft.sprintId}
                onValueChange={(v) => updateTaskDraft((draft) => ({ ...draft, sprintId: v }))}
                options={data.sprints.map((s) => ({ value: s.id, label: `${s.id} · ${s.name}` }))}
                placeholder={t("selectSprint")}
              />
            </Field>
            <Field label={t("dependencyTasks")}>
              <div className="task-dialog-dependencies">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(dialog.draft.predecessors.length
                    ? dialog.draft.predecessors
                    : [{ id: "__empty_predecessor__", fromTaskId: "", type: "FS" as DependencyType }]
                  ).map((p) => {
                    const isPlaceholder = p.id === "__empty_predecessor__";
                    return (
                    <div key={p.id} className="task-dialog-dependency-row">
                      <SelectField
                        value={p.fromTaskId}
                        onValueChange={(v) =>
                          updateTaskDraft((draft) => ({
                            ...draft,
                            predecessors: isPlaceholder
                              ? [{ id: uid("DEP"), fromTaskId: v, type: p.type }]
                              : draft.predecessors.map((x) => (x.id === p.id ? { ...x, fromTaskId: v } : x)),
                          }))
                        }
                        options={data.tasks.filter((t) => t.id !== dialog.draft.id).map((t) => ({ value: t.id, label: `${t.id} · ${t.title}` }))}
                        placeholder={t("selectPredecessor")}
                        style={{ flex: "1 1 220px", minWidth: 180 }}
                      />
                      <SelectField
                        value={p.type}
                        onValueChange={(v) =>
                          updateTaskDraft((draft) => ({
                            ...draft,
                            predecessors: isPlaceholder
                              ? [{ id: uid("DEP"), fromTaskId: "", type: v as DependencyType }]
                              : draft.predecessors.map((x) => (x.id === p.id ? { ...x, type: v as DependencyType } : x)),
                          }))
                        }
                        options={[
                          { value: "FS", label: "FS" },
                          { value: "SS", label: "SS" },
                          { value: "FF", label: "FF" },
                          { value: "SF", label: "SF" },
                        ]}
                        placeholder={t("type")}
                        style={{ width: 92, minWidth: 92 }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => updateTaskDraft((draft) => ({ ...draft, predecessors: draft.predecessors.filter((x) => x.id !== p.id) }))}
                      >
                        {t("remove")}
                      </Button>
                    </div>
                    );
                  })}
                </div>
                <div className="task-dialog-add-dependency">
                  <Button
                    onClick={() => updateTaskDraft((draft) => ({ ...draft, predecessors: [...draft.predecessors, { id: uid("DEP"), fromTaskId: "", type: "FS" }] }))}
                  >
                    {t("addDependencyTask")}
                  </Button>
                </div>
                <div className="task-dialog-notes-field">
                  <label>{t("notes")}</label>
                  <Textarea value={dialog.draft.notes} onChange={(e) => updateTaskDraft((draft) => ({ ...draft, notes: e.target.value }))} />
                </div>
              </div>
            </Field>
            </div>
          </div>
          {taskDialogConstraint?.hints.length ? (
            <div style={{ marginTop: 12, opacity: 0.85 }}>
              {t("dependencyConstraint")}：{taskDialogConstraint.hints.join("；")}
            </div>
          ) : null}
          </Form>
        )}
        {dialog?.kind === "record" && (
          <Form layout="vertical">
          {(() => {
            const target = taskMap[dialog.taskId];
            const assignee = target ? resMap[target.assigneeId]?.name || target.assigneeId || t("unassigned") : t("unassigned");
            const history = data.taskRecords
              .filter((record) => record.taskId === dialog.taskId)
              .sort((a, b) => b.at.localeCompare(a.at));
            const estimatedHours = normalizeHours(target?.estimatedHours);
            const recordedHours = history.reduce((sum, record) => sum + normalizeHours(record.hours), 0);
            const todayHours = normalizeHours(dialog.draft.hours);
            const totalHours = recordedHours + todayHours;
            const isOverrun = estimatedHours > 0 && totalHours > estimatedHours;
            const parts = String(dialog.draft.at || "").split("T");
            const datePart = parts[0] || toISO(new Date());
            const timePart = (parts[1] || "00:00").slice(0, 5);
            return (
              <div className="record-dialog-form-grid">
                <div className="record-dialog-column">
                  <Field label={t("recordTime")}>
                    <div className="record-dialog-time-row">
                      <DatePicker
                        value={datePart ? dayjs(datePart, "YYYY-MM-DD") : null}
                        onChange={(date) => setDialog({ ...dialog, draft: { ...dialog.draft, at: `${date ? date.format("YYYY-MM-DD") : ""}T${timePart}` } })}
                        format="YYYY-MM-DD"
                      />
                      <div className="record-dialog-time-actions">
                        <TimePicker
                          value={dayjs(`2000-01-01T${timePart}`)}
                          format="HH:mm"
                          minuteStep={5}
                          onChange={(value) =>
                            setDialog({ ...dialog, draft: { ...dialog.draft, at: `${datePart}T${value ? value.format("HH:mm") : "00:00"}` } })
                          }
                        />
                        <Button
                          variant="outline"
                          onClick={() => setDialog({ ...dialog, draft: { ...dialog.draft, at: toLocalDateTimeInput(new Date()) } })}
                        >
                          {t("now")}
                        </Button>
                      </div>
                    </div>
                  </Field>
                  <Field label={t("assignee")}>
                    <Input value={assignee} disabled />
                  </Field>
                  <Field label={t("estimatedTotalHours")}>
                    <Input value={`${formatHours(estimatedHours)} ${t("hourUnit")}`} disabled />
                  </Field>
                  <Field label={t("recordedHours")}>
                    <Input value={`${formatHours(recordedHours)} ${t("hourUnit")}`} disabled />
                  </Field>
                </div>
                <div className="record-dialog-column">
                  <Field label={t("taskProgressRange")}>
                    <InputNumber
                      min={1}
                      max={100}
                      value={dialog.draft.progress}
                      onChange={(value) => setDialog({ ...dialog, draft: { ...dialog.draft, progress: Number(value ?? 1) } })}
                      style={{ width: "100%" }}
                    />
                  </Field>
                  <Field label={t("todayHours")}>
                    <InputNumber
                      min={0.1}
                      step={0.5}
                      value={dialog.draft.hours}
                      onChange={(value) => setDialog({ ...dialog, draft: { ...dialog.draft, hours: Number(value ?? 0) } })}
                      style={{ width: "100%" }}
                    />
                    <div className={isOverrun ? "record-dialog-hour-warning" : "record-dialog-hour-summary"}>
                      {t("totalHoursPrefix")}{formatHours(totalHours)}{t("hourUnit")}{isOverrun ? t("hourOverrunWarning") : ""}
                    </div>
                  </Field>
                  <Field label={t("progressNotes")}>
                    <Textarea value={dialog.draft.notes} onChange={(e) => setDialog({ ...dialog, draft: { ...dialog.draft, notes: e.target.value } })} />
                  </Field>
                  <Field label={t("history")}>
                    {history.length ? (
                      <div className="record-history-list">
                        {history.map((record) => (
                          <div key={record.id} className="record-history-item">
                            <div className="record-history-meta">
                              <span>{toLocalDateTimeInput(new Date(record.at)).replace("T", " ")}</span>
                              <span>{record.progress}%</span>
                              <span>{formatHours(normalizeHours(record.hours))}{t("hourUnit")}</span>
                            </div>
                            {record.notes ? <div className="record-history-notes">{record.notes}</div> : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ opacity: 0.65 }}>{t("noHistory")}</div>
                    )}
                  </Field>
                </div>
              </div>
            );
          })()}
          </Form>
        )}
        {dialog?.kind === "requirement" && (
          <Form layout="vertical">
          <FormGrid>
            <Field label={t("id")}>
              <Input value={dialog.draft.id} disabled />
            </Field>
            <Field label={t("title")}>
              <Input value={dialog.draft.title} onChange={(e) => setDialog({ ...dialog, draft: { ...dialog.draft, title: e.target.value } })} />
            </Field>
            <Field label={t("priority")}>
              <SelectField
                value={dialog.draft.priority}
                onValueChange={(v) => setDialog({ ...dialog, draft: { ...dialog.draft, priority: v as Priority } })}
                options={[
                  { value: "高", label: t("priorityHigh") },
                  { value: "中", label: t("priorityMedium") },
                  { value: "低", label: t("priorityLow") },
                ]}
                placeholder={t("selectPriority")}
              />
            </Field>
            <Field label={t("description")}>
              <Textarea value={dialog.draft.description} onChange={(e) => setDialog({ ...dialog, draft: { ...dialog.draft, description: e.target.value } })} />
            </Field>
          </FormGrid>
          </Form>
        )}
        {dialog?.kind === "resource" && (
          <Form layout="vertical">
          <FormGrid>
            <Field label={t("id")}>
              <Input value={dialog.draft.id} disabled />
            </Field>
            <Field label={t("personName")}>
              <Input value={dialog.draft.name} onChange={(e) => setDialog({ ...dialog, draft: { ...dialog.draft, name: e.target.value } })} />
            </Field>
            <Field label={t("role")}>
              <Input value={dialog.draft.role} onChange={(e) => setDialog({ ...dialog, draft: { ...dialog.draft, role: e.target.value } })} />
            </Field>
          </FormGrid>
          </Form>
        )}
        {dialog?.kind === "sprint" && (
          <Form layout="vertical">
          <FormGrid>
            <Field label={t("id")}>
              <Input value={dialog.draft.id} disabled />
            </Field>
            <Field label={t("name")}>
              <Input value={dialog.draft.name} onChange={(e) => setDialog({ ...dialog, draft: { ...dialog.draft, name: e.target.value } })} />
            </Field>
            <Field label={t("start")}>
              <DatePickerField value={dialog.draft.start} onValueChange={(v) => setDialog({ ...dialog, draft: { ...dialog.draft, start: v } })} />
            </Field>
            <Field label={t("end")}>
              <DatePickerField value={dialog.draft.end} onValueChange={(v) => setDialog({ ...dialog, draft: { ...dialog.draft, end: v } })} />
            </Field>
          </FormGrid>
          </Form>
        )}
        {dialog?.kind === "settings" && (
          <Form layout="vertical">
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 16 }}>
            <Field label={t("projectName")}>
              <Input value={dialog.draft.projectName} onChange={(e) => setDialog({ ...dialog, draft: { ...dialog.draft, projectName: e.target.value } })} />
            </Field>
            <Field label={t("projectDescription")}>
              <Textarea
                value={dialog.draft.projectDescription}
                autoSize={{ minRows: 2, maxRows: 4 }}
                onChange={(e) => setDialog({ ...dialog, draft: { ...dialog.draft, projectDescription: e.target.value } })}
              />
            </Field>
          </div>
          </Form>
        )}
      </Modal>

      </div>
    </ConfigProvider>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <AntCard className="app-card" variant="outlined">
      {children}
    </AntCard>
  );
}

function StatusTag({ status, label }: { status: DisplayStatus; label: string }) {
  const color =
    status === "延期"
      ? "error"
      : status === "已完成"
        ? "success"
        : status === "进行中"
          ? "processing"
          : "default";
  return <Tag color={color}>{label}</Tag>;
}

function BurnDownChart({ data, emptyText, remainingHoursLabel }: { data: Array<{ date: string; remainingHours: number }>; emptyText: string; remainingHoursLabel: string }) {
  if (!data.length) {
    return <Empty description={emptyText} />;
  }
  return (
    <Line
      data={data}
      xField="date"
      yField="remainingHours"
      height={260}
      point={{ size: 4, shape: "circle" }}
      tooltip={{ items: [{ channel: "y", name: remainingHoursLabel }] }}
      axis={{ x: { title: false }, y: { title: remainingHoursLabel, nice: true } }}
      interaction={{ tooltip: { marker: false } }}
      style={{ lineWidth: 2.5 }}
    />
  );
}

function SelectField({
  value,
  onValueChange,
  options,
  placeholder,
  style,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  style?: React.CSSProperties;
}) {
  return (
    <Select
      value={value || undefined}
      onChange={onValueChange}
      options={options}
      placeholder={placeholder}
      style={style ?? { width: "100%" }}
    />
  );
}

function DatePickerField({
  value,
  onValueChange,
  minDate,
  maxDate,
}: {
  value: string;
  onValueChange: (value: string) => void;
  minDate?: string;
  maxDate?: string;
}) {
  return (
    <DatePicker
      value={value ? dayjs(value, "YYYY-MM-DD") : null}
      onChange={(date) => onValueChange(date ? date.format("YYYY-MM-DD") : "")}
      disabledDate={(current) => {
        const currentDate = current.format("YYYY-MM-DD");
        if (minDate && currentDate < minDate) return true;
        if (maxDate && currentDate > maxDate) return true;
        return false;
      }}
      style={{ width: "100%" }}
      format="YYYY-MM-DD"
    />
  );
}

function FilterBar({
  search,
  onSearchChange,
  searchLabel = "搜索",
  filterLabel,
  filter,
  onFilterChange,
  filterOptions,
  addLabel,
  onAdd,
  selectPlaceholder = "请选择",
}: {
  search: string;
  onSearchChange: (v: string) => void;
  searchLabel?: string;
  filterLabel: string;
  filter: string;
  onFilterChange: (v: string) => void;
  filterOptions: Array<{ value: string; label: string }>;
  addLabel: string;
  onAdd: () => void;
  selectPlaceholder?: string;
}) {
  return (
    <Form layout="inline" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <Space wrap size={12}>
        <Form.Item label={searchLabel} style={{ marginBottom: 0 }}>
          <Input value={search} onChange={(e) => onSearchChange(e.target.value)} style={{ width: 240, minWidth: 180 }} />
        </Form.Item>
        <Form.Item label={filterLabel} style={{ marginBottom: 0 }}>
          <SelectField
            value={filter}
            onValueChange={onFilterChange}
            options={filterOptions}
            placeholder={selectPlaceholder}
            style={{ width: 180, minWidth: 160 }}
          />
        </Form.Item>
      </Space>
      <Button onClick={onAdd}>{addLabel}</Button>
    </Form>
  );
}

function ListTable({
  headers,
  rows,
  emptyText,
}: {
  headers: string[];
  rows: Array<{ key: string; cells: React.ReactNode[] }>;
  emptyText: string;
}) {
  const columns: ColumnsType<Record<string, React.ReactNode | string>> = headers.map((header, idx) => ({
    title: header,
    dataIndex: `cell_${idx}`,
    key: `cell_${idx}`,
    render: (value) => value,
  }));
  const dataSource = rows.map((row) => {
    const record: Record<string, React.ReactNode | string> = { key: row.key };
    row.cells.forEach((cell, idx) => {
      record[`cell_${idx}`] = cell;
    });
    return record;
  });

  return (
    <Table
      className="app-list-table"
      style={{ marginTop: 14 }}
      columns={columns}
      dataSource={dataSource}
      rowKey="key"
      pagination={false}
      locale={{ emptyText }}
      scroll={{ x: "max-content" }}
    />
  );
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="dialog-form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <Form.Item label={label} style={{ marginBottom: 0 }}>{children}</Form.Item>;
}

import { createHash } from "node:crypto";
import type { MilestonePlan, PlanningHistoryEntry } from "./milestone-planning-types.js";
export function planSnapshot(plan: MilestonePlan): unknown { const { history: _history, historyHead: _head, ...snapshot } = plan; return snapshot; }
export function planSnapshotHash(plan: MilestonePlan): string { return createHash("sha256").update(JSON.stringify(planSnapshot(plan))).digest("hex"); }
export function planningHistoryHash(entry: Omit<PlanningHistoryEntry, "contentHash">): string { return createHash("sha256").update(JSON.stringify(entry)).digest("hex"); }

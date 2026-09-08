import type { ContextGrant, DecisionStatus, NextAction } from "./types.js";

export const ENGINEERING_COVERAGE = [
  "project_defaults",
  "components",
  "technology",
  "commands",
  "relationships",
  "practices_and_checks",
  "operating_context",
  "open_matters",
] as const;

export const ENGINEERING_PHASES = [
  "draft",
  "blocked",
  "ready-for-engineering-confirmation",
  "engineering-foundation-confirmed",
] as const;

export const COMMAND_PURPOSES = [
  "build", "run", "unit-test", "integration-test", "e2e-test", "lint", "typecheck", "package", "deploy", "other",
] as const;

export const COMMAND_CONFIDENCE = ["observed", "proposed-unverified", "confirmed"] as const;
export const GUIDE_TRIGGER_KINDS = ["architecture", "demo-strategy", "release-strategy"] as const;

export type EngineeringCoverage = (typeof ENGINEERING_COVERAGE)[number];
export type EngineeringPhase = (typeof ENGINEERING_PHASES)[number];
export type CommandPurpose = (typeof COMMAND_PURPOSES)[number];
export type CommandConfidence = (typeof COMMAND_CONFIDENCE)[number];
export type GuideTriggerKind = (typeof GUIDE_TRIGGER_KINDS)[number];

export interface EngineeringEvidence {
  source: string;
  finding: string;
  contextScope: string;
}

export interface EngineeringDefaults {
  languages: string[];
  runtimes: string[];
  frameworks: string[];
  dependencyTools: string[];
  practices: string[];
  requiredChecks: string[];
  environments: string[];
  deliveryConstraints: string[];
  compatibility: string[];
  security: string[];
  operations: string[];
}

export interface EngineeringComponent {
  name: string;
  purpose: string;
  path: string;
  languages: string[];
  runtimes: string[];
  frameworks: string[];
  dependencyTools: string[];
  exceptions: string[];
}

export interface ExecutionEvidence {
  exactCommand: string;
  observedResult: string;
  environment: string;
}

export interface EngineeringCommand {
  purpose: CommandPurpose;
  command: string;
  scope: string;
  confidence: CommandConfidence;
  source?: string;
  contextScope?: string;
  executionEvidence?: ExecutionEvidence;
}

export interface EngineeringRelationship {
  from: string;
  to: string;
  description: string;
  deliveryConsequence: string;
}

export interface GuideTrigger {
  kind: GuideTriggerKind;
  triggered: boolean;
  reason: string;
  nextResponsibility: string;
}

export interface EngineeringDeferral {
  topic: EngineeringCoverage;
  question: string;
  consequence: string;
  revisitWhen: string;
  blocking: boolean;
}

export interface EngineeringContent {
  summary: string;
  evidence: EngineeringEvidence[];
  projectDefaults: EngineeringDefaults;
  components: EngineeringComponent[];
  commands: EngineeringCommand[];
  relationships: EngineeringRelationship[];
  triggers: GuideTrigger[];
  assumptions: string[];
  unknowns: string[];
  deferrals: EngineeringDeferral[];
}

export interface EngineeringConfirmedRevision {
  revision: number;
  draftVersion: number;
  productRevision: number;
  productConfirmationHash: string;
  engineering: EngineeringContent;
  decisions: Record<EngineeringCoverage, { status: DecisionStatus; note?: string }>;
  contextGrants: ContextGrant[];
  responsibilityConfirmations: string[];
  previousHash: string | null;
  contentHash: string;
}

export interface EngineeringChangeRevision {
  version: number;
  kind: "material" | "evidence-refresh";
  draftVersion: number;
  snapshotHash: string;
  previousHash: string | null;
  contentHash: string;
}

export interface EngineeringFoundationState {
  schemaVersion: 1;
  stage: "engineering-foundation";
  workspaceClass: "human-project";
  workspaceRoot: string;
  productRevision: number;
  productConfirmationHash: string;
  phase: EngineeringPhase;
  revision: number;
  draftVersion: number;
  reviewedDraftVersion: number | null;
  participantResponsibilities: string[];
  contextGrants: ContextGrant[];
  engineering: EngineeringContent;
  decisions: Record<EngineeringCoverage, { status: DecisionStatus; note?: string }>;
  nextActions: NextAction[];
  responsibilityConfirmations: string[];
  session: { status: "active" | "interrupted"; resumeTopic: EngineeringCoverage | null };
  confirmedHistory: EngineeringConfirmedRevision[];
  changeHistory: EngineeringChangeRevision[];
  changeHistoryHead: string | null;
  generatedViews: Record<string, { revision: number; draftVersion: number; sha256: string }>;
}

export interface EngineeringInitializeOptions {
  participantResponsibilities?: string[];
  contextGrants?: ContextGrant[];
}

export interface EngineeringFoundationUpdate {
  participantResponsibilities?: string[];
  contextGrants?: ContextGrant[];
  engineering?: Partial<EngineeringContent>;
  decisions?: Partial<Record<EngineeringCoverage, { status: DecisionStatus; note?: string }>>;
  nextActions?: NextAction[];
}

export interface EngineeringFoundationContract {
  version: 1;
  id: "establish-engineering-foundation";
  responsibility: "engineering";
  required_product_phase: "product-foundation-confirmed";
  coverage: EngineeringCoverage[];
  resolved_states: DecisionStatus[];
  phases: EngineeringPhase[];
  command_confidence: CommandConfidence[];
  trigger_kinds: GuideTriggerKind[];
  allowed_generated_artifacts: string[];
  guarantees: Record<string, boolean>;
  forbidden_authority: string[];
}

export type EngineeringRenderedArtifacts = Record<
  "LOOPY.md" | "docs/loopy/Roadmap.md" | "docs/loopy/Engineering-Guide.md",
  string
>;

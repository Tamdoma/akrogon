// Types for model.js — the envelope mirrors `akrogon status --json` schema 1
// (src/status.ts JsonEnvelope). main.js validates nothing here; the producer
// owns the contract.

export interface ProgramLite {
  key: string;
  run: string[];
  icon: string | null;
  tint: boolean;
  tile: string | null;
  color: string | null;
  name: string;
  shell: boolean;
  agent: boolean;
  installed?: boolean;
}

export interface SeatJson {
  harness: string;
  command: string;
  source: string;
}

export interface LeafJson {
  slug: string;
  group: string[];
  phase: string;
  phase_since: number | null;
  first_prompt: number | null;
  stopped: boolean;
  blocked_by: { slug: string; label: string }[];
  attention: string[];
  waits_on: ("A" | "B")[];
  broadcast_pending: boolean;
  land: { alive: boolean; unit: string } | null;
  busy_since: { a: number | null; b: number | null };
  done: string[];
  attempts: { A: number; B: number };
  fix_rounds: number;
  verdict: Record<string, string>;
  delivery_errors: { a: Record<string, unknown> | null; b: Record<string, unknown> | null };
  failure: Record<string, unknown> | null;
  missing: { kind: string; name: string; holder: string; steps: string }[];
  worktree: string;
  plan: string;
  red: boolean;
  seats: { a: SeatJson; b: SeatJson };
  history: string[];
}

export interface RepoJson {
  name: string;
  root: string;
  paused: boolean;
  error: string | null;
  unreadable: { path: string; error: string }[];
  slow: { leaf: string; run: string; ms: number; normal_ms: number } | null;
  unpacked: { path: string; command: string }[];
  queue: { slug: string; place: number; no_record: boolean }[];
  kept: { path: string; reason: string }[];
  charts: string[][];
  parked: string[];
  leaves: LeafJson[];
}

export interface Envelope {
  schema: 1;
  generated: number;
  red: number;
  watch: { folders: string[]; files: string[] };
  deploy: {
    failed: boolean;
    attempted: string | null;
    active: string | null;
    step: string | null;
    error: string | null;
  } | null;
  run: string | null;
  kept: { path: string; reason: string }[];
  merges: { repo: string; slug: string; merged: number | null; total_ms: number | null }[];
  repos: RepoJson[];
}

export interface BoardContext {
  now: number;
  spaceName: string;
  spaceFolder: string;
  agents: ProgramLite[];
}

export interface SeatCell {
  busy: boolean;
  logo: string | null;
  tint: boolean;
}

export type SectionName = "Needs you" | "Working" | "Waiting" | "Paused";

export interface RowDetail {
  reasons: string[];
  blockedBy: string[];
  missing: string[];
  moves: string[];
  kept: { path: string; reason: string }[];
}

export interface RowModel {
  repo: string;
  slug: string;
  phase: string;
  section: SectionName;
  time: string;
  reason: string;
  reasonRed: boolean;
  blocks: number;
  seats: { a: SeatCell; b: SeatCell };
  folder: string | null;
  worktree: string | null;
  parked: boolean;
  detail: RowDetail;
}

export interface SectionModel {
  name: SectionName;
  rows: RowModel[];
}

export interface MachineLine {
  text: string;
  tone: "red" | "dim";
  detail: string | null;
}

export interface Board {
  problems: number;
  machine: MachineLine[];
  sections: SectionModel[];
}

export interface PinEntry {
  machine: string | null;
  folder: string;
}

export declare function since(ms: number): string;
export declare function board(env: Envelope, ctx: BoardContext): Board;
export declare function leafRows(b: Board): RowModel[];
export declare function pinIntent(
  spaceId: string,
  folder: string,
  view: "files" | "changes",
  existingPin: Record<string, PinEntry>,
  seq: number,
): { pin: Record<string, PinEntry>; request: { op: "open"; view: "files" | "changes"; seq: number } };
export declare function filesChanged(
  before: Record<string, string | null>,
  now: Record<string, string | null>,
): boolean;

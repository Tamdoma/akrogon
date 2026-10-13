# Brief U1: src/timing.ts

## 1. Goal

Create `src/timing.ts`, the timing-event record module for leaf `timing-events` (plan decisions D1, D2, D4 + Implementation notes). Every other unit imports it.

## 2. Acceptance criteria

1. `issues/timings.jsonl` events validate under an exported `timingEventSchema` zod discriminated union on `kind` with members `visit_start`, `prompt`, `seat_done`, `check_start`, `check_end`, `batch`, `wait`, `repo_pause`.
2. `appendTiming(repo, input)` appends one JSON line to `<repo.root>/issues/timings.jsonl`; on any failure it emits exactly one `console.warn('timing append failed: <msg>')` and never throws.
3. `readTimings(root)` returns `[]` when the file is absent, else strictly parses each line.
4. `visitOf(log, slug, phase)` counts rows with `record.slug === slug && record.to === phase`; `currentVisit(log, slug, phase)` is `Math.max(0, visitOf(...) - 1)`.
5. `recordWait(repo, slug, reason, blocking?)` deduplicates per D4 (below).

## 3. Read-first

- `src/log.ts` — `readLog`/`logMove`: the file layout and style to mirror.
- `src/state.ts` — `Leaf`, `State`, `withLock` is NOT needed here.
- `src/routing.ts` — `Phase`, `phaseSchema`, `slotSchema`.
- `src/config.ts` — `Repo`.
- ponytail.md (skill folder) — fewest moving parts.

## 4. Change list and needed interfaces

Owns: `src/timing.ts` (new file). Prerequisite: none. No other files touched.

```ts
type DistOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type TimingEvent = z.infer<typeof timingEventSchema>;
export type TimingInput = DistOmit<TimingEvent, 'ts' | 'repo'>;
export type WaitReason = 'prerequisite' | 'parked' | 'merge_turn' | 'none';

export function appendTiming(repo: Repo, event: TimingInput): void;   // stamps ts + repo, warns once, never throws
export function readTimings(root: string): TimingEvent[];            // [] when absent; strict parse
export function visitOf(log: LogRecord[], slug: string, phase: Phase): number;
export function currentVisit(log: LogRecord[], slug: string, phase: Phase): number; // Math.max(0, visitOf-1)
export function recordWait(repo: Repo, slug: string, reason: WaitReason, blocking?: string): void;
```

Field shapes (all events share `{ ts, repo, slug, kind }` except `repo_pause` which has no `slug`):
- `visit_start`: `{ phase: Phase, visit: int>=0 }`
- `prompt`: `{ slot: Slot, phase: Phase, visit: int>=0, session: string|null, outcome: 'delivered'|'failed', attempt?: string }`
- `seat_done`: `{ slot: Slot, phase: Phase, visit: int>=0 }`
- `check_start`: `{ run: string, phase?: Phase, name: string, scope: 'leaf'|'worker'|'base', unit?: string, attempt?: string }`
- `check_end`: check_start fields + `{ exit: int, duration_ms: int>=0, log: string }`
- `batch`: `{ attempt: string, holder: string, members: string[], built_on: string }`
- `wait`: `{ reason: WaitReason, blocking?: string }`
- `repo_pause`: `{ pause: 'on'|'off' }`, no `slug`

`recordWait` dedup: scan `readTimings` for the slug, take the last event with `kind` `wait` or `prompt`; if it is a `wait` its `reason` is the open reason, anything else means no wait open. Append a `wait` event only when `reason !== open`; an open of `null` plus `reason: 'none'` appends nothing. `blocking` is carried but ignored for dedup.

## 5. Do-not, reasons and exceptions

- Do NOT touch any other file; this unit owns only `src/timing.ts`. Reason: other units depend on the exact interface. Exception: a revised brief.
- Do NOT write or edit tests. `tests/timing.test.ts` is A's and stays red until the product lands. Exception: none.
- Do NOT add fields beyond the list above, argv, env values, or a reader/formatter. Reason: out of scope is out of scope.
- `console.warn` writes the warning line; format `timing append failed: <message>` exactly. Reason: the planned test greps that substring.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A authorizing it.

## 6. Ordered steps

1. Write `src/timing.ts` per section 4, mirroring `readLog`'s file handling (`resolve(root,'issues')` + `timings.jsonl`, trailing-newline tolerant read).
2. `bun install --frozen-lockfile` in the worktree, then run the section 7 command; `tests/timing.test.ts` red is expected and not yours — report it as pre-existing red, fix only failures in files this unit's diff explains.

Advisory: 1 file, under 8 turns.

## 7. Commands

`AKROGON_BASE=df8868911100bf863224f71a51e70bb489d3b5d9 && bun test --changed="$AKROGON_BASE" --timeout=30000`

## 8. Done-when, evidence and report

Interface compiles (typecheck via the test run or `bun run typecheck`), schema members parse a hand-checked sample of each kind, commit carries `Test-Change:` trailer ONLY if an existing test-file path changed (it should not — this unit adds a new source file only). Commit message: `timing-events: src/timing.ts event record`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

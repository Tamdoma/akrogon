# Brief 1: command code (U1)

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/remove-plan-debate-u1` (detached at the leaf head). Install first: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'`.

## 1. Goal

Remove the lifecycle planning debate from the akrogon command (plan decisions D1-D6). Leaf planning is only `plan.synthesis` (slot A). Old records keep loading: a legacy `debate` key in `state.yaml` and a legacy `rebuttal` key in `issues/config.yaml` are dropped before the strict parse. History (`issues/log.jsonl`, `issues/timings.jsonl`, `failure.phase`) naming `plan.positions`/`plan.rebuttal` keeps parsing.

## 2. Numbered acceptance criteria

1. `readState` loads a `state.yaml` with `debate: 'no'` or `'yes'` or with no `debate`; the loaded `State` has no `debate` property; a file with `debate` plus an unknown key (`notes`) is still refused. `saveState` of such a loaded state writes no `debate`.
2. `readRepo` and `akrogon init` (proposal via `--from` and existing config) load a config with `rebuttal: true`/`false`; `RepoConfig` has no `rebuttal`; init writes no `rebuttal`; an unknown key (`scripts_dir`) is still refused and init leaves the file unchanged.
3. `readLog`, `readTimings` and `readState` (failed state, `failure.phase: plan.positions`) parse retired-phase history; `akrogon timing <slug>` over such history exits 0 and counts a completed retired visit as needing A and B (`incomplete prompt:B` when only A was prompted).
4. A `state.yaml` at `phase: plan.positions`/`plan.rebuttal` is refused; `akrogon phase <slug> plan.positions|plan.rebuttal` is refused from `failed` and from `plan.synthesis`; no `routing` key or `next` entry names a retired phase; `failed` -> `plan.synthesis` still works.
5. The planned tests, already committed on the branch, pass. You do not write or edit any test.

## 3. Read-first list

- `/home/ivan/.claude/skills/implement-issue/ponytail.md`
- `src/routing.ts` (whole), `src/state.ts:1-20` and `:80-160`, `src/config.ts:38-110` and `:210-232` and `:367-372`, `src/init.ts:24-45`, `src/log.ts:1-30`, `src/timing.ts:1-100`, `src/timing-report.ts:1-80` and `:170-180`, `src/phase.ts:330-346`, `src/next.ts:915-930`.
- Planned tests: `tests/retired-debate.test.ts` (criteria 1-4), and the ported files listed in section 7.
- Pattern to copy: `readState` already wraps parse errors; keep that wrapping unchanged.

## 4. Change list and needed interfaces

Owned paths: `src/routing.ts`, `src/state.ts`, `src/config.ts`, `src/init.ts`, `src/log.ts`, `src/timing.ts`, `src/timing-report.ts`, `src/phase.ts`, `src/next.ts`. No prerequisite units. No shared test resource (temp fixtures only).

- `src/routing.ts` (D1): `phaseSchema` loses `'plan.positions'`, `'plan.rebuttal'`; `routing` loses both entries; `failed.next` loses both. Add:
  ```ts
  export const retiredPhaseSchema = z.enum(['plan.positions', 'plan.rebuttal']);
  // issues/log.jsonl history is never rewritten, so history schemas accept retired phases.
  export const historicalPhaseSchema = z.enum([...retiredPhaseSchema.options, ...phaseSchema.options]);
  export type HistoricalPhase = z.infer<typeof historicalPhaseSchema>;
  // a small Record<RetiredPhase, readonly Slot[]> with both retired phases at ['A', 'B']
  export function historicalSlots(phase: HistoricalPhase, rounds: number): readonly Slot[];
  // retired phase -> table value; live phase -> requiredSlots(phase, rounds). Never indexes live routing with a retired phase.
  ```
- `src/log.ts`, `src/timing.ts` (D2): every phase field in `logSchema` (`from`, `to`) and `timingEventSchema` (`seat.phase`, `checkCore.phase`, `visit_start.phase`) uses `historicalPhaseSchema`. `visitOf`/`currentVisit` keep their `Phase` parameter.
- `src/state.ts` (D2, D3): `failureSchema.phase` uses `historicalPhaseSchema`; `stateSchema` loses `debate`; `readState` parses `<strip helper>(parsed, 'debate')`. `stateSchema.phase` stays `phaseSchema`.
- `src/config.ts` (D3): `repoSchema` loses `rebuttal`. Add one exported helper that returns a parsed YAML object without the named key and returns a non-object input unchanged (the strict schema then refuses it). Add `export function parseRepoConfig(raw: ReturnType<typeof Bun.YAML.parse>): RepoConfig` = `repoSchema.parse(<helper>(raw, 'rebuttal'))`; `readRepo` calls it. Type the helper strictly (no `any`). `effectiveConfig` needs no edit (D4).
- `src/init.ts` (D3): `initialize` parses its proposal / existing config / `{ grounding: 'none' }` through `parseRepoConfig`, keeping the existing error wrapping.
- `src/timing-report.ts` (D6): `Visit.phase: HistoricalPhase`; `visitGaps` uses `historicalSlots(visit.phase, visit.rounds)`.
- `src/phase.ts` (D5): delete the `state.phase === 'plan.positions' ... 'Destination contradicts rebuttal config'` guard.
- `src/next.ts` (D5): delete the `state.debate === 'yes' ... 'Debate leaf skipped its debate'` guard; remove imports only if nothing else uses them.
- Any other compile error from the narrowed `Phase` where a log/timing value flows into a `Phase` slot: switch that slot to `HistoricalPhase` (D6). Comparisons need no change.

## 5. Do-not, reasons and exceptions

- Do not write, edit or delete any test or fixture (tests are locked after planning; a wrong or red planned test is a mismatch you return with evidence). Exception: none for workers.
- Do not touch `issues/`, `learnings/`, `skills/`, `docs/` (other units and history own them).
- Do not add a read-time mapping of retired phases into `plan.synthesis`, and do not rewrite logs (design Q2 2a: a stray record fails as unreadable).
- Do not keep `debate`/`rebuttal` as optional fields (design Q1 1a: the keys exist in no schema or type).
- Do not run `bun run format` (it rewrites unrelated prettier drift in `src/status.ts`); run `bunx prettier --check` on your files and `bunx prettier --write <your files>` only.
- Return a mismatch with evidence instead of changing scope or an interface; exception: a revised brief from A.

Reasons restated: tests are A's; other paths belong to other units or are history; read-time mapping and optional fields were foreclosed by locked operator decisions; whole-repo format rewrites unrelated files.

## 6. Ordered steps

1. `src/routing.ts` per section 4 (criteria 3, 4).
2. `src/log.ts`, `src/timing.ts`, `src/state.ts` `failureSchema` (criterion 3).
3. `src/config.ts` helper + `parseRepoConfig`, `readRepo`; `src/init.ts` (criterion 2).
4. `src/state.ts` `stateSchema`/`readState` (criterion 1).
5. `src/timing-report.ts` (criterion 3); `src/phase.ts`, `src/next.ts` guards (criterion 4).
6. `bun run typecheck` green; run section 7 commands; commit once with message `remove the lifecycle planning debate from the command` (no co-author line).

Advisory size: about 9 files, under 40 turns.

## 7. Commands

- `akrogon run-check --name u1-criteria -- bun test tests/retired-debate.test.ts --timeout=30000` (must be 6 pass).
- `akrogon run-check --name u1-ports -- bun test tests/phase.test.ts tests/next.test.ts tests/state.test.ts tests/state-inventory.test.ts tests/timing-report.test.ts tests/batch.test.ts tests/leaf-stop.test.ts tests/pause-next.test.ts tests/release-any-phase.test.ts tests/session-routing.test.ts tests/init.test.ts tests/config.test.ts tests/timing.test.ts tests/watch-issues-scripts.test.ts --timeout=30000`
- `akrogon run-check --name u1-typecheck -- bun run typecheck`
- `akrogon run-check --name u1-format -- bunx prettier --check src tests`

## 8. Done-when, evidence and report

Done when every section 7 command exits 0 on your commit. Keep output only through `akrogon run-check` and cite each `check <label>: <exit> <path>` line; read logs with `akrogon log <path>`. Return the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

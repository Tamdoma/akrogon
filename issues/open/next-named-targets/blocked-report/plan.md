# Plan: blocked-report

Direct synthesis by slot A. The leaf has `debate: "no"`, so no positions or rebuttals exist. Source is brief.md plus design.md plus live checkout at `3e034de` in the worktree.

No brief/design conflict. Nothing recorded for review.

## Decisions

- D1 Subjects: the picked set is the `selectLeaves` result for `next <target>` and typed bare `next` without event JSON, and the swept inventory for `next --all` (current repo inside one, every registered repo outside one). `--resume`, Herdr events, `mergeWake`, `mergePass` and `dispatchDependents` carry no picked set. Explicit target or `--all` is manual even with inherited `HERDR_PLUGIN_EVENT_JSON`. Never classify by `HERDR_PANE_ID` or leaf count.
- D2 Order per picked leaf at its dispatch attempt against current inventory: merged completes via `completeOwner` with no line; failed reports recovery; else unmerged deps; else missing inputs; else normal dispatch where merge turn, capacity and busy seats wait silently. Deps before inputs, matching `eligibility`. One line per picked leaf through existing `report()` dedupe. Any line sets exit 1 through existing `skipped` set.
- D3 Dep detail: every unmerged dep with its phase, or `parked`, `missing` or `unreadable`. Parked is by name as `missingLeafMessage` does. Unreadable means a folder named for the slug exists under `issues/open` or `issues/closed` with `state.yaml` but the slug is absent from inventory (covers bad YAML, duplicate, foreign, invalid depth). Missing means no such folder and not parked. Merged open or closed never appears and never blocks, via inventory covering both areas.
- D4 Input detail: every missing `Gap` by kind, name and holder, never values. Reuse `gaps()`. If deps block, report deps only.
- D5 Failed line contains slug, `failed` and `phase recovery`. Merged picked completes as today with no line.
- D6 Interfaces: replace `dispatchLeaf` explicit flag with picked flag. `sweep` takes the same flag. `dispatchDependents` and merge paths always pass non-picked. `nextCommand` passes picked for selection sweeps and `--all` sweeps, non-picked otherwise. `selectLeaves` unchanged. `eligibility` truth value, merge order and capacity unchanged.
- D7 Messages reuse throw-and-catch for picked waits, matching repo style. Dep message extends current `Leaf dependencies are not merged: <slug>` with `: <dep> (<label>), ...`. Input message keeps current `Leaf inputs are missing: <slug>: <kind> <name> in <holder>, ...`. Failed message is new and contains the D5 substrings. Tests assert substrings (slug, reason, blockers, phases, input names) and side effects, never full prose.
- D8 Tests run at the CLI boundary with `tests/helpers.ts` plus fake herdr, asserting herdr calls, stderr JSON records via `skips()`, and exit codes. New tests append at the end of `tests/next.test.ts` under a `blocked-report` header. Each new behavior shows one deliberate red (for example drop one blocker from the list). No live herdr run.
- D9 Docs: only `docs/guide/next.md` changes, with a new report section after How order is decided. Target forms and `docs/guide/parts.md` belong to sibling `named-targets` and are not touched. No agent doc changes.
- D10 Scope lock: no change to target resolution, `Selection`, eligibility truth, merge order, capacity, or anything under `issues/`. Whichever leaf of this issue merges second resolves overlap in `src/next.ts`, `tests/next.test.ts` and `docs/guide/next.md`.

## Read-first

- `brief.md` and `design.md` in `/home/ivan/Work/infra/akrogon/issues/open/next-named-targets/blocked-report`.
- `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md`, `README.md` for area map and command contracts.
- `learnings/LESSONS.md`: assert refusal plus reason plus side effects, never prose wording (2026-10-01); prove runner settings with a multi-file probe (2026-10-02); run code in a temp repo instead of review by reading (2026-09-10).
- `src/next.ts`: `report` 111-118, `dispatchLeaf` 593-667, `sweep` 698-717, `selectLeaves` 1160-1200, `nextCommand` 1236-1341 including `--all` 1260-1270 and exit 1341.
- `src/turn.ts:8-20` eligibility order, `src/readiness.ts` gaps, `src/state.ts:146-158` parked check, `src/phase.ts:186` completeOwner, `src/akrogon.ts:58-75` phase triggers mergeWake.
- `tests/helpers.ts` fixture plus cli plus leaf, `tests/fake-herdr.ts`, `tests/next.test.ts`: `skips` 1157-1168, missing deps 1204, readiness helpers 3775-3795, gapped tests 3797-3875.
- `docs/guide/next.md` current How order is decided section, insertion point for the report section.

## Needed interfaces

- `src/state.ts`: `export function isParked(repo: Repo, slug: string): boolean` extracted from `missingLeafMessage` without changing its output. `missingLeafMessage` calls it.
- `src/state.ts`: `export function hasLeafFolder(repo: Repo, slug: string): boolean` true when any directory named `slug` under `issues/open` or `issues/closed` contains `state.yaml`. Used only to separate unreadable from missing.
- `src/turn.ts`: `export type DepDetail = { slug: string; label: string }` where label is a phase or `parked`, `missing` or `unreadable`. `export function unmergedDeps(repo: Repo, leaf: Leaf, leaves: Leaf[]): DepDetail[]` lists every blocked-by slug whose inventory entry is absent or not merged, in blocked-by order. `export function blockDetail(global: GlobalConfig, repo: Repo, leaf: Leaf, leaves: Leaf[]): { kind: 'deps'; deps: DepDetail[] } | { kind: 'inputs'; missing: Gap[] } | null` mirrors `eligibility` order and nullness. `eligibility` body unchanged.
- `src/next.ts`: `dispatchLeaf(global, repo, identity, picked: boolean, invocation, mergeContext?)` where picked means this leaf is a report subject. `sweep(global, repo, leaves, invocation, picked: boolean)` passes picked through. `dispatchDependents` calls sweep with false. `mergePass` and hook plus `--resume` plus tab_closed paths call dispatch with false. Selection single-leaf branch and selection sweep plus both `--all` sweeps pass true.

Concrete scenario: epic folder holds ready, dep-blocked (by `plan.synthesis` leaf plus missing slug), input-blocked (env FOO plus file need.txt), and failed leaves. `next <epic-path>` dispatches ready, reports three lines with dep labels plus input kinds plus failed recovery, exits 1. Bare `next` with a hook event on the same tree reports nothing.

## Acceptance criteria

- C1 Folder target over ready plus dep-blocked plus input-blocked plus failed starts ready, prints exactly one line per blocked leaf naming leaf and reason, exits non-zero.
- C2 Dep line names every unmerged dep with phase or parked, missing or unreadable. Merged open or closed never appears and never blocks.
- C3 Input line names every missing input by kind, name and holder, never a value. Leaf blocked by both reports deps only.
- C4 Failed picked line says failed and needs phase recovery. Merged picked completes with no line.
- C5 Same leaf gives the same line by slug, one-leaf folder path, or multi-leaf folder path.
- C6 Bare typed `next` without event, `next --all` inside a repo, and `next --all` outside every repo report picked leaves the same way, including target or `--all` with `HERDR_PANE_ID` or inherited `HERDR_PLUGIN_EVENT_JSON`.
- C7 Plugin-event pass, `next --resume`, and merge wake after `phase` print no wait line and keep today's exit for waits. A dependent started by a completion inside a typed pass prints no wait line. Real errors still report on every path.
- C8 Merge turn, capacity and busy seats never produce a line.
- C9 `docs/guide/next.md` describes the report, its three reasons, the non-zero exit, and that automatic passes stay quiet.

## Ordered checklist

Wave 1 runs U1 plus U2 in parallel. Wave 2 runs U3. Wave 3 runs U4.

- [ ] U1 Blocker detail. Owns `src/turn.ts`, `src/state.ts`. Shared test resource: none, isolated fixtures only. Must land first: none. Covers C2 plus C3 detail plus C4 wording input. Add `isParked`, `hasLeafFolder`, `DepDetail`, `unmergedDeps`, `blockDetail` per Needed interfaces. Keep `eligibility`, `mergeQueue`, `missingLeafMessage` outputs unchanged. Verify with typecheck plus existing readiness tests.
- [ ] U2 Report docs. Owns `docs/guide/next.md`. Shared test resource: none. Must land first: none. Covers C9. Add one section after How order is decided describing subjects, three reasons in order, one line per picked leaf, exit 1, and automatic silence. Do not touch target forms. Verify with grep plus docs-links test.
- [ ] U3 Dispatch report. Owns `src/next.ts`. Shared test resource: none. Must land first: U1. Covers C1 plus C4 dispatch plus C5 sameness mechanism plus C6 classification plus C7 silence mechanism plus C8 silence. Replace explicit flag with picked flag, thread through sweep plus dispatchDependents plus nextCommand branches per D1 and D6, replace explicit-only throws with picked reports per D2 and D7, remove the non-explicit missing throw so automatic waits stay silent. Keep merged completion first, merge plus capacity plus busy silent, real errors reporting. Verify with typecheck plus existing next tests that do not assume silent manual waits.
- [ ] U4 CLI tests. Owns `tests/next.test.ts`. Shared test resource: none, each test builds its own fixture. Must land first: U3. Covers C1-C8. Append blocked-report tests at the end under one header, reuse `dispatchFixture`, `next`, `skips`, `database`, `leaf`, `readinessInput`. Update the manual-silence tests that now report (`missing dependencies skip...`, `next --all leaves a gapped leaf...`, `next refuses unmerged dependencies...` `--all` branch) to the new picked behavior. Include one deliberate red per new behavior. Verify with targeted plus full tests.

## Affected docs

- Human doc `docs/guide/next.md`: report subjects, three reasons, exit 1, automatic silence.
- No agent doc is affected.

## Verification

Each row maps one done-criterion to its proof, the failure it catches, size, and rerun trigger.

- C1: `bun test tests/next.test.ts -t "blocked-report epic folder"` catches missing line, wrong count, ready not started, or wrong exit. Size seconds. Rerun when `src/next.ts`, `src/turn.ts` or `src/state.ts` changes.
- C2: `bun test tests/next.test.ts -t "blocked-report dep detail"` catches dropped dep, wrong label, or merged dep blocking. Includes parked plus missing plus unreadable plus merged-open plus merged-closed in one leaf. Size seconds. Rerun on the same src set.
- C3: `bun test tests/next.test.ts -t "blocked-report input detail"` catches dropped input, leaked value, or inputs reported before deps. Size seconds. Rerun on the same src set.
- C4: `bun test tests/next.test.ts -t "blocked-report failed and merged"` catches failed silence, merged line, or merged not completing. Size seconds. Rerun on the same src set.
- C5: `bun test tests/next.test.ts -t "blocked-report same line"` catches slug versus one-leaf path versus multi-leaf path divergence. Size seconds. Rerun on the same src set.
- C6: `bun test tests/next.test.ts -t "blocked-report manual forms"` catches bare `--all`-inside `--all`-outside divergence, or `HERDR_PANE_ID` plus inherited event JSON changing a target or `--all` to automatic. Size seconds to one minute for multi-invocation runs. Rerun on the same src set.
- C7: `bun test tests/next.test.ts -t "blocked-report automatic silence"` plus `bun test tests/next.test.ts -t "blocked-report dependent not picked"` plus `bun test tests/next.test.ts -t "blocked-report real errors"` catches wait lines on hook, `--resume` or merge wake, dependent reports, or real errors going silent. Size one minute. Rerun on the same src set.
- C8: `bun test tests/next.test.ts -t "blocked-report no line"` catches merge turn, capacity or busy producing a line. Size seconds to one minute. Rerun on the same src set.
- C9: `grep -n "phase recovery" docs/guide/next.md && grep -n "exit 1" docs/guide/next.md && bun test tests/docs-links.test.ts` catches missing report text or broken guide links. Size seconds. Rerun when `docs/guide/next.md` changes.
- Checks: `bun run format`, `bun run typecheck`, `bun test --timeout=30000` catch style, type and regression failures including the updated manual-silence tests. Size minutes. Rerun before handoff.

Concrete verification from the leaf worktree:

```sh
bun test tests/next.test.ts -t "blocked-report" --timeout=30000
bun test tests/docs-links.test.ts --timeout=30000
bun run format
bun run typecheck
bun test --timeout=30000
git diff --check
```

Not a slow-run leaf. No restart boundaries.

## Open limitations

- L1 Unreadable uses the folder name as the slug hint because an unreadable `state.yaml` has no parsed slug. A leaf whose folder name differs from its slug reports a dep on it as missing instead of unreadable.
- L2 Foreign deps report as unreadable under D3 because the record exists but is excluded from inventory. The existing once-per-repo foreign summary on the same run names the foreign paths.

## Dependencies

None requiring ordering.

## Credentials

Design names no variable-named credentials. `akrogon status blocked-report` prints no `Missing:` lines. No human-only blocker.

## Implementation notes

2026-10-08: U4 edits `tests/next.test.ts`, which matches the `src/test-files.ts` path rule, so its worker commit ends with a `Test-Change: tests/next.test.ts <what was added and that no existing expectation changed>` trailer, plus one `Test-Change:` line per updated old test file naming the brief outcome that forced the update. Refines D8.

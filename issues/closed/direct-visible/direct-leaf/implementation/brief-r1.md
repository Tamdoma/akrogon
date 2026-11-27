# Repair brief R1 — direct verb validation, drop coordination, rerun serialization (F1, F3, F8)

## 1. Goal

Repair three review findings against `src/direct.ts`/`src/state.ts` and their tests, per plan
corrections C-D3, C-D5, C-new-D22 in `/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/plan.md`
(read the corrections section first — it is the contract) and review-B.md findings F1, F3, F8.

## 2. Numbered acceptance criteria

1. `akrogon direct` validates the documented draft: `ISSUE.md` at owner level
   (`issues/open/<owner>/ISSUE.md`), `brief.md` + `design.md` + `readiness.yaml` inside the leaf
   folder. Missing any of the four refuses naming the missing one, writing nothing.
2. Create refuses when an owner of the same name exists under `issues/closed` or `issues/parked`,
   and when the slug is taken by ANY open or closed leaf at any depth (a nested epic leaf
   `issues/open/epic-x/child/<slug>/state.yaml` included). Refusal writes nothing.
3. `akrogon direct-drop` checks collision at `<chart>/direct/<owner>` (the owner child), NOT the
   `direct/` parent: a chart whose `direct/` already holds capture logs but no `<owner>` child is
   accepted. The move runs under the owner `.lock` exclusive hold (flockHold, mirroring
   completeOwner src/phase.ts:406) with the enclosing-capture refusal (`enclosingCapture` from
   src/pack.ts — refuse when the owner is inside a run-check capture), and the phase eligibility is
   re-read under the global state lock so a concurrent move cannot pass it.
4. The rerun rewrite serializes under the global state lock `<globalHome>/.lock` (the same lock
   phase moves take, via `withLock` from src/state.ts): leaf re-resolved and state re-read inside
   the lock, seats applied against the CURRENT content so concurrent prompted/delivery_error writes
   survive.
5. tests/direct-create.test.ts and tests/direct-drop.test.ts cover the new refusals and the
   captures-present drop at the real CLI; existing expectations that baked in the wrong layout
   (leaf-level ISSUE.md, parent-destination drop) are corrected.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/plan.md` — corrections C-D3/C-D5/C-new-D22 (the contract), D3-D5 for untouched parts
- `/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/review-B.md` — F1/F3/F8 text
- `/home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/design.md` binding decisions 2 and 3
- `src/direct.ts` whole; `src/state.ts` (`slugLeafFolders`, `hasDirectMarker`, `rewriteSeatRefs`, `parseLeafState`, `leafFolders`, `withLock`, `worktreeLock`); `src/phase.ts` `completeOwner` lines 369-420 for the lock/capture pattern; `src/pack.ts` `enclosingCapture`; `src/flock.ts` `flockHold`
- `tests/direct-create.test.ts`, `tests/direct-drop.test.ts` whole; `tests/helpers.ts` fixture/cli/leaf/yaml
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Owned paths: `src/direct.ts`, direct-support functions in `src/state.ts`, `src/AREA.md` if stale, `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `docs/reference/commands.md` and `docs/use/quick-fix.md` for stale draft/drop wording only. Include consistency on the new destination and refusal conditions. A owns tests.
Do NOT touch: src/next.ts, src/reconcile.ts, src/status.ts, src/timing-report.ts, tests/direct-land.test.ts, tests/direct-seats.test.ts, tests/direct-timing.test.ts (other units own them).

Key facts:
- `withLock(path, action)` from src/state.ts is the global-lock primitive; the path is `resolve(globalHome(), '.lock')` — import `globalHome` from src/config.ts.
- `flockHold(lockPath, '-x')` from src/flock.ts returns `{ release }`; completeOwner uses it for the owner `.lock`.
- `enclosingCapture(owner)` from src/pack.ts returns a run id when the owner sits inside a live capture; completeOwner refuses then. Direct-drop must do the same BEFORE moving, and `refuseAbandonedCaptures(owner)` — check what completeOwner does at src/phase.ts:376/408 and mirror what applies to a drop (the owner's logs move WITH the folder for a drop, unlike completion which deletes them — the capture coordination is about writers mid-publish).
- The slug-taken scan: `leafFolders` on both `issues/open` and `issues/closed` finds every state-holding leaf at any depth; refuse when any matches basename slug EXCEPT the leaf's own rerun path. Closed/parked owner check: `existsSync(resolve(repo.root, 'issues/closed', owner))` / `issues/parked/<owner>`.
- The rerun read-modify-write: inside `withLock(global lock)` re-run `slugLeafFolders` + `hasDirectMarker` + read the raw yaml fresh, apply seat refs + delivery_error drops against that fresh content, write. `rewriteSeatRefs` in src/state.ts should take the lock internally or be split — your choice, but the lock must cover probe-free read-modify-write. Note: probing the reviewer (hc sessions) can stay OUTSIDE the lock (probes are slow; the state write is what's serialized).
- Chart skill (already correct): ISSUE.md owner-level. A already corrected the fixture and captured red proof.

Creation commit (A fills at wave start): a7127a22559407dda29958e65b6266df9d5936e1

## 5. Do-not, reasons and exceptions

A committed the red-first test corrections before this wave. Do not edit tests, even if green requires a fixture correction: report a mismatch with the exact output and reason. No stash, no process-pattern kills, no full verify. Commit WIP if needed and squash the returned work to one commit based on the creation SHA. Stay in your owned paths.

## 6. Ordered steps

Read section 3, implement the behavior in sections 2 and 4, run the targeted commands, and return one commit plus worker-report.md.

## 7. Commands

- `akrogon run-check --name r1-create -- bun test tests/direct-create.test.ts --timeout=120000`
- `akrogon run-check --name r1-drop -- bun test tests/direct-drop.test.ts --timeout=120000`
- `bun run typecheck`
- `bunx prettier --check src/direct.ts src/state.ts` (write-fix if needed)
Long evidence commands through `akrogon run-check` as shown, citing the printed `check <label>: <exit> <path>` line.

## 8. Done-when, evidence and report

All criteria green at the CLI, typecheck clean, one squashed product commit (test changes are already cited by A), report at `/home/ivan/.akrogon/worktrees/akrogon/direct-leaf-u1/worker-report.md`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

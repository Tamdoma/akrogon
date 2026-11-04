# Report: tasks-sections-board

Serial-solo implement (both plan waves held one unit). Base `f96367e6` (rebase onto `origin/main` was a no-op), head `ff06e7dd`.

## Changed files

- `herdr-app/tasks/model.js` — `board()` now returns `{ problems, machine, sections }`; `sectionFor` first-match (attention → Needs you, merged hidden/broadcast → Waiting, stopped/paused → Paused, busy/land-alive → Working, else Waiting); `reason()` (broadcast pending → live dep `waiting on repo/slug` → `merge queue #N` → `next: seats`); `dependents()` counts unmerged same-repo blockers; rows sorted `blocks` desc then `phase_since` asc; `parkedRow()`; `leafRow()` carries `folder` = `dirname(plan)`, `worktree`, seat cells, and `detail` limited to reasons/blockedBy/missing/moves(3)/kept; `pinIntent(spaceId, folder, view, …)` takes the folder; `pill`, `tags`, `clock`, `currentRepoName`, `repoRows`, `alerts`, `quiet` removed.
- `herdr-app/tasks/main.js` — section render with `section-<name>` ids and fixed-size labels (Needs you label `ansi1`); two-line rows (dim repo prefix, foreground slug, right-aligned seat icons + `chev-` chevron; line 2 phase/reason/`· time`/`· blocks N`); body click pins `row.folder` to Files via shared `worktree.pin` + `panel.request`; chevron `stop_propagation` + toggle only; expansion shows reasons in full, blockedBy, missing, last 3 moves, kept, Files/Changes (pin `row.worktree`); machine block above the list (scan failures built in `render`, env lines from `model.machine`, `run waiting` dim line reveals `detail` on click); header 42 px fixed with `N problems` in `ansi1` only when `env.red > 0`; `S()` only on row text/line 2/expansion/seat icons; `max_w` cap removed; pills, `withAlpha`, `alertLine`, `note`, `repoSection`, selected fill removed; seat icons use `TONE #ffffffb3` for tinted programs and `image("mono/<name>.png")` for colored ones, spinner `t.muted`.
- `herdr-app/tasks/model.d.ts` — `LeafJson` gains `attention`/`waits_on`; `Board`/`RowModel`/`SectionModel`/`MachineLine` replace the repo/alerts shapes (landed with the test commit as the tests' boundary).
- `tests/tasks-mod.test.ts`, `tests/tasks-mod-host.test.ts`, `tests/fixtures/status-envelope.json` — committed at planning; fixture gained `attention`/`waits_on` on every leaf.
- No doc changes: `src/AREA.md` and `docs/start/install.md` still accurate.

## Commands and results

- `akrogon run-check --name tasks-mod -- bun test tests/tasks-mod.test.ts --timeout=30000` → `check tasks-mod: 0`, 12/12 pass (implementation/check-tasks-mod-1793749880325-3240132.log); combined rerun `check tasks-mod: 0`, 25/25 across both files (check-tasks-mod-1793750039553-3247818.log).
- `akrogon run-check --name tasks-mod-host -- bun test tests/tasks-mod-host.test.ts --timeout=30000` → `check tasks-mod-host: 0`, 13/13 pass (check-tasks-mod-host-1793750034496-3247156.log). Two mid-run reds (label color on wrong element, line-2 text_size on parent) repaired before commit.
- `akrogon verify` first run on `d1127c6b` → red: `verify format: 1` (`tests/tasks-mod.test.ts` prettier drift); repaired by `ff06e7dd` (format only, no expectations).
- `akrogon verify` on `ff06e7dd` → `verify leaf ff06e7dd: green`. setup 0, format 0, typecheck 0, test 0 — 1308 tests / 75 files in 68 s (check-test-1793750130447-3249658.log). Wall time ~75 s for the verify pass; run-checks were seconds each.

## Criteria → proof

1. Sections/order/hidden merged+empty/no headings — model test "the board groups rows…" + host test "sections render in order…".
2. Attention beats busy; stopped+busy → Paused; first phrase — model test "attention puts a busy leaf…".
3. Waiting reasons + time source — model test "Waiting rows show live blockers…" (`9m`/`4h` short forms via `since`).
4. `blocks N` ordering — model test "rows with more unmerged same-repo dependents…".
5. Header problems + machine lines + no slow-merge/Failed/Missing — model test "machine lines carry deploy…" + host tests "the header shows…", "scan failures draw…", "the run waiting line is dim…".
6. Folder pin / chevron / parked / buttons — host tests "a row shows seats…click pins the leaf folder to Files", "the chevron toggles expansion without pinning; parked rows have no click target", "same slugs…pin independently", "panel request sequences…".
7. Expansion contents/exclusions — model test "the expansion detail shows…" + host test "the expansion shows the reason whole…".
8. No pills/red placement/icons — host tests "a Needs you row keeps a white slug…", "a row shows seats as one-color program icons and a muted spinner" (no `font_semibold` anywhere in a row).
9. Scaling + no cap — host test "row text and seat icons follow the terminal font size while chrome stays fixed; the list has no width cap".

Planned tests were shown red at planning (recorded in plan.md); three test-side fixes landed inside the plan commit (ancestor-matching lookups, fixture-row ordering assumptions, `now − busy` = 10m) and one format-only commit; no expectation was weakened.

## check.fix 2026-11-04 — F2 repair

- B repaired review F1 (chevron full-row-height) in `03bed4b` + `08781e62`; A's F2 handoff: restore the rendered `kept.reason` assertion.
- Repaired in `19998b35` (`tests/tasks-mod-host.test.ts` asserts each kept entry's reason beside its path; `Test-Change` trailer cites review-B F2 and criterion 7).
- Proof: `akrogon run-check --name check-fix-F2 -- bun test tests/tasks-mod-host.test.ts tests/tasks-mod.test.ts --timeout=30000` → `check check-fix-F2: 0`, 26/26 (implementation/check-check-fix-F2-1793750524790-3582333.log).
- `akrogon verify` on `19998b35` → green: format, typecheck, test 0 — 1309 tests / 75 files in 73 s (check-test-1793750605347-3582865.log). Rebase onto origin/main was a no-op; reviewed base `f96367e6` unchanged, head `19998b35`.

## Limitations and unverified criteria

- B's standing dissent (task-only count, live diagnostic target, colored icons, header scaling) and C's folded Done line remain recorded dissent, not implemented.
- The pane/log jump for a row click is deferred to the herdr-app chart; the row pins the leaf's issue folder per design.
- `attention`/`waits_on`/`red` correctness is the producer leaf's; the board trusts the fields.
- Live herdr-app rendering was not screenshot-verified in this pass; all proofs are the element-tree host harness per standing design.

# Report: blocked-report implement (slot A)

Inline build after delegated workers could not run. Two wave-1 workers (sa-1 U1, sa-2 U2) completed with 0 tool calls, claiming no filesystem access. A probe worker (sa-3) confirmed no `exec` tool exists in child sessions, so no nested file operations were possible. Transcripts: sa-1, sa-2, sa-3 under `/home/ivan/.pi/agent/sessions/` (cwd `blocked-report-u1`, `blocked-report-u2`). Worker worktrees `blocked-report-u1` and `blocked-report-u2` were created at base, never committed, and removed. A implemented U1, U2, U3, U4 in plan wave order in the lane, following `implementation/brief-1.md` through `brief-4.md`.

## Changed files and reasons

- `config.yaml`: restores `{model}` placeholder in the claude harness, cherry-picking main `4534a56`. Base `3e034de` pinned `claude-sonnet-5-5`, failing 3 harness-template tests red-on-base (confirmed via base worktree run, logs below). Identical to main so rebase skips it.
- `src/state.ts` (U1): adds `isParked` extracted from `missingLeafMessage` (output unchanged) and `hasLeafFolder` for unreadable-vs-missing.
- `src/turn.ts` (U1): adds `DepDetail`, `unmergedDeps` in blocked-by order, and `blockDetail` mirroring `eligibility` order and nullness. `eligibility` body unchanged.
- `src/next.ts` (U3): replaces the explicit flag with a picked flag through `dispatchLeaf`, `sweep`, `dispatchDependents`, `sweepAll`, and every `nextCommand` branch. Picked merged completes silent; picked failed, deps, and inputs throw detailed lines caught into one `report()` each; automatic paths return waiting silent. Deletes the non-explicit missing throw.
- `docs/guide/next.md` (U2): adds When picked work cannot start after How order is decided (subjects, three reasons, exit 1, automatic silence). Target forms untouched.
- `tests/next.test.ts` (U4): appends 13 blocked-report CLI cases proving C1-C8; updates 13 manual-silence expectations to picked reports per brief criteria 1-4 and 6.
- `tests/batch-dispatch.test.ts` (U4): updates 5 manual `--all` expectations to picked failed/dep reports per brief criteria 2 and 4.

Base: `3e034dee43f0853446c2ba8f97bb72668ab213dc`. Head: `0303a1132bd7d2bca9a9e4fc2687d835f6b7e985`. Lane branch `blocked-report`, clean. Diff: 7 files, 478 insertions, 47 deletions.

## Commands with results and artifact paths

- U1 probe (temp script under `mktemp -d`, deleted): parked true/false, folder true/false, missing messages, `unmergedDeps` 4 labels in order, `blockDetail` deps/inputs/null matching `eligibility`. Result `PROBE OK`, exit 0.
- U3 probes (temp script, deleted): P1 picked dep folder reports `Leaf dependencies are not merged: blocked: ready (plan.synthesis)`, exit 1, ready dispatched; P2 `--resume` on allocated blocked silent, exit 0; P3 merged target completes with blocked dependent silent, exit 0. Result `ALL PROBES OK`.
- Deliberate reds (temp src edits, restored via `git checkout`, tests green after each):
  - R1 `isParked` forced false: T2 fails, expected `(parked)`, received `parked-dep (missing)`. Green after restore.
  - R2 `blockDetail` skips inputs: T3 fails, expected code 1, received 0. Green after restore.
  - R3 failed throw removed: T4 fails, expected code 1, received 0. Green after restore.
  - R4 `sweepAll` true to false: T6a outside `--all` fails, expected 1, received 0. Green after restore.
  - R5 `dispatchDependents` false to true: T7b fails, expected 0, received 1. Green after restore.
- `bun test tests/next.test.ts -t "blocked-report" --timeout=30000`: 13 pass, 0 fail (~1s).
- `bun test --changed="$AKROGON_BASE" --timeout=30000` post-commit: 440 pass, 0 fail (20.90s).
- `bun test --timeout=30000` full pre-commit same content: 552 pass, 0 fail (25.18s). Reused post-commit (content identical, HEAD only adds commit metadata).
- `bun run typecheck`: pass (`tsc --noEmit`, exit 0).
- `bun run format`: pass (exit 0). Reformatted U3 long line plus new tests; pre-existing `src/status.ts` drift reverted as out of scope (not rerun after revert to keep the tree clean for phase).
- `bun test tests/docs-links.test.ts --timeout=30000`: 3 pass, 0 fail.
- `grep -n "phase recovery"|"exit 1"|"automatic" docs/guide/next.md`: hits on lines 102, 100, 104 (C9 text).
- `git diff --check`: clean. `git status --porcelain`: empty.
- Base-red proof for `tests/harness-template.test.ts` (3 claude-template fails, no cause in leaf diff): leaf log `/tmp/akrogon-1000/blocked-report-44bc777275a0/tmp.kKK1mbOBPJ/leaf-harness.log` (0 pass, 3 fail, exit 1); base log `.../base-harness2.log` in detached base worktree at `3e034de` after `bun install` (0 pass, 3 fail, exit 1); install log `.../base-install.log`. Failing names: carries-no-literal plus two substitutes. Tails: expected `opus`/`claude-opus-5-5`, received `claude-sonnet-5-5`. Base worktree removed with `git worktree remove --force` before any outcome. Same literal, same tests, no diff cause, so base explains leaf; fixed by cherry-picking main `4534a56` as above.

## Criterion evidence

- C1 epic folder: `blocked-report epic folder starts ready and reports dep, input, failed` (3 skips, ready prompt, exit 1).
- C2 dep detail: `blocked-report dep detail labels parked, missing, unreadable and skips merged` (`(implement)`, `(parked)`, `(missing)`, `(unreadable)`, merged absent) plus updated `missing dependencies skip...` (2 skips).
- C3 inputs: `blocked-report input detail names gaps without values and defers to deps` (env/FOO/file/need.txt/repo, secret absent, deps win over BAR).
- C4 failed/merged: `blocked-report failed and merged share a folder without a merged line` (failed recovery substrings, 1 skip) plus updated failed tests (F6, F11, F12, F8) to exit 1 with notify/prompt assertions kept.
- C5 same line: `blocked-report same line by slug, leaf path, and epic path` (identical error strings, ready dispatched on multi-leaf).
- C6 manual forms: `blocked-report manual forms bare, all inside, all outside match` plus `... stay manual with pane and event set` (identical blocked lines, exit 1 each).
- C7 automatic silence: `... automatic silence on hook, resume, and merge wake` (hook/stderr empty, resume/stderr empty, phase stderr lacks wait slugs), `... dependent not picked when started by completion` (code 0, stderr empty), `... real errors still report on automatic paths` (malformed reported on manual, hook, resume).
- C8 no line: `... no line for capacity waits`, `... merge turn waits`, `... busy seats` (all code 0, stderr empty, holder/ready dispatched).
- C9 docs: grep hits above plus `docs-links` green.

## Known limitations

- L1 unreadable uses the folder name as the slug hint; a leaf whose folder differs from its slug reports a dep on it as missing.
- L2 foreign deps report as unreadable; the existing once-per-repo foreign summary on the same run names the paths.

## Unverified criteria

None.

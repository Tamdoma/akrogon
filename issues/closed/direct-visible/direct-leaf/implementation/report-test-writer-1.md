# Report: test writer 1 — direct-create and direct-drop

## Files written (new, nothing else touched)

- tests/direct-create.test.ts — 12 tests (criterion 1 + criterion 2).
- tests/direct-drop.test.ts — 6 tests (criterion 9).

No commits made. Nothing under src/ or any existing file modified. Helpers that were missing
(standin terminal spawn, raw state.yaml read/write, worktree porcelain stanza lookup, run-record
seeding, shim/stop log readers) are local to the files, per instructions; minor duplication between
the two files is intentional since shared helpers were off-limits.

## Run result

bun test tests/direct-create.test.ts tests/direct-drop.test.ts --timeout=120000: **0 pass, 18 fail**,
about 0.5 s wall at red. Every failure is missing-verb shaped, which is the correct planning red:

- The happy-path and rerun tests fail at expect(code).toBe(0) with stderr
  "akrogon direct --help: unknown flag --reviewer" (or --chart for drop): the verb does not exist.
- The refusal tests fail at expect(refused.stderr).not.toMatch(/Usage|unknown flag/): the exit is
  already non-zero and stderr non-empty, so without that assertion these tests would pass vacuously
  at planning. It forces the red to be semantic and documents that a real refusal is not a parse error.

Per test, one line:

### tests/direct-create.test.ts

1. direct creates the leaf — red: exit 1 "unknown flag --reviewer" (verb missing).
2. direct preserves the order of repeated --source flags — red: same missing-verb parse error.
3. refuses outside hc: no HC_TERMINAL_ID — red: stderr is a flag-parse error, not the semantic refusal.
4. refuses a dead HC_TERMINAL_ID — red: same.
5. refuses when no open folder holds the slug — red: same.
6. refuses when two owner folders hold the slug — red: same.
7. refuses a folder whose state.yaml is not a direct leaf — red: same (also asserts the pinned
   text "is not a direct leaf" and byte-unchanged pre-existing state.yaml at green).
8. refuses when the owner folder holds a sibling leaf with state.yaml — red: parse error.
9. refuses a reviewer address dead in every live session — red: parse error.
10. refuses a reviewer two live sessions resolve — red: parse error. Construction verified
    separately at planning: a symlinked second socket name lists both sessions in sessions().live
    and terminal() resolves the same address under each; dead probes throw not_found.
11. a rerun rewrites seats only — red: the setup create exits 1 (missing verb).
12. a rerun on a merged leaf in issues/closed — red: same.

### tests/direct-drop.test.ts

1. direct-drop cancels the run, stops slice and scopes — red: exit 1 "unknown flag --chart".
2. refuses a leaf that is not direct — red: parse error instead of the semantic refusal.
3. refuses a direct leaf in the merge phase — red: same.
4. refuses a merged direct leaf in issues/closed — red: same.
5. refuses when the chart direct folder already exists — red: same.
6. refuses without --chart — red: stderr is the generic verb usage (contains no --chart), which
   matches the assertion exactly once the verb exists.

The schema-rejection red the plan mentions does not surface because no test reaches a reader of a
direct state at planning — the missing verb stops everything earlier. That is the honest red; the
seeded direct states are written raw yaml precisely because readState/saveState cannot round-trip
them before the schema gains direct.

## Typecheck

bun run typecheck (tsc --noEmit): zero errors in tests/direct-create.test.ts and
tests/direct-drop.test.ts. (Other tests/direct-*.test.ts files in this worktree belong to parallel
writers and carry their own errors; not mine.)

## Green-time verification done at planning (what red cannot exercise)

- Run-record seeding chain, executed against real src/admission.ts: a record seeded with a live
  sleeper pid + correct /proc start time + boot id is returned by liveRuns();
  cancelLeafRuns marks it cancel: true and keeps state: 'live' — so the happy-path assertion is
  cancel: true on the record file, not state: 'cancelled' (live records are never state-cancelled).
- Seeded direct state minus direct parses under the current stateSchema, including the seeded
  delivery_error/prompted shapes — the seeds fit the schema the rerun will re-save them under.
- git worktree list --porcelain parsing verified against a real locked/unlocked worktree (the
  locked-line detection works).
- status --json envelope/leaf-row zod shape verified against a real fixture leaf.
- Worktree HEAD equals refs/remotes/origin/main for a fresh worktree on the fixture base.

## Deviations from plan.md constructions, with reasons

1. **tests/charting.test.ts does not exist** (never existed in this repo's history). The
   spawn-and-adopt precedent used instead: tests/door-exchange.test.ts (core.hc(['run', ...])
   plain terminals) plus adopt() usage from tests/next.test.ts/tests/hc-window-calls.test.ts.
   Terminals are spawned as plain cat with akrogon=1 + herdr.space/herdr.tab labels and an
   active adopt() per plan D16b. Labels verified harmless: every seat-discovery query in src
   additionally requires akrogon.repo/akrogon.leaf, which these terminals never carry.
2. **Owner-level ISSUE.md in addition to the leaf-level one.** Criterion 1 requires ISSUE.md inside
   the leaf folder; criterion 9 asserts <chart>/direct/ISSUE.md "moved with the owner", which only
   exists if the owner folder carries its own copy. The leaf owner folder in this very issue
   (issues/open/direct-visible/ISSUE.md) has exactly that shape, so both are written. Plain files
   in owner folders are invisible to readInventory.
3. **Drop tests seed the direct leaf with yaml() instead of the create verb** (criterion 9 says
   only "Direct leaf in implement"). Follows plan D16a (direct-leaf fixtures written directly, "no
   dependency on the create verb"); the rerun tests do use the verb for setup because the criterion-1
   construction binds that ordering.
4. **Anti-vacuous assertion added to refusal tests** (stderr must not match /Usage|unknown flag/,
   except the missing---chart case where a usage-shaped error is the correct outcome). Without it
   the refusal tests pass vacuously at planning, which the instructions forbid.
5. **Pinned message "is not a direct leaf" asserted in drop's non-direct refusal too.** D4 pins that
   text only for the create rerun scan; drop shares the semantics, so the same message is asserted.
   Keyword assertions elsewhere are minimal (HC_TERMINAL_ID, --chart); other refusals assert
   meaningful stderr (non-empty, non-usage) plus full nothing-written checks, since pinning unpinned
   wording would over-constrain.
6. **--chart passed repo-relative** (issues/chart/chart-x, cwd is the repo root), matching the
   "akrogon pack issues/chart/outer" precedent from close-pack tests; chart folder pre-created with a
   CHART.md.
7. **No-recreate evidence in the implement-phase rerun strengthened**: an untracked sentinel file in
   the worktree (branch-head equality alone cannot distinguish untouched from recreated). The merged
   rerun keeps the plain not-created assertions since there is no worktree to preserve.
8. **Run record seeded with state: 'live' plus units in the fake systemctl db** (leaf slice, run scope,
   guard), replicating run-units.test.ts 6i locally since that helper is not importable. The fake
   systemctl exits 5 when stopping an unloaded unit and stopLeaf never excuses the slice stop, so
   the units must exist in the db for the happy path to reach exit 0.
9. **stdout interface assertions use realpath-normalized paths** because readRepo realpaths the
   repo root; printing canonical paths is the only consistent implementation.

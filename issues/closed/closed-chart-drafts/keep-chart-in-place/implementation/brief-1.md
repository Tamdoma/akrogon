# Brief-1: keep chart in place on owner completion

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/keep-chart-in-place-u1

## 1. Goal

Stop `completeOwner` from moving `issues/chart/<owner>` into `issues/closed/<owner>/chart` on owner completion; the chart stays in place, the completed record still moves to `issues/closed/<owner>/`. Plan decisions D1-D8 (copied below where binding).

## 2. Numbered acceptance criteria

- B1: `src/phase.ts` contains no chart rename in `completeOwner`; the owner still moves to `issues/closed/<owner>/` (plan C1).
- B2: The completion test and the closure-retry test in tests/phase.test.ts assert `issues/chart/<owner>/CHART.md` exists after completion and `issues/closed/<owner>/chart` does not (plan C2).
- B3: New regression test in tests/phase.test.ts named `completion leaves a chart holding a same-slug draft in place and keeps the inventory readable`: epic fixture, chart holds `slots/leaf-draft/<slug>/state.yaml` with bytes copied from a real leaf's state.yaml (same slug); merge every leaf via real `phase <slug> merged`; chart file tree byte-identical before/after; `next --all` exits 0 with stderr containing neither `Invalid leaf depth` nor `Duplicate leaf slug`; `status <slug>` for a merged leaf exits 0 (plan C3).
- B4: B3 fails on current code (red) and passes after the fix (green). Red may come from any of its assertions; paste both runs.

## 3. Read-first list

- src/phase.ts lines 138-175 (`completeOwner`; the chart lines are 173-174)
- tests/phase.test.ts completion test (~169-185) and closure-retry loop (~638-683)
- tests/helpers.ts (`fixture`, `cli`, `leaf`, `fakeHerdr`)
- src/state.ts (`validateLeafDepth`, `leavesUnder`) and src/next.ts `discover` visit (why the moved chart breaks the inventory: draft lands at depth 5, depth is checked before slug dedup)
- Pattern to copy: the completion test's epic fixture (`leaf(f, 'one', 'merge', {}, 'epic/first')`, real `cli(f, ['phase', slug, 'merged'])` calls, `existsSync` assertions)
- /home/ivan/.pi/agent/skills/implement-issue/ponytail.md
- Open the repo index only for a gap in this list.

## 4. Change list and needed interfaces

Owned paths: src/phase.ts (D1 hunk only), tests/phase.test.ts (B2 flips + B3 test + `node:fs` import addition). Prerequisites: none. Shared resources: none. This is the only unit; no preceding worker output.

 Exact edits:

1. src/phase.ts: delete these two lines in `completeOwner`, keep everything else:
   `const chart: string = resolve(repo.root, 'issues/chart', basename(owner));`
   `if (existsSync(chart)) renameSync(chart, resolve(destination, 'chart'));`
   Keep all imports (`existsSync`, `basename`, `resolve` are used elsewhere in the file).
2. Completion test: replace
   `expect(existsSync(resolve(f.root, 'issues/closed/epic/chart/CHART.md'))).toBe(true);`
   `expect(existsSync(resolve(f.root, 'issues/chart/epic'))).toBe(false);`
   with
   `expect(existsSync(resolve(f.root, 'issues/chart/epic/CHART.md'))).toBe(true);`
   `expect(existsSync(resolve(f.root, 'issues/closed/epic/chart'))).toBe(false);`
3. Retry loop (covers both `standalone`/`epic` scopes via `chart`/`probe.closed` locals): replace
   `expect(existsSync(resolve(probe.closed, 'chart/CHART.md'))).toBe(true);`
   `expect(existsSync(chart)).toBe(false);`
   with
   `expect(existsSync(resolve(chart, 'CHART.md'))).toBe(true);`
   `expect(existsSync(resolve(probe.closed, 'chart'))).toBe(false);`
4. B3 regression (new test, epic shape): two leaves in two issues under one epic (e.g. `leaf(f, 'alpha', 'merge', {}, 'epic/one')`, `leaf(f, 'beta', 'merge', {}, 'epic/two')`); chart dir `issues/chart/epic/` with `CHART.md` plus `slots/leaf-draft/alpha/state.yaml` whose bytes equal the real `alpha` leaf's state.yaml bytes (read after `leaf()` creates it). Snapshot helper: recursive map of relative path to file bytes under the chart dir (add `readdirSync`/`statSync` to the `node:fs` import), snapshot before the first merge, `toEqual` after the last. Merge each leaf with `cli(f, ['phase', slug, 'merged'])` expecting code 0. Then `const herdr = fakeHerdr(f); cli(f, ['next', '--all'], f.root, herdr.env)` expecting code 0 and clean stderr; `cli(f, ['status', 'alpha'])` expecting code 0. Give the test a 15000ms timeout.

## 5. Do-not, reasons and exceptions

- Do not touch readers (`discover`, `leavesUnder`, status, park): reader behavior belongs to sibling leaf unreadable-capacity; overlapping edits break its lane. Exception: none.
- Do not add a `Closed` marker, migrate existing `issues/closed/*/chart` folders, or edit skills/docs: locked out by the design; already-archived charts stay. Exception: none.
- Do not edit tests/next.test.ts or tests/state.test.ts: the invalid-depth negatives there must pass unchanged. Exception: none.
- Do not add other tests or refactor: one regression plus the two flips is the whole scope; extra tests are vanity. Exception: none.
- Do not change scope or any interface on a conflict: return a mismatch naming the requirement, the actual code, and the smallest brief correction. Exception: a revised brief from B authorizing the change.
- Restated: readers, markers, migration, docs, other test files, and extra scope are all out because they belong to another leaf, are locked out by the design, or add vanity; any conflict returns as a mismatch unless B revises this brief.

## 6. Ordered steps

1. Ensure dependencies in the worktree (`bun install`), read section 3 files (all criteria).
2. Apply the B2 flips and write the B3 regression before touching src/phase.ts (tests derived before code) (B2, B3).
3. Run section 7 command: B2-flipped and B3 tests fail on current code; paste the red output (B4).
4. Apply the src/phase.ts edit (B1).
5. Rerun section 7 command until green; paste the green output (B1-B4).
6. Commit only this chunk in the worktree (`git add src/phase.ts tests/phase.test.ts`, one commit), return the commit ID with the section 8 report.

Advisory size: 2 files, under 12 turns (each file costs read, edit, test). Work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

Run only this (base supplied, already verified to detect uncommitted edits and run the full changed file):

`AKROGON_BASE=53508e807128de2a77b22cf4874e266224cf4f0e : "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"`

Confirm the output shows tests/phase.test.ts ran (31+ tests); a 0-test run is not evidence. B runs the full suite separately.

## 8. Done-when, evidence and report

Done when B1-B4 hold with pasted red and green runs of the section 7 command, the chunk committed, and the four lines below filled. No end-to-end artifact beyond the test output (B does the retained full-file run). Follows the repo's test contract: temp fixture repos, real CLI processes, herdr replaced at one boundary via `fakeHerdr`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

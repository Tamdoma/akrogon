# Brief-1: unreadable-capacity fix plus tests

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/unreadable-capacity-u1
Leaf plan: /home/ivan/Work/infra/akrogon/issues/open/closed-chart-drafts/unreadable-capacity/plan.md

## 1. Goal

Fix `activeCount` per plan D1 plus D2 and update plus add tests per D5 plus D6 plus D7. One worker owns both files so red then green stays in one commit.

## 2. Numbered acceptance criteria

B1: `activeCount` per repo returns `global.max_active` when `inventory.unknown` is true, else live readable count plus `inventory.unreadable`. Live readable means phase is not merged and not failed and a live pane matches recorded tab or worktree cwd. Verify by updated plus new tests below.
B2: Existing test near 699 now allocates exactly one leaf at `max_active` 2 with one malformed entry and two waiting leaves. Keeps one skip for malformed path and exit 1. Retry at `max_active` 4 allocates both. Verify by running that test file.
B3: Existing test near 1111 blocks `new` at capacity 3 and allocates `new` at capacity 4 with one live leaf plus two unreadable entries. Keeps both skips and exit 1. Verify by running that test file.
B4: Existing test near 1353 admits `healthy` at `max_active` 2 with one malformed entry plus two foreign leaves. Keeps malformed skip plus foreign count 2 and exit 1. Verify by running that test file.
B5: New regression test fails on current code and passes after the fix. Setup is two repos at `max_active` 3. First repo has one malformed entry plus at least three merged leaves plus two waiting leaves with no live panes. Second repo has one waiting leaf with no live panes. Explicitly dispatch second repo leaf, then one first repo waiting leaf, assert both allocate. Explicitly attempt the remaining waiting leaf and assert it stays unallocated with no new tab. Assert exactly two allocated, skips include malformed path, exit is nonzero. Verify by running the new test before the src change for red and after for green.
B6: New negative test at `max_active` 1 with one malformed entry plus one waiting leaf allocates nothing. Zero tabs, zero prompts, one skip, exit 1. Verify by running that test file.
B7: Failed, existing-tab, duplicate-slug, foreign-summary, and unknown-population behavior keep passing. Verify by changed-test run covering `tests/next.test.ts`.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/worktrees/unreadable-capacity-u1/src/next.ts` lines 60-120 plus 265-284
- `/home/ivan/Work/infra/akrogon/issues/worktrees/unreadable-capacity-u1/tests/next.test.ts` lines 699-715, 1111-1134, 1353-1373, 1496-1511, 2334-2359, helpers 1045-1067
- `/home/ivan/Work/infra/akrogon/issues/worktrees/unreadable-capacity-u1/tests/helpers.ts` lines 60-90
- Pattern to copy: `dispatchFixture` plus `next` plus `skips` plus `configure` plus `leaf` in the files above
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Open `docs/reference-index.md` only on a gap in this list

## 4. Change list and needed interfaces

Files:

- `src/next.ts`: edit `activeCount` only. Replace the branch that counts every non-failed leaf when unreadable is present with one shared predicate plus `inventory.unreadable`.
- `tests/next.test.ts`: update three tests per B2 to B4 and add two tests per B5 plus B6.

Needed interfaces:

- `activeCount(global, invocation): Promise<number>` keeps signature
- `Inventory` keeps `{ leaves, unreadable, unknown, foreign }`
- Liveness check is `pane.tab_id === leaf.state.tab` or `inWorktree(pane.cwd, leaf)` from `src/next.ts`
- Test helpers are `dispatchFixture`, `next(f, args)`, `skips(result)`, `configure(f, extra)`, `leaf(f, slug, phase, extra, container)`, `database(f)` for tabs plus prompts

Chunks that must land first: none. Single unit owns the full change.
Paths this unit owns: `src/next.ts`, `tests/next.test.ts`.
Shared test resource: none. No consumed output from a preceding worker.

## 5. Do-not, reasons and exceptions

- Do not touch `discover`, `report`, `allLeaves`, `findLeaf`, error text, or exit codes. Reason: locked design keeps discovery plus strict lookup unchanged. Exception: revised brief from B.
- Do not touch `src/phase.ts` or any path under `issues/`. Reason: leaf scope owns only `src/next.ts` plus tests and issue artifacts live only in the registered checkout. Exception: revised brief from B.
- Do not edit docs or `AREA.md`. Reason: plan records no doc affected. Exception: revised brief from B.
- Do not add category exemptions for unreadable files by location. Reason: foreclosed by locked decision Q1. Exception: revised brief from B.
- Do not change scope or an interface on conflict. Return a mismatch with conflicting requirement plus actual code evidence plus smallest brief correction. Reason: B owns brief corrections. Exception: revised brief from B authorizing that change.

Reasons restated: scope lock keeps discovery plus strict lookup stable, issue paths stay out of the branch, docs stay clean, and B fixes brief conflicts. Exceptions restated: only a revised brief from B authorizes a change listed above.

## 6. Ordered steps

1. In `tests/next.test.ts` write the B5 regression test first for criterion B5. Run it to show red on current code.
2. In `tests/next.test.ts` update the B2 test for criterion B2. Run it to show red.
3. In `tests/next.test.ts` update the B3 plus B4 tests for criteria B3 plus B4. Run them to show red.
4. In `tests/next.test.ts` add the B6 negative test for criterion B6. Run it to confirm it passes both before and after since one unreadable entry already blocks capacity 1.
5. In `src/next.ts` apply the `activeCount` fix for criterion B1. Keep the change to that function only.
6. Run the changed-test command from section 7 for criteria B2 through B7 until green.
7. Commit only `src/next.ts` plus `tests/next.test.ts` with a short message naming the leaf.

Advisory size: about 2 files and under 12 turns. Each file costs a read plus an edit plus a test run. Work clearly beyond it returns a mismatch with evidence.

## 7. Commands

Run only this changed-test command with the supplied base value:

```sh
AKROGON_BASE=53508e807128de2a77b22cf4874e266224cf4f0e bun test --changed="53508e807128de2a77b22cf4874e266224cf4f0e"
```

Install dependencies with `bun install` in the worktree before the first test run.

## 8. Done-when, evidence and report

Done when B1 through B7 hold with red then green shown for B5 and green changed-test output pasted. Scenarios use temp repos with real files plus processes and fake herdr at one boundary. No real panes, install roots, GitHub, or herdr socket. Tests assert observable allocation plus skips plus exit codes, not wording except literal commands plus numbers plus fixed references.

Reread this section and fill its report before returning.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

# Brief 1: completion-line code and tests

Repair revision 2026-09-30 (check.fix round 1, review-B F1): the `src/phase.ts` change already landed and must not be touched again. This revision covers only the `tests/phase.test.ts` assertion repair below; acceptance criteria AC1-AC5 keep their full strength on the completion contract.

## 1. Goal

Implement plan decisions D2, D3, D4 (scope D1): `akrogon phase <slug> merged` prints a completion line only when the leaf's completion owner finishes.

Binding facts: in `src/phase.ts` `completeOwner`, delete `if (justMerged) console.log(`issue complete ${basename(issue)}`)` before the completion guard. After the remaining-sources closure and before `if (!complete) return;`, print only when `complete && justMerged`: `issue complete <basename(owner)>` when `owner === issue`, else `epic complete <basename(owner)>`. Closure order and the folder move stay as they are. No new lock; the existing `withLock` serialization keeps concurrent final merges exactly-once. Foreclosed: a single `issue complete <owner>` line naming epics as issues.

## 2. Numbered acceptance criteria

- **AC1.** Epic of two issues: merging every leaf of the first prints neither `issue complete` nor `epic complete`; merging the last leaf of the second prints `epic complete <epic>` exactly once. Verified by the updated completion test in `tests/phase.test.ts`.
- **AC2.** Two final leaves of one completion owner merged concurrently: exactly one invocation prints the completion line. Verified by the race asserts in the same test.
- **AC3.** Standalone issue still prints `issue complete <issue>` on its last merge. Verified by existing standalone asserts; `tests/next.test.ts:844,1007` are untouched and must still pass.
- **AC4.** Recovery paths (`merged` retried on a merged leaf, `akrogon next` completing a merged leaf) print no completion line; repeated `merged` stays refused with no completion line. Verified by existing retry/recovery asserts.
- **AC5.** Source-closure asserts pass unchanged (private sources close when their inner issue finishes, remaining sources close at epic completion); only printed-line expectations change. Verified by the updated private-sources test.

## 3. Read-first list

- `src/phase.ts` `completeOwner` (lines 138-173), caller line 126 (`justMerged: true`), line 282 and `src/next.ts:521` (`justMerged: false`).
- `src/state.ts` `withLock`, `findLeaf`, `leavesUnder`.
- `tests/phase.test.ts` completion test (~169-191), private-sources test (~566-650), retry/recovery tests (~660-730).
- `tests/helpers.ts` (`fixture`, `cli`, `leaf`, `fakeGh`).
- Pattern to copy: the existing completion test structure with `fixture`/`leaf`/`cli` helpers.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Open the grounding index only for a gap in this list.

## 4. Change list and needed interfaces

- `src/phase.ts`: already landed at the lane HEAD this worktree was cut from; do not modify or commit it. A temporary local mutation is allowed only inside step 6 as a throwaway decoupling proof and must be reverted before the commit.
- `tests/phase.test.ts` (repair): replace every new whole-stdout comparison against `moved merged` with exit-code asserts plus isolated completion-line asserts, keeping all state, move, and source-closure asserts:
  - Inner race: `expect(race.every((r) => r.code === 0)).toBe(true);` plus per-result `expect(r.stdout).not.toContain('issue complete');` and `not.toContain('epic complete')`.
  - Epic final: `expect(final.code).toBe(0);` plus `final.stdout.split('\n').filter((line) => line.includes('complete'))` asserted `toEqual(['epic complete epic'])`.
  - Standalone race: keep the exit-code assert; replace both whole-stdout filters with `standalone.flatMap((r) => r.stdout.split('\n')).filter((line) => line.includes('complete'))` asserted `toEqual(['issue complete standalone'])`.
  - Private-sources inner merge: keep the code assert; replace `toBe('moved merged')` with the `not.toContain` pair. Private-sources final merge: keep the code assert; replace `toBe('moved merged\nepic complete epic')` with the isolate-and-`toEqual(['epic complete epic'])` form.
  - Leave the repeated-`merged` `not.toContain('complete')` and all recovery `not.toContain` asserts as they are; they already avoid progress wording.
- Interface: stdout lines `issue complete <issue>` and `epic complete <epic>`, each alone on its line.
- Chunks that must land first: none. This unit is wave 1.
- Paths owned: `tests/phase.test.ts` only for this repair. No other files in the commit.
- Shared test resource: none. Consumes no other worker output.

## 5. Do-not, reasons and exceptions

- Do not change `closeSources` timing or behavior; AC5 requires it byte-identical in effect. Exception: none.
- Do not change the `justMerged` parameter or the recovery callers; the silent-recovery rule depends on them. Exception: none.
- Do not touch `src/next.ts`, skills, docs, or `README.md`; other units own them and D1 forbids it. Exception: none.
- Do not commit any change to `src/phase.ts`; its repair-round state must equal the lane HEAD. Exception: the step 4 throwaway mutation, reverted in the same step.
- Do not add a new test harness or live Discord/GitHub call; the standing design requires extending the existing fixture tests. Exception: none.
- Do not write under `issues/`; lifecycle artifacts live only in the registered checkout. Exception: none.
- Do not change scope or an interface; return a mismatch with evidence naming the conflict and smallest brief fix. Exception: a revised brief from A authorizing that change.

Reasons restated: closure timing, caller contracts, unit ownership, cheapest sufficient test, and artifact placement keep this leaf reviewable. Exceptions restated: none, except a revised brief from A for scope or interface changes.

## 6. Ordered steps

1. In the worktree, run `bun install --frozen-lockfile` (covers AC1-AC5 test runs).
2. Apply the section 4 replacements in `tests/phase.test.ts` (AC1, AC2, AC4, AC5); touch no other file. Confirm by grep that the new completion asserts no longer mention `moved merged`.
3. Run the section 7 command; all tests pass with the repaired asserts.
4. Decoupling proof (throwaway, AC1-AC5): temporarily replace the progress string `moved merged` with `phase merged` in `src/phase.ts`, rerun the section 7 command and confirm it still passes, then revert `src/phase.ts` with `git checkout -- src/phase.ts` and confirm `git status --porcelain` shows only `tests/phase.test.ts` modified.
5. Run the section 7 command once more on the final tree. Repair failures inside this brief.
6. Commit only `tests/phase.test.ts` on the worker worktree and record the commit ID.

Advisory size: 1 file, under 6 turns. Work clearly beyond it returns a mismatch with evidence.

## 7. Commands

Run in the worktree, this command only:

```sh
AKROGON_BASE=147dcb33c8c5ae826cff3b74be212d120e0ba913 bun test --changed="147dcb33c8c5ae826cff3b74be212d120e0ba913"
```

A runs the full suite separately.

## 8. Done-when, evidence and report

Done when AC1-AC5 hold with the repaired asserts, the section 7 command passes before and after the throwaway decoupling proof, and only `tests/phase.test.ts` is committed. Scenarios use the existing fixture harness with real repos and the `gh` fake at the one boundary; no real panes, install roots, GitHub, or herdr socket.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

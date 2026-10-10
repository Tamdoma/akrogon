# Brief U4 (check.fix): exact deleted-line identity for lesson re-removal

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/guard-retires-lesson-u4
Repairs review finding A-F1 (handed to A in review-B.md). Do not reopen B's completed repair of the consumer-repo import.

## 1. Goal

`removeRetiredLessons`/`retiredLessonsPresent` currently flag any `LESSONS.md` line containing a retired history stem. That over-removes: (a) a lesson line whose stem is a superstring of a retired one (`history/alpha-x.md` dies when `history/alpha` retires); (b) a legitimately NEW lesson line main added while the retiring leaf was in flight that references the same history path (lesson recurred). B's proof: leaf deletes `- original case. history/alpha.md` + adds `Applied`; main adds `- new recurrence. history/alpha.md`; after union rebase the current code deletes both lines — the new lesson is silently lost.

`git diff`/`git log -p` over the pushed range cannot identify the deleted line: the resurrected line is present at both endpoints, so the file diff is empty. The deleted-line evidence lives in each leaf's ORIGINAL (pre-rebase) commit range, which the batch record preserves.

## 2. Semantics (decided — implement exactly)

- **Removal (`removeRetiredLessons`, used by `buildStack` and the solo one-liner)**: a `LESSONS.md` line is removed only when it is byte-identical to a `-` line in `git diff --unified=0 <r.base>..<r.head> -- learnings/LESSONS.md` for some leaf range `r`, AND it contains a retired stem (`retiredHistoryStems` output, existing logic: `+Applied` lines added to `learnings/history` in `base..head`). Resurrected lines are byte-identical to the deleted ones, so this is precise; new main-added lessons are never in the deleted set, so they survive even sharing a stem.
- **Refusal (`retiredLessonsPresent`, used by `merged --check`)**: a line at `head`'s `LESSONS.md` is flagged when it contains a retired stem AND it is NOT a line that main added — i.e. not a `+` line in `git diff --unified=0 <r.base>..base -- learnings/LESSONS.md` for any leaf range `r` (leaf fork point → the pushed-onto base). This refuses both resurrected lines and half-retired lessons (leaf added `Applied` but never deleted the line), while sparing same-stem lessons added on main.
- **Leaf ranges** are the ORIGINAL member/holder ranges, never rebased tips:
  - `buildStack(repo, builtOn, items, holderHead)`: for each item, `memberBase(repo, builtOn, item.head)` → `{base, head: item.head}`; for the holder, `memberBase(repo, builtOn, holderHead)` → `{base, head: holderHead}`. Compute memberBase inside buildStack (it is already exported there); do NOT use `item.base` — on restacks it is the previous member's tip, not the member's fork point.
  - `batchCheck` in `src/phase.ts`: `record.members.map(m => ({base: m.base, head: m.head}))` plus `{base: record.holder.base, head: record.holder.head}` — the record keeps original heads in both stack and solo modes.
  - Solo skill one-liner: `{base: mergeBase(cwd, '<remote>/<default_branch>', 'ORIG_HEAD'), head: 'ORIG_HEAD'}` — `ORIG_HEAD` is the branch head before B's just-completed rebase, which is the original leaf head containing the deletion.

## 3. Read-first

- `src/lessons.ts` (current code)
- `src/batch.ts` `buildStack` (memberBase import + fixup site)
- `src/phase.ts` `batchCheck` (call site)
- `skills/merge-issue/SKILL.md` (the literal one-liner B just rewrote — `bun -e … "$(dirname "$(readlink -f "$(command -v akrogon)")")/lessons.ts"`)
- `tests/lessons.test.ts` (B's consumer-repo test — it calls `retiredLessonsPresent(f.root, 'origin/main', 'HEAD')` with the 3-arg signature; update those two calls with the leaf range `{base: <merge-base origin/main ORIG_HEAD>, head: 'ORIG_HEAD'}` — ORIG_HEAD exists because the test runs `git rebase`)
- `tests/batch.test.ts` (union fixture `lessonsFixture`)
- `review-B.md` in the leaf folder — B's failing proof, "Handed to A" section.

## 4. Change list

- `src/lessons.ts`:
  - Add `lessonDiffLines(cwd, from, to, sign: '+' | '-'): Promise<Set<string>>` — `git diff --unified=0 from..to -- learnings/LESSONS.md`, collect lines starting with that sign (skip `+++`/`---` headers), strip the sign char.
  - `removeRetiredLessons(cwd, base, head, leafRanges: {base:string; head:string}[]): Promise<string[]>` — stems from `base..head` (unchanged detection); deleted set = union of `lessonDiffLines(r.base, r.head, '-')`; remove only lines in the working file that are in `deleted` AND contain a stem; return removed lines' stems (a stem per removed line, first matching stem).
  - `retiredLessonsPresent(cwd, base, head, leafRanges): Promise<string[]>` — stems from `base..head`; `addedOnMain` = union of `lessonDiffLines(r.base, base, '+')`; flag a `head` LESSONS.md line when it contains a stem AND `!addedOnMain.has(line)`; return flagged lines' stems.
  - Keep `mergeBase` and `retiredHistoryStems` exported as today.
- `src/batch.ts` `buildStack`: build the leaf ranges via `memberBase` per item + holder, pass to `removeRetiredLessons`.
- `src/phase.ts` `batchCheck`: build leaf ranges from `record.members` + `record.holder`, pass to `retiredLessonsPresent`.
- `skills/merge-issue/SKILL.md` one-liner: add the `ORIG_HEAD` merge-base call and pass `leafRanges` — keep B's dynamic import form:

```
bun -e "const {mergeBase, removeRetiredLessons}=await import(process.argv[1]); const b=await mergeBase(process.cwd(),'<remote>/<default_branch>','HEAD'); const ob=await mergeBase(process.cwd(),'<remote>/<default_branch>','ORIG_HEAD'); const r=await removeRetiredLessons(process.cwd(),b,'HEAD',[{base:ob,head:'ORIG_HEAD'}]); console.log(r.length?r.join('\n'):'none')" "$(dirname "$(readlink -f "$(command -v akrogon)")")/lessons.ts"
```

- `tests/lessons.test.ts`: update the two `retiredLessonsPresent` calls for the new signature (leaf range via ORIG_HEAD as above), AND extend this file (it is B's new file — extending it is a change to an existing test file → `Test-Change:` trailer naming what was added and that no existing expectation changed):
  1. Same-stem new lesson on main survives: leaf deletes `- original case. 2026-10-09. history/alpha.md` + appends `Applied`; main adds `- new recurrence. 2026-10-10. history/alpha.md`; after `git rebase` run `removeRetiredLessons` → only the original line removed, the recurrence line and every other line kept. (This is B's failing scenario — prove it green.)
  2. Prefix-collision: leaf retires `history/alpha` (deletes its line + `Applied`); main adds a lesson line naming `history/alpha-x.md`; after rebase + `removeRetiredLessons` the `alpha-x` line survives.
  3. `retiredLessonsPresent` still flags a half-retired lesson: leaf adds `Applied` to history but never deletes the lesson line → flagged (this is the --check backstop for a leaf that forgot the removal).
- `tests/batch.test.ts`: extend `lessonsFixture`-based coverage with one `buildStack` case where main adds a same-stem new lesson (`history/alpha.md` again or `history/alpha-x.md`) → `result.top`'s `LESSONS.md` keeps the new line, drops the retired one. (`Test-Change:` trailer.)
- `tests/phase.test.ts` should need NO changes — the existing stack/solo refusal tests stage lines that were never added on main, so they still flag. Verify they still pass; if one assumed stem-only semantics differently, fix the test with a `Test-Change:` trailer citing this review finding.

## 5. Do-not, reasons and exceptions

- Do not change B's dynamic-import resolution of the helper path — that repair is done and tested.
- Do not remove the stem condition from removal — the design's re-removal key stays "history files with an Applied entry in the pushed range"; the deleted-line set is the line-identity half.
- Do not let `removeRetiredLessons` flag never-deleted stem lines — auto-removal stays exact; refusal is where half-retirements surface.
- Do not weaken `retiredLessonsPresent` to exact-deleted matching — it must still catch the half-retired case.
- A mismatch (e.g. record fields missing in some batch shape, ORIG_HEAD unavailable in a documented flow) returns to A with evidence; exception is a revised brief from A.

## 6. Ordered steps

1. Update `src/lessons.ts` (new `lessonDiffLines`, rework both exported functions).
2. Update `src/batch.ts` and `src/phase.ts` call sites.
3. Update `tests/lessons.test.ts` signature calls; run it — expect it may now pass or reveal a needed ORIG_HEAD adjustment.
4. Add the three new tests in `tests/lessons.test.ts` + one `buildStack` case in `tests/batch.test.ts`; run them (the same-stem test reproduces B's failing proof — run it against old semantics mentally noted, new code must pass).
5. Update the `skills/merge-issue/SKILL.md` one-liner; B's `tests/lessons.test.ts` executes the literal skill line, so rerun that test to prove the updated text works.
6. `bun test tests/lessons.test.ts tests/batch.test.ts tests/phase.test.ts tests/batch-merge.test.ts --timeout=30000`, then `bun run typecheck`, `bun run format`.

Advisory size: ~6 files, under 35 turns.

## 7. Commands

```
AKROGON_BASE=2d9becac4365ec4a1079853364d561d90e356b5e
bun test --changed="$AKROGON_BASE" --timeout=30000
bun test tests/lessons.test.ts tests/batch.test.ts tests/phase.test.ts tests/batch-merge.test.ts --timeout=30000
bun run typecheck
```

## 8. Done-when, evidence and report

B's failing scenario green; existing suite green; commits carry `Test-Change:` trailers for `tests/lessons.test.ts` and `tests/batch.test.ts` naming what was added and that no existing expectation changed (cite review finding A-F1 for any expectation genuinely changed). Paste results.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

# Brief 4: frozen-test-guard — check.fix F1, second round

Worktree: recreate `git worktree add --detach /home/ivan/Work/infra/akrogon/issues/worktrees/frozen-test-guard-u1 9b60a94` from `/home/ivan/Work/infra/akrogon` (check `git worktree list` first; remove a stale dir only if `git worktree remove` reports it registered).

## 1. Goal

Repair F1 round 2 (review-B re-check + handoff). `emptyCommitCitedPaths` accepts any empty commit's trailer, but a planning-era `--allow-empty` trailer commit survives `git rebase` (git keeps deliberately-empty commits), so an old citation still authorizes criterion-5 drift. New rule, per plan.md "Implementation notes" dated 2026-10-11: record the freeze-time `Test-Change` trailer values too, and an untouched violation (`lastTouch` empty) cites only via a trailer-only commit (touches no files) carrying a **fresh** trailer value — one not in the freeze-time set. Trailer values survive rebases verbatim, so this distinguishes pre-freeze authorization from post-drift citation by content.

## 2. Numbered acceptance criteria

1. F1-variant regression at the real CLI boundary: fixture planner deletes `old.test.ts` in a non-empty commit, then adds `git commit --allow-empty -m 'cite planning deletion\n\nTest-Change: old.test.ts planning deletes obsolete test'` BEFORE the implement move; `frozen` gets `old.test.ts: null`; main modifies `old.test.ts`, push, fetch, `git rebase origin/main`, resolve modify/delete with `--ours` keep; `git log origin/main..HEAD -- old.test.ts` empty; `phase <slug> check.review --slot A` is REFUSED naming `Test-Change: old.test.ts <source and reason>` (replayed empty cite must not authorize); a new `--allow-empty` commit with a DIFFERENT trailer text (e.g. `Test-Change: old.test.ts rebase restored main's version`) then accepts.
2. Same variant, negative leg: a post-rebase `--allow-empty` commit reusing the IDENTICAL planning trailer text does not cite (freshness is per trailer value); document this.
3. All existing frozen tests stay green, including `frozen-rbpt` (planning trailer on non-empty commit is fresh-set member and non-empty anyway) and `frozen-rbnt` (post-rebase empty cite is fresh).
4. `frozen_cited` is recorded on the same move as `frozen`: array of `Test-Change` trailer values present in `target..HEAD` at freeze (values matching `/^\S+\s+\S/`, trimmed; store the full value string, not just the path token). Written/replaced under the same conditions; absent field = pre-feature leaf = no freshness restriction. A test asserts the stored set for the fixture (contains the planning `Test-Change: old.test.ts ...` value, the `gone.test.ts` value).
5. Doc lines updated: `skills/implement-issue/SKILL.md` frozen sentence, `skills/merge-issue/SKILL.md:51`, `skills/implement-issue/brief-template.md:45`, `docs/guide/merge.md:11`, `src/AREA.md` bullet, `skills/chart-issues/assets/shapes.md` command-owned field sentence (add `frozen_cited` beside `frozen`), `README.md:134` if it can stay compact — each gains the equivalent of "a later trailer-only commit carrying a trailer not already on the branch at the implement move". Minimal diff per file.

## 3. Read-first list

- `src/phase.ts` — `requireFrozenCitations` (~:442), `emptyCommitCitedPaths`, `trailerCitedPaths`, `citedPaths`, the `frozen` write in `transition` (~:314), `frozenRecord` (~:432).
- `src/state.ts` — `stateSchema` `frozen` line for the sibling field.
- `tests/phase.test.ts:2028-2360` — `frozenBranch`, `frozen-rbpt`/`frozen-rbnt` cases to extend/copy.
- `tests/helpers.ts`, `skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `src/state.ts`, `src/phase.ts`, `tests/phase.test.ts`, the criterion-5 doc files. Sole repair.

- `src/state.ts`: `frozen_cited: z.array(z.string()).optional()` beside `frozen`.
- `src/phase.ts`: where `frozen` is computed in `transition`, also compute `frozen_cited` = `Array.from` of trailer values from the existing `git log --format=%(trailers:key=Test-Change,valueonly,unfold) target..HEAD` scan (dedupe via Set; `{}`/`[]` when no worktree). Reuse the trailer format+parse, not a second mechanism.
- `requireFrozenCitations(repo, worktree, frozen, frozenCited?: string[], from?, to?)`: signature gains the cited set (pass `state.frozen_cited`); when `lastTouch === ''`, the cited set comes from `emptyCommitCitedPaths(worktree, range, new Set(frozenCited ?? []))` — collect only trailer values not in that set, then first-token paths. When `frozenCited` is undefined the behavior equals today (any empty-commit trailer cites).
- Error message unchanged.

## 5. Do-not, reasons and exceptions

- Do not change the touch case or `requireTestChangeCitations` — criteria 2/6 pin them.
- Do not compare commit position, dates, or patch identity — only trailer-value freshness survives rebase.
- Do not weaken either F1 regression — both must fail on the unfixed code (the variant fails today: replayed empty cite is accepted).
- Do not touch merge call sites, other leaves' doc lines (implement-issue :84, check-issue), or the `frozen` map shape.
- Return a mismatch with evidence instead of widening scope; the exception is a revised brief from A.
- Reasons restated: freshness-by-content is the only rebase-stable distinction, criterion 2/5 pin the refusal, scope stays on F1; a mismatch goes back, never a self-decided change.

## 6. Ordered steps

1. Create/reuse the worktree at `9b60a94`, `bun install`. Write the criterion-1/2/4 tests; confirm red (replayed empty cite accepted today).
2. Implement `frozen_cited` in `src/state.ts` + `src/phase.ts` and the freshness filter.
3. Tests green; `bun test tests/phase.test.ts` whole file.
4. Doc edits (criterion 5); `bun test tests/docs-links.test.ts`.
5. Commit once: `fix: cite untouched frozen paths only by fresh trailer-only commits` with trailer block `Test-Change: tests/phase.test.ts added F1 replayed-empty-cite case; no existing expectation changed`.
- Advisory size: about 8 files, under 35 turns; beyond that return a mismatch with evidence.

## 7. Commands

`bun test --changed=354c80e14aca6483c430312c61ae5c1397bb548e --timeout=30000` (AKROGON_BASE = 354c80e14aca6483c430312c61ae5c1397bb548e); `bun test tests/phase.test.ts`; `bun test tests/docs-links.test.ts`.

## 8. Done-when, evidence and report

F1-variant red before, green after; all frozen tests green; docs updated. Report below:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

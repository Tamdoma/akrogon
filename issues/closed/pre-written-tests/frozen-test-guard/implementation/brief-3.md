# Brief 3: frozen-test-guard — check.fix F1

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/frozen-test-guard-u1` (recreate: `git worktree add --detach <this path> 7d317b9` from `/home/ivan/Work/infra/akrogon` — verify `git worktree list` first and reuse the existing one if already created)

## 1. Goal

Repair review F1. Today `requireFrozenCitations` in `src/phase.ts` scans all `Test-Change` trailers in `<from>..<to>` when no commit in that range touches the drifted path (`lastTouch === ''`). That accepts a planning-era trailer replayed by a rebase, so criterion-5 drift is authorized without a later citation. The locked rule for this case: the trailer must come on a **trailer-only commit** — a commit in `<from>..<to>` that changes no files (empty commit). The touch case (`lastTouch` found) is unchanged: trailer in `lastTouch^..<to>`.

## 2. Numbered acceptance criteria

1. F1 regression at the real CLI boundary in `tests/phase.test.ts`, no git mocks: fixture where the planner deletes `old.txt` and cites it with `Test-Change: old.txt <reason>` on its (non-empty) planning commit; `phase <slug> implement --slot A` writes `frozen` with `old.txt: null`; main modifies `old.txt`, push, `git fetch`, `git rebase origin/main` in the worktree, resolve the modify/delete conflict keeping main's version (`git checkout --ours -- old.txt`, `git add`, `git -c core.editor=true rebase --continue`); `git log origin/main..HEAD -- old.txt` is empty; `phase <slug> check.review --slot A` is REFUSED naming `Test-Change: old.txt <source and reason>`; then `git commit --allow-empty -m 'cite\n\nTest-Change: old.txt <reason>'` and the same move succeeds.
2. Same test (or sibling case): a NON-empty later commit carrying the `Test-Change: old.txt` trailer does NOT cite in the no-touch case — the move still refuses until an empty commit carries it. (Trailer-only means touches no files.)
3. Existing frozen tests stay green unchanged in meaning: `frozen-rb` (touch case, later cite commits work), `frozen-rbnt` (no-touch case, the `--allow-empty` cite is already a trailer-only commit), record write/rewrite, drift/reappear/delete/rename, unrecorded added test file, non-test recorded path.
4. Doc lines updated to state the no-touch window accurately: `skills/implement-issue/SKILL.md:64` added sentence, `skills/merge-issue/SKILL.md:51` parenthetical, `skills/implement-issue/brief-template.md:45`, `docs/guide/merge.md:11` added sentence — append to each the equivalent of: "when no branch commit touches the path, a later trailer-only commit must carry it" (word per file, minimal diff). `README.md:134` and `src/AREA.md` frozen clauses get the same qualifier in their compact style if it fits the line, else left as-is (their current wording is not contradicted — a trailer-only commit is a later commit).

## 3. Read-first list

- `src/phase.ts` — `requireFrozenCitations` (~:387-435), `citedPaths` (:346), `changedPaths` (:360), `requireTestChangeCitations` (:373).
- `tests/phase.test.ts:2028-2292` — `frozenBranch`, `frozenRecord`, the four frozen tests including `frozen-rb`/`frozen-rbnt` rebase fixtures.
- `tests/helpers.ts`, `src/test-files.ts`, `src/config.ts:248`.
- `skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `src/phase.ts`, `tests/phase.test.ts`, the doc files in criterion 4. No shared resource; this is the only repair.

- In `requireFrozenCitations`: split `violating` into touched (`lastTouch` non-empty, existing logic unchanged) and untouched (`lastTouch === ''`). For untouched paths the cited set is `emptyCommitCitedPaths(worktree, `${from}..${to}`)` — a new private helper returning trailer-cited paths from commits in range that change no files.
- `emptyCommitCitedPaths`: one `git log --format=%x1e%H%x1f%(trailers:key=Test-Change,valueonly,unfold) <range>` call; split on `\x1e` per commit, `\x1f` separates sha from trailer values; for each commit carrying a `Test-Change` value run `git diff-tree --no-commit-id --name-only -r <sha>` and only when its output is empty collect the value's first whitespace token (same `/^\S+\s+\S/` rule as `citedPaths`). Do not add `-m` or merge handling — leaf branches are linear.
- Keep the error message identical.

## 5. Do-not, reasons and exceptions

- Do not change the touch-case window (`lastTouch^..<to>` accepts trailers on any commit in it, empty or not) — criterion 2 specifies it.
- Do not treat a commit's trailer text, author/committer date or position as evidence — only "touches no files"; dates are forgeable and the record deliberately stores no shas.
- Do not weaken the new tests to assert the old acceptance — F1's probe must fail before the fix.
- Do not touch `requireTestChangeCitations`, merge call sites, `src/state.ts`, or other leaves' doc lines (implement-issue :84, check-issue).
- Return a mismatch with evidence instead of widening scope; the exception is a revised brief from A.
- Reasons restated: criterion 2 pins the touch window, the no-touch window is trailer-only per criterion 5 and the design's Rebase paragraph, and scope stays on F1; a mismatch goes back, never a self-decided change.

## 6. Ordered steps

1. If the worktree is absent create it per header; `bun install`. Write the criterion-1/2 tests; run them and confirm they fail (accepted-without-empty-cite today).
2. Implement `emptyCommitCitedPaths` and the touched/untouched split in `requireFrozenCitations`.
3. New tests green, then `bun test tests/phase.test.ts` whole file.
4. Doc edits per criterion 4; `bun test tests/docs-links.test.ts`.
5. Commit once: `fix: require trailer-only commit for untouched frozen paths` with final trailer block `Test-Change: tests/phase.test.ts added F1 no-touch rebase case; no existing expectation changed`.
- Advisory size: about 4-6 files, under 30 turns; beyond that return a mismatch with evidence.

## 7. Commands

`bun test --changed=354c80e14aca6483c430312c61ae5c1397bb548e --timeout=30000` in the worktree (AKROGON_BASE = 354c80e14aca6483c430312c61ae5c1397bb548e); `bun test tests/phase.test.ts` while iterating; `bun test tests/docs-links.test.ts` for the docs.

## 8. Done-when, evidence and report

F1 regression red before, green after; file suite and changed tests green; docs updated. Report below:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

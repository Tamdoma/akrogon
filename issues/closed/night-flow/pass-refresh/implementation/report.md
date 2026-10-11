# Implementation report: pass-refresh

Base: 22ede6c12f7d3b3beb2c7dadeb1bc4aea81d6192 · Head: bd16392

## Refreshes

- Pass start (implement): prior base 9cd0c7e → new base 22ede6c, prior head 500941b → new head f3bc349 (rebase moved the one test commit; no conflicts).
- Pre-final-proof (implement): no movement (origin/main still 22ede6c, head unchanged).
- Pass start (check.fix): fetch showed origin/main unchanged at 22ede6c; `git rebase origin/main` → up to date; no movement.

## Changed files and reasons

- `skills/implement-issue/SKILL.md` (worker u1, commit 402db40): shared refresh paragraph in Shared context; leading refresh sentences in `## implement` and `## check.fix`; commit → refresh → proof resequencing at the implement handoff and check.fix close; merge-origin paragraph invokes the shared refresh and keeps replay rules. Amended by B's repair d954eed (`skills: reuse opening refresh before merge replay`) per review-A F1: the pre-judging refresh is the section opener's, removing the double refresh.
- `skills/check-issue/SKILL.md` (worker u2, commit f3bddc3): re-check paragraph gains the recorded-SHA `git range-diff` clause.
- `docs/guide/phases.md`, `skills/AREA.md` (worker u3, commit 0ca50b9): A's proof descriptions state the refresh before proof; AREA.md stays 33 lines with its four sections.
- `tests/skill-refresh.test.ts`: added at planning (f3bc349), deleted in check.fix (bd16392) under review-B F1 — design locks proof to quoted lines + sweep and rejects prose-wording tests.

## Quoted edited lines (criterion proof)

C1 — `skills/implement-issue/SKILL.md` Shared context rule:

> A refreshes the leaf branch onto current main: it fetches the configured remote, rebases the leaf branch onto the current `<remote>/<default_branch>` and refreshes `AKROGON_BASE` from `akrogon config`. Before every refresh A commits outstanding scoped work, never stashing or discarding it. Conflicts resolve inside the rebase keeping both true sides under the merge-issue solo rule; when resolution needs a plan correction A makes it under the `check.fix` plan-correction rule and resolves by it, `plan.md` lives in the registered checkout so the rebase stays in progress meanwhile, and such a conflict never ends the pass `failed`. A fetch failure or another refresh error with no conflict to resolve is recorded with its original error in `implementation/report.md`; A aborts a rebase only if one is in progress and the pass ends with no phase move; the re-prompted pass resumes at the refresh instead of redoing committed work and compares any red check again; A never proceeds on an old tip. A comparison record holds only for the head and pass it was written in; after a refresh or a later commit a red check is rerun and compared on the new head, never carried over. `implementation/report.md` records each refresh that moves the branch with prior and new base and prior and new head; a report handed off from `check.fix` also records the prior reviewed base and head and the handed-off base and head.

Call sites:

> `## implement` — `Run the Shared context refresh before the first unit.`
> `## check.fix` — `Run the Shared context refresh before reading the findings.`
> implement handoff — `commit any remaining edits on top of the wave commits on the leaf branch, making no empty commit, and run the Shared context refresh, then supply passing proof for every done-criterion`
> check.fix close — `commit any remaining edits and run the Shared context refresh, then supply passing proof for every done-criterion`

C2 — merge-origin paragraph (after B's repair d954eed):

> `Before judging the failure, the pass replays the recorded commands after its opening Shared context refresh; a green replay needs no repair and goes on to the record below, and only a red replay takes the base-run rule, against the refreshed base. After the repair commits, the pass runs the Shared context refresh again, then their normal proof (done-criteria proof, changed tests, `checks`) and replays every exact command the red ending recorded verbatim` — plus unchanged `implementation/report.md` replay-evidence record, red-rerun repeat and `a red rerun is never handed to `check.review`, which only a green replay reaches`.

C3 — `skills/check-issue/SKILL.md` re-check clause:

> `when `implementation/report.md` records that the `check.fix` pass refreshed the branch, B computes `git range-diff <prior reviewed base>..<prior reviewed head> <handed-off base>..<handed-off head>` itself from the SHAs recorded there and reviews as repair the commits it shows added or changed, conflict resolutions included; main's commits are not reviewed as repair`

## By-meaning sweep (criterion 4)

Swept `skills/**/*.md` and `docs/**/*.md` for lines claiming a leaf meets current main only at merge, or that only a merge-origin `check.fix` rebases. Reviewed hits by meaning:

- `docs/guide/merge.md:7`, `:19`, `:24`, `:91`; `docs/guide/idea.md:89`; `docs/guide/problems.md:43`; `docs/guide/state.md:52`; `skills/merge-issue/SKILL.md` — describe merge-time stack builds, push restacks and solo rebases; no exclusivity claim.
- `merge_checks` "only at merge" phrasing (`docs/guide/setup.md:54`, `docs/guide/phases.md:94`, `skills/AREA.md:24`, `skills/init-akrogon/SKILL.md:20`, `skills/plan-issue/SKILL.md:63`, `skills/check-issue/SKILL.md:43`) — check scheduling, not branch meeting; stays.
- `skills/chart-issues/SKILL.md:106` — direct-route rebase instruction; in scope by location but describes the door's one-time worktree move, not leaf meeting; reported here per the sweep's outside-ownership rule, no claim to remove.

No line claims merge-only meeting or merge-origin-only rebasing.

## Commands run

- `bun test tests/skill-refresh.test.ts` — 10/10 green after the units (later deleted per review-B F1).
- `akrogon run-check` format — clean, no rewrites (twice: implement and check.fix).
- `akrogon run-check` typecheck (`tsc --noEmit`) — clean (twice).
- `akrogon run-check` test (`bun test --timeout=30000`) — 826/826 green at implement; 816/816 green after the test deletion.
- `akrogon run-check` test_changed (`bun test --changed=$AKROGON_BASE`) — 10/10 at implement; 390/390 across 8 changed files after the deletion.
- Correction check: `git grep -lE 'A refreshes the leaf branch onto current main|prior reviewed base|handed-off' tests/` — no matches.

## Review rounds

- review-A F1 (double refresh in merge-origin check.fix): repaired by B in d954eed.
- review-B F1 (prose-anchor test contradicts design proof form): repaired by A in this pass — plan.md proof section corrected, `tests/skill-refresh.test.ts` deleted with `Test-Change:` trailer citing the design conflict, proof re-recorded here as quoted lines + sweep.
- review-A Nit (pre-existing `repair any failure` clause ordering): untouched, stays a Nit.

## Known limitations

- The by-meaning sweep is judgment over read hits, not a mechanical guarantee; reviewed hits are listed above.
- No live run exists for this leaf (skill text only; standing-design proof = quoted lines + sweep).

## Unverified criteria

None.

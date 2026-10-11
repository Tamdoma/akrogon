# Plan: pass-refresh

Skill-text leaf: A's implement and check.fix passes refresh onto current main at start and before final proof; B re-checks a refreshed check.fix through `git range-diff`. `debate: no`, synthesized from brief + design. No `src/` change; merge reds keep routing to A's `check.fix`.

## Read-first

- `skills/implement-issue/SKILL.md` — edit target; `:74` opening clause, `:78` merge-origin paragraph, `:80` plan-correction rule (consumed from plan-not-cap, merged at `2eb011a`), `:63` implement-end handoff, `:84` check.fix close, Shared context `:38` comparison rule.
- `skills/check-issue/SKILL.md` — `:67` re-check sentence.
- `skills/merge-issue/SKILL.md` — `:53` solo conflict rule + range-diff record (named, not restated), `:41`/`B commits nothing` line confirming no src change.
- `src/compare.ts:116-145` — record validation binds `leaf_revision` to HEAD, `counterpart_revision` to refreshed `base()`, base-run start to `prompted_at`; motivates the no-carryover rule.
- `src/next.ts:632-641` — a pass ending without a phase move is re-prompted once idle; basis of the resume rule.
- `src/batch.ts:89-133` (buildStack) — leaves currently meet main only at merge stack build.
- `docs/guide/phases.md:94`, `skills/AREA.md:24` — A's proof description lines, updated under the stale-doc rule once the skill text changes.
- `skills/chart-issues/assets/standing-design.md` — proof form: report-quoted edited lines + by-meaning sweep; no live run.
- `learnings/LESSONS.md` — applied: stale-checkout line cite (verify `main..origin/main`), sweep prose by meaning not path.

## Decisions

- **D1 — One named refresh rule in implement-issue Shared context**, placed after the comparison paragraph (`:38`) and before Proof order (`:40`): *"A refreshes the leaf branch onto current main: it fetches the configured remote, rebases the leaf branch onto the current `<remote>/<default_branch>` and refreshes `AKROGON_BASE` from `akrogon config`."* Plus its sub-rules, each stated once here and invoked by name elsewhere:
  - Commit first: before every refresh A commits outstanding scoped work, never stashing or discarding it.
  - Conflicts resolve inside the rebase, keeping both true sides under the merge-issue solo rule; when resolution needs a plan correction A makes it under the `check.fix` plan-correction rule and resolves by it; `plan.md` stays in the registered checkout so the rebase stays in progress meanwhile; a conflict never ends the pass `failed`.
  - A fetch failure or other refresh error with no conflict to resolve is recorded with its original error in `implementation/report.md`; A aborts a rebase only if one is in progress and the pass ends with no phase move (`src/next.ts:632-641` re-prompts); the re-prompted pass resumes at the refresh instead of redoing committed work and re-compares any red check; A never proceeds on an old tip.
  - A comparison record holds only for the head and pass it was written in (`src/compare.ts:116-145`); after a refresh or a later commit a red check is rerun and compared on the new head, never carried over.
  - `implementation/report.md` records each refresh that moves the branch (prior and new base, prior and new head); a report handed off from `check.fix` also records the prior reviewed base and head and the handed-off base and head.
- **D2 — Call sites**: `## implement` gets one leading sentence running the Shared context refresh before the plan-notes/`Before coding` step (and before any unit/sub-brief). `## check.fix` gets one leading sentence running it before findings are read. The pre-final-proof refresh rides the existing commit-then-proof sentences (`:63`, `:84`), resequenced to commit → refresh → proof. No refresh while a worker wave is in flight falls out of the ordering: it sits before the first unit and after every worker worktree is removed.
- **D3 — Merge-origin `check.fix` paragraph (`:78`) keeps its structure** and now invokes the Shared context refresh for both its fetch/rebase spots: refresh → replay recorded commands → green goes to the record / red takes the base-run rule against the refreshed base → repairs commit → Shared context refresh → normal proof and verbatim replay → report's replay-evidence record (each command+args, rejected base/head, rerun base/head, result) → red replay repeats the path. Keeps "starts at the rebased head recorded in `review-B.md`", the green-replay rule, and the never-`check.review`-on-red rule. `fetch`/`rebase` vocabulary no longer appears in this paragraph.
- **D4 — check-issue `:67` gains one clause**: on re-check after a `check.fix` whose `implementation/report.md` records a refresh, B computes `git range-diff <prior reviewed base>..<prior reviewed head> <handed-off base>..<handed-off head>` from the recorded SHAs and reviews as repair the commits it shows added or changed, conflict resolutions included; main's commits are not reviewed as repair. The merge-origin replay-evidence clause and everything after stay.
- **D5 — Docs**: `docs/guide/phases.md:94` and `skills/AREA.md:24` (A's proof description) updated for the refresh under the stale-doc rule — skill-describing docs, not literal "only at merge" claims. No `docs/` line today claims merge-only meeting (sweep already clean). `docs/guide/merge.md`, `idea.md`, `state.md`, `setup.md` need no change: they describe merge behavior without exclusivity claims. `AREA.md` stays under the 40-line/exact-sections rule.

## Waves

Wave 1 (3 units, disjoint paths, no shared test resource):

| Unit | Owns | Depends on |
|---|---|---|
| U1 | `skills/implement-issue/SKILL.md` | none |
| U2 | `skills/check-issue/SKILL.md` (`:67` clause) | none |
| U3 | `docs/guide/phases.md`, `skills/AREA.md` | none |

Wave 2: none — the sweep proof runs on the post-edit tree, mechanically, inside the criterion test.

## Done-criteria → proof

Corrected in check.fix (review-B F1): this leaf is skill text only and the locked design's proof is `implementation/report.md`'s quoted edited lines plus the by-meaning sweep — no code test; the test-proof rule rejects tests of prose wording. `tests/skill-refresh.test.ts` was deleted with a `Test-Change:` trailer citing the design conflict. Executable check for this correction: `git grep -lE 'A refreshes the leaf branch onto current main|prior reviewed base|handed-off' tests/` returns nothing (no test pins refresh-rule prose) and `bun test --timeout=30000` stays green after the deletion. All proofs: seconds, rerun on any edit to `skills/` or `docs/`.

| # | Criterion | Proof | Catches |
|---|---|---|---|
| 1 | Refresh required at implement/check.fix start and before final proof, with conflict, report-record, failed-refresh and resume rules | report.md quotes the Shared context rule paragraph and the call-site sentences | Missing rule or call site |
| 2 | Merge-origin check.fix keeps replay + green-replay rule; fetch/rebase stated once via shared rule | report.md quotes the merge-origin paragraph | Lost replay/evidence rules; duplicated fetch/rebase |
| 3 | check-issue tells B to compute range-diff from recorded SHAs, review only added/changed | report.md quotes the `:67` clause | Missing range-diff rule or wrong scope |
| 4 | By-meaning sweep: no line claims merge-only main meeting or merge-origin-only rebase | report.md sweep listing of `skills/` and `docs/` hits | Residual stale claim |

## Doc checklist

- `docs/guide/phases.md` — U3 edits the A-proof line for the refresh.
- `skills/AREA.md` — U3 edits the A-proof bullet (40-line cap applies).
- `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md` — the leaf itself.
- `docs/reference-index.md`, `tests/AREA.md`, remaining `docs/guide/*` — verified unaffected.

## Notes

- `plan-not-cap` consumed: plan-correction rule lives at `implement-issue/SKILL.md:80` on main (commit `2eb011a`); the conflict sentence names it without restating.
- No env/produces/grants involved; `akrogon status` shows no `Missing:` lines.
- Open limitation: the sweep is judgment-by-reading for the by-meaning criterion; the report lists reviewed hits (e.g. `merge_checks` scheduling mentions) and states none claim merge-only meeting.
- check.fix correction note: the earlier test-first instruction committed `tests/skill-refresh.test.ts` before product text; review-B F1 judged that contract-wrong (design: no code test; prose-wording tests rejected). Corrected decision: proof is quoted lines + sweep; the file is deleted. History kept: commit f3bc349 remains in the branch's earlier range.

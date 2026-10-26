# Implementation report: new-chart-proposal

Serial-solo run (plan: one wave, one unit; A implemented, no workers).

## Changed files and reasons

- `skills/chart-issues/SKILL.md` — `## Autopilot`: wait list gains "a new-chart proposal, an operator approval that is not a grant" (criterion 2); new paragraph after the wait list carries trigger and precedence, the existing-chart branch, parking rules, the fixed question with yes/no paths, the cross-repo wait form, and the handed-list precedence over one chart folder per destination (criteria 1-4).
- `skills/chart-issues/assets/shapes.md` — `## Autopilot` line list gains `- proposal:` beside `- wait:` (criterion 5).
- `docs/use/autopilot.md` — "What still waits for you" gains the new-chart bullet with the question and yes/no effects; "Read the record" names new-chart proposals (criterion 6).

Criterion 7 (diff scope): `git --no-pager diff --name-only "$AKROGON_BASE"...HEAD` lists exactly the three files.

No code, no tests: design interpretation — no criterion is a code behavior, and the 2026-10-01 lesson bars wording-coupled assertions. Review proof is the diff read against each criterion.

## Commands run

- `akrogon run-check --name 'docs-links' -- bun test tests/docs-links.test.ts` — first run red: missing `zod` (worktree had no `bun install`); after `bun install --frozen-lockfile` (configured `setup`), `check docs-links: 0` on 16c28b2, 8 pass / 0 fail. Log: `implementation/check-docs-links-1793034618951-3141963.log` (first red run: `check-docs-links-1793034612769-3141520.log`).
- `akrogon run-check --name 'diff-scope' -- sh -c 'git --no-pager diff --name-only "$AKROGON_BASE"...HEAD'` — `check diff-scope: 0` on 16c28b2; output listed only the three files. Log: `implementation/check-diff-scope-1793034621274-3142306.log`.
- `akrogon verify` on committed head 16c28b2 — green: format, test (1212 pass / 0 fail), typecheck. Logs under `implementation/check-{format,test,typecheck}-*.log`; receipt: `verify leaf 16c28b2eeb3f42cc0d3742bd8606bf835ee848be: green`.

Refresh: branch `new-chart-proposal` fetched; it was already at `origin/main` tip (a58b90f), no rebase needed. Base a58b90f, head 16c28b2.

## Known limitations / unverified criteria

None. Criteria 1-6 are prose assertions whose proof is review reading the diff against the criterion text; no runnable proof exists by design. Criterion 7 proven by the diff-scope check above. No slow run, no outside call, no grants or env inputs.

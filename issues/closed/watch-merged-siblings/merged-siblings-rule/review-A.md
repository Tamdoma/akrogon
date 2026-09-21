# Review A: merged-siblings-rule

Base: `20926c68f7664015b23ea0224147f69059d5b881`
Head: `045dd11d7e23a60b0333ad3c6e1bc08e5b167c80`
Scope: initial review, whole diff. `debate: no`, so no positions/rebuttal artifacts expected.

## Diff inspected

One file, one line: `skills/watch-issues/SKILL.md:37`, the "Merged still under open" Judge bullet replaced per plan D1. `git diff --name-only` base..head lists only that file.

## Acceptance check

- AC1: bullet holds all four ordered elements: owner-folder read; any-unmerged (waiting on siblings, no `next`); all-merged (`next` once this fire, re-observe, command-error rule, open-alone-not-error); unreadable-gap branch. Order matches the plan interface. Pass.
- AC2: names "the leaf's top-level owner folder under `issues/open`, an issue or an epic", covering the epic case. Pass.
- AC3: only `SKILL.md` differs; `observe.ts`, `src/`, `tests/`, `docs/`, other skills untouched (name-only diff plus empty diff on those paths). `docs/` grep for the rule matches nothing. Pass.
- AC4: headings byte-identical (same 7 headings, same lines); Never section byte-identical (diffed base vs head); no new file, field, or command (only existing `akrogon next` referenced); prose is a read-only tree read, no conflict with the Never list. Pass.
- AC5: report evidence complete — root `bun test` 287 pass, skill `bun test` 20 pass, `tests/docs-links.test.ts` 3 pass, plus clean typecheck and format. Prose-only diff, no code change and no specific concern, so no rerun per skill. Pass.
- Concrete scenario: epic E with L1 merged, L2 open → rule text yields "waiting on siblings, run no `next` for L1"; after L2 merges → `next` once, re-observe, command-error rule on failure. Matches plan scenario. Pass.

## Live surface

Judge section read in full. The "Command error from `next` or `phase`" bullet exists, so the cross-reference resolves. Re-observe maps to the Observe section script. No AREA.md in diff. No human doc states the merged rule, so no documented behavior changed outside the skill.

## Tests and report

No new tests, correct per D7 (prose-only leaf; verification is the unchanged suites). No mocks, no wording tests. Report records base/head, commands with pasted results, and limitations; no material gap. Ponytail: smallest possible diff, one line, no abstraction or dependency; the prose-only-enforcement ceiling is the plan's accepted open limitation, not a defect.

## Findings

None. No Fix, no Nit.

## Verdict

`ready`

## Merge (2026-09-21)

- Outstanding changes: none, worktree clean.
- Fetch + rebase onto `origin/main` (`20926c68f7664015b23ea0224147f69059d5b881`): no-op, "already up to date"; head unchanged at `045dd11d7e23a60b0333ad3c6e1bc08e5b167c80`. No conflicts, no range-diff needed.
- `AKROGON_BASE` refreshed from config after rebase: `20926c68f7664015b23ea0224147f69059d5b881`.
- Checks on rebased head: `bun run format` clean (all unchanged); `bun run typecheck` clean; `bun test --changed` 0 pass 0 fail (no test files affected); `bun test` 287 pass 0 fail across 13 files. All green.
- Advisory: none configured.
- Push: `git push origin HEAD:main` fast-forward `20926c6..045dd11`, confirmed landed via `merge-base --is-ancestor`. (First attempt with `--ff-only` failed: not a `git push` flag; plain push is the FF-only path.)

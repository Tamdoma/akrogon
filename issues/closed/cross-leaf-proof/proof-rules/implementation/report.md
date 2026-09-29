# Implementation report: proof-rules

One delegated unit (brief-1) did all 5 files in one wave; B cherry-picked it onto the lane and ran the full suite plus typecheck.

## Changed files and reasons

- `skills/chart-issues/assets/standing-design.md` (+4): the four proof rules as one bullet each after the user-visible-flow lock (criteria 1-4).
- `skills/chart-issues/assets/shapes.md` (+2): chain charting and the implementer-audit refusal after the audit paragraph (criterion 5).
- `skills/plan-issue/SKILL.md` (+2): per-criterion proof mapping plus slow-run restart boundaries under `plan.synthesis` (criterion 6).
- `skills/implement-issue/SKILL.md` (+3): locked-decision stop after :31 plus wall-time and slow-run report lines (criterion 7).
- `skills/check-issue/SKILL.md` (+2): the three Fix triggers, the look-alike exclusion, and the no-rerun pointer (criterion 8).
- Rewritten existing lines: none. The whole diff is 13 insertions, 0 deletions.

## Commands run with pasted results

Base `ea43b14eaa195c168d078b291eefd2fc3c5f4586`, committed head `c39309cc41bdfbb7cf0c0242c474c54f15d12f1f` (cherry-pick of worker commit `a762f176c3b9fe6ac79387dfe774d4c08d3a9844`). All commands from the lane worktree `/home/ivan/Work/infra/akrogon/issues/worktrees/proof-rules`.

Worker changed tests (brief section 7):

```text
$ AKROGON_BASE=ea43b14eaa195c168d078b291eefd2fc3c5f4586; : "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"
bun test v1.4.2 (744846f84)
--changed: 5 changed files, but no test files are affected
 0 pass
 0 fail
Ran 0 tests across 0 files. [13.00ms]
```

Lane changed tests after cherry-pick: same command, exit 0, `0 pass 0 fail, Ran 0 tests across 0 files. [9.00ms`.

Full suite (B):

```text
$ bun test
333 pass
0 fail
3896 expect() calls
Ran 333 tests across 15 files. [86.43s]
```

Wall time: 86s.

Typecheck (B):

```text
$ bun run typecheck
$ tsc --noEmit
```

Clean, no output. Wall time: about 1s.

`bun run format` not run per criterion 10: package.json:8 scopes it to `prettier --write src tests` and this diff touches markdown only.

Budget evidence (criterion 9 paste):

```text
$ git --no-pager diff --numstat origin/main...HEAD | awk '{a+=$1} END {print a}'
13
$ git --no-pager diff --numstat origin/main...HEAD
2	0	skills/chart-issues/assets/shapes.md
4	0	skills/chart-issues/assets/standing-design.md
2	0	skills/check-issue/SKILL.md
3	0	skills/implement-issue/SKILL.md
2	0	skills/plan-issue/SKILL.md
$ git --no-pager diff --name-only origin/main...HEAD
skills/chart-issues/assets/shapes.md
skills/chart-issues/assets/standing-design.md
skills/check-issue/SKILL.md
skills/implement-issue/SKILL.md
skills/plan-issue/SKILL.md
$ git --no-pager diff --numstat origin/main...HEAD -- skills/chart-issues/assets/standing-design.md
4	0	skills/chart-issues/assets/standing-design.md
$ git --no-pager diff --numstat origin/main...HEAD -- skills/implement-issue/ponytail.md skills/check-issue/ponytail.md
(empty)
```

Substance greps (worker, all matched): `cheapest sufficient`, `recorded from one real run`, `fail-first`, `agreement test`, `spine command`, `rerun trigger`, `restart boundaries`, `failed --reason`, `wall time`, `target-size`. The former :49 rerun rule is byte-identical (shifted to :51 by insertion).

No end-to-end artifact exists for this prose leaf; the diff is the artifact. Brief: `implementation/brief-1.md` in this leaf folder.

## Known limitations

- The implement-issue design-stop line and the two report lines sit markdown-joined to their anchor paragraphs (no blank separator) to hold the line cap; substance is unambiguous (folded from the worker return).
- The new rules bind future leaf designs only; existing contracts keep old behavior until the operator changes them (plan L1).

## Unverified criteria

None. Criteria 1-10 verified: substance reads in full from the new lines, 13 added lines against the 20 cap, both ponytail files untouched, no new files, `bun test` passes.

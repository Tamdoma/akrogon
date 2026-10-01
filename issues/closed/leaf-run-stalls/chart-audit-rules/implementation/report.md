# Implementation report: chart-audit-rules

Base: `2ad0acf70a85dacefa3a89c53a53233e2aae11ca`. Committed head: `646fa457d2160461b389b4c6b605bb643d61924a` (cherry-pick of worker commit `e49acdb3c738a0c6e5ac8653734321f302fe397b`). Mode: delegated, one unit, one wave. Worker worktree removed before the full suite.

## Changed files and reasons

- `skills/chart-issues/assets/shapes.md` (2 lines changed, the only file on the branch): the done-criteria placeholder now names only the two allowed proof kinds, and the implementer-audit paragraph states rule 1 (allowed kinds, prerequisite route, audit refusal) and rule 2 (`blocked-by` keying, consumed output in What or Why, prerequisite proposal, no triggers). This is the plan's full checklist items 1-3.

## Commands run with pasted results

Worker (worktree `chart-audit-rules-u1`, since removed):

```text
AKROGON_BASE=2ad0acf... bun test --changed="$AKROGON_BASE"
bun test v1.4.2 (744846f84)
--changed: 1 changed file, but no test files are affected
 0 pass
 0 fail
Ran 0 tests across 0 files. [9.00ms]
```

Worker docs sweep: zero hits for `done-criterion may cite` and `concrete check executable` under `docs/`; `blocked-by` hits in `docs/guide/{create,limits,next,state}.md` are schema/dispatch mechanics only. No `docs/` edit made.

A on the lane after cherry-pick:

```text
AKROGON_BASE=2ad0acf... bun test --changed="$AKROGON_BASE"   # 0 pass, 0 fail, no test files affected
bun test            # 339 pass, 0 fail, 3937 expect() calls, 15 files, 76.15s wall time
bun run format      # all files unchanged, worktree clean
bun run typecheck   # exit 0, no output
git diff <base>..HEAD --stat   # skills/chart-issues/assets/shapes.md | 4 ++--
git diff <base>..HEAD -- skills/chart-issues/SKILL.md | wc -c   # 0
```

## Done-criterion evidence

1. Placeholder names only the two proof kinds; audit paragraph states rule 1 with prerequisite route and refusal: `git diff` on `shapes.md` read against the brief (seconds).
2. Audit paragraph states rule 2 keyed on `blocked-by` with no count, size or duration trigger: same diff (seconds).
3. Spine paragraph and `SKILL.md:41` unchanged: `SKILL.md` diff is 0 bytes, spine paragraph present once and outside the diff (seconds).
4. Blocking `checks` pass including resolved changed-tests: outputs above (full suite 76s wall time). No test asserts the new wording, per the plan's D4 vanity-test exclusion.

## Known limitations

- The rules are prose the door applies; no automated check rejects a violating done-criterion or a `blocked-by` entry without consumed output (carried from the plan's open limitation).

## Unverified criteria

- None.

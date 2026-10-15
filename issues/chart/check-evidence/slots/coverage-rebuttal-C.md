# Log coverage rebuttal, slot C

Sources: coverage-merged.md, akrogon main f3557d8, host 2026-10-15. Read-only.

## Corrections to my own notes

1. flaky and chart logs. D is right, I was wrong. `akrogon flaky` does not scan folders; it opens whatever path a verify-runs.jsonl receipt recorded, with only an open→closed substitution (src/flaky.ts:11, :35). A direct attempt's receipt points at `<chart>/direct/check-*.log`, so flaky reads it as long as the file exists at that path. Host: 7 chart receipts in akrogon, 1 in framework. Consequence for Q1: any option that moves or ignores direct logs must keep the taken resolver able to serve `chart/<chart>/direct/<log>` from the archive, or flaky prints `(log gone)` for every direct red (flaky.ts:12).
2. My Q2 pitfall "run-check records every run in timings, which flaky reads" was wrong on the reader. flaky reads verify-runs.jsonl only (src/flaky.ts:3, :20). The timings inflation remains, but it affects `akrogon status` timing lines, not flaky.

## Misstatements in the merged notes

3. Q2 pitfall "Seat cannot cite the path: run-check prints `check <name>: <code> <path>` (D)" contradicts the evidence line above it and the code. Today run-check writes only the command's own stdout (src/run-check.ts:205) and returns the exit code (:143); it prints no path. The `check <name>: <code> <path>` line is D's proposed fix, modelled on verify (src/verify.ts:163, :170), and should be tagged as such.

## Where I move

4. D-q1. I move to O1 (pack at end), on one condition. Reason: with the taken resolver, a packed direct log costs one command to read, and item 1 shows a plain-vs-packed split would have to be special-cased in the resolver anyway. Condition: `Handed off` must pack too, before the branch is adopted by the leaf, since system-flow's 18 direct logs are untracked today and would be lost on the next worktree cleanup, not moved to the leaf. B's pitfall "keep the chart archive in place" and my handoff point are the same requirement.

## D-trigger

Pick: door step (A,B), as one named command run before the end marker is appended (SKILL.md:114, :121, and the handoff sentence at :85), plus the "end marker with plain logs" check in direct-guards or the chart-usage.ts run, not in `akrogon sync`.
Reason: chart-usage.ts is a transcript-cost reporter (`chart-usage.ts <chart-folder> [<until>]`, scripts/chart-usage.ts:342-348) and gains nothing from owning a pack; `akrogon sync` is a plain `git add` plus commit of eligible records (src/sync.ts:140-165) called only from the CLI (src/akrogon.ts:107-109), and a pack inside it makes a commit step able to fail on chart state.
A net belongs where the marker is checked, not where files are staged.

## Q2a

Pick: no filename guard. The pack takes every `*.log` under the owner, so a stray hand-saved file costs nothing at close, and a guard by name would also refuse the non-check outputs merge-issue needs (push and trailer-gate results, range-diff per merge-issue SKILL.md:55).
Enforce the writer, not the name: the three skill sentences change, and B's review checks that every cited check log is a `check-*` or verify copy.
If a guard is still wanted, make it a function check: refuse a hand-saved `*.log` byte-identical to a `check-*` log in the same leaf, which is the only duplication the evidence shows (118 files).

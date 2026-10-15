# Final shape: log-coverage (operator `1a | 2a | 3a`, 2026-10-15)

Builds on the taken evidence-location shape: /home/ivan/Work/infra/akrogon/issues/chart/check-evidence/forks/evidence-location.md, section Taken.

1. The owner pack becomes one shared function. A new command `akrogon pack <folder>` runs it on any folder: same temp-name write, byte-equal read-back, delete only verified plain logs, retry union, `.closing` while it runs, symlinks refused, no archive when no logs.
2. The chart door runs `akrogon pack <chart>/direct` before appending `Closed`, `Held` or `Handed off`, when `<chart>/direct` holds a `*.log`. Archive at `<chart>/direct/evidence.tar.zst`, members relative to `direct/`. The step goes into chart-issues SKILL.md at the three ending sentences (:85, :114, :121).
3. `.gitignore` additions from `akrogon init` (src/init.ts:67-76) also cover `issues/chart/*/direct/*.log`.
4. A chart reopened after an end marker writes new plain logs; the next pack merges them into the archive by the retry union. run-check refuses a chart holder only while its folder holds `.closing`.
5. The `akrogon log` resolver adds `chart/<chart>/direct/<member>`: plain file, else member of `<chart>/direct/evidence.tar.zst`. flaky uses the same resolver, so direct receipts in verify-runs.jsonl keep resolving.
6. `akrogon status` warns for each chart whose last marker is `Closed`, `Held` or `Handed off` and whose `direct/` still holds a plain `*.log`, naming the chart and the command to run.
7. `akrogon run-check` prints `check <name>: <exit> <kept path>` after the command, like verify (src/verify.ts:163,170).
8. Skills implement-issue (SKILL.md:25,65), check-issue (:18,67,83,85) and merge-issue (:18,41,53,75): any kept command output runs through `akrogon run-check --name <label> -- <cmd>` (`--holder <chart>/direct` on the direct route) and the report cites the printed path. No hand-saved `*.log` under issues/. The `$TMPDIR` rule for scratch stays. Non-log artifacts (screenshots, traces, JSON) keep their own contracts.
9. No guard refuses stray logs; the pack takes every `*.log` in the folder.

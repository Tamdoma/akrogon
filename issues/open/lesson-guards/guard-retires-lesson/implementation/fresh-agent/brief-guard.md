# Brief: schema-guard-everywhere

## What
Land `src/validate.ts` and call it from every code path that produces a report artifact: the report writer (`src/report.ts`), merge evidence (`src/merge.ts`) and the repair diff (`src/repair.ts`). Retire the review-by-reading lesson in the same diff: remove its active line from `learnings/LESSONS.md` and append `Applied <YYYY-MM-DD> by src/validate.ts:<line>: schema validation runs on every report-producing path` to `learnings/history/2026-09-10-review-by-reading.md`.

## Why
Leaf csv-export shipped two invalid rows because the reviewer read the report but never ran the new schema validator. The mechanism, review-by-reading, stays open until validation runs mechanically on every path that produces a report artifact.

## Done-criteria
1. Invalid rows pushed through each report-producing path (report writer, merge evidence, repair diff) fail with the validator's rejection; valid rows still produce their artifacts.
2. Retirement: the diff removes the review-by-reading line from `learnings/LESSONS.md` and appends the `Applied <YYYY-MM-DD> by src/validate.ts:<line>` entry to `learnings/history/2026-09-10-review-by-reading.md` in the same diff.

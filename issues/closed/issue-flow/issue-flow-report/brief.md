# Brief: issue-flow-report

## What
Add a read-only mode `akrogon timing --flow --since <YYYY-MM-DD>` that shows where each leaf-carried GitHub issue's life went, from filing to merge, and how big and old the not-handed-off backlog is. (A,D)

A carried issue is an identity in the `sources` of any open, closed or parked leaf; a leaf without `sources` carries nothing. (A,B,D,E) Per carried issue: identity, filed time, handoff date (earliest `created` among its leaves), merged time (latest move into `merged` when every leaf carrying it is merged, else `open`), wait (handoff date minus the UTC filing date, whole days) and total (filing to merge, or to now while open), and leaf count. (A,D) Per open issue of the repo's origin GitHub repository that no leaf carries: identity, filed time and age. Then summary lines.

## Why
The system-flow chart found most of an issue's life outside the lifecycle: framework issues have a 4.9-day median age while leaves started after 10-14 15:50Z take a 1.86 h median from start to merge. No command shows this today: seeds carry no filing time, `akrogon timing --cohort` starts at the first plan prompt, and the numbers were computed by hand. The operator paused factory rule changes until about 20 leaves run under today's rules; this view, beside the existing cohort gate, aims the next change at the real constraint. It covers only leaf-carried issues: direct deliveries and issues closed by `akrogon close` have no leaf, so they are counted, not timed. (B)

## Done-criteria
1. `akrogon timing --flow --since <YYYY-MM-DD>` prints one line per carried issue with the fields in What, sorted by filed time then identity. Issue-level spans print in days with one decimal (`4.9d`), wait in whole days (`3d`). (A,E)
2. It prints one line per open issue of the origin repository that no leaf carries, with identity, filed time and age, so a parked leaf's issue never appears there. (A,B,E)
3. It ends with summary lines: issues handed off before the `--since` date and issues handed off on or after it, each with count, merged count, median wait and median total over merged issues; the backlog with count, median age and oldest age; and the count of closed issues in the listed repositories that no leaf carries. A median over an even count is the mean of the middle two; a median or oldest over nothing prints `-`. (A,B,D,E)
4. Filing times come from one `gh api --hostname github.com repos/<owner>/<repo>/issues?state=all&per_page=100 --paginate --slurp` read per distinct repository among the carried identities and the origin, through the existing command retry, with pull requests dropped. A failed read exits non-zero with the command and output. A carried identity its repository's listing lacks prints as `<identity> not in listing` and the command still exits 0. (A,D) A real run in this repo is recorded in the implementation report with its output.
5. `akrogon timing` usage errors, the README command table and `docs/guide/files.md` describe `--flow --since <YYYY-MM-DD>` and the leaf-carried coverage. (A,B,D,E)

Criteria 1-5 are proven by the destination's `test` command in `checks`. (B,D,E)

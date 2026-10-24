# Fork: receipts at member grain

Context: CHART.md destination; slots/map-merged.md; slots/rebuttal-B.md R1-R5; slots/rebuttal-D.md 1-3; src/verify.ts:111-120, 259-263, 398-416; src/admission.ts:139-144.

## Questions

- Q1 What is the unit akrogon records and reuses for a check?
- Q2 Does a red run stop its siblings at first red?
- Q3 What does `--known-red` run on the base side?
- Q4 How do seats stop running the full suite by hand through `run-check`?

## Taken

Taken by A under autopilot 2026-10-24, consultants B (codex) and D (claude-fable-5-1).

- Q1 Member receipts (A,B,D). A configured check may name a parallel group of members. `akrogon verify` runs the group in one worktree with one setup and the existing root-state guard over the composed run, records one result per member keyed by tree, and skips a member holding a green result for this tree under the same command text. The gate passes when every member is green or covered by the existing known-red rule per member (B R3). Cancelled, not-started or setup-failed members never count green (B). Members are listed once, in the destination's config, not copied from package.json (B). The same-tree input assumption already behind tree reuse is extended to members and named in the design (B,D). No new admission permit, so runs still start immediately (B R5). Reason: it is today's tree-reuse rule at the grain the suite already has, so a same-tree rerun repays only the red member.
- Q2 Not taken. The operator locked "a failing run shows every failure" (FW verify-gate reporting-main-run 2026-10-03, merge-gate fail-fast 2026-10-10). Reported to the operator as the largest remaining saving, with D's upper bound of about 35 CPU-h over 11 days, to be measured at member grain after Q1 lands.
- Q3 The base side uses the same member-receipt reuse as the head (D). A base member with a green result on the base tree is read, a base member without one runs fresh. This reopens the autopilot pick in akrogon base-red/forks/red-base-policy.md:27, which was not operator words. Reason: reuse can only make the known-red pass stricter. A green base result makes a red head member fail the comparison, so a stale receipt can block a merge but can never pass one. The passing direction still needs fresh red evidence on both sides. Observed cost of the accepted loss: 0 of 9 base reds in 11 days were drift, all were the fixture-flakes timeouts (D). Dissent B R1-R2: keep fresh base evidence for each red head member, with an amended completeness contract. Not taken because it adds a base-side exception the head does not have and runs a superset of D's runs.
- Q4 `akrogon run-check` refuses a command whose text equals a configured check or a configured member and prints the `akrogon verify` command to use (A,D). `akrogon verify` accepts an explicit merge scope from check.fix, so a seat repairing a red merge has a route that writes a receipt (B). Reason: the refusal alone leaves check.fix no way to rerun the merge suite (src/verify.ts:396 picks scope from phase), the route alone leaves the hand path open.

## Dropped

- Front-loading affected suites before merge (B; A dropped it): selection, foreclosed by FW verify-speed 1a.

## Refined at draft review

- Q4 narrowed (A, from D draft review 10-11): the refusal covers `merge_checks` entries only, in their bare, `sh -c` and printed setup forms. `checks` stay runnable, because implement and check.fix run them through their printed form. `akrogon config` prints `akrogon verify --scope merge` for merge checks.
- Root-state guard owner (A, from B F1 and D 1): the framework leaf wraps each member in `run-with-root-state-guard.ts`. akrogon adds no guard.

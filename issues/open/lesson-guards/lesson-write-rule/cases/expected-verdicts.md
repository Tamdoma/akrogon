# Expected verdicts — kept out of the decider's input

These expectations are private to A; case-1..6.md carry evidence only.

| Case | Expected | Reason |
|---|---|---|
| 1 | `append-case | seed` | same failure cause (generator unconditionally rewrites the tracked artifact); mechanism is a fixed pattern, history links no report |
| 2 | `new-line | seed` | different cause (ordering drift vs. self-rewriting test); shared filenames are not a match; checkable, no report |
| 3 | `new-line | no-seed` | no matching line; review-calibration judgment is not a fixed pattern |
| 4 | `akrogon-learnings /home/ivan/Work/infra/akrogon/learnings/ | seed Tamdoma/akrogon` | lesson is about an akrogon skill → akrogon's learnings; akrogon-owned path routes the seed to Tamdoma/akrogon |
| 5 | `new-line | no-seed` | checkable but history already links a report → the Seed clause is pre-empted |
| 6 | `new-line | local+notice | seed-stops` | no matching line → new line; akrogon root unresolvable → the seat says so and writes locally; the `/seed-issue` run cannot route (owner test stops visibly before posting), so no report is filed and no URL is appended |

Broken variant check: under a Match clause where shared keywords count as a match, case 2 must be decided `append-case`; the shipped rule must produce `new-line`.

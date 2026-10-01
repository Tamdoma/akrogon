# check-scheduling merged round

Q1 scope. Split.
- 1a (B rec) scheduling + tool-written runner. Reason: intake asks for both; runner gives one shared record format.
- 1b (A rec) scheduling only; runner Off route. Reason: map F5, the emdash full runs were all red or on new heads, so a commit-keyed passing record saves zero runs; B already skips green reruns on prose (F2). Safe reuse needs declared inputs akrogon lacks.
- 1c runner only. (A,B) reject: keeps blanket repair runs.
- Pitfalls (A,B): a file in an agent-writable leaf folder is provenance, not forgery protection; a `phase merged` guard is post-push and cannot gate a push.

Q2 implement/repair proof. (A,B) 2a: after implement and after every repair, A runs the changed tests including affected consumers and every `checks` command; `merge_checks` run only at merge. Replace the undefined "full suite" at implement-issue:42,48,52, worker-protocol:25,27, brief-template:37, skills/AREA.md:22, docs/guide/phases.md:91.
- 2b full suite once before first review, then 2a on repairs. (B) cost: one slow run per leaf proving nothing beyond criteria.
- Pitfall (A,B): a slow command left in `checks` still runs every round; placement is the repo's choice, not akrogon's.

Q3 chart audit. (A,B) 3a merged: a done-criterion may not cite a `merge_checks` command (A); a repo-wide `checks` command is allowed only when the chart names the property no smaller test proves (B, existing standing-design:10); replace shapes.md:170 "added to `checks` first" so repo-health suites stay in merge_checks (A,B).
- 3b ban every repo-wide command (seed). (A,B) reject: no mechanical definition, rejects real integration proof.
- Pitfall (A): merge_checks red on main sends every merge to check.fix (merge-issue:41). Pitfall (B): existing framework C1 is an operator contract decision, not part of this work.

## After B rebuttal (accepted by A)
- B1: Q2 keeps "passing proof for every leaf criterion" (implement-issue:44) and reuse of unchanged evidence (check-issue:51); a criterion that needs a whole run still runs it before review. (A,B)
- B2: Q3 also refuses a criterion whose outcome is repo health outside leaf ownership. (A,B)
- B3: F5 wording becomes "no savings from passing-record reuse shown in this case". (A,B)

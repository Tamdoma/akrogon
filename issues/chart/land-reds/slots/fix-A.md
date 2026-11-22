# Blind notes: fix-shape — slot A (written before reading B or C)

## Q1 Cause vs symptom
- Pick: load is the cause (condition 2); condition 1 decides who is charged. Every framework land on 2026-11-22 overlapped 8-19 leaf-scope verify runs (framework issues/verify-runs.jsonl vs merge-attempts.jsonl, A's count: reds 8-19, the one green 8). Each framework verify command runs through `checkedRun` -> `withAdmission` (src/run-check.ts), which admits every non-`full` run at once; framework has no `full`. The land verify is several sequential `checkedRun`s (setup, cheap/verify), each its own record, so no admission record spans a land.
- Condition 1 is by design: merge-lanes red-exit Taken 7/8 (nameless never covers; base pass only on named repeats; #134). Keep it: a nameless placeholder as a comparison key lets a new failure land (limit S2).
- The charging defect is skill text: check-issue `## check.repair` "For a second red on the same unit, use check.fix" fires on a repeated nameless/timeout unit that B itself judged not leaf-caused, and A then edits unrelated code on the leaf branch.

## Q2 Load
- Pick: the land run holds its repo for the whole verify. `land` takes one admission record (`land: true`, `full: true`) around its verify calls and exports its token as `AKROGON_RUN`, so every pass command (forwarded through `passForwarded`) is nested under it, `full` ones included (`nested` accepts a same-repo full parent). Admission gains one rule in the existing poll loop: a land record starts when no other non-nested run of its repo is live (drain, first among line waiters); any other run of that repo waits while a land record of the repo is waiting or live. One loop (`awaitLineTurn` generalized), no new state file.
- Rejected: framework `full: [verify, cheap]` (merge-lanes 9 not taken; FIFO lets the land wait behind every queued leaf run, serializes leaves); per-command land flag (gaps between commands let leaf runs in); lowering framework concurrency only (framework-side, does not stop overlap); a pressure gate (observe-only numbers, a threshold A cannot source).
- Pitfalls: line deadlock (a full waiter first in line blocked by a waiting land) -> sort waiting land records first; starvation of the land by arrivals -> arrivals wait while the land waits; a long seat run-check (paid e2e) delays a land — accepted; the land record must die with the land process (pid liveness already does this).
- Unasked: should the merge turn's restack/gates outside verify also hold the repo? (A: no, they are git-only.)

## Q3 Judgment
- Pick: no verify.ts change. check-issue `## check.repair`: the second-red bullet applies only to a red B judges leaf-caused; a repeated red B judges not leaf-caused (timeouts, nameless, load) on an untouched diff returns to `merge` unchanged or takes the main-red `failed` stop, never `check.fix`; B never hands A a fix outside the leaf's brief.
- Rejected: nameless units as taken8 keys (#134, S2); an in-land rerun (5a, operator); a count of reds before failing (no sourced number).

## Q4 Else
- docs/reference/checks.md admission/full paragraph; the admission comment in src/admission.ts; merge-issue land description if it names admission.
- Tests (red before, green after): a leaf run of repo R waits while a land record of R is live and starts after; a land record waits while a leaf run of R is live; a run of another repo is not held; a land's full command runs nested (no self-deadlock); a full waiter queued before a land does not deadlock it.

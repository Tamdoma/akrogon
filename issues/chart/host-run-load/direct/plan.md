# Direct plan: host-run-load

Branch host-run-load, worktree /home/ivan/.akrogon/worktrees/akrogon/host-run-load, base 0ed00de652e571bd54481244c1b6aed1f000c176.

Criteria (forks/full-suite-line.md Taken 1-7, operator status correction, rebuttal outcomes):
1. A run named in the repo's `full` list waits while another full suite runs host-wide; a run not named there starts at once. Proof: run-permit "a full suite waits for the live full suite, a run not marked full starts at once, status shows the line only while one waits".
2. Arrival order. Proof: "full suites start in arrival order".
3. Killed holder or waiter does not block. Proof: "a killed full suite holder or waiter does not block the next full suite".
4. Full under full nests; full under non-full takes its turn. Proofs: "a full suite inside a full suite runs at once", "a full suite inside a run not marked full waits for the live full suite".
5. Config refuses unknown names. Proof: "config refuses a full name that is not a check".
6. Status table only while a full suite waits (criterion 1 test asserts both absence and the rows).
7. Full verify green on the head.

Rollout after landing (door, outside the diff): deploy, then add `full` to each repo's issues/config.yaml (strict schema: never before the deploy), then unpause akrogon and lingua-relay.

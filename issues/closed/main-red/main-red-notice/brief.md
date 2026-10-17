# Brief: main-red-notice

## What
When a `akrogon verify --known-red` base run completes with failing tests that no unresolved incident already covers, akrogon sends one herdr notification saying main is red, naming the count, the first test names and the receipt id, and stores the delivery result on that base run record. Repeats stay silent until the unit is seen green on landed main.

## Why
known-red-pass lets leaves pass while main stays red, so the operator must learn about the red once to chart a repair. This consumes the linked base run records known-red-pass writes (`compares` field in issues/verify-runs.jsonl).

## Done-criteria
1. A completed `--known-red` base run with a failing test no unresolved incident covers runs `herdr notification show "<repo> main red" --body "<n> new red on main: <first names>; receipt <run id>; chart a repair" --sound none` once and stores the reply reason, or `error`, on that base run record.
2. A later base run where the same scope, command and test is still failing and unresolved sends no notification.
3. After a completed base-side run or default-branch-tip verify for the same scope and command shows that test passing on the red revision or a descendant of it, a later failing base run notifies again; a passing leaf-head run does not resolve it, and a green run on an older revision never clears a newer red even when it finishes later. (A,B)
4. When the notification call fails or herdr is absent, `akrogon verify --known-red` keeps its exit code and pass/fail result, prints `notice: <error>` to stderr, records `error`, and the next base run for that unresolved incident sends it.
5. Two base runs finishing at the same time with the same new failing test produce one notification; a reservation left by a dead process does not block the next run's send. (A,B)

# check-scheduling, slot A round

Q1 1a (rec): scheduling only. Records runner goes Off route. Reason: map F5, every emdash full run was red or on a new head, so commit-keyed passing records save zero runs; F2, B already skips green reruns on prose. Safe cross-commit reuse needs a declared-input model (Bazel/Nx/Turborepo) that akrogon lacks.
Q1 1b: build the runner too (new verb, record schema, storage under leaf, phase guard, adoption in three skills). Cost: two more leaves for savings not shown in the motivating case.

Q2 2a (rec): after the last unit and after every repair, A runs the changed tests plus every `checks` command; `merge_checks` run only at merge. Replace undefined "full suite" with "every `checks` command" at implement-issue:42,48,52, worker-protocol:25,27, brief-template:37, skills/AREA.md:22, docs/guide/phases.md:91. checks is the fast tier by placement (init-akrogon:20).
Q2 2b: repair runs changed tests plus only "fast" checks. No config field marks fast within checks, so A guesses.
Pitfall: a slow command left in `checks` still runs every round. That is a consumer config fix, not akrogon.

Q3 3a (rec): a criterion may cite a `checks` command or the leaf's own tests, never a `merge_checks` command. Replace shapes.md:170 "a leaf needing a larger repo-wide command gets it added to `checks` first" so repo-wide health stays in merge_checks. Reason: emdash C1 cited framework:verify, forcing the slow suite into every round.
Q3 3b: refuse any repo-wide command (seed). "Repo-wide" has no mechanical test; akrogon's `bun test` is repo-wide and fast.
Pitfall: merge_checks red on main sends every merge to check.fix (merge-issue:41 fix-forward). That is the emdash day-long block in another place.

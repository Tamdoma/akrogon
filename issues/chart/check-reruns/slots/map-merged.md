# Merged map: check-reruns (#48)

Attribution: `(A)`, `(B)`, `(A,B)` = slots that found it independently.

## Seed claims vs code

- F1 No check runner exists. `src/akrogon.ts:32-91` has no check verb, `src/config.ts:34-36` holds command strings only, phase guards (`src/phase.ts:253-269`) check cleanliness and branch content, not check results. (A,B)
- F2 "Prose always counts as missing" is false. `check-issue/SKILL.md:51` permits reuse, and emdash review B accepted the report's results without rerunning them (`review-B.md:18,117`). (B)
- F3 Repair pressure is real. `implement-issue/SKILL.md:52` forces "a full-suite rerun follows a repair", `:48` runs "the full suite" at implement end, `:62` already says repair runs "affected changed tests and required checks". "Full suite" is defined nowhere (`skills/AREA.md:22`, `worker-protocol.md:25,27`, `brief-template.md:37`, `docs/guide/phases.md:91`). (A,B)
- F4 merge_checks shipped today (5375dbe) as the slow merge-only tier, and framework moved `framework:verify` there (framework a5898e73b). That is the seed's workaround made permanent. (A,B)
- F5 Records keyed by commit would have saved zero of the six emdash full runs. Every run was red or on a new head: report.md:27 (exit 2, 63199cb), :81 (exit 2, 5ca8065), :107 (exit 1, 604f370), :128 (exit 0, ee13892). Review B's run was red on the same head as A's red run, and only passing records are reusable. (B, verified by A)
- F6 The real cost driver was a done-criterion naming a repo-wide suite (`emdash-conversion/brief.md:26` C1 `framework:verify`) that was red on main for reasons outside the leaf until main fixed it (report.md:126). `shapes.md:170` tells charts to add such a command to `checks`. (A,B)

## Practitioner notes (B, read 2026-10-01; A concurs)

GitHub check runs bind evidence to `head_sha` but cache nothing. Bazel, Nx and Turborepo reuse results only from declared inputs (files, env, lockfile, toolchain, args). An arbitrary shell string keyed by SHA or tree misses ignored inputs such as installed `node_modules`, which changed the emdash scan result without changing HEAD (report.md:80-85). Safe cross-commit reuse needs an input model akrogon does not have.

## Forks

- check-scheduling: what to build, how implement/repair schedule checks, what chart audit refuses.
- check-records (only if records are chosen): identity, enforcement point, dirty-run handling, storage.

## Split (proposed)

- Scheduling leaf (skills + guide prose + chart audit). Independent of any runner. (A,B)
- Records runner and its skill adoption, only if chosen: runner leaf, then adoption leaf blocked by it. (A,B)
- Framework config cleanup (duplicate parity/contracts entries under `test` and `test_changed`) is a framework operator change, off route here. (B)

## Disagreement

None on facts. A recommends dropping records entirely given F5. B kept records as proposed leaves without a value judgment and flagged savings as unmeasured (B R2).

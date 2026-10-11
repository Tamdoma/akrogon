# Report: cheap-check-placement

Base: `c53f6196533289555518577f08907ec9c713721c` · Committed head: `cbd5640` (cherry-picked worker commit `0590ed3`).

## Changed files and reasons

- `skills/init-akrogon/SKILL.md` — "Inspect and propose" paragraph: setup now inspects the scripts each proposed merge command runs and places their cheap checks in `checks`, naming an existing cheap group command; a merge command may rerun them but is never their only home (done-criterion 1, plan D2).
- `docs/guide/setup.md` — `**merge_checks**` bullet: a cheap check never runs only at merge, even when a merge command also runs it (done-criterion 2, plan D3).
- `skills/check-issue/SKILL.md` — `## check.review`, "Start from the changed behavior" paragraph: a leaf diff leaving a cheap check reachable only at merge is a Fix when a script edit within the leaf routes it through a `checks` command, else an `Operator actions` item naming the config line, which gates no done-criterion (done-criterion 3, plan D4).

One commit, three files, +3/−3 lines. No tests: plan D6, standing design — text-only leaf, proof is quoted lines plus the by-meaning sweep. No `Test-Change` trailer needed; no changed path matches `src/test-files.ts`.

## Quoted edited lines

- `skills/init-akrogon/SKILL.md:20` — "…replays the exact rejected command. When proposing `checks` and `merge_checks`, inspect the scripts each proposed merge command runs and place their cheap checks — typecheck, lint, validators and the like — in `checks`, naming an existing cheap group command when the repo has one; a merge command may rerun cheap checks on the integrated candidate but is never the only place they run:"
- `docs/guide/setup.md:54` — "…replays the exact rejected command. A cheap check never runs only at merge, even when a merge command also runs it — a check cheap enough for the leaf's own check belongs in `checks`, and a merge command may rerun it on the integrated candidate but is never its only home."
- `skills/check-issue/SKILL.md:43` — "…no documented behavior changed. When a leaf's diff changes a script that a `merge_checks` command runs and leaves a cheap check reachable only at merge, it is a Fix when a script edit within the leaf can route that check through a command `checks` already runs, and otherwise an `Operator actions` item naming the config line to add, which gates no done-criterion."

## Criterion 4: by-meaning sweep

Command: `grep -rniE "merge_checks|merge check|only at merge" skills/ docs/` — 30 lines, all classified:

- In scope (edited): `skills/init-akrogon/SKILL.md:20`, `docs/guide/setup.md:54`, `skills/check-issue/SKILL.md:43`. None claims akrogon code enforces placement.
- Remaining 27 hits describe merge mechanics (order, `merge_covers`, grants, retry/replay rules, config template keys in `init-akrogon:30-31`) and never permit a cheap check to run only at merge.
- Out-of-scope hits: none.

No line under `skills/` or `docs/` now allows a cheap check to run only at merge.

## Commands run and results

- `bun test --changed=$AKROGON_BASE --timeout=30000` (worker worktree and again on the lane after cherry-pick): "3 changed files, but no test files are affected", 0 pass / 0 fail, exit 0 — expected for markdown the suite does not import.
- `checks.format` (`bun run format`): clean, prettier rewrote nothing.
- `checks.test` (`bun test --timeout=30000`): 792 pass / 0 fail, 41 files, ~105 s wall.
- `checks.typecheck` (`tsc --noEmit`): clean.
- `checks.test_changed` (`bun test --changed=$AKROGON_BASE`): no test files affected, exit 0.
- Criterion proofs: `grep -c` for each added sentence → 1 hit each (above); sweep classified above.

`merge_checks` not run (empty set; merge runs them).

## Worker return (U1, sa-1)

Commit `0590ed3`, three files only; section-8 report fields complete: changed files/reasons listed, tests run as above, no known limitations beyond prose guidance, no unverified criteria. Worktree removed after cherry-pick.

## Known limitations and unverified criteria

- The rule is agent-followed prose; akrogon code cannot enforce placement — locked design, restated nowhere in the diff.
- No unverified criteria.

# Review B: seat-override

Base: `329e59d951969f49008a2d7c2fab99c867d133c5` · Reviewed head: `57bd933cb69d8e825bc84502dc125b1c927a330b`

## Evidence

- Diff inspected in full: `src/config.ts`, `src/next.ts`, `src/init.ts`, three test files, five doc files. Matches plan D1–D7 and design locks; no field-level merge, no per-repo templates, no `issues/` changes, no `globalSchema`/install/routing churn.
- Live probe (`bun -e` importing `seats`): inheritance returns global pair; override returns repo seat + inherited seat; unknown harness throws `Missing harness template "ghost" for seat b in repo akrogon` — names repo, seat, harness per criterion 2.
- `akrogon config` in this worktree prints the merged `slots` pair (criterion 4).
- `grep -rn "slots" src/` confirms every consumer goes through `seats`; no bypass of the resolver.
- `src/AREA.md` paths all exist from repo root; file is 30 lines with the four required sections.
- Doc sweep (`seat|harness|model` across `docs/guide/` and `README.md`): no stale claim; `install.md` still correctly describes machine config as defining the seats (override is additive), `next.md` makes no seat-source claim.
- Tests are behavior-level (argv elements, exit codes, printed YAML, filesystem absence), not wording mocks; spaced-model assertion proves `quote()` keeps the model as one argv element.
- Reported checks reproduced earlier this pass chain: full `bun test` 287 pass, `typecheck` clean, `format` clean, `git status --porcelain issues/` empty. No code change since; not rerun.

## Findings

None.

## Verdict

ready

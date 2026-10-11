# Design: guard-at-creation

## Binding decisions, verbatim

From `issues/chart/night-flow/forks/stop-rules.md`, Taken. Operator, 2026-10-11, on the simplified round: "1a | 2a | 3a |"

S3 guard-at-creation (3a)
- Drop `akrogon guard ancestors` from `withSetup` (`src/config.ts:276-292`); creation checks stay (`src/next.ts:284`, `src/batch.ts:96`).
- Keep `guard own-modules`: a separate guarantee (`src/guard.ts:36-39`) (B F6). Add `setup: bun install --frozen-lockfile` to akrogon `issues/config.yaml` so a fresh akrogon store worktree gets node_modules (C).
- Base copy allocated under `~/.akrogon/scratch/<repo>/` instead of bare `mktemp -d` (`skills/check-issue/SKILL.md:18,65`, `skills/implement-issue/SKILL.md:38`, `skills/merge-issue/SKILL.md:18`), rest of the clause unchanged (B F7, C). base-run's wording becomes "the hand-made base checkout" (C).
- Held (B F6): amend worktree-store `brief.md:14`. Not taken: worktree-store is merged.

Current state on main `c53f619` (B H4, C F1): every base checkout the skills describe is made by `akrogon base-run` (`implement-issue/SKILL.md:38`, `check-issue/SKILL.md:65`, `merge-issue/SKILL.md:73`), under `leafTemp` (`src/base-run.ts:143-145`, `src/config.ts:263-267`), and removed after (`src/base-run.ts:170`). The scratch-location bullet above is therefore already delivered, and the base-run wording item is moot. What remains is the `$TMPDIR` temp-file sentence at `implement-issue:25`, `check-issue:18` and `merge-issue:18`. Anchors today: `withSetup` `src/config.ts:283-289` (prefix `:287-288`), `checkLocation` `src/next.ts:287`, batch creation `src/batch.ts:97`.

Evidence added after the check: seat TMPDIR is `/tmp/akrogon-1000/<slug>-<hex>` for all six live seats, so the `framework/.temp/tmp.*` base copies did not come from seat TMPDIR. Origin still unverified.

Foreclosed: the repo-wide hold and `held.yaml`; raising `fix_rounds` as the fix; a per-check ancestor guard.

Exclusions: the akrogon `issues/config.yaml` `setup` line was the handoff prerequisite P1, done by the operator on main (`issues/config.yaml:6`, pushed `c53f619`) (B). `akrogon base-run` and its instructions are unchanged. The red-on-base ending in the same skills is already gone, removed by the merged `known-red-leaf`.

## Standing design

`/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md`. Interpretation for this leaf: criteria 1 and 2 are the built command strings and their real run, proven by the existing `withSetup` and run-check tests against a real temporary directory with a parent `package.json` and with a missing `node_modules`, plus one deliberate break re-adding the ancestor guard. Criterion 3 keeps today's creation tests. Criterion 4 is skill text, proven by the report's sweep. No live run and no outside call.

## Leaf architecture

- `withSetup`: both forms of `inner` lose the `akrogon guard ancestors &&` prefix; nothing else changes. `akrogon guard ancestors` stays as a command because creation uses the same check.
- Skill text: the three temp-file sentences keep temp files and logs under `$TMPDIR` and point base copies at `akrogon base-run`. No new allocation command (B,C).
- Not in scope: moving or deleting the existing `framework/.temp/tmp.*` folders, the worktree store, seat TMPDIR.

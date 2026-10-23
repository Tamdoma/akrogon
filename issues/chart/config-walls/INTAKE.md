# Intake: config-walls

## Scope

A repo config that cannot work with akrogon's dependency guards is refused at its source, naming the key to fix. Grouped: #113 (no setup), #114 and #115 (duplicates: in-checkout worktree_root).

## Provenance

- GitHub: Tamdoma/akrogon#113
- GitHub: Tamdoma/akrogon#114
- GitHub: Tamdoma/akrogon#115
- Operator: door session f254b4d3 pane w8:pNP, 2026-10-22

## Source: Tamdoma/akrogon#113

# `akrogon verify` setup fails with `missing own node_modules` on every Gljive checkout, so no receipt and no check.review move

Source: Tamdoma/akrogon#113
URL: https://github.com/Tamdoma/akrogon/issues/113

Origin repo: CastrumS/gljive
Lesson history: /home/rudi/Work/akrogon/learnings/history/2026-10-22-verify-setup-own-modules.md

Unverified intake.

## Observation

- On 2026-10-22, in the Gljive leaf worktree `/home/rudi/Work/Privatni/Gljive/issues/worktrees/map-cut-action`, `akrogon verify` on the committed head `340db2c3bb88e0dae41b549a58b8cc44e41cfa4d` failed its setup in 0.3 s: `missing own node_modules: /home/rudi/Work/Privatni/Gljive/issues/worktrees/verify-<id>/node_modules`, `verify setup: 1`, `verify leaf 340db2c…: red`.
- `akrogon verify --known-red` failed the same way on the head and on the merge-base `4ab2a26`, ending with `verify known-red 340db2c…: fail`.
- Gljive's `issues/config.yaml` has `checks: {}` and no `setup`. The repo commits `package.json` and `bun.lock`, and `bun install --frozen-lockfile` passes in the leaf worktree. `issues/verify-runs.jsonl` held no earlier Gljive run. `akrogon config` printed this config with no warning.

## Location

`akrogon verify` and the `check.review` move, release `92dddada`: `src/config.ts:333-337` (`setupCommand`), `src/guard.ts:36-40` (`own-modules`), `src/verify.ts` (`completed`, `greenRun`, `baseCoversHead`, `requireGreenReceipt`) and `src/phase.ts:350-353`. Consumer CastrumS/gljive.

## Reproduction

Run `akrogon verify`, or `akrogon verify --known-red`, on a committed head in any Gljive leaf worktree. Every run so far failed at setup the same way: three runs on 2026-10-22, two on the head and one on the base.

## Expected behavior

Not provided.

## Urgency

No Gljive leaf can get a verify receipt, so every `check.review` move and every `check.repair` to `merge` move is refused. The leaf map-cut-action is blocked at its `check.review` move with its work done. Workaround: the operator adds `setup: bun install --frozen-lockfile` to Gljive's `issues/config.yaml`.

## Suspected cause

- Supported hypothesis: with no `setup`, `setupCommand` (`src/config.ts:333-337`) makes verify's setup step `akrogon guard own-modules && sh -c true`. `own-modules` (`src/guard.ts:36-40`) returns 1 when the checkout has a `package.json` and no `node_modules` of its own, and a fresh verify checkout has none. A receipt needs a run with `setup === 0` (`src/verify.ts:75-77`, `:97-106`, `:257-263`), and so do both runs of a known-red pair (`:111-112`), so the move check at `src/phase.ts:350-353` refuses. Contributing condition: Gljive's akrogon config landed in `d7e38d0` (2026-10-13) before the repo had a lockfile, so the init rule (`skills/init-akrogon/SKILL.md:43`: propose `setup` only when HEAD lists a lockfile) proposed none. Later the same day `eaa9b0d` added `package.json` and `bun.lock`, and the config never gained `setup`.
- Whose view: both. The reporter supplied the runs and the config, and the agent read the code and the history.
- Files read: `/home/rudi/Work/akrogon` at `92dddada`, the same commit as the installed release `~/.akrogon/releases/92dddada7b2d0a1b37fcb3b1bce9993d535bb62b`: `src/config.ts:333-337`, `src/guard.ts:1-40`, `src/verify.ts:41-120` and `:250-380`, `src/phase.ts:346-356`, `docs/guide/setup.md:55-66` and `skills/init-akrogon/SKILL.md:28,43`. In Gljive, the origin/main history of `issues/config.yaml`, `package.json` and `bun.lock`.
- Not inspected: whether re-running `akrogon init` on Gljive now would propose `setup` (not run), whether dispatch checks `setup`, and other registered repos of the same shape.
- Related reports: none found. Searched Tamdoma/akrogon, state all: `--author @me --search "created:>=2026-10-20"` (limit 40) returned #110, #111 and #112, about run-check's environment and arguments. `--search "own node_modules"` (limit 10) returned #47, #49, #57, #76, #77 and #98, all closed and about base-red handling, temp folders and merge reruns, none about a missing `setup`.

## Source: Tamdoma/akrogon#114

# `akrogon verify` stops on every Gljive leaf with `Refusing location: canonical ancestor … holds node_modules or package.json`

Source: Tamdoma/akrogon#114
URL: https://github.com/Tamdoma/akrogon/issues/114

Origin repo: CastrumS/gljive
Lesson history: /home/rudi/Work/akrogon/learnings/history/2026-10-22-in-repo-worktree-store-guard.md

Unverified intake.

## Observation

- On 2026-10-22, in the Gljive leaf worktree `/home/rudi/Work/Privatni/Gljive/issues/worktrees/emergency-112`, `akrogon verify` on the committed head `22869dead1bca20567fb7e03b3303499b823a4fa` stopped at once with `error: Refusing location: canonical ancestor /home/rudi/Work/Privatni/Gljive holds node_modules or package.json`. The stack ends in `checkLocation` (`src/guard.ts:21`) called from `runOnce` (`src/verify.ts:297`).
- The one retry and `akrogon verify --known-red` stopped the same way. No run was recorded in `issues/verify-runs.jsonl`.
- The same leaf's verify got past this point at 00:54 the same day and failed later, at setup (#113). The leaf klobuk-rename hit the same refusal earlier on 2026-10-22, on head `55280ea`.
- Gljive's `issues/config.yaml` sets `worktree_root: issues/worktrees`. `akrogon config` prints `worktree_store: /home/rudi/Work/Privatni/Gljive/issues/worktrees` with no warning.

## Location

`akrogon verify` and the `check.review` move that needs its receipt, release `92dddada`: `src/guard.ts:5-22` (`checkLocation`), `src/verify.ts:296-297` and `src/config.ts:267-271` (`worktreeStore`). The same guard runs in `src/next.ts:225` (`createSparseWorktree`, new leaf worktrees) and `src/batch.ts:89-91` (merge batches). Consumer CastrumS/gljive.

## Reproduction

Run `akrogon verify` or `akrogon verify --known-red` in any Gljive leaf worktree while the registered checkout `/home/rudi/Work/Privatni/Gljive` holds `package.json` at its root. Every run since 09:18 on 2026-10-22 refused: three on emergency-112, and the klobuk-rename runs in the lesson history.

## Expected behavior

Not provided.

## Urgency

No Gljive leaf can get a verify receipt, so every `check.review` move is refused. emergency-112 is blocked at that move. By the guard's call sites, new leaf worktrees and merge batches under this store would be refused too (not run). Known workaround, from the lesson history: a store outside the checkout plus moving the active leaf worktrees (`ensureWorktree` refuses a recorded worktree that differs from `<store>/<slug>`, `src/next.ts:250-255`), or a main checkout without the app files.

## Suspected cause

- Supported hypothesis: `worktreeStore` returns the configured `worktree_root` (`src/config.ts:267-271`), so every verify checkout is `/home/rudi/Work/Privatni/Gljive/issues/worktrees/verify-<id>`. `checkLocation` (`src/guard.ts:5-22`) walks the canonical ancestors of that path and refuses when any holds `node_modules` or `package.json`. At 09:18 on 2026-10-22 the Gljive main checkout moved from `bfd1a30` (an issues-only root, per the lesson history) to `4ab2a26`, whose root holds `package.json`, so the ancestor `/home/rudi/Work/Privatni/Gljive` now trips the guard. Contributing condition: nothing compares the configured `worktree_root` with this guard when the config is written or printed. `docs/guide/setup.md:57` documents `worktree_root` and says an in-checkout store is gitignored, without saying such a store fails the guard once the checkout root holds `package.json`.
- Whose view: both. The reporter supplied the runs, and the agent read the code.
- Files read: the installed release `~/.akrogon/releases/92dddada7b2d0a1b37fcb3b1bce9993d535bb62b`, the same commit as `/home/rudi/Work/akrogon` HEAD `92dddada`: `src/guard.ts:1-40`, `src/verify.ts:270-320` and `:380-420`, `src/config.ts:267-271`, `src/next.ts:215-230` and `src/batch.ts:84-95`. Also `/home/rudi/Work/akrogon/docs/guide/setup.md:52-62`, Gljive `issues/config.yaml:1-6` and the Gljive main checkout reflog.
- Not inspected: `issues/closed/worktree-isolation/worktree-store/design.md:12`, which the lesson history cites as saying the store belongs outside every checkout. Also not inspected: whether `akrogon init` validates `worktree_root`, and other registered repos with an in-checkout store.
- Related reports: Tamdoma/akrogon#113 covers the same leaf runs and command but a different guard (`own-modules` at setup, reached after this location check passed). Searched Tamdoma/akrogon, state all: `--author @me --search "created:>=2026-10-20"` (limit 30) returned #110, #111, #112 and #113. `--search "Refusing location"` (limit 10) returned none.

## Source: Tamdoma/akrogon#115

# `akrogon verify` refuses every Gljive checkout: "Refusing location: canonical ancestor … holds node_modules or package.json"

Source: Tamdoma/akrogon#115
URL: https://github.com/Tamdoma/akrogon/issues/115

Origin repo: CastrumS/gljive
Lesson history: learnings/history/2026-10-22-in-repo-worktree-store-guard.md

Unverified intake.

## Observation

On 2026-10-22, in the Gljive leaf worktree klobuk-rename (head `55280ea`), `akrogon verify` exited 1 before creating its checkout:

```
error: Refusing location: canonical ancestor /home/rudi/Work/Privatni/Gljive holds node_modules or package.json
      at checkLocation (/home/rudi/.akrogon/releases/92dddada7b2d0a1b37fcb3b1bce9993d535bb62b/src/guard.ts:21:15)
      at runOnce (/home/rudi/.akrogon/releases/92dddada7b2d0a1b37fcb3b1bce9993d535bb62b/src/verify.ts:297:3)
```

One retry and `akrogon verify --known-red` stopped the same way. No run was recorded in `issues/verify-runs.jsonl`. The same leaf's verify on 2026-10-21 at 23:16Z got past this guard and failed later at setup (#113). The Gljive leaves map-cut-action and emergency-112 hit the same refusal the same morning.

## Location

akrogon `verify` (installed release 92dddada): `src/guard.ts` `checkLocation`, called from `src/verify.ts` `runOnce`. Gljive registered checkout `/home/rudi/Work/Privatni/Gljive`, whose `issues/config.yaml:3` sets `worktree_root: issues/worktrees`.

## Reproduction

1. A registered repo's config sets `worktree_root` to a folder inside the registered checkout (Gljive: `issues/worktrees`, since 2026-10-13).
2. The registered checkout's working tree holds a root `package.json`. Gljive's main checkout moved from `bfd1a30` (tree root `.gitignore docs issues learnings`) to `4ab2a26` (the whole Expo app, with `package.json`) at 2026-10-22 09:18:04 +0200, per its reflog (empty message).
3. Run `akrogon verify` in any leaf worktree of that repo.

Seen on every run since the move, on 3 leaves.

## Expected behavior

Not provided. The night before, the same command on the same leaf created its checkout and ran setup.

## Urgency

Every Gljive leaf is blocked at the `check.review` move, which needs a verify receipt (`src/phase.ts:352`), and neither a green run nor a known-red pair can be recorded. New leaf worktrees (`src/next.ts:225`) and merge batches (`src/batch.ts:89-91`) call the same guard. No workaround is available to a seat: the store location and the main checkout belong to the operator. Changing `worktree_root` alone would also trip `ensureWorktree`'s recorded-path check for the four active leaves (`src/next.ts:250-255`). Not tried.

## Suspected cause

Supported hypothesis: the configured store lies inside the registered checkout, and `checkLocation` refuses any target with a canonical ancestor holding `package.json` or `node_modules`. Gljive's store passed only while its main checkout's tree lacked the app. Contributing: `akrogon config` prints `worktree_store` without applying the guard, so the conflict shows only when a seat runs verify.
Whose view: both.
Files read: `src/guard.ts:5-22`, `src/verify.ts:296-297` and `:394-404`, `src/config.ts:267-271`, `src/next.ts:219-255`, `src/batch.ts:84-95`, `src/phase.ts:352`, all in the installed release `~/.akrogon/releases/92dddada…`, which matches the akrogon workspace HEAD `92dddada`. Also Gljive `issues/config.yaml:3`, akrogon `docs/guide/setup.md:57` and `issues/closed/worktree-isolation/worktree-store/design.md:12` (the store belongs outside every checkout).
Not inspected: what moved the Gljive main checkout at 09:18, and whether other registered repos set an in-checkout `worktree_root`.
Related reports: Tamdoma/akrogon#113 (the same Gljive verify wall the night before, with a different mechanism: no `setup`). Searched Tamdoma/akrogon, all states: `--author @me created:>=2026-10-20` (limit 30), and "Refusing location", "worktree_root guard", "worktree store package.json" (limit 10). No covering report.

## Source: operator 2026-10-22 door start

I pulled another series of issues. Consolidate them and categorize them. Use slot b and slot c (active panes in your herdr tab) to consult. Come up with solutions and chart them out. Best, simplest, most elegant solutions. Always see if you can reduce code first rather than just cramming new complex code on. Keep the code lean. Full autopilot mode, I give you all the permissions. watch-akrogon is the watcher agent tab in this herdr workspace.

## Agent findings

Opening maps (A,B,C): slots/map-A.md, slots/map-B.md, slots/map-C.md. Proofs: see forks.

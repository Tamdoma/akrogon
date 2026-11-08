# Leaf review: D

## Issues

1. `deploy-listener-ready` criterion 2 and design "release without `plugin/` makes no plugin call"; `engine-on-hc` design line 246: deleting the source does not unregister the live plugin.
   The registered manifest in `~/.config/herdr/plugins.json` points into the previous release, whose `plugin/pull.sh` and `plugin/next.sh` run `akrogon pull` and `akrogon next` from PATH. After the engine deploy those are the new commands, so old herdr startup and pane events can still drive pulls and passes beside the listener.
   Smallest fix: in the no-`plugin/` deploy/install path, unlink or disable the akrogon plugin while `herdr` still exists, before restarting the listener, and prove `herdr plugin list` no longer shows it enabled.
2. `engine-on-hc` criterion 12 and design line 244: the no-migration rule covers old open leaves, but says nothing separate about closed leaf state.
   `repoInventory` in `src/state.ts` reads `open` and `closed` together, and the current strict state schema owns `pane` and string `prompted`. This repo has 267 closed `state.yaml` files, most with those fields, including what the engine leaf's own old merge will write. Removing or retyping them makes closed leaves unreadable after deploy.
   Smallest fix: state plainly that retired closed-state fields stay parseable (ignored on read or replaced by a new key), while only an open pre-hc leaf is refused, with an old closed-state fixture in the tests.
3. `update-check` criteria 1-2: a clone "changed from its shipped copy" both must pass today and is the deliberate break that must fail.
   Cloned mods exist to be edited: herdr-app's AGENTS.md says to clone before editing structure or code, and herdr-setup's `cloned_from` mods are local versions. A plain diff therefore cannot distinguish an intentional local patch from an upstream change that needs attention.
   Smallest fix: make clone diffs report-only for manual review, and fail on version mismatch, `herdr-app check`, `bun test`, session probe, or recorded-version mismatch. Use a behind-version clone or a failing behavior test as the deliberate break.
4. `herdr-sweep` criterion 1 and design line 102: only the main `~/.config/herdr-app/mods/tasks` stale link is homed.
   The binding Tasks-board decision copied into the design also requires `~/.config/herdr-app-sessions/infra/mods/tasks` to be checked and removed in the same step. Without a criterion or an exact operator-list item, that link dangles after `herdr-app/tasks/` is deleted.
   Smallest fix: name the infra link path and its absence check either in criterion 1 or as a required line in criterion 5's operator list.

## A's calls

- D1: Agree. `engine-on-hc` should delete `plugin/`: shipping it in the hc release would let the old plugin dispatch beside the listener, and the rollback sentinel needs `<previous>/plugin` to distinguish pre-hc releases. Issue 1 is the missing machine unregister step, not a reason to keep the source.
- D2: Agree. A top-level `prefixes:` map keeps `repos:` as plain paths, and `akrogon init` spreads the parsed global config when it rewrites the file, so the new key survives registration. Adding values only after the engine deploy also matches the strict global schema, and refusal on a missing prefix beats guessing a name.
- D3: Agree, and stronger: no board leaf at all. The operator's 2026-11-07 answer in `forks/board-focus.md` scrapped the Tasks board, and the sweep deletes the remaining mod code, so there is no click-to-seat follow-on to schedule.
- D4: Agree. The engine has to land as one leaf because identity, state shape, dispatch, delivery proof and the listener change together at one cutover, and the deployer-first leaf is the only bootstrap split that does not create a half-switched release. Chart door, watcher and notices then consume stable start and resolver surfaces side by side, and the sweep stays gated on the recorded end-to-end proof.

## Paid budgets

- `engine-on-hc` 8: agree. Four harness kinds with one repeat each matches the per-kind properties only real sessions show, and 4 prompts cover trust handling, first task, later send and file checks.
- `chart-door-on-hc` 7: agree. Reset needs one session and one repeat for each of claude, codex and pi, plus one Claude auto-mode door. Four prompts fit a pre-reset task, the warm-up and the start prompt with one spare.
- `watcher-on-hc` 3: agree. Two codex attempts are enough to settle one stop step, and one watcher session can run the three checks.
- `herdr-skill` 8: agree. Skill discovery differs per harness, so four sessions plus one wording repeat each is the smallest honest budget.
- Door final proof +4: disagree as stated. Four is enough only if it counts newly started sessions while the consultant round and watcher reuse already-running sessions. If every participant is new, a whole-life leaf (A and B), a consultant round and a watcher already exceed 4 before any final per-kind run, so the counting unit needs one explicit line.

## Overall

Not ready. Four narrow contract fixes come first: unregister the old plugin at the engine deploy, keep closed state parseable, repair the update-check diff rule, and home the infra Tasks link, plus one clarifying line for the final-proof budget count.

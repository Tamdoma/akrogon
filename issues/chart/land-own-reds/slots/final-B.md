# Final-shape check B: land-own-reds

Checked in code on main. No objection to Q1's branch deletion, the reset-failed deletion, the 3-name cap or keeping taken8. Eight defects in the shape as written.

- D1. Commit (a) must also accept the `rerun` config key, not only the receipt field.
  Fact: `repoSchema` is a `strictObject` (src/config.ts:58-59).
  Consequence: once a repo's `issues/config.yaml` has `rerun:`, a rollback to a release without the key refuses that repo's config, and every command on the repo fails. Framework adds the key in its own repo on its own schedule.

- D2. The rerun must run inline, right after the red command and before the blocker bookkeeping.
  Fact: a red non-full check sets `blockedBy` (src/verify.ts:727), and `blocker` is the first red entry in `ran` (src/verify.ts:730-731), which records every `merge_checks` member as blocked.
  Consequence: a rerun done after the loop saves the command but leaves the full checks and members `blocked`. The row is not green and the leaf exits anyway. For members, rerun after `allSettled` and before the push into `ran` (src/verify.ts:747-754).

- D3. `AKROGON_RERUN_NAMES` does not reach the command as designed, and the file has no safe place yet.
  Fact: the child env is built from a fixed list (src/run-check.ts:63-76). `AKROGON_BASE` is added by name (src/run-check.ts:337). `checkedRun` has no env argument (src/run-check.ts:296, called at src/verify.ts:711).
  Consequence: the rerun command sees no variable and reruns nothing or everything. The design needs an explicit pass-through. The file cannot sit in the verify worktree (an untracked file changes the tree the checks see) or in the run root (created inside `checkedRun`). The pass folder `verify-passes/<id>/` is a fit.

- D4. On a red rerun, the row's failing names must stay comparable with base rows.
  Fact: the cover and taken8 read `item.failures ?? failedTests(log)` (src/verify.ts:358, src/land.ts:165). Base passes never rerun, so base rows hold full-suite names. Names are parsed from Bun `(fail)` lines, and anything else becomes `(no test name)` (src/flaky.ts:30,48).
  Consequence: if the final row takes the rerun's log and names, a rerun script that prints names in another form, or none, makes a covered main red look uncovered or nameless. The leaf then goes to repair or `failed`. Rule that holds: final `failures` are the first run's names that the rerun reports again. If the rerun is red and reports none of them by name, keep all first-run names.

- D5. A saved row must not enter the normal-wall median.
  Fact: `slowEligible` leaves out only `reused` and `blocked` entries (src/verify.ts:218-223).
  Consequence: a row that ran a command twice counts as a normal run. It raises the normal or opens a merge-slow episode. Leave out rows with a `rerun` entry.

- D6. The undo figure cannot be read on akrogon.
  Fact: akrogon's `issues/merge-attempts.jsonl` since 11-08 has 3 red of 46 attempts (one on 11-17, two on 11-21).
  Consequence: "same-head bounces per day do not fall on akrogon" starts near zero and can never show a fall. The bounces are on framework, which has no `rerun` key until its seed lands. Readable figure on akrogon: rows with a `rerun` entry, split by final exit (saved against red twice). State the bounce figure as a framework figure, read after framework adopts the key.

- D7. `leafSlice` must take the home as an argument, and "default" needs one definition.
  Fact: tests compute expected names in the test process (`leafSlice({ name: f.repo }, ...)`, tests/leaf-slices.test.ts:29,58,105-106, and about 20 more sites in other test files). The CLI child runs with `AKROGON_HOME: f.home` (tests/leaf-slices.test.ts:114,250). `globalHome()` returns `toolRoot` when the home has no `config.yaml` (src/config.ts:224-229).
  Consequence: with the home read from the process, the test process and the child hash different homes at every site. With `globalHome()` as the input, the same home hashes differently before and after its `config.yaml` exists. Pass the home in. Compare `resolve(AKROGON_HOME ?? ~/.akrogon)` against `~/.akrogon`, not the fallback result.

- D8. Cross-chart note for wake-cost.
  Fact: after the branch deletion a slice is stopped only while its leaf is in the inventory (src/reconcile.ts:1311-1313). The inventory reads `open` and `closed` (src/state.ts:268).
  Consequence: if chart 4 narrows the host step's inventory to `open`, every merged leaf's slice stays loaded until reboot. The host step must keep reading closed leaves, or the land's landed path must stop the slice itself.

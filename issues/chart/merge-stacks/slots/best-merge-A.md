# best-merge notes, slot A (written before reading B and C)

## 1. Pick

Move the slow, failure-prone work off the one-at-a-time line, then make the line itself cheap. Four steps, in this order, each measurable on its own:

1. Delete member stacking (stack-fate O1). Removes about 3 min of wasted red stack per landed leaf on today's numbers.
2. Run the full merge suite (`merge_checks`, framework `verify`, median 8.6 min) on the leaf's own branch rebased on current main before the leaf enters `merge`, in parallel across leaves, off the serial line. Today only 22 of 177 merged leaves ever ran the full suite before merge (framework timings.jsonl), so merge is where the full suite first runs, and half of merge verify runs are red (153 of 308). A red found before the queue costs that leaf only. A red found on the line blocks every leaf behind it.
3. The merge turn reuses that green receipt when the landing tree is identical (main did not move since). This already exists for identical trees (`akrogon verify` reuses a receipt only for an identical tree). When main moved, the turn reruns the suite on the new tree, as today. Precision is unchanged: every landed tree is checked as it lands.
4. A green merge needs no agent seat. The command rebases, verifies, pushes and moves the phase. The seat is prompted only on red or a conflict. A green solo turn averages 11.9 min, of which verify is 8.8 min, so about 3 min per leaf is agent and coordination time.

Once steps 2-4 land and the merge red rate falls, a fifth step becomes worth measuring: verify the next holder speculatively on the current holder's predicted top while the current one verifies (Zuul's pipeline, depth 2). At a low red rate this roughly halves the wait for a queue. At today's 24-49% red rate it wastes most of its runs, so it comes after, not first.

Estimated drain for 11 queued leaves:
- Today: about 11 x 18.6 min (solo minutes per landed leaf including red solo attempts, B's M10) plus about 3 min of red stack each, so about 3.9 h, with every red bouncing a leaf to check.fix and back.
- After steps 1-4 with main moving every turn: about 11 x (8.8 verify + ~1 push) = about 1.8 h, and reds on the line drop to true interaction failures with new main. This is an estimate. The true interaction share is not measured.
- With step 5 at a low red rate: about 1 h.

Cost: about 8.6 min of extra host time per leaf that would have been red anyway, moved earlier. Pre-queue suites from several leaves can contend for the host (akrogon#69 heavy check load). They need the same host lock or queue that checks use today.

## 2. Rejected or deferred

- Batches with bisection (bors, Mergify): pays only when most batches are green. At a 24% solo red rate an 11-leaf batch is all-green about 5% of the time (C). Deferred until step 2 lowers the merge red rate, then re-measured.
- Small batches of 2 without bisection: break-even on history (C).
- Test impact selection (run only tests affected by the main delta, Google TAP, Nx affected): needs a dependency graph the framework does not have. The suite is scripts, fixtures and recorded runs that read files by path. A wrong graph lands a red main silently. Rejected on precision.
- Flaky quarantine: the sampled red logs (16 kept, below) show deterministic fixtures and e2e plumbing, not obvious flakes. `akrogon flaky` already lists known flakes. Not the main cost.
- Parallel speculative trains first: wastes host time at today's red rate.

## 3. Evidence

- Framework issues/timings.jsonl, read 2026-10-19: merge-phase `verify` 308 runs, 153 red, median 8.6 min, p90 12.9 min. Check phases run `cheap` (median 0.4 min) and leaf-specific tests, rarely `verify` (45 runs in check.fix).
- merge-attempts.jsonl joined with timings: a green solo turn averages 11.9 min with 8.8 min inside verify (0.92 verify runs per turn). A red solo turn averages 1.02 verify runs.
- Only 22 of 177 merged leaves ran `verify` outside the merge phase.
- Framework akrogon config: `checks: cheap`, `merge_checks: verify`, `merge_covers: [cheap]`. package.json `framework:verify` = cheap + hooks selftest + `framework:verify:core` (parallel suites), wrapped in run-verify-stages.
- 16 red merge verify logs still on disk, all satellite-plan-fit leaves: failures are "plumbing fixture outputs stay byte-identical to the recorded baseline", "fixture-network-bookstore same seed and config", "readable-outbound-links e2e", "scratch-root inventory", "input-manifest-vocabulary". These are whole-suite tests a leaf never ran at check, plus shared fixtures that sibling leaves change. Which ones are the leaf's own break and which are interaction with new main is not established.
- Practitioner (training knowledge, not fetched by A; B and C fetch): Uber SubmitQueue (EuroSys 2019) predicts the success of pending changes and builds speculatively; Google TAP runs presubmit on the change before the queue; Zuul pipelines speculative prefixes; GitHub merge queue requires the PR's own checks before queuing. Common to all: the change proves itself before the serial step, and the serial step only proves the combination.

## 4. Pitfalls

- A pre-queue green suite on an old main gets trusted after main moved: the merge turn reuses a receipt only for an identical tree, otherwise reruns. No staleness window.
- Several pre-queue suites overload the host and turn reds flaky: run them under the same lock or slot limit as other heavy checks; measure pressure (attempt records already carry pressure).
- A command-only merge pushes something the seat would have caught: the seat today adds judgment only on red (rerun, known-red, cause). On green it reads a receipt and runs commands. Keep the seat for red and conflicts.
- A leaf with a long pre-queue suite holds its dependents longer: dependents wait on merge anyway, and today they wait longer behind reds on the line.

## 5. Question the fork does not ask

Why do leaves reach merge without the full suite? The check phase's proof rules ask for the leaf's done-criteria and `checks` (cheap). Should check end require a green `merge_checks` run on the rebased branch, which is step 2, or should step 2 be its own command-run stage between check and merge?

## Revision after the operator correction (2026-10-19)

Operator: "This was a part of the speed up because if they were running two full checks of test suites during their run and inside of the merge that just doubles the amount of time that takes to merge. Consider all the updates that we did in the past week. I am aiming for speed as well as accuracy.As well as the cost reductions."

Confirmed in code and closed charts: leaf passes run `checks` (framework: cheap), merge runs `checks` minus `merge_covers` plus `merge_checks` (src/verify.ts verifyCommands; merge-covers-key brief.md:4,7, 2026-10-08; night-flow ISSUE.md:10, 2026-10-11, cheap checks in the leaf; bounce-repair-proof design.md:9, "merge_checks only at merge"). The full suite runs once per leaf, at merge, by design.

Step 2 above is withdrawn: it runs the full suite twice for every green leaf. The 49% merge verify red rate stays a fact, but the fix is not a second full run.

Revised pick, one full run per leaf kept:
1. Delete member stacking.
2. Command-only green merge: no agent seat on a green verify; the seat is prompted only on red or a conflict. Saves about 3 min and one agent session per landed leaf.
3. Pipeline the line, depth 2 (Zuul/SubmitQueue): while leaf 1 verifies on main+1, leaf 2 verifies on main+1+2. If leaf 1 lands, leaf 2's run already checked its exact landing tree, so precision is unchanged and no green leaf runs twice. If leaf 1 is red, leaf 2's run is thrown away and redone on main. Two suites at once can slow each other on one host; needs a pressure measurement before choosing depth.
4. Faster suite (framework repo, not akrogon): `framework:verify:core` runs long sequential chains (`rest-a`, `rest-b`) inside its parallel group; the slowest chain sets the 8.6 min. Splitting it is framework work outside this chart.

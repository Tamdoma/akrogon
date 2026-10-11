# Map A: the night of 2026-10-10/11

## 1. Ledger (by cause class)

C1 Stop-the-repo hold on a false comparison. framework held since 2026-10-10T22:21:44Z (`/home/ivan/Work/infra/akrogon/held.yaml`, holder recording-consumers). Evidence `framework/issues/open/worktree-isolation/recording-consumers/review-B.md:155-200`: top failed one flaky playback test that PASSED on base; base failed a different thing (root-state-guard sentinel materialized in the detached base checkout). Whole-command exit 1 on both sides was read as "red on base". 4 framework leaves sit at merge (recording-consumers 450m, root-influence 437m, check-scratch, formspark-build-wiring). ~7.3h, still active.

C2 Guard landed before its migration. `1191e8c` (2026-10-10T22:22Z) composes `akrogon guard ancestors` into every check (`src/config.ts:280-281`). Both repos set `worktree_root: issues/worktrees` (nested under a checkout holding package.json), so the guard fails in every in-flight worktree: verified exit 1 in `akrogon/issues/worktrees/leaf-env-file`; copyfile-install failed on it at 05:35:19Z (`framework/issues/log.jsonl:2408`). The migration leaf `worktree-reconciler` is blocked behind leaf-env-file and base-run, which now also run under the guard: a dependency knot.

C3 Cap ends in `failed` and waits for a human. leaf-env-file failed 22:56:46Z, sat 6.4h, recovery at 05:19 re-failed in 28s (#85), cap raised to 4, failed again 05:42:20Z (`akrogon/issues/log.jsonl`). formspark-build-wiring failed on the cap 22:51Z, sat 6.5h. frozen-test-guard used all 3 rounds. 4 akrogon leaves wait on leaf-env-file, including the red-base-wait fix chain (base-run → known-red-leaf → known-red-merge) that would remove C1.

C4 Upstream decision defects found downstream. copyfile-install: locked bunfig key that bun ignores (#81), failed 22:12Z, sat 7.3h. leaf-env-file: plan rule D3 false (#83), and see C6.

C5 No sensor reaches a sleeping operator. All failures recorded `delivery: shown` once (#84); the watch cron was not armed. Every C1-C4 stop waited 6-7h for the operator.

C6 leaf-env-file does not converge (operator flagged). Rounds take 7-10 min each and every round ends with a NEW finding: F1 JSON escapes, F2 line scanner, F3 mixed quotes, F4 trailing backslash / Unicode index / fixture (`leaf-env-file/review-B.md:90-310`). Cause: plan D3 (`plan.md:22,74`) re-encodes parsed values with a hand encoder ("never copies raw text") against criterion 1's universal bar ("exactly the root's values" for every value parseEnv accepts). The input space is unbounded, B's probe is seconds, each A repair adds restrictions that create the next edge case. More rounds cannot converge it.

C7 Deploy loop stalls (#80): self-update skips when local main is ahead (handoff commits), so seats can run stale skills. Not a stop last night beyond the skip, now 0/0.

C8 Slow feedback rounds (#79): formspark-build-wiring 222 min check.fix round on live-rig bugs. Already addressed for new leaves by `732c896` (no leaf builds proof machinery; a prerequisite leaf does). Likely dissolved; keep as evidence only.

## 2. Structure

Stocks: leaves at `merge` (WIP waiting for the one merge lane per repo), leaves in `failed`, held repos, blocked dependents, accumulated stop conditions in code (guards, caps, holds, refusals).
Flows: merges out (the only exit that creates value). Failed→recovered depends on a human. New gates flow in from each chart (131 akrogon commits in 48h, ~45 charts in `issues/chart/`, many on the same symptoms).

Loops:
- B1 (intended balancing): red main → hold → no bad merges. Release requires a green main, which requires a merge or a named fix, which the hold blocks at night. Balancing loop with no release path → stops become permanent until a human acts.
- R1 (dominant last night) gate accretion / "fixes that fail": incident → chart → new guard or terminal end (`failed`, `held`, refusal) → more ways to stop → more incidents. Two of last night's three biggest stops came from gates merged in the window (C1 hold, C2 guard).
- R2 repair whack-a-mole (C6): each repair adds encoder rules → new edges → new findings → more rules.
- B2 cap: fix_rounds counts rounds, not progress, and ends in `failed` rather than a different next step.
Delays: operator response at night (6-7h) dominates every other delay by 10-50x. Merge verify 3-6 min, review rounds 7-10 min.
Sensors and targets: (a) "red on base" = whole-command exit code, not per test (false positive C1). (b) failure delivery "shown" = handled (no ack). (c) cap counts rounds, blind to convergence or to a plan defect. (d) nobody measures stopped time or flow (merges per hour, age of oldest stop); every target is a quality gate, none is a flow target. (e) locked decisions are proven for capability, not in the exact form locked (#81).
Archetype: shifting the burden. Each symptom gets a gate; the fundamental fix (isolate the defect to its leaf, keep everything else flowing) is chartered (red-base-wait) but queued behind the stops it would remove.

## 3. Last 48h merges

Worse:
- W1 red-main-hold (`0d0e001`, `800dda6`, `3612c45`, `b0b4860`, `3fde73f`, `210efa5`, `8479286`; 10-10 ~09:30Z): turns one comparison into a repo-wide stop. Caused C1 (7.3h, 4 leaves).
- W2 `1191e8c` guarded check composition (10-10 22:22Z, landed with worktree-store): guard before migration. Caused copyfile-install's 05:35 failure; will fail every nested leaf's checks in both repos, including leaf-env-file and the chain behind it.
- W3 `2595d71` merge bounces count toward fix_rounds: spends the cap faster. check-scratch and formspark-build-wiring are at merge with fix_rounds 3 = framework cap 3, so one bounce fails them. Risk, not observed yet (medium confidence).
- W4 `732c896`/`5788bf3` add new `failed` exits (new proof machinery, red-first). Not observed last night (low).
Neutral or helped: self-update (`3f27689`) helps but skips on divergence (C7); merge-attempt records, dependents-first, batch_limit, culprit ejection: no evidence of harm.

## 4. Leverage (fewest holistic changes)

L1 One rule: no stop waits for a human when an automatic next step exists, and a stop is scoped to the one leaf that caused it. Concretely, land red-base-wait first (retires the hold, per-test comparison), not last. Deletes held.yaml, hold-fix, unhold, --red-on-base. Risk: a truly red main keeps merging leaves that each carry known-red; mitigated by the red record.
L2 Guard at allocation only: `checkLocation` already refuses a nested location when a worktree is created; drop `guard ancestors` from every check composition, and drop `worktree_root: issues/worktrees` from both repo configs so new worktrees go to the home store. In-flight nested worktrees finish as before. Deletes a per-check failure mode; makes worktree-reconciler's migration optional. Risk: a nested worktree can still resolve the parent's modules until it finishes (the status quo for weeks).
L3 Cap ends in a re-plan, not `failed`: at the cap, A corrects the plan (the repeated finding is a plan defect, #83), cap resets once; a second cap is the only operator stop. Or simpler: drop the cap's terminal and count only repeated findings. Fork.
L4 leaf-env-file: remove the encoder. Options: copy the root `.env` bytes whole (0600), or copy the raw source span of each declared assignment, or narrow criterion 1 to refuse loudly any value outside a simple safe set. Fork.
L5 One alarm that repeats until acknowledged, owned by akrogon (status/next/merge wake print and re-notify a failed or held item each pass) instead of a session cron. Fewer stops (L1-L4) make this rare.
L6 Handoff commits push at handoff (door runs `akrogon sync`), so self-update never diverges (#80). Or self-update rebases issue-only local commits.
L7 Chart rule: prove a locked third-party setting in the exact form locked (#81); review rule: a finding that repeats in the same area questions the plan rule first (#83). Text only.

## 5. Right now (operator actions recommended, not taken)

N1 framework: `akrogon unhold framework` (the hold's evidence is not red on base: playback passed on base). 4 merges resume.
N2 Guard: until L2 lands, every nested worktree fails checks. Smallest step is reverting the check composition lines (`src/config.ts:280-281`) on main, or moving in-flight worktrees out. Needs a decision, it touches merged work.
N3 leaf-env-file: failed at cap 4 with a design-level defect; another round will not converge. Hold it for the L4 decision.
N4 copyfile-install: failed on C2 only; resumes once N2 is done (F3 still open, normal repair).

## 6. Forks

Q1 Order: do we pull red-base-wait (hold retirement) ahead of everything, possibly as a smaller interim leaf that only deletes the hold?
Q2 Guard: allocation-only (L2) vs keep per-check guard and migrate worktrees first.
Q3 Cap end: re-plan then reset once, vs count only repeated findings, vs keep failed with loud alarm.
Q4 leaf-env-file mechanism: whole-file copy vs raw-span copy vs narrowed safe-value set.
Q5 Alarm: akrogon-owned repeat-until-ack vs re-armed watch.
Q6 Handoff push vs self-update rebase.

## 7. Practitioner sources (from model knowledge, no searches run yet; to be redone at the fork round)

- Toyota andon/jidoka (Ohno, Liker): stop the line only with a responder inside takt time; otherwise pull the defective part aside. Supports L1.
- Meadows, leverage points: rules and goals beat parameters; raising fix_rounds is a parameter fix. Supports L1/L3 over cap tuning.
- Reinertsen, flow: queue size and cost of delay; a 7h stop on the only merge lane dominates. Supports measuring stopped time.
- Merge queues (Uber SubmitQueue, GitHub merge queue, bors): eject the failing PR, keep the queue moving; never stop the whole queue on one red. Supports L1.
- Google SRE (Beyer et al.): alerts must be actionable and paged until acked; a "shown" notification is not an alert. Supports L5.

## 8. Pitfalls

P1 Retiring the hold lets known-red accumulate on main → red record notices once per test (red-base-wait lock).
P2 Guard at allocation only misses a manually created nested worktree → refuse at allocate, the only creation path.
P3 Cap reset loops forever → reset once per leaf, recorded in state.
P4 Whole-file `.env` copy widens secret exposure per leaf → the Why of leaf-env-file; operator chooses.
P5 More gates from this chart → every leaf here must delete at least as much as it adds.

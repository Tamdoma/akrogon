# Merged map: the night of 2026-10-10/11

Sources: map-A.md, map-B.md, map-C.md in this folder. Tags name the slots that wrote the point.

## Ledger by cause class

- M1 Repo hold on a false comparison (A,B,C). framework held since 22:21:44Z (`akrogon/held.yaml`). Top failed one playback test that passed on base; base failed a different thing, the root-state sentinel in the detached base checkout (`recording-consumers/review-B.md:155-213`). Clears only by main moving or `unhold` (`src/next.ts:1074-1103`, `src/hold.ts:104-111`); main cannot move while held (C). About 19 leaf-hours at merge (C), ~1,113 leaf-min (B). Dominant stop of the night (A,B,C).
- M2 Count cap ends repairable work in `failed` (A,B,C). leaf-env-file 22:56→05:19 (6.4h), recovery re-failed in 28s (#85), cap raised by hand to 4, failed again 05:42:20Z on F4 (A,B). formspark-build-wiring 22:51→05:24 (6.5h). Cap counts handoffs, not progress: check-scratch open Fixes 5→4→1→0 while counter read 1,2,3 (C). `src/phase.ts:308-313`.
- M3 Locked mechanism never proven in its locked form (A,B,C). copyfile-install bunfig key, failed 22:12→05:30 (7.3h), #81.
- M4 Guard enforced before migration (A,B,C). `1191e8c` prefixes every check with `akrogon guard ancestors` (`src/config.ts:276-292`); both repos keep `worktree_root: issues/worktrees`. Live only since the operator's pull at 05:28Z; overnight the self-update skip kept it off (C, reflog). copyfile-install failed on it 05:35Z (A,B,C). Added (A): `createSparseWorktree` runs `checkLocation` (`src/next.ts:284`), and the merge stack worktree is created under `worktreeStore` (`src/batch.ts:96`), so with the nested store no new leaf worktree and no merge batch can be created in either repo; unhold alone would not restart framework merges. Home store ancestors hold no package files (checked `/home/ivan`, `/home`, `/`).
- M5 leaf-env-file does not converge (A, operator note; B F6; C R3). Every 7-10 min round ends with a new finding: F1 JSON escapes, F2 line scanner, F3 mixed quotes, F4 trailing backslash, Unicode index, false refusal fixture (`leaf-env-file/review-B.md:90-314`). Plan D3 re-encodes parsed values with a hand encoder and "never copies raw text" (`plan.md:22,74`) against criterion 1's universal bar (every value `parseEnv` accepts). Unbounded input space, seconds-cheap probe for B, each repair adds rules that create the next edge (A). Env repeatedly replaced an invalid refusal expectation instead of removing the grammar assumption (B).
- M6 One-shot failure notice (A,B,C). `delivery: shown` counts as handled; watch cron self-deleted on an empty tree before the handoffs (C; B marks this unverified).
- M7 Self-update skip (A,B,C). 26 commits undeployed for ~8h after a local handoff commit (C). Now 0/0 (B,C).
- M8 Inherited base red early in the window (B). Four framework leaves failed on base red for ~50 min, #76/#77 class, already owned.
- M9 Hold state lives in the tool checkout (A,C). `globalHome()` defaults to the akrogon checkout (`src/config.ts:190-191`), so `held.yaml` sits at the repo root and was committed by `525161d add issues`.
- M10 Live-rig rounds (#79) (A,B,C): formspark 3h42m in one check.fix round. Covered for new leaves by the delivered test-proof-rules rules (`732c896`: no leaf builds its own proof machinery).

## Structure

Stocks: leaves at merge, leaves in failed, blocked dependents, undeployed commits, accumulated stop rules (A,B,C). Outflow that creates value: merges; failed→moving only by operator (A,B,C).
Loops: hold deadlock R1 dominant (A,B,C). Repair creates next finding (A,C), plan rule defended by code (C, A). Gate accretion / fixes that fail (A,B,C); shifting the burden to the operator (A,B). Partial rollout delays its own completion (B, A "dependency knot").
Sensors: whole-command exit as "red on base" (A,B,C); "shown" as handled (A,B,C); round count blind to progress (A,B,C). No flow target: nothing measures queue age, time since main moved, or time a failed leaf waits; every ambiguity resolves toward stop (A,C).
Delays: operator reaction 6.4-7.3h dwarfs every work delay (A,B,C).

## Last 48h merges

Worse: hold commits `0d0e001`, `800dda6`, `210efa5` (+ `3612c45`, `b0b4860`, `3fde73f`, `8479286`) (A,B,C); `1191e8c` guard composition (A,B,C). `2595d71` bounce counting: minor/risk (A,C); not the cause of these cap stops (B). New `failed` exits from `732c896` not observed (A, low).
Neutral: self-update `3f27689`/`accfa29`, a help with a gap (A,B,C).
Helped: framework base fixes `4584cf7cb`, `ffaa233f4`, `0d45bb3fd` (B); dependents-first `26e0ddb`, `merge_covers` `77ad6b990` (C); test-proof-rules (not deployed overnight) (B,C).

## Leverage options

- L1 Hold. L1a delete now as its own small leaf ahead of known-red-merge, interim rule: a merge red with no cause in the stack and red on base stays at merge and retries next turn (A,C). L1b finish the owned red-base-wait chain as locked, no new fork (B).
- L2 Cap. Delete count-to-failed. L2a review decides continue vs evidenced blocker (B). L2b progress rule: open Fix set must shrink; a repeated finding or a plan contradiction goes to A's plan by name (#83) (C, A). L2c at cap A re-plans, count resets once (A). Keep the counter as information (C).
- L3 Guard. L3a check location only at creation (already in `createSparseWorktree`), drop the per-check prefix, drop `worktree_root` (A; C as O2). L3b keep the per-check guard, migrate worktrees first (B; C as O1); B: disabling the guard restores the bad environment.
- L4 leaf-env-file. L4a remove the encoder: copy the root `.env` whole, or copy each declared assignment's raw source, or narrow criterion 1 to refuse loudly outside a safe set (A). L4b repair F4 via direct recovery `akrogon phase leaf-env-file check.fix` (bypasses the cap, `src/routing.ts:40-54`) (B).
- L5 Self-update. L5a separate clean runtime checkout from writable records (B). L5b self-update syncs issue-only ahead commits, refuses code (C). L5c door pushes at handoff (A).
- L6 Alarm. Fewer stops, no new notifier; at most the watch never self-deletes (B,C). Repeat-until-ack in akrogon (A).
- L7 Rule lines: prove a locked third-party setting in the exact locked form (A,B,C); a repeated finding questions the plan rule first (A,C).

## Right now (recommended operator actions)

- N1 Guard first (A,B,C differ on how): without it no worktree or merge batch can be created in either repo. Drop `worktree_root` from both `issues/config.yaml` and move in-flight nested worktrees to `~/.akrogon/worktrees/<repo>/<slug>` with their `state.worktree` (C), or wait for worktree-reconciler (B, framework stays stopped).
- N2 `akrogon unhold` framework after N1 (A,C). Unhold restores attempts, not approval; recording-consumers reruns verify (B).
- N3 leaf-env-file: direct recovery to A for F4 (B) vs hold for the L4 decision (A).
- N4 copyfile-install back to review after N1, F3 still open (A,B,C).
- N5 Commit the hand edits (`fix_rounds: 4`, `held.yaml`) (C).
- #79: close as delivered by test-proof-rules `732c896` (A,B,C agree it is covered).

## Where slots differ

D1 hold timing (A,C vs B). D2 guard (A vs B; C both). D3 leaf-env-file (A vs B). D4 self-update (A, B, C each different). D5 alarm (A vs B,C). D6 `2595d71` (A,C vs B).

## Operator-forwarded material (watch-akrogon, verbatim at watch-akrogon-note.md)

- At 05:53Z the operator side replaced leaf-env-file D3 with a parser-checked rule (fixed candidate encodings, keep the first that `parseEnv` reads back exactly, then check the whole file; 41,371 values, zero mismatches, 11.4% refused), raised `fix_rounds` to 6 and resumed: check.fix round 5 at 05:53:40Z (`issues/log.jsonl`). N3 is therefore already acted on.
- Adds: S1 plan-error stock has no lifecycle outflow; an "oracle gap": a criterion over every input is tested only by B's one-counterexample-per-round hunt, so the Fix drain is fixed at one per round. Proposes: (W1) a second Fix in the same area or a Fix contradicting a plan decision re-plans that decision instead of check.fix; (W2) a criterion over every input needs a self-checking oracle test (round-trip, property, real parser) that A runs before handoff; (W3) loud-until-ack failed leaves; (W4) handoff push or issue-only rebase in self-update.
- New fact: Bun's own `.env` loader expands `$NAME` in every quote style, so parseEnv fidelity differs from what Bun processes see for values with `$` (2,293 mismatches, all with `$`). Possible separate seed; check-env and readiness also use parseEnv.
- Maps onto: L2b/L2c (W1), M5 and L4 (W2 generalizes L4 into a planning rule), L6 A (W3), L5 (W4).

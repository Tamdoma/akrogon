# Stop rules

## Question
Q1 When a merge check fails and main's check also fails, does the whole repo stop, or only that leaf?
Q2 When a leaf reaches its fix-round limit, does it stop in `failed`, or fix its plan and continue?
Q3 Does the "no package files above me" guard run before every check, or only when a worktree is created?

### Carries
- red-base-wait merge-gate Taken: the hold is retired by known-red-merge (`issues/open/red-base-wait/known-red-merge/brief.md:17`).
- red-base-wait waiting-leaf Taken (`issues/chart/red-base-wait/forks/waiting-leaf.md:40-51`).
- worktree-isolation: worktrees in `~/.akrogon/worktrees/<repo>/<slug>`, `checkLocation` at creation (`src/next.ts:284`).

## Findings
Territory map: slots/map-merged.md, rebuttals slots/rebuttal-B.md, slots/rebuttal-C.md.
- Hold: framework held 22:21Z to past 06:00Z on a whole-command comparison; top and base failed different things (`framework/issues/open/worktree-isolation/recording-consumers/review-B.md:155-213`) (A,B,C).
- Cap: counts handoffs, not progress; leaf-env-file and formspark-build-wiring sat failed about 6.5h (A,B,C).
- Guard: `1191e8c` prefixes every check with `guard ancestors && guard own-modules` (`src/config.ts:276-292`); live leaf worktrees already moved to the store (C).
- Research: Chromium sheriffing (revert the culprit, keep the tree open), Uber SubmitQueue (keep mainline green without freezing), Meadows leverage points (rules beat parameters), read 2026-10-11.
- Peer positions before the answer: hold now as its own leaf (A,C) vs finish the chain (B); cap deleted with plan correction in repair (A,B,C, B rejects automatic plan.synthesis moves and a shrinking-count gate); guard at creation (A,C) vs keep per-check (B).

## Taken
Operator, 2026-10-11, on the simplified round: "1a | 2a | 3a |"

Final shape after the focused check (slots/stop-rules-final-check-B.md, slots/stop-rules-final-check-C.md):

S1 hold-retire (1a)
- The holder's own state records the tested base (`batch.built_on`); the gate at `src/next.ts:1074-1103` skips that leaf instead of returning for the repo (C). Wake compares with `equalOutsideRecordFolders`, so record-only main commits do not wake it (B R1, C).
- Release the queue: restore carried members, clear the applied batch, exclude the waiter from holder and member selection until the base changes; fetch before the empty-queue return (`src/next.ts:1037-1040` vs `:1062`) (B F1).
- Ending: `--red-on-base` stays as the wait ending and never stamps a red push (C, B F1).
- Deleted: `held.yaml` use, `src/hold.ts`, `hold-fix`, `unhold`, status hold line, unpause print, `tests/hold.test.ts` (C).
- S1 owns the active merge-seat refresh (B F2).
- known-red-merge amended: drops the moved parts, keeps `--red-on-base`/`--command` retirement, consumes S1's wait and releases waiters when it lands; lands after S1 (B F2, C), already ordered by its blocked-by chain.

S2 plan-not-cap (2a)
- Removes only the round-cap path (`src/phase.ts:308-313,327`) (C). Other automatic failed exits (`src/next.ts:560-578`, skill-ordered stops) go to the next fork (B F4 held there).
- B names the repeated problem, the contradicted decision, or a missing plan step, and hands it to A through check.fix; A corrects `plan.md` with an executable check A runs, preserving brief, locked design and test-change protections (`src/phase.ts:282-284`) (B F3). "Executable check" is the shape's addition to the operator's words (C).
- `fix_rounds` key stays parsed (strict schema `src/config.ts:38-45`, framework config sets it) (C) and keeps bounding direct-route repairs (`skills/chart-issues/SKILL.md:117`) (B F5). State counter stays (`src/routing.ts:53-55`, status).
- Text: `docs/guide/phases.md:76,108`, `docs/guide/setup.md:60`, `skills/init-akrogon/SKILL.md:26`, `skills/check-issue/SKILL.md:93`, `skills/implement-issue/SKILL.md:42` (B,C).

S3 guard-at-creation (3a)
- Drop `akrogon guard ancestors` from `withSetup` (`src/config.ts:276-292`); creation checks stay (`src/next.ts:284`, `src/batch.ts:96`).
- Keep `guard own-modules`: a separate guarantee (`src/guard.ts:36-39`) (B F6). Add `setup: bun install --frozen-lockfile` to akrogon `issues/config.yaml` so a fresh akrogon store worktree gets node_modules (C).
- Base copy allocated under `~/.akrogon/scratch/<repo>/` instead of bare `mktemp -d` (`skills/check-issue/SKILL.md:18,65`, `skills/implement-issue/SKILL.md:38`, `skills/merge-issue/SKILL.md:18`), rest of the clause unchanged (B F7, C). base-run's wording becomes "the hand-made base checkout" (C).
- Held (B F6): amend worktree-store `brief.md:14`. Not taken: worktree-store is merged.

## Evidence added after the check
- Seat TMPDIR is `/tmp/akrogon-1000/<slug>-<hex>` for all six live seats (`/proc/<pid>/environ`, TMPDIR only), so the `framework/.temp/tmp.*` base copies did not come from seat TMPDIR. Origin still unverified (LC).

Foreclosed: the repo-wide hold and `held.yaml`; raising `fix_rounds` as the fix; a per-check ancestor guard.

## S1 revised at handoff
Operator, 2026-10-11, verbatim: "4a".

The question as read: known-red-leaf merged and known-red-merge reached `plan.synthesis` during charting. Its live brief already retires the repo hold (`issues/open/red-base-wait/known-red-merge/brief.md:4,17`, red-base-wait merge-gate Q2 2a). 4a: drop hold-retire and leave known-red-merge unchanged. 4b: keep hold-retire and make known-red-merge wait for it.

- hold-retire is not built, and the known-red-merge amendment is not applied. known-red-merge delivers the hold retirement and its deletions (`held.yaml` use, `src/hold.ts`, `hold-fix`, `unhold`, status line, unpause print) and the merge-seat refresh (live brief:17,19,21) (B,C; slots/handoff-review-B.md:9-14, slots/handoff-review-C.md:15-38).
- Reason: keeping it would park known-red-merge, since `blocked-by` is checked on every dispatch (`src/next.ts:763-772`, `src/turn.ts:10-18`), and would build a wait that known-red-merge then removes (C).
- Lost, accepted by the operator: S1's interim per-leaf wait and early queue release. Until known-red-merge lands, a merge red also red on main still holds the repo, released by `akrogon unhold` (B; `docs/guide/cheat.md:110-116`).
- The S1 line "lands after S1, already ordered by its blocked-by chain" was never true on main; known-red-merge's chain is `known-red-leaf, base-run` (C).

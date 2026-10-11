# Final-shape check, slot C

Disagreements and collisions only. Read-only.

## 1. Shape vs option

S1 (1a). The option's wait ("retries after main changes") needs a place to record which commit the leaf was tested red on and a skip in holder selection; the shape names neither. Smallest change I would defend: move the hold's sha from `held.yaml` to the holder's own state (`src/phase.ts:955-976` already writes it, keep that ending), and make the gate at `src/next.ts:1074-1082,1090-1103` skip that one leaf instead of returning for the repo, with the same `equalOutsideRecordFolders` compare so record-only commits like `caa617ec` do not trigger a 25-minute verify. `mergeHolder` then needs no fix branch (`src/hold.ts:77-88`), and `src/hold.ts`, `hold-fix`, `unhold`, the status line (`src/status.ts:341-343,387-390`), the unpause print (`src/akrogon.ts:133-136`) and `tests/hold.test.ts` go. That keeps `--red-on-base`/`--command` as the interim ending and leaves their retirement (criterion 7's flag part) to known-red-merge, which also retires the per-leaf field. Writing a second wait mechanism that known-red-merge deletes weeks later is a larger diff for the same behavior.

S2 (2a). `fix_rounds` config key: keep it parsed and unused rather than removed. `repoSchema` is `z.strictObject` (`src/config.ts:38-45`), so removing the key breaks every registered `issues/config.yaml` that still sets it (framework `fix_rounds: 3`, which this leaf cannot edit) at the next deploy. Remove the compare at `src/phase.ts:308-313,327` and the docs lines (`docs/guide/phases.md:76,108`, `docs/guide/setup.md:60`, `skills/init-akrogon/SKILL.md:26` template, `skills/chart-issues/SKILL.md:117` which binds the direct-mode repair bound to the same key). The state counter stays for `requiredSlots` (`src/routing.ts:53-55`) and status (`src/status.ts:116`).

S3 (3a). Matches. One gap: akrogon's own repo has no `setup` (`issues/config.yaml`, effective checks wrap no install), so a fresh akrogon store worktree has no `node_modules`; the five existing ones have it only because they were moved with it (LC on who ran the install). Today `own-modules` turns that into a named refusal; after S3 it is a module-not-found red that S1 then treats as "red on base too" and parks. Pair S3 with `setup: bun install --frozen-lockfile` in akrogon's `issues/config.yaml` (one line in the same leaf), and the dropped guard has nothing left to catch.

## 2. Collisions

- known-red-merge `brief.md:17`, criteria 6, 7, 9, owned files `src/hold.ts`, `src/status.ts`, `src/akrogon.ts`, `tests/hold.test.ts`, `docs/guide/next.md:119`, `merge.md:29`, `cheat.md:110-116`, `README.md:134,144-145`, and `design.md:12` (Taken Q2 2a verbatim), `:52` (hold retirement architecture): contract amendment. Criterion 6 and the `hold-fix`/`unhold`/status/unpause parts of 7 and 9 move to S1 wholesale; known-red-merge keeps `--red-on-base`/`--command` retirement (plus the S1 per-leaf field and skip if the smallest change above is taken) and its stale-call error text changes its pointer from "known-red rule" to whatever S1 writes at `skills/merge-issue/SKILL.md:73`. Order: S1 before known-red-merge (already true by the blocked-by chain).
- `skills/merge-issue/SKILL.md:73`: S1 rewrites the hold ending; known-red-merge criterion 8 rewrites the same sentence later. Order only.
- known-red-leaf owns `skills/check-issue/SKILL.md` "today :59, :63, :85" and `skills/implement-issue/SKILL.md` "today :38, :61, :74" (`known-red-leaf/brief.md:18`); its :63 is today's :65. S3 edits the `mktemp -d` clause inside that same sentence (`check-issue/SKILL.md:65`, `implement-issue/SKILL.md:38`). Nothing contractual; known-red-leaf cites by "today" line and rebases.
- base-run `brief.md:8` and criterion 7 say the verb replaces "`mktemp -d` plus `git worktree add`" at those lines (and `merge-issue/SKILL.md:18`). After S3 the text it replaces is a store path, so amend the wording to "the hand-made base checkout"; nothing else.
- base-run `brief.md:4,10` and criterion 5 run `akrogon guard own-modules` after setup through the verb: the shape keeps the verb, nothing. Note that criterion 5's second clause inherits the no-`setup` gap above for akrogon.
- S2 and S3 both edit `check-issue/SKILL.md` and `implement-issue/SKILL.md`, different sentences (S2: findings and repair rules; S3: base checkout clause). Rebase only; land S3 first since it is one clause.
- worktree-reconciler criterion 2 reports "an unknown directory in the store". A hand-made base checkout under the store that B fails to `git worktree remove` (today's `.temp/tmp.*` leftovers show it happens) is reported every pass until base-run's removal-in-finally lands. S3's skill clause must keep the existing `git worktree remove --force` before any outcome (`check-issue/SKILL.md:65` already says it) and name the path `base-<something>` so the reconciler report is readable. Nothing contractual.
- leaf-env-file, check-env: no overlap. S2 touches `src/phase.ts:154-157,308-313`; leaf-env-file owns `src/next.ts`, `src/state.ts`; known-red-leaf touches `src/phase.ts` flag parsing, different lines.

## 3. `guard own-modules`

Safe to drop with `ancestors` once akrogon's config has a `setup`. In the store no ancestor holds `node_modules` (`src/guard.ts:5-16` has nothing to find), so a missing own `node_modules` cannot resolve from above and fails the command itself. What `own-modules` still catches is only "setup absent or did not produce `node_modules`", which for akrogon is the missing `setup` line, and for a repo with no `package.json` it is a false refusal on every check (`src/config.ts:280` applies it with no setup too). Registered repos other than akrogon and framework not checked (global config at `/home/ivan/Work/infra/akrogon/config.yaml`, roots not inspected).

## 4. Breakage later

- S1: a leaf parked on a red main waits as long as main stays red, with no notice beyond `akrogon status`. Removed by known-red-merge (per-test comparison lets a known-red stack land) and, until then, by the merge of any other queued leaf moving main.
- S1: a stack red on main and red on top for different reasons (last night's case, `recording-consumers/review-B.md:192-203`) parks the leaf although its own red is real. Removed when the parked leaf is retried after main moves and the top red reappears with a green base, which routes to `check.fix` as today.
- S2: a leaf whose plan correction keeps producing the same finding loops with no stop. Removed by the counter in status plus the existing 60-minute busy notice; B's explicit `failed --reason` naming the repeated finding stays available.
- S3: a repo whose checks need a resource `setup` does not create gets a plain red instead of a named refusal. Removed by the `setup` line per repo; `init-akrogon` should write one (`skills/init-akrogon/SKILL.md:26` template).
- S3: a hand-made base checkout in the store left behind is reported by the reconciler forever. Removed by base-run.

## 5. Added or dropped against the operator's answer

- 2a says "A fixes the plan itself and keeps going". The shape adds "with an executable check A runs before handoff". Not in the answer; keep it, it is the one sentence that made leaf-env-file converge at round 5 (`plan.md:22`), but record it as the shape's addition.
- 2a keeps `failed` for operator-only blockers. The shape's "reachable only by an explicit blocker move" would also cover the two automatic `attempts` failures at `src/next.ts:560-575` (prompt undelivered after 3 passes, seat unreachable), which the answer did not touch. Say S2 removes only the round-cap path (`src/phase.ts:308-313,327`) and leaves those.
- 3a says "drop the per-check guard". The shape drops both `ancestors` and `own-modules`; the answer does not name the second. Fine under section 3, with the `setup` line.
- 3a "move the reviewer's copy of main to the store" is in S3; the shape adds "the `akrogon guard` verb stays for base-run's use", consistent with base-run `brief.md:10`.

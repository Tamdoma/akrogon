# Fork notes: red-main-hold, slot C (blind)

Code cites are origin/main at 2e78945 (equal to 083264e for every cited line). Framework log numbers computed in this pass from `tamdoma/framework/issues/log.jsonl`.

## The 10-09 episode, from the log

agent-content-extraction merged at 01:58 UTC onto what became red main `2ccc39534`. Then three holders in a row went `merge -> check.fix`: finished-site-review 02:04, hero-role-fields 02:08, deliverable-obligations 02:16. Two of them hit the check.fix base rule and ended `failed ... red on base 2ccc3953` (02:08, 02:21, and again 02:49 after an operator retry). The operator moved leaves four times (`failed -> check.fix` x2 at 02:49, `failed -> merge` at 03:08). The two survivors merged as one batch at 03:09. The turn merged nothing for 71 minutes, spent three gate runs on a known-red base, and produced three `failed` stops and four operator moves. With a hold: one red run at 02:04, one base run (hooks:selftest, minutes), turn held on `2ccc39534`, zero further runs, zero `failed`, zero moves; when `264cc2f5b` landed the holder would have been re-prompted on the new main.

## Q1. When does the hold clear

Pick 1a: the hold is "repo R, main sha X, command, holder slug". It clears mechanically when the fetched tracking ref no longer equals X, checked at `mergeTurn` entry (`src/next.ts:962`, the same spot pause is checked, so it also stops stack building, not only the prompt). No separate green proof: the holder's own rerun on the new main is the proof, and if it is red on base again the hold re-latches on the new sha at the cost of one run.
Reason: zero new proof runs on the serial turn. Cost: a half-fixed main costs one run per push until green.

Rejected 1b, clear only after a green proof on the new base: that proof is a full gate run with no leaf attached, on the one serial resource, before the holder's run that would show the same thing. Rejected 1c, clear on operator verb only: the 10-09 fix landed by direct push; requiring a verb adds a step to the path that already works.

Explicit bypass without a verb: `akrogon next <holder-slug>` typed by the operator runs in full and ignores the hold, exactly as repo-pause 1a already decided for explicit commands (issues/chart/repo-pause/forks/boundary.md Taken). That is how a hold caused by a flaky base run is cleared without waiting for a main commit.

## Q2. Who repairs red main and how the repair passes the hold

Pick 2a: whoever is fastest, in this order, with no new mechanism. (i) The holder's B fixes forward inside the leaf when the defect is small and the failing output names it; merge-issue:55 already permits "a broken default branch discovered by this leaf is fixed forward with failing tests as criteria", and B holds the worktree and the red output. The leaf's rerun is then green on the still-red main, so the hold must not block the holder it was raised for: the hold skips `mergeTurn` for every pass except the one re-prompting its own holder slug after B records the fix-forward. Simplest form: the hold is cleared by B's `--check` call on that holder (the command sees a `merged --check` from the hold's own slug and drops the hold). (ii) The operator pushes the fix directly to main, as on 10-09 (`264cc2f5b`); the hold clears on the next fetch. (iii) A fix leaf under failed-leaf-routing (new leaf, merged stays terminal) for anything larger. It reaches `merge` with a later stamp and is not the holder; today's only way to put it first is the operator rewriting `merge_stamp` (the #65 workaround). That is a limit of this fork, owned by the ordering fork, and I would say so in the record rather than add a priority flag here.
Reason: (i) and (ii) cover both observed episodes (10-08 declared-surfaces-contrast, 10-09 selftest scaffold) with no code beyond the hold itself. Cost: a fix-forward lands through the merge seat with no second review; that is already true today.

Rejected 2b, the hold names a repair owner and waits for that owner: nothing in the command can know who owns a test on main; it would be a prose field. Rejected 2c, auto-create a fix leaf: failed-leaf-routing 1a decided the operator charts the fix, not the command.

## Q3. B judges or the command mechanizes

Pick 3a: split by what each can do. The base run is B's, under the test-runs rule verbatim (completed comparable run, same command, args, scope, install, material conditions, recorded shared cause). The command owns everything that can be checked: a new flag on the existing red ending, `akrogon phase <slug> check.fix --slot B --attempt <id> --red-on-base <sha>`, which (1) refuses a stale attempt as today (`src/phase.ts:781-784`), (2) fetches and refuses when `<sha>` is not the current tracking ref ("main moved, rerun"), (3) does not move the leaf, restores carried members to their saved heads and clears the batch record without halving `batch_limit` (the split path at `src/phase.ts:788-798` minus the halving), (4) writes the hold under the global lock to a gitignored schema-validated file under `globalHome()` keyed by repo name, same shape as `paused.yaml` (`src/pause.ts:18-55`), (5) prints `merge turn held on <sha>: <command>`, and (6) sends one notification naming the sha, command and holder, same shape as `mergeNotice` (`src/next.ts:827-864`). `akrogon status` annotates the repo heading like paused (`src/status.ts:382`). On clear, `mergeTurn` finds the holder with no batch record and builds a fresh stack on the new main through the existing path (`src/next.ts:1008-1042`), so no restack code is added.
Reason: akrogon never runs check commands itself (test-runs heavy-run-slot finding), so the run must be B's; every other step is mechanical and the command already owns attempt ids, batch restores and state files. Cost: one flag, one state file, one `mergeTurn` guard, one status line, one skill paragraph at merge-issue:65.

Rejected 3b, B writes the hold itself: a prose-owned state file is the drift the map warned about (seats broke the deferral rule 166 times). Rejected 3c, the command infers red main from the failing output: no parser can tell a base failure from a leaf failure.

## Does this increase merges per hour

Plainly: a little, and not during the red window. Framework since 10-07: 54 merged in 42.6 hours with a non-empty queue, 1.29 merged per busy hour, 2.37 exits per busy hour. The hold does not merge anything while main is red; the window length is set by whoever fixes main. What it removes is the runs spent inside the window and the recovery after it. Seed 62 classified 9 of 34 bounces as BASE over 10-07..08; the 10-09 episode added 3. Each episode costs one red run plus one base run either way, so the hold saves about (bounces minus episodes), roughly 8 of 12 runs over three days at 11-35 min each, about 2-4 turn-hours of 42.6, a 5-9% gain in turn capacity, which becomes merges only when green leaves are waiting. It also removes the back-of-queue return (`src/phase.ts:152`), the 0.34 h check.fix cycle per bounced leaf, and every `failed` stop and operator move of this class (7 `red on base` failed records in the log, 4 operator moves on 10-09). The larger merges-per-hour levers are the first-package items (repeat bounces, batch size); this fork is the one that removes operator work and the dead end.

## Evidence

- primary, code 2e78945: merge-issue:65 red ending with no base comparison; `src/phase.ts:151-154, 788-798` (no increment, split path, `batch_limit` halving); `src/next.ts:962, 1008-1042, 1204-1219` (pause guard at `mergeTurn` entry, fresh batch build, holder prompt); `src/pause.ts:18-55` (state file shape, global lock); `src/status.ts:338, 382` (paused annotation); `src/next.ts:827-864` (`mergeNotice`); implement-issue:38 (check.fix base rule ends `failed`); merge-issue:55 (fix forward permitted).
- primary, framework log, computed 2026-10-09: the 10-09 timeline above; 7 `failed` records with reason `red on base`; 1.29 merged per busy hour.
- carried locks: test-runs base-red rule 1a/2a (completed comparable runs, recorded shared cause, killed run is incomplete); repo-pause boundary 1a and control 1a/3a (explicit commands run in full, gitignored state under globalHome, status annotation); failed-leaf-routing 1a/2a (operator charts a fix leaf, merged terminal); merge-turn turn-release 3a (new stamp on every move into merge, which the hold avoids by not moving the leaf).
- practitioner: GitHub merge queue removes only the failing PR and re-tests the rest on a rebuilt branch (docs.github.com, managing-a-merge-queue, read 2026-10-09); Zuul gating keeps main green by construction and re-tests changes behind a failure (zuul-ci.org/docs/zuul/latest/gating.html, read 2026-10-09). Both prevent red main rather than recover from it; akrogon can have red main because the gate ran in a long-lived worktree (#63), so this fork is recovery. Chromium CQ reruns the failing suite without the patch and blames the CL only when it passes without (carried from test-runs base-red-rule findings, read 2026-10-02).
- model knowledge: the 11-35 min per run figure is the seeds' own; no attempt records exist to measure it (seed 66).

## Pitfalls

- P1 a flaky base run holds the whole turn until main moves, where today the next holder would likely pass. Removed by: test-runs completed-comparable-with-shared-cause rule, the one-time notification, and the explicit `akrogon next <holder>` bypass that needs no new verb.
- P2 hold checked only at the prompt, so passes keep building and applying stacks on a held repo and move members' branches. Removed by the guard at `mergeTurn` entry (`src/next.ts:962`), before `reconcileBatch` and the build.
- P3 hold raised on a sha that is no longer main (main moved during B's base run). Removed by the command refusing `--red-on-base <sha>` when it is not the fetched tracking ref; B reruns.
- P4 holder re-prompted on its old stack top after the hold clears, so its rerun is red again on the old built_on. Removed by clearing the batch record at hold time and letting `mergeTurn` build a fresh stack on the new main.
- P5 bounce-counting lands before the hold and spends a leaf's `fix_rounds` on base-red bounces. Removed by order: this fork first (bounce-counting carries that dependency).
- P6 the hold and pause both set, operator unpauses expecting dispatch and the turn stays held. Removed by `akrogon status` showing both annotations and the unpause pass printing the hold line.
- P7 long-running `next` or `phase` processes keep pre-hold code. Removed by the operator restart step at handoff (map pitfall, carried).

## Questions the fork does not ask

- Q4 does the hold apply per repo only, or does one red main also hold other registered repos' turns? Pick: per repo, keyed like pause. The turn is per repo and main is per repo.
- Q5 what does a carried member's state show while its holder is held? Pick: nothing new; members are restored to saved heads and wait in `merge` as before a batch; `akrogon status` places them behind the held holder.
- Q6 does a leaf entering `merge` during a hold get a stamp? Yes, as today; the hold stops only `mergeTurn`, not moves into `merge`.

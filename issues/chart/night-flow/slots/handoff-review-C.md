# Handoff review, slot C

Read 2026-10-11 09:54Z against main `c53f619`: every draft under `drafts/night-flow/` (ISSUE.md, ten leaf folders, `amend/`), the live `issues/open/red-base-wait/known-red-merge/` brief, design and state, the stop-rules and failed-exits Taken, and the cited lines of `src/`, `skills/` and `docs/`. Disagreements and missing pitfalls only. LC marks a low-confidence claim.

## H-a: confirmed

known-red-leaf (`merged`, `merge_stamp` 09:39Z) delivered every pre-merge-red criterion:

- Criterion 1. `skills/implement-issue/SKILL.md:38` and `skills/check-issue/SKILL.md:65` contain one `failed` ending each, `"<command> incomplete base run <sha>: <cause>"`. The red-on-base stop is gone. The seat records the failing units and both log paths in a comparison record under the `leaf=` folder and "Only `known-red` units let the leaf continue". `check-issue:61`: "Failed `checks` commands always block unless every failing unit is known-red in a validated comparison record."
- Criterion 2. Same lines: `new` and `unverified` units "keep the existing repair or incomplete-verification path"; `unverified` covers "missing, crashed, timed out, skipped or unreadable on either side or blocked by a failed setup or build stage".
- Criterion 3. `docs/guide/phases.md:94` and `:102` state the retry, base-run, `--compare` and continue rule. The only pre-merge stop wording left in `skills/` or `docs/` is `implement-issue:36`, which is the own-criteria rule (a done-criterion of the leaf "is never handed off as pre-existing, base red"), consistent with S4 and the waiting-leaf lock.

The delivered form is the structured record, not the `report.md`/`review-<slot>.md` note pre-merge-red brief:7 named. Substance holds, and the record is the stronger form. Drop pre-merge-red and `amend/known-red-leaf`. Drafts that still name pre-merge-red: ISSUE.md:6, pass-refresh design:28, guard-at-creation design:17 (last sentence), plan-not-cap design:15, seat-retry design:19.

## H-b: drop hold-retire and `amend/known-red-merge`

### What each choice costs

Keep hold-retire and apply the amendment now:
- known-red-merge stops. `blocked-by` is re-checked on every dispatch, not only at allocation: `src/next.ts:763-772` calls `blockDetail` for any leaf not merged or failed and returns `waiting` before `dispatchSlot` when a dependency is unmerged (`src/turn.ts:10-18`); the merge queue filters the same way (`src/turn.ts:37-44,81-84`). Adding `hold-retire` to `known-red-merge/state.yaml` parks it until a leaf that does not exist yet is planned, implemented, reviewed and merged. Its A has been planning since 09:43Z against the unamended brief, so that plan is redone against new owned files and criteria (amend brief:21, D6, D7).
- The work is built to be deleted. S1's wait field, selection skip, status line, fetch reorder and tests are removed again by the amended known-red-merge (amend brief:17 "nothing writes the wait again", design:57 "the wait field is no longer written, and the selection skip clears any remaining wait"). Two leaves edit the same functions in sequence: `mergeTurn` (`src/next.ts:1069-1170`), the `check.fix` ending (`src/phase.ts:1011-1040`), `src/status.ts:351-364,408-414`, `src/akrogon.ts:121-143`, `skills/merge-issue/SKILL.md:43,73`, `docs/guide/next.md:119`, `merge.md:29`, `cheat.md:110-116`, `README.md:144-145`.
- If the amendment is not applied, the live brief and the draft collide: both own `src/hold.ts` deletion, `hold-fix`, `unhold`, the status line and the unpause print (live brief:17,21 vs hold-retire brief:9,12).

Drop hold-retire:
- The repo hold stays until known-red-merge lands. Today `--red-on-base` writes `held.yaml` (`src/phase.ts:1011-1040`) and `mergeTurn` returns for the whole repo while fetched main matches outside record folders (`src/next.ts:1127-1133,1146-1156`), and `merge-issue:73` still orders that ending. The remedy exists and is one command, `akrogon unhold` (`docs/guide/cheat.md:110-116`, `next.md:119`). The night's 8h57m hold recurs only while a red main meets a merge run and nobody runs it.
- Nothing else is lost (next section).

### What S1 promised, item by item

- Per-leaf wait until main changes. Not needed once known-red-merge lands: a red merge run is either known-red on `batch.built_on` and pushes (live brief:6, D1) or stack-caused and takes culprit, split and repair (D3). No leaf waits for main, so there is nothing for the wait to do. The red-base-wait merge-gate Taken (2026-10-10, Q2 2a, live design:12) already decided "retire the repo hold" with the same deletion list; S1 split that decision into a leaf one day later.
- Fetch before the empty-queue return (B F1, `src/next.ts:1089` return vs `:1113` fetch). Its only purpose is to let a waiter see main move. With no waiter it changes nothing.
- Queue release on a red run. The ending already restores carried members and clears the applied batch (`src/phase.ts:1017-1023`), and known-red-merge keeps culprit and split (D3).
- Deletions (`held.yaml` use, `src/hold.ts`, `hold-fix`, `unhold`, status line, unpause print, `tests/hold.test.ts`): live brief:17,21 and D6, D7, D9 own every one.
- Merge-seat refresh: live brief:19 owns it.

### The Taken needs correcting either way

Stop-rules S1 ends "lands after S1 (B F2, C), already ordered by its blocked-by chain". On main the chain is `known-red-leaf, base-run` only (`known-red-merge/state.yaml`); the ordering exists only in `amend/known-red-merge/state.yaml`, which was never applied. If hold-retire is dropped, the Taken should record that S1's hold retirement is delivered by known-red-merge under merge-gate Q2 2a and that the wait is not built. Drafts that name hold-retire: ISSUE.md:3, pass-refresh brief:23 ("which hold-retire removes", should name known-red-merge), pre-merge-red design:23 (dropped under H-a).

If the operator keeps it: hold-retire design:19 line numbers are stale on main. Gate `src/next.ts:1127-1163`, empty-queue return `:1089`, fetch `:1113`, ending `src/phase.ts:1011-1040`, flag checks `:955-968`.

## Line references on current main

`src/phase.ts` grew by 58 lines since the drafts (known-red-leaf's `--compare` validation at `:330-335`, `recordComparisons` at `:380`), so every draft reference past `:150` is off by about 50. `src/next.ts` and `src/sync.ts` did not change in `ec08dec..c53f619`, but the `next.ts` numbers in the drafts were already off by about five.

- plan-not-cap: `src/phase.ts:308-313,327` are now `:357-362,376`; `:154-157` is `:156-159`; the test-change protections `:282-284` are `:324-326`.
- pass-refresh: `src/phase.ts:1025` (eject to `check.fix`) is `:1081`; `src/next.ts:631-645` is `:632-641`.
- records-sync: `src/phase.ts:626,660-669,882` are `:671,717-719,932`; readiness.yaml `src/phase.ts:603` is `:653`; `src/next.ts:1382` is `:1387`; `:1531-1543` is `:1540-1548`.
- seat-retry: `src/next.ts:604-610` is `:609-617`; `:616-624` is `:621-629`; `:641-648` is `:645-652`; `:649` is `:654`; `:651` is `:656`.
- watch-steady: `src/next.ts:1572` is the `false` argument of the typed `dispatchLeaf` call at `:1565-1573`; the pause check it skips is `:738`.
- guard-at-creation: `withSetup` `src/config.ts:276-292` is `:283-289` with the prefix at `:287-288`; `leafTemp` `:256-266` is `:263-267`; `src/next.ts:284` (`checkLocation`) is `:287`.
- locked-setting-proof: the Take operation-proof paragraph the brief owns is `skills/chart-issues/SKILL.md:57`; the brief cites no line.
- Skill and doc lines cited by the drafts hold: implement-issue `:34,36,38,42,63,74-80,78`; check-issue `:18,29,61,65,67,93`; phases.md `:76,94,102,108`; setup.md `:54,60`; init-akrogon `:16-20,26`; install.md `:40`; next.md `:119,133`; merge-issue `:18,43,55,73`; watch-issues `:16-18,38,45`; chart-issues `:117`; cheat.md `:110-116`; README `:134,144-145`.

## guard-at-creation

- F1 Criterion 4 and the base-run wording item have no target on main. No skill line creates a base checkout by hand any more: `implement-issue:38`, `check-issue:65` and `merge-issue:73` all run `akrogon base-run`, which creates its checkout under `leafTemp`, that is `~/.akrogon/scratch/<repo>/<slug>/run-*` (`src/base-run.ts:143-145`, `src/config.ts:263-267`), and removes it (`src/base-run.ts:170`). The only `mktemp` left under `skills/` is init-akrogon:72, a proposal file. So the S3 bullet "base copy allocated under `~/.akrogon/scratch/<repo>/`" is already delivered by base-run for every clause, and "base-run's wording becomes 'the hand-made base checkout'" (my own S3 proposal) is moot, since base-run has no hand-made checkout to name. What remains is the three sentences "Temp files, logs, and base copies go under `$TMPDIR`" at `check-issue:18`, `implement-issue:25` and `merge-issue:18`, which now contradict where base copies go. The brief owns `check-issue:18,65`, `implement-issue:38`, `merge-issue:18`; `:65` and `:38` carry no base-copy text, `implement-issue:25` does and is not listed. Reword criterion 4 to those three sentences (drop "base copies", or point at base-run) and drop the base-run wording item.
- Criteria 1 to 3 stand: `akrogon guard ancestors &&` still prefixes both `inner` forms (`src/config.ts:287-288`), `own-modules` is a separate check (`src/guard.ts:36-40`). P1 confirmed: `issues/config.yaml:6`.

## plan-not-cap

- F2 `fix_rounds: 8` is on akrogon main too, not only framework: `issues/config.yaml:4`, added in `9ed8865` (2026-10-11 09:04 local). Design:24 leaves every `issues/config.yaml` unchanged, so after S2 both repos bound the direct route (`skills/chart-issues/SKILL.md:117`) at 8 instead of the init default 3 (`init-akrogon:26`). Name the owner of the revert as an operator step, or the stopgap outlives the cap it was raised for.
- F3 Criterion 1's "merge `check.fix` ending" is the eject path only. The cap applies in `transition` when `state.phase === 'merge'` (`src/phase.ts:357-362`), reached from merge by `transition(culpritLeaf, 'check.fix', 'B', ...)` at `:1081`. The `--red-on-base` ending (`:1011-1040`) never calls `transition`, so it has no cap path. The design's second test case therefore needs a batch record and `--culprit`, the `tests/culprit.test.ts` style, not `tests/phase.test.ts` alone.

## pass-refresh

My earlier F1, F3 and F4 are addressed (brief:10, brief:14, design:24). One missing pitfall from known-red-leaf landing after the draft:

- F4 Comparison records are bound to the head and the pass. `src/compare.ts:116-118` refuses a record whose `leaf_revision` is not HEAD at the phase move, `:120-123` requires its counterpart to equal `base()` (merge-base of HEAD and the tracking ref), and `:125-145` requires the base-run line to start after this slot's `prompted_at`. Two consequences the brief should state once. (a) A refresh or a repair commit after a record is written invalidates it: the red check is rerun on the new head, never carried. The brief's order (refresh, then final proof) gives this for the common case, but `implement-issue:40` applies proof order "after every check.fix repair", so a repair after the final proof moves HEAD past any record already written. (b) The resumed pass after a failed refresh (brief:10) keeps committed work but not comparison evidence: the re-prompt re-stamps `prompted_at`, so base-runs and records from the earlier pass are refused. "Resumes at that refresh instead of redoing committed work" should say red checks are compared again.
- Under H-b, brief:23 names hold-retire; under H-a, design:28 names pre-merge-red.

## records-sync

- F5 Criterion 1's second registered repo contradicts two doc lines the brief does not own. `docs/guide/install.md:36` and `README.md:82` both say the step runs on "`next` runs that select or cover the Akrogon repository" and describes akrogon-only deploy. Brief:14 owns `install.md:40` only. Add `install.md:36` and `README.md:82` to the owned lines, or criterion 7's doc sweep leaves them contradicting criterion 1.
- `src/self-update.ts` references hold: non-akrogon early return `:19`, `ahead > 0` skip `:46-47`, `--ff-only` under the global `.lock` `:51-53`.

## seat-retry

- Criterion 4 is already met on main: `akrogon status` prints `<seat> prompt <code>` while the seat is not busy (`src/status.ts:121-124`) and `A:<n> B:<n>` (`:115-116`), so design:29 needs no status change. No disagreement beyond the line references above.
- Pitfall for the sweep: `docs/guide/next.md:133` is owned, but `skills/watch-issues/SKILL.md:28,38-39` describe `failed=<cause>` and recovery of failed leaves. They stay correct (other failed causes remain), so no edit, but the report's out-of-scope list should name them so B does not read them as a miss.

## watch-steady, cheap-check-placement, locked-setting-proof

No disagreement. Line references hold (watch-issues `:16-18,38,45`; init-akrogon `:16-20`, setup.md `:54`, check-issue `:93`; chart-issues `:57` for the operation-proof paragraph, `:117` for the direct-route bound).

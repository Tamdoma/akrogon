# Design: known-red-leaf

## Binding decisions, verbatim

From `issues/chart/red-base-wait/forks/`, Taken sections.

### waiting-leaf
Operator, 2026-10-10: "1 - I can't have failed. It needs to show exactly what is. Also, why does it have to wait for the main? ..." then "1a | 2a |" on the reshaped round, earlier "2a | 3a" on Q2/Q3.

Decision: a pre-merge leaf never stops, waits or fails because main is red. A red check with no cause in the diff gets one without-change run; failures present on both sides are recorded on the leaf as known-red-on-base and the leaf continues. Attribution is per failing test, not per command exit.
Binding boundaries (B final check):
- This rule only attributes completed check failures. Done-criteria proof, review Fixes, missing credentials and incomplete verification still block (F1).
- Unexecuted, renamed, absent or unparseable base tests are never treated as passing or known-red; crashes, build errors, setup failures and interrupted runs need explicit outcomes; unresolved attribution defaults to unverified (F2).
- "Without change" names the exact counterpart revision and equivalent conditions; leaf base, fetched main and merge stack parent are different proofs (F4).
- Removing the #67 merge hold is a separate operator decision in merge-gate (F5).
Foreclosed: failed + cause held (operator: state must show exactly what is); typed wait state; new held phase; repo-wide freeze.

### comparison
Operator, 2026-10-10: "1a | 2a | 3a"
- Q1 1a: the seat reads both complete logs and writes one structured comparison record per red check (command, args, scope, leaf and counterpart revisions, material conditions, per unit runner/stage, file/suite, full name, outcome each side with log reference, both log paths, completeness). The command validates function only: record parses, states valid, nothing blank, evidence files exist. Native reports are optional evidence. Absence is not pass. skills/check-issue/SKILL.md:59,63 and skills/implement-issue/SKILL.md:38 are rewritten to match.
- Q2 2a: a missing, crashed, timed-out, short-circuited or skipped unit is unverified, never known-red, and blocks (repair path, or the existing incomplete-verification stop with its cause). A non-test error on both sides never exempts the tests it prevented.
- Q3 3a: one with-change retry of the same command, args, scope and configuration after a completed test failure, before any base run. Green retry: recorded on the leaf as inconsistent (flaky), no base run, review still binds. Red retry: per-test base comparison. Retry budget recorded in leaf evidence so a session replacement does not reset it.
Foreclosed: mandatory reporter per check; log parser; command-exit comparison; crash exemption; retry of failing units only; no retry.

### base-evidence-reuse
Operator, 2026-10-10: "cut". No reuse. Every comparison runs the without-change side fresh in the same pass, after the leaf run and retry, under the same conditions (comparison Taken). No recorded base result, red record entry or earlier log is accepted as counterpart evidence. This removes the #77 stale-evidence class. The red record is never acceptance evidence. Foreclosed: cross-leaf reuse, freshness signals (timestamps, prompted_at), invalidation on environment repair.

### red-record
- Q1 1a: one entry per failing unit with command/args/scope/material-conditions provenance. Additive repo record under the mutation lock. An entry resolves only on a completed green run of that unit on landed main under equivalent conditions, from a run that already happens; partial resolution allowed; fix merge, issue close or disappearance never resolve; recurrence is a new entry and a new notice. Update/resolve rereads and compares inside the lock (lesson 2026-10-10-red-main-hold-stale-clear). Incident and notice delivery stored separately; no timer.
- Q2 cut: the record only dedupes notices: one operator notice per new entry, joins silent. No automatic repair leaf, no seed filing, no owner field. Fixing a red is ordinary charted work. A leaf does not repair a recorded red outside its own criteria (B R4).
- Q3 3a: green-on-retry stays in the leaf's comparison record and report only.
Foreclosed: per-command entries; automatic repair leaf; claim-in-place fixing; auto seed; owner link.

### merge-gate (the part this leaf applies)
"The 2026-10-10 red-main-hold stale-clear lesson stays active; the red record's update and clear paths carry lock-then-revalidate."

### worktree-location
Delegated. framework issues/chart/worktree-isolation owns the store, the ancestor guard, migration and the `akrogon base-run` verb. red-base-wait builds none of these; its comparison calls `akrogon base-run` with caller-supplied baseline.

Exclusions: the merge gate, the `--check` binding, merge-time red record updates, the `reuse` route rule and the retirement of `held.yaml`, `--red-on-base`, `hold-fix` and `unhold` belong to `known-red-merge`. `skills/merge-issue/SKILL.md` is not edited here. The base checkout itself, its record file and its log location belong to `base-run`.

## Standing design

`/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md`. Interpretation for this leaf: the properties are CLI refusals and record writes, so the cheapest sufficient proof is the `tests/phase.test.ts` style, driving `akrogon phase` against a real temporary git repo and worktree with real record files, and herdr replaced at one boundary as the existing hold notice tests do (`brief-template.md:47`). The base-run record is read from the real file `base-run` writes. Each refusal gets one case plus one deliberate break turning it red. No live run, no outside call during implementation.

## Leaf architecture

- Comparison record (`src/compare.ts`): one YAML file per red check per pass, under the `leaf=` folder, parsed with zod. Fields: command, args, scope, material conditions, leaf revision, leaf run log, one retry (log and outcome), counterpart revision and base-run log (only when the retry is red), completeness per run (completed, or the cause: crash, timeout, interruption, setup or build failure) (A,B), and units, each with runner or stage, file or suite, full name, outcome on each run (`pass`, `fail`, `missing`) with a log reference, and a verdict (`known-red`, `new`, `unverified`). Check state is `inconsistent` (green retry) or `compared`. The schema makes a `compared` record without a counterpart unrepresentable, and the single retry field makes a second retry unrepresentable (A,C).
- Retry budget (A,C): the seat writes the record file with the first run before retrying. A replaced session that finds a record for the same check and leaf revision with a retry already written does not retry again.
- Log location (A,C): the seat writes both with-change logs into `<leaf>/implementation/`, the folder where `base-run` writes `base-<id>.log`. The validator accepts any existing log path the record names and does not read contents.
- Validation runs in `transition` beside the existing checks (`src/phase.ts:279-285`), only for files passed with `--compare`. It runs before `commitMove` resets `prompted_at` (`src/phase.ts:148`) (C). It checks function only: parse, allowed states, nothing blank, files exist, leaf revision equals HEAD, counterpart equals `base(repo, worktree)` (the `AKROGON_BASE` the seat was given, `src/config.ts:296`). The base log must belong to a `base-run` record line for this leaf and slot whose start is after `state.prompted_at[slot]` (`src/state.ts:90`), whose base, command and args equal the record's, and which shows an end and exit status (A,B). The line is found through `readBaseRuns(repo)`, which `base-run` exports. If the landed line lacks the log path, this leaf adds it (A,B). It never reads log contents to judge outcomes.
- Own criteria and planning (A,B): a unit named by the leaf's own done-criteria is refused as known-red, since `test-proof-rules` gives its wrong expectation to A alone. At `plan.synthesis`, a planned test's intended red is not compared. Other failures there take the same rule, stated in one sentence of the `plan.synthesis` section `test-proof-rules` writes. This is why the leaf is blocked by `test-proof-rules`. It also orders the shared `docs/guide/phases.md` line (C).
- Freshness binding: the operator's cut forecloses "freshness signals (timestamps, prompted_at)" as a way to reuse earlier evidence. Here `prompted_at` only refuses a record whose base-run started before this pass, which enforces the cut in code. Operator, handoff review 2026-10-10, "2a": keep this check.
- Red record (`src/red-record.ts`): an append-only JSON lines file beside the merge attempts record (`issues/merge-attempts.jsonl`, `src/attempts.ts:75`), events `opened` (entry id, unit identity, provenance, first-seen revision, comparison file), `notice` (entry id, `{shown, reason}` or error), `resolved` (entry id, resolving revision, comparison file). Active entries are a fold over events. Add and resolve run inside the global lock that `akrogon phase` already holds for its whole run (`src/phase.ts:818`). They never call `withLock` again: `withLock` spawns a separate `flock` process (`src/state.ts:194-214`), so a nested call on the same lock file waits forever. They read the file inside that lock and compare before writing: add skips a unit already active, and resolve applies only to an active entry whose first-seen revision is the evidence's counterpart revision or an ancestor of it (`git merge-base --is-ancestor`). An entry opened on a newer main than the evidence therefore stays active (A,C). A leaf's `AKROGON_BASE` is `git merge-base HEAD <tracking>` (`src/config.ts:252-254`), so a leaf branched before the red landed tests an older revision and must not resolve it (C).
- Limit: a flaky unit can resolve and reopen at the same code, costing one notice per flip. The record only dedupes notices and never gates a leaf (A).
- Notice: one `herdr notification show` per `opened` event, with the same call shape as the current hold notice (`src/phase.ts:868-880`). Its result is appended as a `notice` event. A failed notice is never retried by a timer, and `akrogon status` shows it.
- Status (`src/status.ts`): one line per active entry. The hold line (`:341-343`, `:387-390`) is removed by `known-red-merge`, not here.
- Skill text: built on the `akrogon base-run` command line that `base-run` puts into `implement-issue/SKILL.md:38` and `check-issue/SKILL.md:63`. The surrounding rule becomes retry, compare, record, `--compare`. The red-on-base `failed` stop for a completed comparison goes, and the incomplete base-run stop stays. `implement-issue/SKILL.md:36` (a done-criterion still red ends the pass) belongs to `test-proof-rules` and is unchanged here. `docs/guide/phases.md` is shared with `test-proof-rules`, which edits other lines.
- Not in scope: a log parser, required reporters, a timer, notice retries, repair leaves, seed filing, owner fields, flake tracking across leaves.

## Held disagreements

- B F1 asked for the observed entry ID in resolution evidence. A took C's ancestry rule instead. It refuses evidence from a revision older than the entry with no seat-supplied ID. B's case, an old green comparison closing a newer recurrence, is refused by it. The remaining same-code flake case is the Limit above (A,C; B held).

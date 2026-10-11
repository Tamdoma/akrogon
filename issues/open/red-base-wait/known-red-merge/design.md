# Design: known-red-merge

## Binding decisions, verbatim

From `issues/chart/red-base-wait/forks/`, Taken sections.

### merge-gate
Operator, 2026-10-10: "1a | 2a |"

Decision:
- Q1 1a: a red merge run takes comparison Taken (one same-command retry, then per-test comparison against the exact target the whole stack stands on, ordinarily batch.built_on). The stack pushes through the normal tested-top/check/push flow only when every remaining failure is known-red on that target, the seat judges no cause in the whole-stack diff, and no required coverage is unverified. Any stack-caused failure, including one inside a test also red on base, keeps today's culprit/split/repair path. The command validates the comparison record bound to the attempt and tested revision pair before stamping `--check`; tested-top, attempt-id and fast-forward guards stay. merge-issue SKILL.md:55 unconditional fix-forward and :73 base-red ending are rewritten.
- Q2 2a: retire the repo hold: no reads or writes of held.yaml, hold-fix routing removed from mergeHolder, `hold-fix` and `unhold` removed with stale calls rejected by a clear error, status hold line and unpause hold print removed, docs/guide/next.md:119 and merge.md:29 updated. Normal queue ordering and pause stay. An existing held.yaml (today /home/ivan/Work/infra/akrogon/held.yaml, `{}`) is left as inert history, never read, never converted, never deleted at runtime. A legacy nonempty hold fixture proves it is ignored.
- The 2026-10-10 red-main-hold stale-clear lesson stays active; the red record's update and clear paths carry lock-then-revalidate.
- Deployment step: active merge seats are refreshed when the new skill lands (owner named in the leaf contract).
Reason: keeping the hold moves the pile-up to merge; the operator already removed waiting before merge.
Limit: a new failure inside an already-red test can stay hidden when output and review cannot expose it.
Foreclosed: keep the hold; optional hold switch; reshape held.yaml into the red record; repurpose hold-fix/unhold.

Note 2026-10-10 (slots/from-chart-framework.md): merge-time base runs are logged by `akrogon base-run` under the merge attempt's issue folder with the parent attempt id; the merge comparison record references that log. Compatible with Q1.

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

Exclusions: the comparison record schema, the red record file, the notice and the pre-merge rules belong to `known-red-leaf`, which lands first. The base checkout, its record file and its log location belong to `base-run`. Pause, queue order, batching, culprit and split are unchanged.

## Standing design

`/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md`. Interpretation for this leaf: the properties are merge-turn refusals, push outcomes and record writes, so the cheapest sufficient proof is the style of `tests/batch-merge.test.ts` and `tests/culprit.test.ts`: a real temporary repo with a bare remote, real stacks and pushes, the real `base-run` record file, and herdr replaced at one boundary. The legacy hold proof is a nonempty `held.yaml` written into the test home before the run. Each refusal gets one case plus one deliberate break turning it red. No live run and no outside call during implementation.

## Leaf architecture

- Merge-gate rationale: the tested top is what gets pushed, so `batch.built_on` is the without-change side. The attempt id alone does not prove freshness, because a restack keeps the attempt while changing the target and top (`src/phase.ts:647-659`), and an interrupted attempt survives into a later pass (`src/next.ts:872-905`) (A,B). So the base-run line must name this attempt, match the record's base, command and args, and have started after slot B's `prompted_at`. This is the same rule `known-red-leaf` applies before merge (A,B).
- Batch record (`src/state.ts:54-61`): gains the list of accepted comparison files, set by `batchCheck` (`src/phase.ts:400-449`). It is not cleared where `tested_top` clears on a refused push (`src/phase.ts:504-513`), because `finishPush` may still find that candidate landed (`src/phase.ts:750-765`) (A,B). The restack drops it after its `reuse` decision, at `src/phase.ts:657` on both decisions and at the rebuild paths (`:605`, `:639`, `:694`, `:723`). It also goes when the batch record clears (A,B,C).
- Validation: `batchCheck` calls the `known-red-leaf` validation with the merge binding before `transition`. Validation is chosen by record state: `inconsistent`, `compared` or `green` (A,B). It refuses new or unverified units and any unit a batch leaf's own done-criteria name (A,B).
- Reuse (`src/phase.ts:553-558`): `reuse` also requires that no accepted record holds a known-red unit.
- Red record at merge: add and the `built_on`-side resolve run in `batchCheck`, under the `known-red-leaf` ancestry rule (A,C). The tested-top resolve runs in every path that records a landed push: `batchPush` (`src/phase.ts:495-501`), `finishPush`'s landed path (`src/phase.ts:750-765`) (A,B) and the reconcile (`src/next.ts:921`, `:946`). It applies only when the landed revision equals the `green` record's leaf revision, which makes a `reuse` push resolve nothing. All these paths already run inside the global lock (`src/phase.ts:818`, `:751`, `src/next.ts:890`), so they never call `withLock` again (`src/state.ts:194-214` spawns a separate `flock` process, and a nested call waits forever).
- `green` record (A,B): on green or known-red checks, when `akrogon status` shows active entries whose command B ran, B passes one record per such command. It holds the run log and each active unit's outcome on the tested top with a log reference, and has no retry and no counterpart. The schema in `src/compare.ts` gains this state. Absence from the log is not a pass.
- Own criteria at merge (A,B): a unit named by a batch leaf's own done-criteria is never known-red. It takes the culprit path, so the leaf's A corrects a wrong expectation under `test-proof-rules`. Merge B corrects none.
- Hold retirement: the hold gate in `src/next.ts:1044-1076` and `fixHeld` go, `mergeHolder` keeps queue order without the fix branch (`src/hold.ts:77-88`), the `--red-on-base` ending (`src/phase.ts:844-889`) and its flag checks (`:793-805`, `:831-832`) go, and `held.yaml` functions are deleted. Retired flags and commands stay recognized by the argument parser only to fail with the pointer error. `appendAttempt` keeps `held` in its outcome enum (`src/attempts.ts`) so history parses.
- Deployment, owned by this leaf: no restart machinery. A merge seat mid-pass with the old skill text hits the retired-flag or retired-command error, which names the skill section to re-read, and every later merge prompt loads the new skill.
- Not in scope: a hold switch, conversion of `held.yaml`, deleting `held.yaml`, new merge outcomes, changes to batching, culprit or split.

## Held disagreements

- B F9: retired-call errors do not refresh a seat that takes the old `:55` fix-forward and finishes green without calling a retired command, so B asks for a named landing-time refresh action. A holds that each merge prompt already loads the current skill. The only seat still on old text is one mid-pass when this leaf lands, and its old fix-forward behaves as akrogon does today. A restart action would be new machinery, against the operator's "I don't want more complexity" (A; B held).

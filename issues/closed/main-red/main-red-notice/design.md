# Design: main-red-notice

## Binding decisions, verbatim

### base-red / red-notice Q1 (issues/chart/base-red/forks/red-notice.md)
Autopilot pick by A, 2026-10-17 (not operator words; mode record in CHART.md). Matches the round recommendation.


Q1: one herdr notice per new base-red incident, delivery stored on the verify receipt.
- Incident identity: scope + command + failing unit within the repo's receipt file. Tree and base sha are evidence, not identity.
- Fires on any completed fresh base run (the known-red comparison's base side) that finds a red unit no unresolved incident covers, whether or not the head side passes.
- Resolves on completed, comparable passing evidence for that unit on landed main: a base-side run or a default-branch-tip verify, with a generation check so an older run never clears a newer red. A leaf head run never resolves; a candidate run counts once that exact revision is main.
- One notification per run: count, first unit names, receipt id; title names the repo and says main is red; body names the next action, chart a repair. `--sound none`, the form the 10-10 proof used, since a known red blocks nobody. The exact call is proven before handoff.
- Sender decided under the verify-runs lock; delivery reason or `error` stored on that receipt like `failure.delivery`. A failed send prints `notice: <error>` to stderr and never changes verify's exit, comparison result or leaf phase; the next base run for an unresolved incident retries. A duplicate after a crash between send and record is accepted.
Reason: the taken policy's accepted cost relies on this notice; the 10-10 operator decision already set its shape; receipts are the surviving record, so no new file.
Cost: one receipt field, a scan and a send on verify's finish path, lock care. `shown` is not a read receipt; a missed notice leaves main red until someone looks.
Rejected: notice on every known-red pass (same channel many times a day); GitHub issue per incident (the 10-10 foreclosed auto seed, plus a credential and network write in every verify); status or reports only (nobody is prompted); `--sound request` (sounds like a failed leaf); tree in the key (re-notifies every landing).
Off route: a derived `akrogon status` line for open incidents (C Q-a); reopen if a notice is missed and a red lingers.


### base-red / red-base-policy (issues/chart/base-red/forks/red-base-policy.md), the parts this leaf relies on
- Incident evidence comes from the linked base run that known-red-pass writes; no red-record file is restored.
- Accepted cost: main stays red until the operator charts the repair from a notice; no assigned repair owner.

### Exclusions
- Pair qualification, the `--known-red` flag and the gates are owned by known-red-pass.
- The expiring-time rule is owned by expiring-time-rule.

## Standing design
/home/ivan/.akrogon/releases/6f31ca94490e98f0306e77a7ad63316cef314b45/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: proof is own tests in the existing suite with the existing fake herdr (tests/fake-herdr.ts, which already answers `notification show` and can fail it) on PATH; the real call shape is proven at charting (readiness proofs). No new proof machinery.

## Leaf architecture
Owned surfaces: src/verify.ts (finish path of a `--known-red` base run), tests, src/AREA.md verify line.

Interfaces:
- `verifyRunSchema` gains optional `notice: string` on base run records (`pending`, the herdr reply reason, or `error`). (A,B)
- Incident identity: scope + command name and string + failing test name, within the repo's issues/verify-runs.jsonl. Tree and sha are evidence only.
- A unit is new when no base run for the same identity holds a covering `notice` newer than the unit's last clearing observation. Covering means a herdr reason other than `error`, or `pending` while that record's `pid` is alive on the same `boot_id`; a dead `pending` counts as undelivered, so the next run retries. (A,B)
- Generation, not completion time, decides clearing: a completed passing observation of the unit on a base-side run or default-branch-tip verify clears the incident only when its tested sha is the red observation's sha or a descendant of it (`git merge-base --is-ancestor <red sha> <green sha>`). `end` alone is never the authority. (A,B)
- The sender is decided inside the verify-runs lock when the base record is finalized, and the same locked write sets `notice: pending` on that record as its reservation, so a second run finalizing next sees the unit covered. The herdr call runs outside the lock; a second locked update replaces `pending` with the reply reason or `error`. (A,B)
- Call: `herdr notification show "<repo> main red" --body "<n> new red on main: <first names>; receipt <run id>; chart a repair" --sound none`, parsed like src/phase.ts `announceFailed` (`{shown, reason}`), but a failure is caught, printed as `notice: <error>` on stderr and recorded; nothing rethrows.

State and consumers:
- The new `notice` field is read only by this leaf's own incident scan. Open for the plan: whether "default-branch-tip verify" is identified by the record's sha equalling the tracking ref at finish time or by scope and leaf fields; the plan names the rule and its test.
- src/flaky.ts reads the same records and ignores unknown optional fields once the schema accepts them.

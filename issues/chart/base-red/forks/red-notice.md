# Red notice and prevention

## Question
Q1. Under the taken known-reds-pass rule, main can stay red while work lands. How does the operator learn it, so the repair gets charted? Options seen so far: a herdr notification each time `verify` passes a leaf on a known red (no stored state, repeats per affected leaf); one notification per incident deduplicated on tree, scope, command and unit with a stored delivery field; a GitHub issue filed once per incident so `akrogon pull` brings it in as intake; no notice, the seat report and `akrogon status` show it.
Q2. Add any prevention for date-rotting tests (a test rule in the plan skill's test-proof rules, a clock seam in src, a lint), or none, since known-reds-pass now absorbs decay and the one seen case is fixed (0dfae20)?

### Carries
- Taken: forks/red-base-policy.md (known reds pass inside verify; accepted cost: main stays red until the operator charts a repair from a notice; no assigned repair owner).
- Locks: no classifier model API; only the operator flips autopilot; no new timers or polling.
- Existing notice path: src/phase.ts:83-104 shows a herdr notification for a failed leaf and stores `failure.delivery`.
- Earlier: issues/chart/red-base-wait/forks/red-record.md (10-10: one record, one notice per newly red check, joins silent).
- Operator corrections: none. Autopilot on since 2026-10-17T08:36:16Z.

## Findings
- Notes: slots/red-notice-A.md (written after B and C returned), -B.md, -C.md; merged slots/red-notice-merged.md with B F1-F3 and C D1-D2 applied.
- operator, 10-10: issues/chart/red-base-wait/forks/red-record.md Taken: per-unit identity on command/args/scope/conditions, joins silent, resolve on observed green landed main from a run that already happens, recurrence is a new entry, no auto seed, no repair owner. Changed: shape of the notice and its dedupe.
- better-than-training, read 2026-10-17: src/phase.ts:83-104 sends `herdr notification show ... --sound request`, parses `{shown, reason}`, stores `failure.delivery`; src/verify.ts:130-196 appends a run record at start and rewrites it at finish under the verify-runs lock. `herdr notification show --help`: `--sound none|done|request`. Changed: notice and delivery reuse existing patterns; receipt carries the field.
- practitioner, read 2026-10-17: Ewaschuk, Google SRE "Monitoring Distributed Systems": low-noise, actionable interruptions. Changed: dedupe and lower sound.
- better-than-training, read 2026-10-17: 0dfae20 fixed tests/timing-report.test.ts by computing expectations from observed time (:511-539); tests/sync.test.ts:253 deliberately uses a fixed wait budget; Bazel Test Encyclopedia, Time and date. Changed: rule limited to expectations that expire as calendar time advances.
- skills/plan-issue/SKILL.md:69 is where criterion tests are written ("test-proof-rules"); it also says "since main is green by the receipt gate", which the taken policy makes false.

## Taken
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

Q2: one rule line in skills/plan-issue/SKILL.md test-proof rules: an expectation that would expire as calendar time advances injects the time or computes the expected value from the time observed in the same run; deliberate elapsed-time and deadline bounds are unaffected. Nothing in src, no lint, no audit of existing tests now.
Reason: one line against a recurring incident class, enforced by the reviewers who already read criterion tests; narrowed per B so deadline contracts stay valid.
Rejected: clock seam in src (most `Date.now()` reads are correct elapsed-time reads); lint (cannot tell an expiring bound from a relative one); audit now (no evidence of another rotting bound).
Standing dissent: B prefers no prevention rule in this issue, since a rule reminds but does not prevent.

## Proofs
- herdr notification for a new main-red incident, 2026-10-17. Command: `herdr notification show "akrogon charting proof: base-red" --body "Test of the main-red notice call. No action needed." --sound none`. Identity: operator's local herdr session (no credential), run from the akrogon registered root inside herdr workspace w8. Version: herdr 0.9.1. Result: exit 0, stdout `{"id":"cli:notification:show","result":{"reason":"shown","shown":true,"type":"notification_show"}}`. Cleanup: none, a desktop notification with no stored state. Limits: proves the call shape, `--sound none` and the `{shown, reason}` reply src/phase.ts parses; does not prove delivery outside herdr, that the operator saw it, or the behavior when herdr is absent.

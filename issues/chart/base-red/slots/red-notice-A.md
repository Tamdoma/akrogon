# red-notice, slot A notes

Written after B's and C's notes returned, so not blind. A's lean before reading them: one herdr notice per new red unit with one stored delivery field, and no clock work beyond 0dfae20 (CHART Fog before this fork).

## Q1 pick: one herdr notice per new incident, delivery stored on the receipt
- Incident = scope + command + failing unit in the repo's receipt file. Tree and base sha are evidence, not identity, because main's tree changes with every landing while known reds pass.
- Fire on any completed fresh base run that has red units no earlier unresolved incident covers, whether or not the head side passes. The notice is about main, not the leaf, and this closes the gap where a leaf blocked on its own extra red leaves the base red unseen.
- Resolve only on a base-side run or a default-branch-tip verify that completes with that unit green. A leaf head run never resolves.
- One notification per run: count, first unit names, receipt id. Delivery reason or `error` stored on that receipt, like `failure.delivery` (src/phase.ts:83-104). A failed send never fails verify. The next base run for an unresolved incident retries.
- Sender chosen inside the verify-runs lock; an occasional duplicate after a crash is accepted.
- Sound: not `request`. A known red blocks nobody, so it should not sound like a failed leaf.
Reason: the taken policy's accepted cost relies on a notice, and the 10-10 red-record decision already set the shape (one notice per new entry, joins silent, no auto seed, no owner). Receipts are the record that survived dc2e2b0, so no new file.
Cost: a receipt field, a scan and a send on verify's finish path, plus lock care. `shown` is not a read receipt.

## Q2 pick: one test-proof rule line, nothing in src
An expectation over a clock- or date-derived value injects the time or computes the expected value from the time observed in the same run. One line, placed once where plan-issue and check-issue already reference test-proof rules. Cost is prose reviewers already read. A seam or lint is rejected: 19 `Date.now()` sites in src are mostly correct elapsed-time reads, and a lint cannot tell a fixed bound from a relative one.

## Rejected
- Notice on every known-red pass: repeats on the same channel many times a day while an incident lasts.
- GitHub issue per incident: the auto seed the operator foreclosed on 10-10, plus a network write and credential in every verify path.
- Status only: nobody is prompted. A derived `akrogon status` line is a possible later addition if a notice is ever missed.
- Clock audit of the existing suite now: no evidence of another rotting bound.

## Pitfalls
- Tree-keyed dedupe re-notifies per landing: keep tree out of the key.
- Leaf that edited a test locally clears a main incident: only base-side and tip runs resolve.
- Mass break floods the notice: one summary per run.
- Notice error turns verify red: caught and recorded, never thrown.

# red-base-policy merged notes

Tags name the slot whose own notes hold the line.

## History both slots must respect
- 2026-10-10 operator (issues/chart/red-base-wait/forks/waiting-leaf.md:41-51): "I can't have failed. It needs to show exactly what is. Also, why does it have to wait for the main?" Decision: a pre-merge leaf never stops, waits or fails because main is red; failures red on both sides are recorded as known-red and the leaf continues. Foreclosed: failed + cause held, typed wait state, new held phase, repo-wide freeze. merge-gate.md:14-25 extended known-red to merge and retired the repo hold. (B; verified by A)
- 2026-10-14 direct commits on main (0706551..c00246d, dc2e2b0, ac50164) replaced that with `akrogon verify` receipts, green-only gates at check.review, merged --check and direct landing, and the seat rule "every commit passed verify, so no base defect". No chart records the reason. (A,B)
- That rule is what brought back the per-leaf `failed` stops of #98. (A)

## Options
- Keep today (per-leaf repair or `failed`). Rejected: three incidents in 10 days, a full verify per leaf, manual moves, and the leaf has no authority over the failing test (any-consultants report.md:31). (A,B)
- Shared incident, affected leaves wait, auto resume on fresh green. Recommended in both blind notes. (A,B) Hold only the transition that needs the affected evidence, not every seat. (B) It contradicts the 10-10 foreclosure of wait states, so it is a policy reversal the operator must make knowingly. (B)
- Known reds pass, merge included (10-10 design). Legitimate operator option, Chromium CQ precedent. A new break inside an already-red unit can stay hidden, and the gate stops meaning main is green. (A,B)
- Reshaped after merge (A): leaf continues, landing waits. A red that also fails on a fresh run of the exact base is recorded on the leaf as red on main; the leaf is not failed and moves through review; only landing waits for green main, which the receipt gate already requires. Fits both operator choices: 10-10 "never stops, waits or fails because main is red" before merge, and 10-14 "only green lands". Cost: the check.review receipt gate must accept a recorded base red for exactly those units, so a slim comparison returns; landing stalls until someone repairs main.

## Evidence
- verify.ts:63-76, :119 reuse by tree, no freshness; verify.ts:78 requireGreenReceipt; phase.ts:291, :295 gates. (A,B)
- verify-runs.jsonl:120-122, three separate reds, third from a direct attempt. (B)
- Chromium CQ docs, read 2026-10-17: same-config retry, rerun without patch, failures also red on base are ignored. Supports known-reds-pass. (A,B)
- Software Engineering at Google: build cop owns red tests regardless of who broke them, rollback preferred. (A) Fowler, Continuous Integration: fix a broken mainline first, by a small responsible group. (B) Fowler 2011: wrap the clock, quarantine and fix fast. (A)

## Pitfalls
- Unexplained is not base-caused: fresh run on the exact base sha, same command set, completed with setup exit 0, same failing units. Interrupted or setup-failed evidence stays unverified. (A,B)
- A fresh base run silently reuses an old green receipt (verify.ts:119). Base runs bypass reuse. (A)
- The wait blocks its own repair: one owner with a runnable repair path. (B)
- Old evidence clears a different incident: identity is command, configuration and unit, not sha alone; resolve under lock. (A,B)
- Resume skips the leaf's own verification or pause/stop: resume only waiting work, then verify the leaf's new head. (A,B)
- Direct landing must follow the same rule. (B)

## Open after this fork
- Who repairs main (operator by hand, or a door-charted fix leaf), and which existing event resumes waiting work after an environment fix with no commit. (A,B)
- Clock prevention scope. (A,B)

## Addendum after C joined (2026-10-17, autopilot)
C's blind notes: red-base-policy-C.md.
- C picks known reds pass in reduced form: after the red retry and the seat's no-cause judgment, `akrogon verify` runs the exact base fresh (no reuse on the base side), extracts failing units from both logs with the existing `failedTests` (src/flaky.ts:10), and passes when every red unit on the head is also red on the base, both runs complete with setup 0. `requireGreenReceipt` accepts that head+base pair wherever it accepts a green receipt (check.review, merge --check, direct-guards). First fresh red base receipt per tree+scope+unit sends one notice, later joins silent. No wait, no resume, no incident record, no `failed` for a base red; the false "never a base defect" sentence is deleted. Matches the 2026-10-10 operator decision. (C)
- C rejects the hybrid (leaf continues, landing waits): a leaf that adds no failure does not make main redder by landing; holding only at merge moves the pileup into the serialized merge queue, the #67 pattern. (C)
- C rejects shared wait: most machinery, contradicts 10-10, stale-clear races (2026-10-10 red-main-hold lesson). (C)
- C rejects restoring the deleted trio (base-run verb, red-record file, seat comparison records): receipts plus existing unit extraction carry the same facts. (C)
- Cost: one fresh base run per leaf that hits a persistent unexplained red, only while main is red; main can stay red while clean work lands, so repair rests on the notice. A new break inside an already-red unit can hide. (C)
- Open (C): who decided dc2e2b0; non-test commands (typecheck, format) have no units; whether done-criteria proofs are covered; what is written when the fresh base is green.
- A's answers to those: dc2e2b0 was authored by the operator 2026-10-14 and no chart records the reason (A checked changed-test-proof, night-flow, check-evidence, merge-green-rate); unitless commands block; done-criteria proofs stay blocking (10-10); a green fresh base writes nothing and the leaf stays on its repair path. (A)

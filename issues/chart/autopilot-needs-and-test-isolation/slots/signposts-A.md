# Signposts angles, slot A

Evidence gathered before the exchange (2026-11-09, main 49d2c916, load 1.5):
- #131: `tests/hc-identity.test.ts` "pinned copy" now asks a core the test starts (`hcCore(f)`), with a comment naming the old failure. Landed in 47186f90 (2026-11-08 10:06 CET). The report's base 75f61f00 is an ancestor of 47186f90; its leaf head 6d6ef4bc is not. The test passes on main in 70 ms, also with `HC_SESSION=default` set.
- #130: `tests/hc-delivery.test.ts` "a working seat gets no send" passes on main in 14.9 s at load 1.5. 97034315 (test cores in their own runtime dir, no hc units) removed the unit-leak load, not the test's own waits. Still about half the 30 s budget at idle.
- #129: SKILL.md Autopilot lists grant approval, retention, secret-save, paid proof, missing need, prerequisite as chart waits; Take places the needs sheet after forks settle. The first reply's supply list excludes approvals.

Angles:

1. A report the code already fixed (#131): close it with the delivering commit (recommended), or chart a guard against it coming back? Steers whether #131 becomes a leaf.
2. Cause or limit: when a test runs out of time under load, remove the wait it spends (recommended), or widen its timeout? 233d01ca added 90 s timeouts and 75f61f00 reverted them. Steers #130's options.
3. Rule or code for #129: skill text only (recommended, matches herdr-app signpost 1a), or a command that checks needs before the map? Steers #129's leaf shape.
4. What a late-found need does after the upfront ask: still parks and is recorded as a miss (recommended; nothing else is honest), or A cuts the contract to what is proven without asking? Steers #129's rule text.
5. Paid calls this session: none (recommended; no handed report needs one), or a budget? Steers proofs.
6. Split: one epic with two issues (needs, tests), or one issue per report? Steers the handoff tree.

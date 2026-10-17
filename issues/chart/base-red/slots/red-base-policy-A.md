# red-base-policy, slot A notes

## Pick: (b) one shared incident, green-only landing
Reason: it removes the repeated cost (one full suite per affected leaf, 149-163 s each on 10-17, verify-runs.jsonl:120-122) and the manual per-leaf `akrogon phase` moves, while keeping the rule dc2e2b0 installed: nothing reaches main without a green receipt (src/verify.ts:78-83 requireGreenReceipt). Main stays the one place that must be green. Practitioner support: Software Engineering at Google, build cop owns keeping the project's tests passing no matter who broke them, rollback preferred over fix-forward.
Cost: leaves on a red main stall until the repair lands. On 10-17 that was minutes (operator fixed in 0dfae20). New mechanism: a fresh base run, an incident record, a wait state and a resume trigger. Must stay far smaller than the deleted 3242 lines: binary per incident, no per-unit comparison engine.
Could invite later: stall of all work if nobody repairs (removed by one notice to the operator and the existing failed-leaf notice path); the incident record drifting into a second source of truth beside verify-runs.jsonl (removed by making the fresh base receipt in verify-runs.jsonl the record itself, no new file).

## Rejected
- (a) today: three incidents in 10 days, each costing a full verify per leaf, a `failed` stop and a manual move per leaf (log.jsonl:581,590,591,675,685,1032,1033). Zero new code, but the toil repeats with every decay.
- (c) known reds pass: Chromium CQ ignores a failure that also fails without the patch (cq.md, read 2026-10-17). It keeps work flowing but lands onto a red main on purpose, so the receipt gate stops meaning "main is green", and a new break inside an already-red unit is hidden. It is the design dc2e2b0 deleted three days ago. Chromium can afford it with sheriffs and thousands of commits per day; akrogon has about 5 merges a day and one operator.

## Evidence
- better-than-training: src/verify.ts:63-76,:119 (receipt reuse by tree, no age key); src/preflight.ts:62 (no test-health gate); skills/implement-issue/SKILL.md:40, skills/check-issue/SKILL.md:69, skills/merge-issue/SKILL.md:77 (base red never attributed); dc2e2b0 body. Read 2026-10-17.
- practitioner: Software Engineering at Google (Winters, Manshreck, Wright, 2020), build cop and rollback-first; Fowler "Eradicating Non-Determinism in Tests" (2011-04-14): wrap the clock, quarantine non-deterministic tests but fix them quickly. Read 2026-10-17.
- better-than-training: Chromium CQ docs (chromium.googlesource.com/chromium/src/+/main/docs/infra/cq.md), read 2026-10-17: retry same config, rerun without the patch, ignore failures that also fail on base.

## Pitfalls
- Fresh base run reuses an old green: base runs bypass receipt reuse (verify.ts:119). Done-criterion.
- Leaf's own break hidden as base red: run the exact `$AKROGON_BASE` sha the leaf sits on, require the same failing unit red on base. Done-criterion.
- Timed-out or setup-failed base run counted as proof: only a completed run with setup exit 0 counts; otherwise unverified and the leaf keeps today's path.
- Two seats race on one incident: the receipt append is the record; the second seat reads it instead of running. Coalescing in-flight runs is a design question for the next fork.
- Resume on a moved main without proof: resume only when a fresh green receipt exists for the main sha the leaf will rebase onto.

## Question the fork does not ask
- Who repairs: operator by hand (today), or the door charts a fix leaf. Next fork with resume.

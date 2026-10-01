# proof-tail merged (A, B, C blind, 2026-10-01)

## Measured
- T1 (A,B,C) The emdash-launch implement tail ran 154m after the last pick (11:47 to 14:21 UTC). Launch ran 7 runs (B: 2m36s to 8m34s each, not a constant), with 4 stranded-gate recoveries. Static bring-up ran 4 times, convert once (about 15m), first-boot twice, and `framework:verify` 3 times (about 12m each).
- T2 (C, B agrees on fixes) Every implement rerun followed a fix to the stage it reran. There was no re-proof of an unchanged stage. The cost is one defect found per slow run: 9 different defects (report.md:29-33). The same shape appears in live-replay (6, 3 and 5 live runs over three passes), emdash-deploy-profile (7 deploy runs) and satellite-review (3 verify runs).
- T3 (C) Cheap checks ran last. `framework:verify` first started at 13:41, 114m after the last pick. It needs no live result, and its two defects cost two more 12m runs at the end.
- T4 (B,C) Polling: 42-43 `sleep` calls covering about 104m in implement and about 56m in check.fix. Most of that time the command was really running. The waste is the gap after a run ends. One measured gap: gate-close evidence at 13:25:09, the poll returned at 13:27:19 (B). C estimates up to about 45m over both phases (unverified).
- T5 (C) A was idle during every poll in implement. No startable unit remained, because U8 needs the live result. Overlap gain is conditional (B).
- T6 (C, B) check.fix rebuilt a fresh fixture (bring-up plus convert, about 25m of re-proof of unchanged stages) because cleanup B9 deleted the first one. B: plan C8's trigger "any launch-path code change" (plan.md:111) is broader than a per-stage map.
- T7 (A) check.fix notes already say "Exactly one full attempt; new failures are recorded, not chased" (plan.md:151), and the pass still runs over 2h.

## Positions
- P1 Count cap (one repair plus one rerun, then `failed`): rejected by A, B (withdrawn) and C. 9 different real defects, live-replay's two `failed` passes did not shorten the third (C F7), and recovery would add an operator step.
- P2 Cheap proof first (C, A agrees): after the last pick, start every `checks` command and every proof needing no live result before or alongside the first slow run. Expected about 25-35m on emdash-launch (C).
- P3 Overlap (A,B,C): while a slow proof runs, start a unit or repair that does not consume its result, does not edit anything the run reads and does not share its fixture. Land it after the run returns, then rerun the changed stages (standing-design.md:12). B: proof inputs must stay stable, so never cherry-pick under a running command.
- P4 Wait on process end (B,C): wait for the slow command's actual exit and status instead of fixed `sleep N; tail` polls. Behavior wording only, naming no harness command (B: a named harness operation needs operation proof. C: the about-300s tool limit is inferred).
- P5 Explicit stage reuse map (B): each slow proof in plan.md names its inputs, consumed stage outputs, shared resources and restart boundary, and the report records which stages changed. C: T2 shows reuse was already followed in implement, and gain is only T6-type cases.
- P6 Collect every failure per slow run (A): continue past a failure where the plan's restart boundaries say the next stage's input stays valid. B and C did not propose it. Pitfall: stranded live state (4 gate recoveries).
- P7 Keep the fixture into check.fix (C 3b): not recommended (C). It moves cleanup proof B9 to merge, which is a contract change.

## Honest size
(B,C) None of this gets emdash-launch under 2h. The tail is mostly real discovery. Wave-plan is the larger lever, and proof-tail covers about 6 of 47 long phases.

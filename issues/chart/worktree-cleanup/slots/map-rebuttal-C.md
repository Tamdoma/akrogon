# Rebuttal, slot C (disagreements only)

R1. #91 "Fog after merge: none material (C,D)" misattributes my map. map-C.md lists G7/E2 as open: what herdr reports as `done` for an agy pane whose process exited, and whether `done` should still produce `failure`. It is material to Q1 a): every observed false failure carried `status: idle`, none `done` (door transcript 773ba851, outcomes at 09:37:29Z, 09:40:22Z, 09:41:28Z, 09:41:39Z, 12:15:31Z, 12:15:47Z, 12:23:04Z). If a pane exit shows as `done`, keeping `failure` on `done` still catches a dead peer and the cost listed for a) shrinks to "peer ended its turn, process alive, no file". The merged Q1 a) drops the idle/done distinction and the proof call; it should keep both (my Q1.2 O2, E2).

R2. #91 Q1 a) cost "A waits until the operator sees it" overstates. peer-wait is bounded by the budget argument (peer-wait.ts:159-200 loops only while budget remains) and peer-ask passes a fixed budget (peer-ask.ts:31-37; 560 s in the incident). Under a) a dead peer costs one budget, then A gets `budget` and acts under peer-turn.md. Not an unbounded wait.

R3. #91 omitted pitfall: the fake herdr used by tests holds one `agent_status` per pane (tests/peer-wait.test.ts:1-150, tests/fake-herdr.ts:218-235), so no test can drive "working, idle for 5 min, working, done". The leaf needs a status sequence in the fake before Q1 a) can be proven by a test (my P13).

R4. #92 fact correction to my own number, since the merged map carries both units: the tracked logs are 990,774,857 bytes = 944.9 MiB (`git ls-files -z 'issues/**/*.log' | xargs -0 stat -c %s`, framework, 2026-10-15). My map wrote "944.9 MB"; MiB is right.

# Chart: merge-test-facts

## Destination

After a leaf closes and its logs are deleted, its verify-runs rows still say which failures timed out (every scope), how long the slowest tests and every failure ran at merge, and which land attempt launched each run. Destination repo: akrogon, one leaf.

Route: lifecycle (autopilot)

## Forks taken

- [Signposts](forks/signposts.md): session signposts (original in seat-turn-idle), A's picks
- [Test facts](forks/test-facts.md): A's pick

## Open forks

## Fog

## Off route

- Keeping logs past leaf close: reverses b9fe5027 and works against the footprint chart (forks/test-facts.md Q1d).
- Run ids on merge-attempts rows, and `attempt` in `samePass`: forks/test-facts.md Q3 and binding decision 5.
- Durations at leaf scope: no consumer (binding decision 4).
- verify-runs.jsonl being parsed and rewritten whole as it grows: pre-existing, not this outcome; related to the footprint chart (C's open question in slots/fork-test-facts-merged.md).

## Pending steps

none

## Mode record

- mode 2026-11-24T22:57:50Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/99903986-d780-4c50-93c1-6f67616882a6.jsonl: on full autopilot (autopilot signposts); handed list seat-turn-idle (#157), fresh-leaf-base (#156), run-check-display (#155), merge-test-facts (#154), direct-visible (#153); consultants B pi devin/swe-2-1-max high, C agy neon high, D pi meta/muse-wonder-full-1.0 high (door-created); words in INTAKE.md "Source: operator door message 2026-11-24"
- handover 2026-11-25T00:13:52Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/99903986-d780-4c50-93c1-6f67616882a6.jsonl /home/ivan/Work/infra/akrogon/issues/chart/fresh-leaf-base/door-reset.log: handed fresh-leaf-base (#156), run-check-display (#155), merge-test-facts (#154), direct-visible (#153); consultants B t3k6 pi devin/swe-2-1-max high, C t3k7 agy neon high, D t3k8 pi meta/muse-wonder-full-1.0 high (door-created); signposts /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/forks/signposts.md; instructions "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance." (operator door message 2026-11-24, INTAKE.md "Source: operator door message 2026-11-24"; scope: this door session, all handed charts)
- handover 2026-11-25T00:47:52Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/6bc67a19-6f25-4293-b35b-b07dacf6d218.jsonl /home/ivan/Work/infra/akrogon/issues/chart/run-check-display/door-reset.log: handed run-check-display (#155), merge-test-facts (#154), direct-visible (#153), fresh-leaf-base (#156, waiting on N1); consultants B t3mm pi devin/swe-2-1-max high, C t3mn agy neon high, D t3mp pi meta/muse-wonder-full-1.0 high (door-created); signposts /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/forks/signposts.md; instructions "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance." (operator door message 2026-11-24, INTAKE.md "Source: operator door message 2026-11-24"; scope: this door session, all handed charts)
- handover 2026-11-25T01:31:14Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/ccbc2cc7-b3ef-45e6-8834-75438e8a3781.jsonl /home/ivan/Work/infra/akrogon/issues/chart/merge-test-facts/door-reset.log: handed merge-test-facts (#154), direct-visible (#153), fresh-leaf-base (#156, waiting on N1), run-check-display (#155, waiting on N1); consultants B t3n1 pi devin/swe-2-1-max high, C t3n2 agy neon high, D t3n3 pi meta/muse-wonder-full-1.0 high (door-created); signposts /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/forks/signposts.md; instructions "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance." (operator door message 2026-11-24, INTAKE.md "Source: operator door message 2026-11-24"; scope: this door session, all handed charts)
- mode 2026-11-25T01:31:59Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/49b07d56-880f-44ff-9ec6-91b9391daef8.jsonl: continue autopilot (handover 2026-11-25T01:31:14Z)

## Autopilot

- switch-on: INTAKE.md "## Source: operator door message 2026-11-24"
- consultant: B pi devin/swe-2-1-max high, C agy neon high, D pi meta/muse-wonder-full-1.0 high, door-created at the first exchange
- signposts: A, original in issues/chart/seat-turn-idle/forks/signposts.md
- route: lifecycle
- test-facts: A picked 1a (K=20, failures included) 2a 3a 4b, rerun facts per leg, samePass unchanged. Standing dissent: C,D larger K (50, 100); B,C full-run durations at top level; D durations in every scope; C attempt in samePass. Final-shape check: B no defect; C (red joined pass not recoverable by tree) and D (timeout line carries the chain prefix) adopted as restatements.
- pick against recommendation: test-facts Q1, A's blind notes said K=10 without failures; the merged evidence moved the pick to K=20 with failures.
- consultant: restarted empty at entry 2026-11-25 (B t3nd, C t3nf, D t3ng, same recipes); all collected in every exchange, none dropped
- recorded only: akrogon flaky lists 20 tests (latest 2026-10-24), outside the handed list; no failed leaves; Tamdoma/akrogon footprint chart (another door, t350) deleted logs in b9fe5027, related to #154, not the same outcome
- handed off: issues/open/merge-test-facts/verify-test-facts (akrogon, sources Tamdoma/akrogon#154), leaf review by B, C, D applied (criterion 4 drops the unwritable reused clause, sub-ms pass lines recorded, test placement removed from criterion 5); akrogon status reads it at plan.synthesis
- recorded only: new seed Tamdoma/akrogon#158 (fresh leaf worktree has no node_modules) pulled 2026-11-25T02:54Z, outside the handed list and this scope
- usage: USAGE.md, outcome partial (B and C seats unmeasured)

Handed off 2026-11-25

# Chart: fresh-leaf-base

## Destination

A leaf's first allocation starts from the current tracking ref when its slug's branch has no commits of its own, instead of reusing a stale leftover worktree or branch. Destination repo: akrogon. Shared opening map: issues/chart/seat-turn-idle/slots/map-merged.md.

Route: lifecycle (autopilot)

## Forks taken

- [Signposts](forks/signposts.md): session signposts (original in seat-turn-idle), A's picks
- [Leftover worktree](forks/leftover-worktree.md): A's pick 2026-11-25, corrected after the final-shape check

## Open forks

none

## Fog

none

## Off route

- A fetch before first allocation: forks/leftover-worktree.md Q3, residual named in the design.
- A withdraw verb and notices for allocation errors: not needed for this outcome (merged notes, open questions).

## Pending steps

none

## Mode record

- mode 2026-11-24T22:57:50Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/99903986-d780-4c50-93c1-6f67616882a6.jsonl: on full autopilot (autopilot signposts); handed list seat-turn-idle (#157), fresh-leaf-base (#156), run-check-display (#155), merge-test-facts (#154), direct-visible (#153); consultants B pi devin/swe-2-1-max high, C agy neon high, D pi meta/muse-wonder-full-1.0 high (door-created); words in INTAKE.md "Source: operator door message 2026-11-24"
- handover 2026-11-25T00:13:52Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/99903986-d780-4c50-93c1-6f67616882a6.jsonl /home/ivan/Work/infra/akrogon/issues/chart/fresh-leaf-base/door-reset.log: handed fresh-leaf-base (#156), run-check-display (#155), merge-test-facts (#154), direct-visible (#153); consultants B t3k6 pi devin/swe-2-1-max high, C t3k7 agy neon high, D t3k8 pi meta/muse-wonder-full-1.0 high (door-created); signposts /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/forks/signposts.md; instructions "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance." (operator door message 2026-11-24, INTAKE.md "Source: operator door message 2026-11-24"; scope: this door session, all handed charts)
- mode 2026-11-25T00:14:44Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/6bc67a19-6f25-4293-b35b-b07dacf6d218.jsonl: continue autopilot (handover 2026-11-25T00:13:52Z)
- handover 2026-11-25T00:47:52Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/6bc67a19-6f25-4293-b35b-b07dacf6d218.jsonl /home/ivan/Work/infra/akrogon/issues/chart/run-check-display/door-reset.log: handed run-check-display (#155), merge-test-facts (#154), direct-visible (#153), fresh-leaf-base (#156, waiting on N1); consultants B t3mm pi devin/swe-2-1-max high, C t3mn agy neon high, D t3mp pi meta/muse-wonder-full-1.0 high (door-created); signposts /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/forks/signposts.md; instructions "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance." (operator door message 2026-11-24, INTAKE.md "Source: operator door message 2026-11-24"; scope: this door session, all handed charts)
- handover 2026-11-25T01:31:14Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/ccbc2cc7-b3ef-45e6-8834-75438e8a3781.jsonl /home/ivan/Work/infra/akrogon/issues/chart/merge-test-facts/door-reset.log: handed merge-test-facts (#154), direct-visible (#153), fresh-leaf-base (#156, waiting on N1), run-check-display (#155, waiting on N1); consultants B t3n1 pi devin/swe-2-1-max high, C t3n2 agy neon high, D t3n3 pi meta/muse-wonder-full-1.0 high (door-created); signposts /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/forks/signposts.md; instructions "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance." (operator door message 2026-11-24, INTAKE.md "Source: operator door message 2026-11-24"; scope: this door session, all handed charts)
- handover 2026-11-25T03:04:30Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/49b07d56-880f-44ff-9ec6-91b9391daef8.jsonl /home/ivan/Work/infra/akrogon/issues/chart/direct-visible/door-reset.log: handed direct-visible (#153), fresh-leaf-base (#156, waiting on N1), run-check-display (#155, waiting on N1); consultants B t3nd pi devin/swe-2-1-max high, C t3nf agy neon high, D t3ng pi meta/muse-wonder-full-1.0 high (door-created); signposts /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/forks/signposts.md; instructions "Full autopilot mode. Don't ask me anything. Think from the systems perspective: simplicity, clarity elegance." (operator door message 2026-11-24, INTAKE.md "Source: operator door message 2026-11-24"; scope: this door session, all handed charts)

## Autopilot

- switch-on: INTAKE.md "## Source: operator door message 2026-11-24"
- consultant: B pi devin/swe-2-1-max high, C agy neon high, D pi meta/muse-wonder-full-1.0 high, door-created at the first exchange
- signposts: A, original in issues/chart/seat-turn-idle/forks/signposts.md
- route: lifecycle
- consultant: restarted empty at entry 2026-11-25 (B t3mm, C t3mn, D t3mp, same recipes); A read child status with `hc get` once between waits (own-call mistake, no drop)
- leftover-worktree: A picked Q1 a, Q2 a, Q3 a, corrected after the final-shape check and the leaf review. Standing dissent: B holds that a HEAD off the slug branch should be judged by reachability, or scoped inside the commit-free gate.
- wait: N1 pending (operator commits learnings/LESSONS.md line "leaf worktree kept at a stale base" and learnings/history/2026-11-24-leaf-worktree-stale-base.md to akrogon main; done when `git log origin/main --oneline -- learnings/history/2026-11-24-leaf-worktree-stale-base.md` prints a commit; checked 2026-11-25, still uncommitted) — next: on N1 supplied, run the destination check, preflight and presence check, the handoff review, then write slots/leaf-draft/ into issues/open/fresh-leaf-base/
- recorded only: akrogon flaky lists 20 tests (latest 2026-10-24), outside the handed list; no failed leaves; Tamdoma/akrogon footprint chart (another door, t350) deleted logs in b9fe5027, related to #154, not the same outcome

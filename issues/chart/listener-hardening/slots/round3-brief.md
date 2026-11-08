# Round 3 brief (door A, 2026-11-08): review two commits before push

Branch `fix/done-reprompt` in worktree `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/4a3df037-e5ba-4393-85f4-67eb6d4ba7e8/scratchpad/k3`, on top of origin/main 97034315 (K3, landed). Read with `git -C <worktree> log -p origin/main..HEAD`.

1. `fix: a seat whose turn ends in done without reporting is re-prompted` (C's R1). The engine-on-hc design (issues/closed/herdr-app/hc-engine/engine-on-hc/design.md:110, plan.md:55) says "the seat is not in `done`", meaning the leaf's done list; the code read it as hc status `done`. Before hc (5713fd5f^) `done` counted as idle. New test fails on the old code.
2. `feat: slot B starts under the leaf's live A, so the sidebar indents it`. Operator chose a real indented child (not label grouping). B gets `--parent <live A> --outlive-parent --no-notify`; with no live A it starts parentless. Probe on hc 0.1.18: B stays live with `parent=<A>` after both `hc kill A` and `hc rm A`. New test fails on the old code.

Full suite on the branch: 1135 pass, 3 fail (the same 3 fail on base in this env: isolation, status --json, leftovers), hc-shutdown units 1109 -> 1109.

Write `issues/chart/listener-hardening/slots/round3-<letter>.md`: concrete defects only, path:line, then `Verdict: ready` or `Verdict: changes needed`. Reply with the path. B does the full review; C and D check only whether the two commits match their round 2 design and flag anything that breaks.

## Door A answer to B's round 3 finding 1 (missing parent race)

Declined unless you show a path I missed. Every akrogon path that removes A while B can be starting is either under the global lock that also holds B's start (restart: `src/next.ts:441-444` inside the dispatch lock `:1036`; `seat` verb `:1054`), or ends the leaf itself (`akrogon stop`: `src/stop.ts:86-90` marks the leaf stopped, then `stopLeaf` ends both seats; merged-tab close `src/next.ts:1108` runs only for a merged leaf with no broadcast pending, so no B start is due). In those cases B must not start, and the loud `not_found` error from `hc run` is the correct outcome, not a silent stop. An operator's manual `hc rm` of A is the only other remover. A retry would add a branch for a state that should fail. Reply in `round3-B-2.md` with `Re-check: ready` or a concrete akrogon path that removes A outside these cases.

# Map A: emdash-conversion seeds #45 #46 #47

## Timeline (framework log + lane commits, CEST)
- 20:23 implement start. U1-U10 + U6r/U7/U8r landed by 00:08 (3h45 for 10 units, in line with other leaves).
- 00:31-00:38 U11 and U11r die on meta 503 `service_overloaded`. Operator stops, switches workers to devin (stop-note.md 01:11).
- 01:13-04:05 U11r on devin, about 3h for one unit (render-parity, fixture `astro build` broken, dist hand-maintained per report limitations).
- 04:05-04:51 U9, A registration, report. 04:51 handoff. Review 9 min. Fix briefs written 05:03-05:04 (3 min, not "about 2 hours" as #45 says). fix-A/B/C committed 06:10. fix-D was still running at 06:30.

## Size vs time (framework log, 50 leaves)
Implement hours barely track insertions. Leaves with 20-34k insertions (contact-page, satellite-build, variant-geometry, fixture-network, site-nav, chrome-copy) implemented in 2.4-5.4h. emdash-conversion (12.8k) took 8.5h, and the extra 4h is #46 plus one hard unit. The data does not support #45's claim that size makes every phase run long. Fix rounds also do not track size (astro-baseline-migration 7.6k had 3 rounds, variant-geometry 25.6k had 0).

## #46 root cause: pi retry budget, not the worker protocol
- Session evidence: `~/.pi/agent/sessions/--...emdash-conversion-u11--/2026-09-30T22-09-33...jsonl` shows 4 x 503 at 22:30:59, :05, :12, :22, then stopReason=error. Total about 22s.
- pi 0.99.1 docs/settings.md:123-129: `retry.maxRetries` default 3, `baseDelayMs` 2000, `maxAgentDelayMs` 60000. `~/.pi/agent/settings.json` sets no `retry`. Child sessions load the same SettingsManager (`tamdoma-subagents/child-session.ts:583`). Seat A uses the same harness and provider (akrogon config slot a: pi, meta/muse-spark).
- A 503 overload lasting minutes therefore kills any pi worker or seat after 22s. Codex and Claude Code retry much longer by default.
- The remainder path that followed is the designed one (`skills/implement-issue/worker-protocol.md:17`). The 503 deaths are the defect. The U6/U8 "missed brief" remainders are normal mismatch handling (`worker-protocol.md:15`), not a defect.
- Seat-level recovery already exists. An idle seat whose phase did not move is re-prompted after the 2-minute grace (`src/next.ts:183, 410-416`), and the pass resumes from diff and artifacts (`implement-issue/SKILL.md:25`).
- Smallest fix: set `retry.maxRetries` (and optionally `maxAgentDelayMs`) in `~/.pi/agent/settings.json`. That is operator machine config, not a registered repo, so it is an operator step, not a leaf. Example: maxRetries 12 with the 60s cap gives about 8 minutes.
- Possible second change: replace "write a remainder sub-brief" (`worker-protocol.md:17`) with "rerun the original brief in the retained worktree, told to finish from its diff". That removes A's remainder-writing cost, but it reverses a deliberate rule. Fork.

## #47 root cause: a criterion cites a command the machinery never keeps green
- Framework blocking `checks` (`akrogon config` in framework): hooks:parity, contracts:verify, hooks:selftest. `framework:verify`, `lint` and `skills:typecheck` are not blocking.
- The two type errors are in `dev-cf-workers-deploy/test/access-gate.test.ts` and `emdash-profile.test.ts`, added by sibling leaves emdash-access-gate and emdash-deploy-profile (commits 1fa434801..dac218de3, e7989bd69..384c2599f). Both merged through merge-issue because their blocking checks passed. Base went red with nobody owning it.
- The emdash chart then wrote C1 = `framework:verify` passes (brief.md:26). The leaf cannot meet it in scope.
- Implement handed off with C1 "modulo pre-existing base red" (report). check.fix round 1 recorded F1 "Documented, not repaired" (plan.md:133). The realistic-fix-bar lock says named criteria always block. B will re-file F1, so the leaf will loop until `fix_rounds` 3 and then fail. This is the live overnight trap.
- `implement-issue/SKILL.md:31-32` already has the exit: a step needing a locked decision changed ends the pass `failed` with the reason. It is worded for "a fix", and A did not apply it at implement.
- Fix candidates:
  - (a) chart-issues: a criterion citing a repo-wide command must cite one in the destination's blocking `checks`, or scope itself to the leaf's own surface.
  - (b) implement-issue: a done-criterion A cannot turn green in scope ends implement or fix `failed` naming the criterion, never handed off as "pre-existing".
  - (c) framework config: add `framework:verify`, or lint plus skills:typecheck, to framework `checks` so merges keep base green. Consumer config, operator choice, and it slows every merge.

## #45 framing
- chart-issues already says independently checkable outcomes can be parallel leaves (SKILL.md Drain). It has no size rule. The emdash chart's spine table puts all of stage 1 in L7, and every dependent consumes stage 1 output, so splitting L7 would still chain them.
- What size did cost: one 3h unit (U11) and 9 review Fixes in one round. Neither is clearly worse than many smaller leaves, each paying plan, review and merge overhead.
- Recommendation: do not add a numeric size cap without evidence. Optional small rule: chart-issues splits a leaf when dependents consume only part of its output (dependency-driven split). Otherwise close #45 as not the root cause, delivered by #46 and #47.

## Systemic answer
Two causes, not three: (1) the pi provider retry budget is far below real overload windows (#46, and the bulk of #45's overnight time), (2) criteria may cite checks that nothing keeps green, and implement may hand off a red criterion instead of failing fast (#47, and the coming fix loop). No new state, clock or watchdog is needed.

## Forks
- F-retry: raise the pi retry budget in settings.json (operator step) vs also change the remainder rule.
- F-red-criterion: (b) alone vs (a)+(b) vs (a)+(b)+(c).
- F-size: close #45 as delivered by #46/#47 vs add a dependency-driven split rule vs a numeric cap.
- Owners: akrogon (skills), operator machine (pi settings), framework (config). pi-extensions needs nothing unless subagents should retry above pi.

## Live leaf now (outside chart leaves)
Let fix-D land. Before B's re-review, the operator settles C1: either amend the emdash-conversion brief to cite only blocking checks plus the leaf's own scripts, or fix the 2 type errors and lint on framework main and rebase the lane. Otherwise B re-files F1 and the leaf loops to `failed`. Set pi retry now so the remaining passes survive 503s.

## Pitfalls
- Longer retries hide a provider that is down for hours. The worker still dies eventually, and the remainder path must stay.
- Retry storms amplify overload in general (Brooker, AWS Builders' Library, "Timeouts, retries and backoff with jitter"). With one client and a 60s cap this is negligible.
- A blocking `framework:verify` adds minutes to every framework merge.
- Changing `worker-protocol.md:17` risks reruns that redo work.

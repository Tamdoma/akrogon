# Intake: merge-lanes

## Scope

Destination: akrogon (registered root /home/ivan/Work/infra/akrogon). Revisit akrogon's one-at-a-time merge design so merges in a busy repo (framework today) finish faster without overloading the host. One chart; grouping decided at the map.

## Provenance

- Operator: door message 2026-11-21 in hc t2z2 (session c-akrogon-faster-merges)

## Source: operator 2026-11-21 door message

Look at the framework space right now. It's clogged with merges, and there is stalling because every merge is happening one at a time. Look at the changelogs in Akrogon in the past one month where we were fighting these slow merges. Maybe it was also over a month ago. We went back and forth with the design, and I settled for this one. But now that Claude Fable 5.2, which will be your slot B consultant, is available, I want to revisit this and see if it's possible to create a better architecture that will not overburden my PC while making the merges faster. Consult with the following consultants. slot b: claude fable 5.2 high, slot c: agy neon xhigh. Full autopilot mode, but I want to do the signposts.

## Agent findings

- Live framework status 2026-11-21T17:2xZ: 10 leaves in `merge`, one holder (`pagespeed-doctor-setup`, `land`), the rest queued with TURN 2-10; oldest queued `checker-command` 9h46m in merge.
- `src/next.ts` mergeTurn: one holder per repo from `mergeQueue` (`src/turn.ts`), `buildStack` (`src/batch.ts`) rebases only the holder onto the base, then `launchLand` (`src/land.ts`) runs verify, gates and push. No other leaf's merge work starts until the holder lands or hands off.
- framework `issues/merge-attempts.jsonl` since 2026-11-14: 244 attempts, 197 merged, 47 red (19%); attempt median 13.4 min, p90 29.9 min, max 152.9 min. Busy lane hours per day: 16.0 (11-18), 12.4 (11-19), 16.7 (11-21).
- framework `issues/verify-runs.jsonl` merge scope since 2026-11-14: 359 runs, median 11.5 min, p90 13.5 min.
- Host: 32 cores, 123 GB RAM.
- framework merge check: `merge_checks.verify: bun run framework:verify`, `checks.cheap`, `merge_covers: [cheap]` (framework issues/config.yaml).
- Seed Tamdoma/akrogon#146 (watch-issues consult) holds a decision section; it is unrelated and the operator note did not ask for seeds, so it is not imported.
- Correction after the signposts exchange (B slots/signposts-B.md, C slots/signposts-C.md, A re-checked framework issues/verify-runs.jsonl): green merge verify median per day was 4.1-5.0 min 2026-10-30 to 11-06 and 12.9-13.4 min 2026-11-20 to 11-21; about half of merge runs exit non-zero (e.g. 11-21: 21 of 65). There is no host-wide full-suite line: 861d0e4e was reverted (20455420) and `full:` is set only in akrogon (6a29a6db); framework's only serializer is the merge turn, host protection is akrogon.slice limits.
- B: a red leaf re-queues at the back because `merge_stamp` resets on each entry (src/phase.ts:230). C: waiting merge leaves keep live tabs counted in host-wide `max_active: 12` (src/next.ts activeCount), so a clogged repo throttles others.

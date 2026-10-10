# Opening map, slot A: #73 lessons to guards

## Intake corrections (inspected 2026-10-10)
- "Seats are told not to read LESSONS.md" is partly wrong. plan-issue reads it as a resource (skills/plan-issue/SKILL.md:25) and docs/guide/learn.md says "Plans read the lesson list". Only implement (implement-issue/SKILL.md:31) and review (check-issue/SKILL.md:45) exclude it.
- Recurrence evidence is weak. Framework LESSONS.md (144 lines today, up from 135) has 0 lines mentioning biome, 0 ancestry, 1 schema-version, 2 generated, 3 receipt. The named bounce classes are mostly not written up as lessons, so the bounces are not proven to be lessons ignored.
- Stock claim holds: framework has 144 active lessons and 0 history files with `Applied`. Akrogon has 3 Applied.
- No command code touches lessons except init scaffolding (src/init.ts:55-70) and batch diff exclusion (src/batch.ts:24).

## Forks
F1. What turns a lesson into a guard, and when?
- 1a At write time: the seat that writes a lesson also sorts it (guarded / checkable / stays, learn-issues rules) and files a seed for a checkable one. Breaks later: seed volume and duplicate seeds; seats need authenticated gh (seed-issue's only dependency).
- 1b Command-triggered sweep: akrogon starts a learn-issues pass on a trigger (stock count, issue complete). Breaks later: a new automatic pass competing for seats; batch triage of stale lessons.
- 1c Keep operator-run learn-issues, add a stock signal in `akrogon status` and let learn-issues file seeds itself. Still depends on operator; cheapest.
F2. Who files the seed: print (today) or file via seed-issue automatically? Outward-facing GitHub writes need a proof call and grant.
F3. Existing stock (144 framework lessons): one-time operator run of learn-issues, a leaf, or leave it?
F4. Recurrence signal: should a merge bounce be matched to a lesson class (needs merge-attempt-records, in flight)? Probably fog until that leaf lands.
F5. Should implement/review read lessons? Intake says no (noise). Agree: keep exclusion.

## Practitioners
- Google SRE, Lunney/Lueder/Beyer, "Postmortem Action Items: Plan the Work and Work the Plan" (SREcon17, https://research.google/pubs/pub45906/, read 2026-10-10): learnings must become tracked action items with owner and priority or the same outage recurs. Supports 1a/F2 file-at-write.
- John Allspaw, SREcon24 slides (https://www.usenix.net/system/files/srecon24americas_slides-allspaw.pdf, read 2026-10-10): post-incident artifacts become a "museum to incidents"; repair crowds out learning. Warns against forcing every learning into a fix item. Supports keeping "stays" as a valid outcome.
- Synthesis: file a tracked item for anything a check can catch, at the moment it is written, and leave judgment lessons as prose with a pruning rule.

## Pitfalls
- Seed spam: dedupe against open seeds and existing sources before filing (seed-issue already searches).
- Seat stalls on gh auth: proof call before handoff with the seat identity.
- Lesson written but never sorted: make the sort part of the same write step, not a later pass.

## #63 / #69
Both were ruled off route with reopen conditions. Close them; reopening is cheap.

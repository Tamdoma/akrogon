# Map A: #51 long leaf phases

## Root cause (measured, framework log + git, 2026-10-01)
- A1 Only `implement` is long: n=247, median 27m, p90 175m, 48 over 120m. check.review median 5m, check.fix median 8m (2 over 120m), merge median 3m. "2h to merge" is an implement problem.
- A2 Implement time tracks the number of planned worker units (unit commits `<slug> uN:` joined to log):
  - 0-1 units: n=7 median 19m, 0 over 2h
  - 2-3 units: n=7 median 29m, 1 over 2h
  - 4-5 units: n=5 median 105m, 1 over 2h
  - 6-7 units: n=6 median 209m, 4 over 2h
  - 8-9 units: n=9 median 148m, 7 over 2h
  - 10-11 units: n=3 median 175m, 3 over 2h
  14 of 18 leaves with 6+ units exceed 2h; 1 of 14 with 3 or fewer.
- A3 Shape of a long implement (emdash-launch, emdash-kit, site-nav, one-client-link): unit waves (up to 3 workers, implement-issue/SKILL.md:44) run serially for 1-3h, the e2e/live unit lands last, then a serial tail of seat-A repairs (`b:`/`A:`/`C8:` commits) as integration failures surface. emdash-launch: U1-U7 done in ~1h (12:56-13:45 local), then ~2h of `C8:` live Cloudflare fixes (14:33-15:56).
- A4 Not caused by stalls or provider deaths in these examples: commits are steady. The stall notice (src/next.ts:193-222) would not shorten them; it only tells the operator.
- A5 leaf-run-stalls (merged today) covers provider deaths, red criteria and dependency splits. It does not cover a leaf that is simply many units of work with no separable dependent.

## Material forks
- F1 Lever: shrink the leaf at chart/plan time (recommended) vs bound the phase at run time (clock) vs notify only. Size is the measured cause; a clock cuts work mid-flight and produces half-done leaves that come back as fix rounds.
- F2 Where the size rule lives: chart door (before handoff, the door already writes leaves and audits briefs) vs plan-issue (has the unit list, but leaves already exist and plan cannot easily mint sibling leaves). Recommend chart door with plan-issue as the backstop that refuses a plan exceeding the rule and returns to the door.
- F3 Rule form without a numeric size gate (lock): "a leaf's plan is one wave of independent units". Any unit that needs another unit landed first is a separate leaf with blocked-by. Derived from existing wave structure, not a count. The cap of 3 per wave is the existing worker cap, not a new number. Challenge: still a de facto size bound; operator must say whether this violates the lock.
- F4 Integration-last tail: put the e2e/spine proof first (walking skeleton) inside a leaf, or make the e2e its own leaf. Splitting by wave makes the e2e leaf naturally last and small.
- F5 Lock challenge: operator now states >2h is unacceptable. Is that a duration target the door should measure against (median implement->merged under 60m) or a hard ceiling? Recommend target as evidence check, no runtime clock.

## Elegant mechanism
One structural rule at charting: a leaf = one wave. No serial dependency inside a leaf. Removes the long serial chain, the late integration tail and the dependent-wait problem at once, adds no clock, field or phase. Cost: more leaves (per-leaf overhead ~10-15m review+merge), more blocked-by chains, the door must plan units before handoff.

## Pitfalls
- Unit count is the plan's choice; a planner can pack work into fewer fat units. Rule must be on dependency structure, not count.
- More leaves means more merge rebases on shared frozen files (contact-page m1/m2, site-nav m1-m3 re-freeze churn).
- leaf-split clause (shapes.md:170) exists; extending it must not duplicate it.

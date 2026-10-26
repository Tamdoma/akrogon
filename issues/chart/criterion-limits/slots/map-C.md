# Skill gap answer C, 2026-10-26

## Class

Invalidation-boundary omission: a plan reuses a result and proves aggregate behavior while the reuse is valid, but neither traces nor tests the outcomes or intervening events that the criterion says end or are excluded from that interval. Here those were a failed lookup being memoized and an earlier loop iteration performing a write between a shared read and a later use. (practitioner: leaf `brief.md` criteria 2-3, `plan.md` D2/D3/C2/C3 and Implementation notes, 2026-10-26)

## Smallest change

Add one sentence to `/home/ivan/.claude/skills/plan-issue/SKILL.md`, at the end of the paragraph in `## plan.synthesis` beginning “plan.md maps each done-criterion to the observation that proves it”:

> Where a decision reuses, caches, snapshots or omits repeated work, that mapping states the reuse's valid interval and gives each outcome or event the criterion excludes from, or places inside, that interval its own proof case in the same run, tracing every code path from the first read to the last use (including paths through earlier iterations of a containing loop or earlier items in a batch), or the traced reason that case is unreachable; an aggregate count over cases where the interval holds does not prove a boundary.

No change is needed in the other two skills. `check-issue` already blocks when a criterion has no test that would catch its failure, and `implement-issue` largely prohibits adding tests after planning. Planning is therefore the only point where this proof can be created without a repair loop. (practitioner: `check-issue/SKILL.md` `## check.review`; `implement-issue/SKILL.md` `## implement`, read 2026-10-26)

## What it would have caught here

- D3: the valid interval must classify a non-repo `null` as a failed outcome excluded from memoization, with a same-process case calling the lookup again and observing another spawn. The first D3 contradicted that case before coding began. The existing four-distinct-cwd check could not observe it.
- D2: tracing from the host-wide pane read to each later repo's use, including earlier iterations of the repo loop, exposes `reconcile()`'s reachable `tab close`. The required multi-repo write-between case would have rejected deriving the later repo's list from that read. The no-write slice count in C2 could not observe it.

## Cost and risk

Plans containing reuse gain a brief interval trace and sometimes one preservation case. Such a case may be green on the base because the base does not yet reuse the value, so it must be recorded as a boundary guard beside the red proof of the new behavior, not mistaken for that red proof. The trace is also only as complete as the planner's search for writer call paths, especially writes hidden behind helpers.

A smaller generic instruction such as “test criterion edge cases” would not do. The current skill already requires proofs from the brief and plan and asks for the product failure each catches, yet decision-derived totals satisfied that language here. The missing requirement is specifically to identify the interval-ending outcome or event and place a case beyond it; without that trigger, future planners can repeat the same omission.

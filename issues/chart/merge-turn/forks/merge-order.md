# Merge order

## Question
Q1. How are competing merges in one repo ordered so a leaf's checks are not invalidated by another leaf landing during the run?

Q2. While another leaf holds the order, where does a waiting leaf wait, and does it keep its tab and its `max_active` slot?

Q3. After a red batch, do the leaves merge solo one at a time or split in half and retry?

Q4. Where does a carried leaf's B record its held reusable Nits, since it never runs a merge pass?

### Carries
- Operator ask 2026-10-05: "avoid that completely. While also making sure that everything merges correctly, there are no issue conflicts".
- Lock: issues/chart/check-reruns/forks/check-scheduling.md:22-24 (merge_checks only at merge, before every push, on the final rebased commit).
- Lock: issues/chart/leaf-run-stalls/forks/red-criterion.md (no clocks, watchdogs or polling; red is never waved through).
- Related: forks/issues-only.md, forks/turn-release.md.

## Findings
Research and peer rounds: ../slots/merge-order-A.md, -B.md, -C.md, -merged.md, -rebuttal-B.md, -rebuttal-C.md; batching shape ../slots/merge-order-1d-shape.md, -final-check-B.md, -final-check-C.md, -1d-merged.md, -1d-rebuttal-B.md, -1d-rebuttal-C.md.

Partial answer, operator 2026-10-05: after asking "Can we still merge them fast without sacrificing conflicts and not triggering rechecks all the time?", A explained batching on top of the turn; operator answered verbatim "1d". Q1 = 1d (merge turn plus batching), shape in ../slots/merge-order-1d-merged.md including its rebuttal section. Foreclosed: 1a alone, 1b speculative train, 1c batch without a turn.


## Taken
Operator 2026-10-05, verbatim: "1d" then "1a | 2a | 3a" (round numbering 1-3 there maps to Q2-Q4 here).

- Q1 1d: per-repo merge turn plus batching, binding shape in ../slots/merge-order-1d-merged.md (Revised shape steps 1-9 as amended by "After 1d rebuttals"; step 10's bound claim withdrawn, no cap). Reason: removes leaf-versus-leaf reruns and cuts the wait to about one run when green. Foreclosed: 1a turn alone, speculative train, batch without a turn, skill-held lock.
- Q2 2a: a waiting leaf stays in `merge`, unprompted, keeps its tab, panes and `max_active` slot; `akrogon status` names the holder and each waiting leaf's place. Reason: nothing new to build, wait is at most one run, B keeps review context. Foreclosed: uncounted waiting tabs, closing tabs.
- Q3 2a: after a red batch nothing lands, every member is restored to its saved base and head, marked solo and merged one at a time; a red solo run goes to `check.fix`. Reason: simplest; solo marks needed either way. Foreclosed: split-in-half retry.
- Q4 3a: B's last act before its own move into `merge`, from check.review or check.repair, records its held reusable Nits in `learnings/LESSONS.md` with a history file; the merge-pass Nit step is removed. Reason: every leaf's own B does it, so carried leaves lose nothing. Foreclosed: holder reads carried reviews, accepting the loss.

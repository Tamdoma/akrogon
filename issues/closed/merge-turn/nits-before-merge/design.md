# Design: nits-before-merge

## Binding decisions, verbatim

### merge-order (issues/chart/merge-turn/forks/merge-order.md)
Operator 2026-10-05, verbatim: "1d" then "1a | 2a | 3a" (round numbering 1-3 there maps to Q2-Q4 here).

- Q1 1d: per-repo merge turn plus batching, binding shape in ../slots/merge-order-1d-merged.md (Revised shape steps 1-9 as amended by "After 1d rebuttals"; step 10's bound claim withdrawn, no cap). Reason: removes leaf-versus-leaf reruns and cuts the wait to about one run when green. Foreclosed: 1a turn alone, speculative train, batch without a turn, skill-held lock.
- Q2 2a: a waiting leaf stays in `merge`, unprompted, keeps its tab, panes and `max_active` slot; `akrogon status` names the holder and each waiting leaf's place. Reason: nothing new to build, wait is at most one run, B keeps review context. Foreclosed: uncounted waiting tabs, closing tabs.
- Q3 2a: after a red batch nothing lands, every member is restored to its saved base and head, marked solo and merged one at a time; a red solo run goes to `check.fix`. Reason: simplest; solo marks needed either way. Foreclosed: split-in-half retry.
- Q4 3a: B's last act before its own move into `merge`, from check.review or check.repair, records its held reusable Nits in `learnings/LESSONS.md` with a history file; the merge-pass Nit step is removed. Reason: every leaf's own B does it, so carried leaves lose nothing. Foreclosed: holder reads carried reviews, accepting the loss.

Applies here: Q4 3a only. Excluded: Q1-Q3 belong to merge-turn-order and merge-batch. issues-only, turn-release and dependency-setup decisions belong to record-only-reuse, merge-turn-order, merge-batch and check-setup.

## Standing design
/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md

- This leaf changes skill prose only. No akrogon test asserts prose wording, so there are no new tests. Review proves the criteria by reading both skills and the docs.
- Lessons are written in the registered checkout and left for the operator to commit. The leaf branch never touches `learnings/` or `issues/`.

## Leaf architecture
- Owned: `skills/check-issue/SKILL.md` (B records before a non-`fix` check.review verdict and before its check.repair move to `merge`, skipping Nits already written (A,B,C)), `skills/merge-issue/SKILL.md` (remove the `## merge` Nit step, currently its first paragraph), and any `docs/` page that places the step in the merge pass.
- Keep the wording rules of the removed step: one mechanism/date/history line, a history file with case, evidence and learning, no reading of the active list as pass input, no extra turn.

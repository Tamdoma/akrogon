# tab-close-rule

## Question
Q1. Which merged leaves should have their tab closed by the command?
Q2. Which pass closes it?

### Carries
- Expected behavior from Tamdoma/akrogon#30: a merged leaf's tab closes once the leaf is merged, including when the merge slot does not close it and the leaf stays under `issues/open` waiting on siblings.
- Off route: worktree and branch retention stays as is.

## Findings
See INTAKE.md Agent findings. Tier better-than-training: inspected code at origin/main and the herdr skill (read 2026-09-27). This is akrogon's own mechanism, so no outside practitioner source applies.

Q1 options:
- A. Every merged leaf, wherever its folder is. The worktree and branch still wait for the owner move. The failed-closure test changes to expect the tab closed.
- B. Only merged leaves with unmerged siblings. A leaf whose closure is pending keeps its tab.

Q2 options:
- A. The merged leaf's own pane-idle hook, plus the existing cleanup passes. This makes SKILL.md:47 true.
- B. The existing cleanup passes only (manual sweep, `--all`, `--resume`).

B final-shape check, 2026-09-27 (slots/idle-tab-close-review-B.md): the hook closes the tab only on an event from the merge seat A (`src/routing.ts:32`), since seat B can go idle while A is still broadcasting after `merged`. Also: rediscover the leaf by slug after dispatch, and keep closure errors visible on the following `tab_closed` pass. A agrees (both). This refines Q2-A and needs operator approval at the handoff review.

## Taken
Operator, 2026-09-27: "1a, 2a"

Q1: A. The command closes the tab of every merged leaf, wherever its folder is. The worktree and branch keep waiting for the owner move. Reason: one rule, and a merged leaf's tab is never needed again. The GitHub closure retry needs the worktree, not the tab. Foreclosed: B (keep the tab while closure is pending).

Q2: A. The merged leaf's own pane hook closes the tab as soon as the seat goes idle, and the existing cleanup passes also close it. The merge-issue skill drops its "close this tab" step. Reason: the tab closes the moment the merge seat finishes, and the fragile agent step goes away. Foreclosed: B (cleanup passes only, up to a ~20 minute lag).

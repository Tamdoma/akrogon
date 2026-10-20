# Stale rule in docs

2026-09-11. Leaf blind-initial-review scoped peer questions in `skills/check-issue/SKILL.md` to A's re-check only. `docs/limits.html` still says peer questions are allowed in every phase except `plan.positions`. The leaf's owned surface was the skill alone, so the stale line passed review as a nit.

Learning: when a skill edit changes a rule, grep `docs/` for that rule and either include the doc line in the owned surface or name the stale hit under known limitations.

## 2026-10-19: twin-guard

Case: the plan excluded guide edits after checking a general eligibility sentence, while docs/guide/next.md's refusal section explicitly said failed leaves came first. B accepted the omission in initial review; A's F1 identified that the new twin-owner refusal precedes failed-phase handling. Repair 5d96fa0941a0606fbf0ebb384204f6d1d2cf414d corrects that ordering claim.

Evidence: issues/open/owner-completion/twin-guard/review-A.md F1, review-B.md check.repair entry, and implementation/check-repair-b-refusal-before-1792425980843-1548619.log versus implementation/check-repair-b-doc-diff-1792425994004-1549536.log under that leaf.

Learning: review the guide section that describes the changed decision order, even when a broader summary remains true and the plan excludes docs. Comparing prose meaning with runtime ordering is a judgment task, so this case adds no mechanical check or seed.

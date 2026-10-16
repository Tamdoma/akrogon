# Slot B independent territory map

Read on 2026-10-16. Akrogon evidence is HEAD `4088a91ad3015c346dc56a9fd485827033e1c507`; framework evidence is its current checkout. No other opening map was read. Paths without a prefix are relative to `/home/ivan/Work/infra/akrogon`; `framework/` means `/home/ivan/Work/infra/tamdoma/framework/`. Existing working-tree changes are outside this map.

## Recommendation

Adopt the framework's complete-mechanism rule across the retirement, triage, implementation, review and handoff instructions in one change. Preserve `Applied` for mechanisms actually stopped. Treat moving a judgment lesson into a review step as a separately approved transfer. Do not sweep either repository's active lessons in this change.

## Material forks

### D1. What evidence permits retirement?

**Pick:** a mechanism is stopped on every reachable path by removal, a reader or writer refusing it loudly at the point of use, or a running guard. Apply the same standard to a delivering leaf and to `/learn-issues` finding an already-delivered change. Name the outcome “Stopped” or equivalent plain language, so removal is not misleadingly called a guard. Cost: the agent must trace the failure mechanism and surviving paths, not merely find a deleted filename or a check.

**Reject:** guard-only retirement perpetuates the reported blockage and invites redundant checks. A deleted cited file alone is insufficient because the failure can survive elsewhere. Warnings or eventual crashes alone are insufficient because they may occur after the harmful effect. Treating all stale-looking lessons as obsolete loses evidence without proving the cause is gone.

**Evidence:** operator tier, `framework/issues/chart/agent-latitude/forks/check-retirement.md:42-44`, decision dated 2026-10-16, explicitly chooses all three routes and a subsequent retrospective sweep. Better-than-training tier, `skills/lesson-rule.md:8`, `skills/learn-issues/SKILL.md:18-29`, `skills/implement-issue/SKILL.md:33`, `skills/check-issue/SKILL.md:61`, inspected 2026-10-16, currently require guards. These are incompatible unless changed together. Better-than-training tier, `framework/learnings/history/2026-09-14-variant-when-dead-after-field-removal.md:8-18`, inspected 2026-10-16, records a field deletion that left dead conditional requirements. Removal can create a defect instead of stopping one.

**Practitioner question:** does “loud failure” prevent the recorded bad outcome, including effects before the failure, and can any other caller still reach it?

**Pitfalls removed:** require evidence of mechanism-wide coverage, with the historical case untouched. Keep partial coverage and missing evidence active. Update Checkable to mean a mechanically detectable mechanism that remains reachable and unstopped. Keep report closure, duplicate and rejection explicitly insufficient. Broaden the source-traced retirement criterion in both `skills/chart-issues/assets/shapes.md:289` and `skills/chart-issues/SKILL.md:75`; otherwise charting still fails to require retirement for removal and boundary refusal.

### D2. When may a judgment lesson move into a review step?

**Pick:** a separate transfer path restricted to judgment-class Stays lessons. Prepare the concrete uncommitted diff containing the destination instruction, active-line removal and history transfer record for operator review. The transfer is not approved or completed until the operator approves that diff. Record destination, date and approval provenance. The destination must be the one live step reached for the relevant work. Cost: an attended approval and tracing the actual review path. This is the specific exception to learn-issues' current “act without asking.”

**Reject:** silently transferring all Stays lessons confuses judgment with missing evidence, since Stays currently includes both. Moving Checkable lessons into prose substitutes advice for prevention. Adding a general review checklist recreates the active backlog at another location. Refusing every transfer contradicts the operator's explicit allowance.

**Evidence:** operator tier, `framework/issues/chart/agent-latitude/forks/check-retirement.md:43`, dated 2026-10-16, permits only approved judgment transfers and says unreached steps retain the lesson. Better-than-training tier, `skills/learn-issues/SKILL.md:22,26-31`, inspected 2026-10-16, combines judgment and uncertainty in Stays and currently authorizes automatic edits only for Guarded. `skills/check-issue/SKILL.md:61` currently rejects every nonguard removal, so its wording must distinguish this operator-owned operation from leaf retirement.

**Practitioner question:** who actually reads this note, at which step, and is that step reached for every case covered by the lesson?

**Pitfalls removed:** require a concrete destination and approval, keep an unapproved transfer visibly pending, and never describe it as Stopped or Guarded. A step mentioned in documentation but skipped in execution does not qualify. Restrict transfers to the registered-root learn pass, which already leaves changes uncommitted, rather than inventing autonomous leaf transfer authority.

### D3. How should history receipts interact with merge cleanup?

**Pick:** retain `Applied <date> by <file:line or commit>: <what stops it>` for all three stopped-mechanism routes. Use a distinct `Transferred` history entry for D2, explicitly naming the destination and approval. Keep transfers in the root learn pass. No `src/lessons.ts` change is needed for that scope. Cost: merge cleanup will not recognize a transfer marker if transfers are later allowed in leaf branches, so expanding that authority would require an explicit compatibility decision.

**Reject:** replacing `Applied` with removal-specific markers silently bypasses existing merge protection. Recording a transfer as though it stopped the mechanism hides the remaining dependence on human judgment. Extending the parser now to accept a transfer marker adds branch behavior that the selected root-only transfer workflow does not use. A typed receipt schema would overbuild this prose policy change.

**Evidence:** better-than-training tier, `src/lessons.ts:11-25,78-95`, inspected 2026-10-16, recognizes added lines beginning `Applied` without interpreting their suffix, and re-removes only matching lines actually deleted in leaf ranges. `skills/merge-issue/SKILL.md:61-67` invokes this helper after rebase. `tests/lessons.test.ts:8-56` exercises resurrection through union merge and scoped cleanup. Operator tier, `framework/issues/chart/agent-latitude/forks/check-retirement.md:43-44`, dated 2026-10-16, retains Applied for removal and requires transfers to be recorded separately in meaning, but does not prescribe their exact marker.

**Practitioner question:** is transfer intentionally confined to the root learn diff, or must it survive leaf rebases too? My pick is the existing root-only scope.

**Pitfalls removed:** preserve the literal parser prefix for stopped mechanisms, use commits when removed code no longer has a file:line, and avoid retrospective rewriting of historical cases or old receipts. A future new case remains evidence to reassess, not something an old receipt automatically invalidates.

## Split and verification

**A1:** one direct change in akrogon after the choices are accepted. It has one outcome, consistent retirement policy, and needs no consumer changes, live implementation run or outside resource. B is available. If the door chooses lifecycle, use one leaf, not separate rule and review leaves that temporarily disagree.

**A2:** owned surfaces are `skills/lesson-rule.md`, `skills/learn-issues/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, both chart audit surfaces above, `learnings/LESSONS.md:5` only, `docs/guide/learn.md:18`, `skills/AREA.md:15`, `README.md:222` and `docs/guide/cheat.md:149`. Keep summaries aligned and refer to the shared rule where possible. No active lesson deletions or framework sweep belong here.

**A3:** review the resulting instructions against removal, boundary refusal, running guard, partial coverage, missing evidence, approved judgment transfer, unapproved transfer, skipped review step, Checkable-to-note and issue-closure cases. Check existing merge behavior and required repository checks during implementation. Do not add exact-wording tests for prose. Evidence: better-than-training tier, `skills/check-issue/SKILL.md:55`, inspected 2026-10-16, explicitly rejects those tests except literal executable references.

## Surprises and limits

**F1:** the report's 158 framework bullets are already 159 in the inspected checkout. There are still no history lines starting `Applied` there. Counts establish backlog size, not how many lessons qualify for retirement. No sweep was performed.

**F2:** akrogon already has historical removal-style application evidence: `learnings/history/2026-09-11-guide-source-spec.md:9` records deleting guide-dependent assertions with source deletion. This is better-than-training evidence inspected at HEAD on 2026-10-16. It shows historical practice is broader than the current written rule, not that a current authorized retirement path exists.

**F3:** a reader that already rejects the bad state could arguably fit current Guarded's “command code” wording. The clearest missing case is removal with no surviving guard. Explicitly naming boundary refusal still resolves disagreement between triage and the stricter “diff carries a running mechanical guard” review rule.

**F4:** the framework decision is operator evidence for the intended policy, not an akrogon lock. The remaining meaningful choice is adoption and the transfer/receipt boundary above. The consumer's sweep depends on this policy landing and stays owned by its chart.

# Adopt round: slot B

## Recommendation

D1. Run lesson triage only in an explicitly requested chart-issues pass whose purpose is lesson maintenance. Drop today's automatic chart-open prune offer. Continue reading relevant lessons during ordinary charting, but do not offer triage, perform it in the background or add a closing reminder. The operator identifies interruption itself as the problem (`issues/chart/retro-concepts/forks/adopt.md:22–23`), and today's instruction creates that interruption on every opening (`skills/chart-issues/SKILL.md:29`).

D2. Preserve the locked three outcomes and seed acceptance. In the requested pass, verify coverage before removing an already guarded line, offer a `/seed-issue` line for each checkable lesson, and otherwise leave it. Keep history. Do not create seeds without the operator's acceptance or turn candidates into implementation forks. These decisions remain binding (`issues/chart/retro-concepts/forks/adopt.md:19–23`). An explicit lesson-maintenance request supplies the door's scope, so unrelated mirrored seeds need not enter the pass (`skills/chart-issues/SKILL.md:31`). No new command or workflow is needed.

## Options and lifetime costs

O1. Keep triage at chart open. It reuses the existing prune offer and regularly exposes stale entries, including the clean-worktree lesson still active in the list (`skills/chart-issues/SKILL.md:29`, `learnings/LESSONS.md:10`, `issues/chart/retro-concepts/slots/map-merged.md:15`). But an optional offer still interrupts, and classifying every lesson requires investigation outside the chart's selected problem. Repeated refusals create noise without maintenance. The correction directly rejects this cost (`issues/chart/retro-concepts/forks/adopt.md:22`). Do not choose it.

O2. Operator-requested door pass only, dropping the automatic offer. Recommended. The whole pass is about lessons, so classification and seed decisions cannot displace another chart's purpose. Existing charting already researches questions and records scope decisions (`skills/chart-issues/SKILL.md:37–47`). Cost: maintenance may never be requested, and stale entries remain planning input (`skills/plan-issue/SKILL.md:25–27`). Accept that cost explicitly instead of adding a reminder, timer or new tracking field. Applied-lesson removal during implementation continues independently (`skills/implement-issue/SKILL.md:31`).

O3. Run triage in merge slot B. Merge has the completed diff and already records reusable Nits, making it the strongest lifecycle candidate. However, it explicitly does not read the active list or add a turn, and it must finish checks, push and completion before its pane closes (`skills/merge-issue/SKILL.md:35`, `:37`, `:53–57`). Full-list triage lengthens every merge and invites concurrent edits from unrelated leaves. Filing unattended seeds would call seed-issue's authenticated `gh issue create` path (`skills/seed-issue/SKILL.md:10`, `:51–61`), but bypasses the locked operator accept/decline decision. Merely saving offers postpones that decision and creates another pending-work responsibility. Reject it.

O4. Adopt nothing. Keep the current process. This adds no triage obligation, and lessons can still leave when applied (`skills/implement-issue/SKILL.md:31`). It also leaves the existing open-time prune offer, so it does not solve the operator's distraction. Removing that offer without adding triage would solve interruption but abandon the chosen routing improvement. Evidence: the current offer and active-list lifecycle both explicitly name chart opening (`skills/chart-issues/SKILL.md:29`, `learnings/LESSONS.md:5`). O2 preserves useful maintenance at the same operational complexity.

## Exact surfaces and boundaries

A1. Change `skills/chart-issues/SKILL.md:29` to separate ordinary lesson reading from triage explicitly requested as the pass's purpose. Use existing lesson, check and seed terms. Do not change plan, review, merge or watch responsibilities.

A2. Align `learnings/LESSONS.md:5` so pruning is no longer tied to every chart opening. Preserve the current line format and applied-lesson removal. Clarify the requested maintenance entry point in `docs/guide/learn.md:18` without adding another lesson store or process.

R1. An explicit pass can still remove a lesson too early. A guard citation must demonstrate coverage of the mechanism wherever it can recur, not just one fixed instance. The merged map's whitespace example already distinguishes partial coverage from full prevention (`issues/chart/retro-concepts/slots/map-merged.md:15`, `:33`). Unproved coverage stays active by default.

R2. A seed is intake, not a prescribed check or implementation grant. Keep the offered report about the observed gap and supporting case. The seed skill forbids recommended fixes and planning metadata, and the guide requires later investigation and a contract (`skills/seed-issue/SKILL.md:26`, `docs/guide/learn.md:40–46`). This avoids turning maintenance into an automatic queue of extra checks.

R3. Do not ask whether to triage while opening or closing an unrelated chart. That recreates the distraction under another timing rule. The request must come from the operator, and missing maintenance is an accepted tradeoff. The reopened question is about preserving the main chart's focus, not maximizing cleanup frequency (`issues/chart/retro-concepts/forks/adopt.md:22–23`).

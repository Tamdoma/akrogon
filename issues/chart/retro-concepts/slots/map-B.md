# Independent territory map: slot B

## What retro does

F1. Retro reads a specified coding session, or the current one, and proposes changes to the agent's environment that would improve later runs. It presents candidates by severity. It does not itself implement them or define a new delivery state (`issues/chart/retro-concepts/slots/source-retro-SKILL.md:7`, `:13`, `:25`).

F2. Its seven lenses are navigation, automated checks, coding standards, global steering, tool cost, ineffective instructions and information access. Its strongest distinction is between mechanically detectable violations and judgement: automate the former, leave the latter to review, and inspect existing checks before proposing more (`issues/chart/retro-concepts/slots/source-retro-SKILL.md:17–23`).

F3. In Matt's wider flow, retro follows a build or bug fix, preferably before session context is cleared. It improves the next build's environment rather than extending the delivered feature (`issues/chart/retro-concepts/slots/source-ask-matt-SKILL.md:32–36`, `:48`). This is a discovery practice, not a replacement for lessons or acceptance review.

## Existing coverage and actual gaps

F4. Navigation is already explicit: the reference index links command, tests, skills and learning areas. Planning follows those pointers and records useful paths in its read-first list (`docs/reference-index.md:3–9`, `skills/plan-issue/SKILL.md:25–27`). Retro adds a question about observed search friction, not another index or documentation hierarchy.

F5. Automated verification already has a home. Configured checks include tests, typechecking and formatting, implementation runs blocking checks, and merge runs them again after rebase (`issues/config.yaml:7–11`, `skills/implement-issue/SKILL.md:63–68`, `skills/merge-issue/SKILL.md:37`). The tests area names link checks and command-contract checks (`tests/AREA.md:12–14`). Missing CI or hooks alone does not establish that Akrogon's controlled merge route lacks verification. Whether another write route bypasses it needs separate evidence.

F6. Mechanical enforcement already appears in the process: changed existing tests require provenance trailers, with a command check before push (`skills/merge-issue/SKILL.md:37`, `:47`). Retro's useful contribution is to consider an existing or missing executable check before adding another instruction. It does not justify automating judgement about realistic sources or reviewer quality.

F7. Judgement and standards already live in the locked design and review rules. Review follows criteria, exclusions, live contracts and affected docs. Tests must prove a criterion or concrete consequence, and prose wording tests are explicitly rejected (`skills/check-issue/SKILL.md:39–53`, `skills/chart-issues/assets/standing-design.md:8–16`). A separate CODING_STANDARDS.md would add another authority unless an actual missing responsibility is established.

F8. Steering size and ineffective instructions are plausible inspection lenses, not established defects. Phase skills explicitly limit repeated reads, and planning reads lessons while implementation and review do not consume the active list (`skills/plan-issue/SKILL.md:6`, `:25–27`, `skills/implement-issue/SKILL.md:31`, `skills/check-issue/SKILL.md:45`). Moving all rules to review would also hide constraints needed while designing and implementing.

F9. Tool economy already reaches charting. The slow-phases chart selected suite concurrency from measurements and left other costs off route. The stalls chart separated normal work, provider deaths and blocked dependents before choosing changes (`issues/chart/akrogon-slow-phases/CHART.md:4–20`, `issues/chart/leaf-run-stalls/CHART.md:8–17`). Retro could help discover similar opportunities without waiting for an operator's complaint. It need not create a timing service or token dashboard.

F10. Information access and log inspection already exist in watch: it combines lifecycle records, session-log summaries and visible pane evidence (`skills/watch-issues/SKILL.md:28–40`). Lifecycle records carry timestamps, phase changes, heads and session IDs (`issues/log.jsonl:1`, `:502`). These locate events but do not explain their causes. The log-tail parser supports Claude, Codex and Pi, renders shortened tool/result excerpts and emits only the last 20 entries (`skills/watch-issues/scripts/log-tail.ts:244`, `:276`, `:296`, `:412–421`, `:486–487`). It is useful triage, not a complete retrospective transcript or cost ledger.

F11. Lessons already close the loop more broadly than the operator guide's review-Nit example suggests. Plan, implementation and review may record reusable discoveries, and merge promotes a reusable Nit without another turn (`skills/plan-issue/SKILL.md:39`, `skills/implement-issue/SKILL.md:31`, `skills/check-issue/SKILL.md:59`, `skills/merge-issue/SKILL.md:35`, `docs/guide/learn.md:9–18`). History guidance already asks why the machinery permitted failure and which change prevents its class, extending a case as evidence develops (`learnings/history/README.md:3–10`, `:22–28`). The missing piece is a deliberate environment scan, not a place to store lessons.

F12. Existing cases demonstrate this practice already: a review lesson distinguishes reading from executable reproduction, and the timeout lesson records a multi-file probe that disproved a proposed runner setting (`learnings/history/2026-09-10-review-by-reading.md:3–7`, `learnings/history/2026-10-02-bun-preload-default-timeout.md:3–6`). The latter also shows why nominally configured checks are not enough. Retro's lenses could make this discovery more consistent, but inspected files do not measure how often useful candidates are currently missed.

## Where it fits

D1. Best surface: `skills/chart-issues/SKILL.md`, within its existing evidence-led Drain/Take work, when intake asks to investigate a session or process incident. Examine the named run's artifacts and relevant log spans, ask what environment change would prevent the demonstrated waste or error, inspect the existing mechanism, and rank only supported candidates. The current door already maps options, researches them and resolves scope before handoff (`skills/chart-issues/SKILL.md:37–47`).

D2. Keep the current output routes: reusable evidence in lessons/history, possible implementation work through seed/chart/leaf contracts, and no immediate expansion of the original leaf. This preserves the guide's distinction between learning and new authorized work (`docs/guide/learn.md:20–46`). An investigation finding nothing worthwhile should end without creating a lesson or work item.

D3. Do not put this in every merge, review, watch tick or phase transition. Merge is intentionally bounded and its pane closes after completion, review repairs only concrete defects, and watch handles current recovery (`skills/merge-issue/SKILL.md:35`, `:53–57`, `skills/check-issue/SKILL.md:49–59`, `skills/watch-issues/SKILL.md:36–40`). Automatic retros would add work and contention at the wrong boundary. Another retro command, state, standards file or lesson store duplicates existing responsibilities.

## Material forks and lifetime pitfalls

O1. Adopt nothing. Existing charting and history already support evidence-led retrospectives. This avoids more instructions, but leaves discovery dependent on whoever notices the friction. Choose it if no concrete missed opportunity can be demonstrated. Evidence for substantial existing coverage: F9–F12.

O2. Add a narrow, conditional scan to chart-issues. Recommended. It gives current charting a prevention question and retro's diagnostic lenses without adding a workflow. Over time it could become a generic checklist that consumes tokens on unrelated intake. Limit it to requested session/process investigations and remove it if it produces only restated lessons. Existing entry point: D1.

O3. Add a dedicated or mandatory retro mechanism. It could discover problems after apparently successful runs, but introduces invocation, evidence collection, ownership and duplicate-work questions. Multi-seat leaves span several sessions, and an added post-merge seat cannot assume the original context survives. Current session IDs and bounded log summaries do not solve full evidence collection (F10). Current evidence does not justify this option.

Q1. What problem should adoption solve: overlooked prevention opportunities, or simply easier invocation? Matt provides a discovery method (F1–F3). Akrogon already has storage and delivery (F11). Require an example where existing charting missed a useful environment change before buying a new mechanism.

Q2. Should investigations be explicitly requested, or required after every build? Matt recommends running before context is cleared, but Akrogon has multiple seats and phase artifacts rather than one continuous build session (`issues/chart/retro-concepts/slots/source-ask-matt-SKILL.md:36`, `skills/watch-issues/SKILL.md:34`). Recommend explicit, scoped investigation through charting. A mandatory rule needs demonstrated benefit and a clear owner.

Q3. Should a mechanical finding automatically create enforcement? Matt says deterministic check, full stop (`issues/chart/retro-concepts/slots/source-retro-SKILL.md:19`). Recommend considering that first, then proving value against Akrogon's cheapest-sufficient-check rule (`skills/chart-issues/assets/standing-design.md:10–13`). A detector that freezes wording, adds duplicate checks or tests an unreachable scenario can increase failure and upkeep without preventing the observed problem.

R1. Diagnosis can drift into anecdotal policy. Preserve the exact case, distinguish observation from proposed prevention, verify current surfaces and do not treat old lessons as laws (`skills/plan-issue/SKILL.md:27`, `learnings/history/README.md:24–25`). The wording lesson shows a green, contract-compliant change can still expose a poor criterion (`learnings/history/2026-10-01-failed-stop-guard-wording.md:6–8`).

R2. More discovery can become uncontrolled scope. Do not turn every retro candidate into a merge blocker or repair. Existing Fix/Nit rules and separate seeds retain a finish line (`skills/check-issue/SKILL.md:49–57`, `docs/guide/learn.md:40–46`). Proposed information access also needs normal scoped authorization rather than blanket readonly access to services (`skills/chart-issues/SKILL.md:53–55`).

R3. Repeated retros can inflate the active lesson list or collide during edits. The list removes applied or pruned entries, history extends repeated cases, and the lessons-conflict chart explicitly chose union retention including overlapping edits (`learnings/LESSONS.md:5`, `learnings/history/README.md:9–10`, `issues/chart/lessons-merge-conflicts/CHART.md:7`). Use the existing lifecycle and ownership guidance rather than adding a second queue.

## Recommendation

Adopt O2 only: a small conditional addition to existing charting that asks for evidenced environment prevention during requested process/session investigations. It complements lessons by improving discovery, while lessons preserve evidence and contracts authorize changes. This is worth a small instruction change if it sharpens the door's current work. A separate skill, automatic post-build phase or new record system is not worth it on the available evidence. No implementation or process mutation was performed for this map.

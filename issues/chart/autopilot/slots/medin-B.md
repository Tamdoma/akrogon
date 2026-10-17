# Medin material: independent B notes

## Pick, reason and cost

**D1. Keep delegated charting, but separate deciding how to achieve the operator's outcome from inventing that outcome.** Before leaving, the operator supplies the intended result, meaningful exclusions and authority. A researches and answers ordinary design choices inside that boundary. When a newly discovered choice changes an undelegated user outcome, A prepares the alternatives but holds the affected handoff. Cost: occasional interruptions remain. This is narrower than making every architectural choice attended, and stronger than treating consultant consensus as knowledge of the operator's wishes.

## Evidence and verification

All sources checked 2026-10-16.

**E1, operator-supplied material:** `sources/cole-medin-ai-software-factory.txt` is Gemini's summary, not a Medin transcript. YouTube metadata verifies [Medin's video](https://www.youtube.com/watch?v=GQatuTWSRqY), published 2026-10-16. Its author-written description explicitly retains release planning and staging review. Caption retrieval returned no content. Exact speech, the fixed 10–20 issue size and 2–3 hour manager interval remain unverified.

**E2, practitioner and better-than-training:** Medin's [README](https://github.com/coleam00/ai-software-factory/blob/54f1c4a395e992d0e686b5aba23f184cf64c8d13/README.md#L111-L132), [mission template](https://github.com/coleam00/ai-software-factory/blob/54f1c4a395e992d0e686b5aba23f184cf64c8d13/template/MISSION.md#L111-L138) and [holdout template](https://github.com/coleam00/ai-software-factory/blob/54f1c4a395e992d0e686b5aba23f184cf64c8d13/template/.factory/holdout/HOLDOUT.md#L1-L5). The mission permits proposing answers to open product questions and building against them, with human approval before merge. Irreversible questions stop earlier. The README reports a reviewed change rewriting governance and adds protected-path checks. These are inspected source instructions, not a live verification of his factory.

**E3, practitioner:** Dex Horthy, [Why Software Factories Fail](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/wsff.md), July 22, 2026 per HumanLayer's resource index. His team reverted from lights-off operation after costly debugging and maintainability failures. He recommends human alignment and review, while exempting obvious small fixes from product review. His argument is a practitioner position, not proof that no autonomous planning can succeed.

**E4, practitioner:** Justin McCarthy, [StrongDM factory](https://factory.strongdm.ai/), February 6, 2026, and [Shift Work](https://factory.strongdm.ai/techniques/shift-work), undated. StrongDM separates evolving intent interactively from executing fully specified work, and uses independent scenarios. [Dan Shapiro](https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/), January 23, 2026, describes specification and plan review at level 4. His levels classify practice; they do not prove a safe permission boundary.

## Ideas mapped to the open forks

| Ref | Idea and affected fork | Pick, rejected alternative, cost and pitfall remover |
|---|---|---|
| I1 | Intent → **boundary, picking** | Require an operator-owned outcome, not operator-written implementation details. Reject guessing a new product preference. Cost: hold when evidence cannot establish intent. E1/E3/E4. |
| I2 | Out-of-scope → **boundary, switch** | Record concrete tempting exclusions alongside named work. Reject copying Medin's minimum list length or making this pass's exclusions permanent product bans. Cost: brief upfront review. His mission distinguishes permanent exclusions from deferred work; our door scope need not use the same lifetime. E2. |
| I3 | Holdout checks → **picking, morning-record** | Use independent, outcome-based trial judgments. Reject claiming blind peer notes equal hidden evaluation or that secrecy guarantees correctness. Cost: independent review effort. Actual isolation is required for any hidden cases; his holdout template explicitly says its helper does not enforce it. New implementation holdout machinery is off route. E2/E4. |
| I4 | Rule self-modification → **boundary** | Preserve the current run's authority and success criteria. Reject A relaxing them to clear its own hold. Cost: operator involvement for those changes. The protected-path incident strengthens this boundary, but does not prove every harmless skill edit must wait. E2. |
| I5 | Blast radius → **boundary, switch** | Judge consequences at handoff, not merely the size of the chart. Reject assuming “charting only” means no downstream effects. Cost: define authorized destinations/effects before leaving. Existing state-last handoff creates dispatchable work. |
| I6 | Batch review → **morning-record** | Present consequential choices, assumptions and resulting outcomes together. Reject calling morning review a pre-release gate: akrogon may already have merged the work. Cost: delayed corrections remain possible. Importing staging would widen scope. E1/E2. |
| I7 | HITL toggles → **switch, boundary** | Explicit delegation per door and substantive holds. Reject a repo-global switch or approval for every routine choice. Cost: record which authority is active. Medin's approval/preview controls are precedent, not a requirement to copy his configuration. E2. |
| I8 | Manager agent → **watcher-seam** | Keep the existing operator-run watcher. Reject another supervisor or timer. No new charting capability follows from Medin's slower manager loop. E2; CHART.md excludes watcher changes. |

## Challenge and new question

**F1. The challenge applies directly:** charting often discovers intent; it is not merely executing an agreed specification. More consultants cannot supply missing preferences. But mandatory human planning for every fork does not follow: known outcomes and established operator choices support delegated design. Akrogon retains research and peer review (`SKILL.md` at `f7baddc:51-55,69-71`), which mitigates errors without proving decision quality.

**Q1. Add to Boundary:** when A proposes an answer to an undelegated product assumption, may it prepare drafts only, or hand off before the operator accepts it? **Pick drafts only.** Preserve the normal handoff once authorized. This transfers Medin's distinction between proposing and committing without adding staging, hiding requirements or removing ordinary autonomous choices. `questions.md:31` still prevents silence supplying authorization.

END medin-B

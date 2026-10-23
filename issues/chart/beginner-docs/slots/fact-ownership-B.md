# Blind notes B: fact-ownership

Independent notes, 2026-10-23. Read current Question/Carries and doc-architecture Taken, not A notes, merged notes or current Findings. Only the requested return file is written. The operator's correction is binding: ordered documentation and narrated examples, no practice project, exercises or tutorial finish line.

## Q1. Which rules human docs own

### Pick, reason and cost

Pick (a), with “never copying” narrowed to exact agent policy, not a ban on useful executable commands or necessary summaries. Human docs explain what happens, what the operator does and why. Exact agent decision procedures stay in the owning skill. Runtime syntax, accepted configuration and behavior are grounded in source. Human reference owns its accurate description, not a competing runtime specification.

A task page must be usable without reading a dense skill to discover an essential operator action. For example, the autopilot page should explain how to request it, the handed-list boundary, what can wait on the operator and that handoff does not start execution. It links the exact consultant retry/drop and session-handover policy instead of transcribing it. Command reference can repeat a literal command because executable syntax is its subject.

Cost: writers must distinguish necessary user-visible semantics from agent-only procedure and verify summaries against the owner. Linking alone does not make a vague summary correct.

### Rejected option

(b), restate every rule: every added policy now needs coordinated edits in a skill and a human paraphrase. Equivalent wording is hard to maintain and check mechanically. It also forces beginners through conditions they cannot act on. Existing stale merge and cleanup summaries show the risk even when many docs updates are made.

### Evidence, tier, source and date

E1. Tier 1, operator corrections in doc-architecture Taken, read 2026-10-23: documentation should be easy to follow without assigned practice tasks. Supports readable explanation rather than turning the docs into agent instructions.

E2. Tier 3, existing guide/skills inspected this session: docs/guide/chart.md embeds consultant-script and session-record detail before modes; skills/chart-issues/SKILL.md owns exact mode/peer behavior. docs/guide/merge.md's normal B merge and sweep-only cleanup descriptions disagree with current skill/source behavior. These are concrete duplication costs.

E3. Tier 3, skills/chart-issues/assets/standing-design.md, Standing design lines, read 2026-10-23: writer and checker share a rule definition; a retained second copy needs a reason and agreement test. Avoid creating a second agent-policy specification in human docs. A human explanation is a different purpose, judged semantically, not an excuse for another exhaustive copy.

### Pitfalls and removal steps

R1. “Never copy” removes the commands users need. Permit literal syntax and concise outcome explanations where they serve the page's purpose. Keep one complete command/config reference and link it from task pages.

R2. Links replace essential operator guidance. Review whether the reader can complete their intended job using the task page and explicitly linked prerequisites. Skill links provide depth, not missing basic actions.

R3. A source link is treated as proof the summary is current. Reviewer compares the summary's meaning to the current implementation/skill and checks the boundaries shown in diagrams too.

### Missing question

Q1a. Can “never copying” explicitly mean no duplicate exhaustive agent procedure, while permitting the commands and concise semantics needed by human tasks/reference? Without that clarification, (a) can be interpreted as a ban on useful documentation.

## Q2. Tests affected by the restructure

### Pick, reason and cost

Pick the functional direction of (a), with two corrections: retired-word bans are not automatically functional, and the rollback test does not currently execute the documentation's actual command block.

Retain and retarget link/file/anchor checks, canonical command coverage/argument semantics and real rollback behavior. Extend existing link discovery to nested docs and the actual image/SVG embedding forms used by the rewrite. Do not build a general Markdown/SVG validator or a new proof runner. Markdown images are already partly matched by the current link regex; HTML img/source references are not. Validate those references where the selected embedding requires them.

Remove pure word-presence checks from affected human documentation, including door-reset's guide “handover” requirement, log-reader's README “akrogon log” requirement, and command-reference's files/next guide substring assertions. Those require content in a particular location, not working behavior or clarity. Preserve the associated runtime tests. Do not widen this leaf into deleting every existing skill assertion.

Keep exact CLI contract checks in the new command reference. Their executable syntax is different from ordinary prose. The current command-reference test already compares verbs with src/akrogon.ts and normalizes argument alternatives and row order. Do not replace it with an exact-text snapshot.

Audit the retired-feature checks individually. CLI refusal and absence of retired runtime wiring are useful functional guards. A blanket prose ban on “run permit”, “unhold” or similar terms can forbid an accurate explanation that the old command was removed. Keep a documentation ban only if the contract explicitly excludes publishing that literal surface, or narrow it to stale executable instructions. Do not claim arbitrary word absence proves current documentation.

The rollback test exercises a valuable real broken-release recovery with the pinned predecessor. Preserve it. However, it currently reads README only to require two substrings, then runs a handwritten sequence using command calls and writeFileSync. Moving its doc path does not make it a test of the documented shell block. Retain the behavior proof and semantically compare the moved instructions with it during review. If the contract requires execution of the literal documented block, say so separately and check whether a minimal extension of the existing fixture can do that without new proof machinery. Do not silently claim that stronger evidence already exists.

Cost: a bounded test migration accompanying owned docs moves, explicit reasons for removed expectations and semantic review of the human content. None of these tests proves beginner comprehension.

### Rejected options

(b), keep every assertion and change paths: preserves arbitrary vocabulary/location requirements, including ones rejected in recent repository history. New pages could be clear and accurate while failing these tests.

(c), keep old pages for the tests: creates duplicate manuals or empty compatibility shells whose purpose is satisfying tests. Compatibility entry pages may be justified for readers' old links, but not for obsolete test expectations.

### Evidence, tier, source and date

E4. Tier 3, tests/docs-links.test.ts, inspected 2026-10-23: enumerates only docs/guide/*.md plus README and top-level skill files; resolves Markdown links/files/anchors using local parsing. Recursion and used HTML image references are the concrete gaps for the selected architecture.

E5. Tier 3, tests/command-reference.test.ts, inspected 2026-10-23: reads README's Command table, compares verb coverage to the dispatcher and checks argument semantics against contracts. Separate tests merely require specific timing/stop/start strings in current guide pages. Preserve the former role, drop prose-location checks as part of their owned migration.

E6. Tier 3, tests/rollback.test.ts, named manual-steps test inspected 2026-10-23: builds predecessor 6121559ee158f559842715a552248645f05bd026, breaks the current release and verifies actual recovery. The documentation is checked only for release-hold.yaml and writeDeploySuccess; the executed sequence is written independently in TypeScript. This is strong recovery evidence but not literal documentation execution.

E7. Tier 3, tests/door-reset.test.ts and tests/log-reader.test.ts, focused assertions inspected 2026-10-23: require handover in chart.md and akrogon log in README. These are the page wording constraints to remove, not a reason to weaken handover or log-reading runtime tests.

E8. Tier 3, tests/run-permit.test.ts and tests/hold-retired.test.ts, inspected 2026-10-23: contain runtime retirement tests plus Markdown regex bans. The latter are text constraints and need separate judgment rather than being grouped automatically with runtime behavior.

E9. Tier 3, git commit 7efe3d67, inspected 2026-10-23: explicitly removes setup.md wording assertions and assigns that criterion to reading the guide. Commit c9f658b1 removes prose wording assertions while retaining executable command literals. Commit 88216a75 removes a prose-shape gate. This supports judging function rather than exact prose without demanding deletion of every literal test.

E10. Tier 3, standing-design.md Standing design lines: no vanity tests, smallest sufficient proof, preserve real regression guards and explain outdated expectation deletions. These rules apply to the migration.

### Pitfalls and removal steps

R4. Moving tests weakens real coverage accidentally. Name retained runtime tests and the reason for each removed prose expectation. Keep the command and recovery proofs at their actual boundaries.

R5. Broad Markdown parsing turns a docs rewrite into a tooling project. Cover the repository's chosen syntax and check image existence. Rendering/readability and animation semantics remain visual/judgment checks.

R6. A handwritten rollback test gives false confidence in edited shell steps. Describe its evidence accurately and compare the canonical instructions during review. Literal command extraction/execution must be an explicit criterion if wanted.

R7. A retired-term ban blocks factual migration explanations. Check the specific prohibited surface and consequence. Word absence alone is not a functional property.

### Missing question

Q2a. Does this chart require proof that the actual documented rollback block runs, or preservation of the current runtime recovery proof plus review of the moved instructions? The brief currently describes the existing test more strongly than its implementation supports.

## Q3. Keeping future docs current

### Pick, reason and cost

Pick (b): one short “where things go” page, using the existing implementation/review guarantees rather than adding another standing obligation.

The page should explain folder purposes and canonical fact ownership, with links to the human home and agent grounding index. Keep it short and structural. Do not add an exhaustive second feature inventory or repeating list of every page. An existing human docs home may carry this contributor section if that avoids a redundant file while remaining findable.

Cost: maintain the ownership guidance when the docs structure changes. No additional leaf execution rule is needed because the repository already requires documentation updates before review.

### Rejected options

(a), page plus new standing-design sentence: the substantive obligation already exists in implement-issue Shared context. Adding the same rule in standing-design creates another policy location with no new guarantee. The proposed narrower wording, only what the operator sees/does, could also obscure existing coverage of stale reference/area docs.

(c), nothing new: avoids policy duplication but leaves contributors guessing where the new documentation structure expects facts to live. The rewrite needs a discoverable ownership map, not a new enforcement mechanism.

### Evidence, tier, source and date

E11. Tier 3, skills/implement-issue/SKILL.md Shared context, located and inspected 2026-10-23: already says implementation updates every doc the plan names plus any doc the diff makes stale before review. Its check.fix section also requires affected docs/index updates.

E12. Tier 3, skills/plan-issue/SKILL.md Shared context and skills/check-issue/SKILL.md check.review, located/inspected 2026-10-23: planning finds candidate docs through grounding/areas/README, and reviewers follow affected docs and index pointers. This is an existing end-to-end responsibility, not reliance on unspecified reviewer goodwill alone.

E13. Tier 3, learnings/LESSONS.md, inspected matching lines 2026-10-23: stale-rule, ambiguous-referent, conditional dispatch and cleanup-timing cases all identify missed semantic coverage. Adding another generic update-docs sentence does not identify the owning page. The ownership map addresses the missing routing information.

### Pitfalls and removal steps

R8. Another rules file is treated as the fix for missed judgment. Reuse existing update/review obligations and make destinations easy to find. The chart's leaf contracts should name affected pages during this rewrite.

R9. “Where things go” becomes a duplicate table of contents. State the few ownership distinctions, link the real navigation and keep individual task descriptions in their actual pages.

R10. Maintenance guidance is invisible to agents. Link it through the existing grounding/index route and documentation home. Do not replace the code-grounding index or add a second index hierarchy.

### Missing question

Q3a. Given implement-issue already guarantees stale-doc updates before review, what new failure would a duplicate standing-design sentence catch? I found none. The requested change should supply the missing location guidance instead.

## Carried locks

Purpose folders, short README, repo Markdown and no tutorial remain taken. Implementation A remains claude, claude-opus-5-5, medium. These recommendations do not authorize unrelated test cleanup or runtime changes.

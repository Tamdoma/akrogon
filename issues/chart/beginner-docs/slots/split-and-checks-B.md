# Blind notes B: split-and-checks

Independent notes, 2026-10-23. Read current Question/Carries, examples Taken and named shape sections. Earlier audience, architecture, ownership and SVG decisions remain held. No A notes, merged notes or current Findings read. Only this return file is written.

## Q1. Work split

### Pick, reason and cost

Pick the five ownership areas in (a), with actual dependencies for delivered link targets and one explicit final navigation/removal owner. Reject the claim that fixed paths alone make all five leaves independently mergeable.

The door should finish the subject-to-page and concept-to-picture map before handoff. Each row needs the final path, reader goal, owning source/skill, picture, incoming links and owning leaf. Include legacy-page disposition and every affected test. That map is architecture work at this door, not a prerequisite implementation leaf whose answer the other contracts must guess.

A feasible staged shape uses the same five leaves:

L-reference owns reference pages, command table, ownership guidance and shared documentation test discovery. L-pictures owns the mapped assets. These can run independently if reference does not embed unavailable pictures or link unavailable destinations. If it does, there is a real prerequisite, not merely a scheduling preference.

L-use owns complete task pages and their directly affected test changes. It depends on the reference and picture targets it actually links. L-examples owns verified external narratives, their scrubbing and case-specific pictures only if that ownership is explicitly removed from L-pictures. Ordinarily all SVGs remain with L-pictures, so a case requiring its asset depends on it. Examples may depend on use for current how-to links.

L-start owns README, the human docs home, ordered start explanation and narrated external change, plus the final cutover: update docs/reference-index.md's human link, remove superseded docs/guide pages, and resolve remaining legacy incoming links. It lands after all destinations it advertises exist. It does not rewrite other leaves' finished subjects.

These are candidate actual prerequisites. Derive the final graph from links/assets in the door's map. Do not encode a five-leaf serial chain merely for convenient ordering, nor release unresolved references under the promise that another leaf will land later.

Cost: constrained parallelism and a deliberate migration strategy. Keeping the old guide until cutover temporarily retains legacy content while new pages are prepared. That is bounded transition work, not the final documentation architecture. If the operator disallows any intermediate copies on main, these five leaves cannot safely publish separately without a different atomic cutover arrangement. Settle that constraint before handoff.

### Sizing for one implementer session

The current README plus 17 guide pages contain about 19,156 words, measured this turn. “Reference” includes dense command/config/state/phase semantics and seven interacting test files across the migration. “Pictures” has no known final asset count because the operator expanded coverage to every introduced concept. Neither is demonstrably small just because it has one folder name.

Do not hand off until the map makes page and picture counts concrete. If reference or pictures is too large for a bounded implementation/report/review pass, split by coherent subject bundles, each with complete linked targets and named tests, rather than arbitrary file counts. For example, command/config reference versus state/artifact reference can be separate only once their cross-links and common test ownership are settled. The same applies to overview/chart pictures versus execution/reference pictures. No invented time estimate or context-token capacity is established by this consultation.

### Rejected options

(b), everything in one leaf: guarantees atomic moves and avoids migration ordering, but combines roughly 19k existing words, external-case research, unknown SVG count and test migration into one large unit. It weakens independent review and makes a late defect expensive to isolate. Consider it only if the settled scope becomes much smaller or intermediate publication is forbidden.

(c), a map implementation leaf first: unnecessary when the door can make and review the architecture now. Otherwise downstream ownership remains unsettled at handoff. Only genuinely unresolved product work should become a prerequisite, not documenting this door's own settled decisions.

### Evidence, tier, source and date

E1. Tier 1, taken decisions: purpose folders, short README, mapped subject/picture ownership, no tutorial, external real cases, no dates/private identifiers on public pages and current-state-only content. Read this session.

E2. Tier 3, source inventory 2026-10-23: wc -w README.md docs/guide/*.md = 19,156. README advertises the full guide. Legacy guide pages have previous/next links across subjects. tests/docs-links.test.ts currently enumerates docs/guide directly. A file move is a consumer/interface change, not only an authoring task.

E3. Tier 3, chart-issues assets/shapes.md Handoff tree and Leaf files, read 2026-10-23: only actual prerequisites enter blocked-by; cross-leaf claims need an accepting owner; done-criteria belong to the leaf's observable ownership; designs name altered preconditions and consumers. This supports dependency-based delivery instead of declaring all disjoint paths parallel by default.

### Pitfalls and removal steps

R1. Pages and assets are individually correct but cannot land alone. Check each leaf against its prerequisites' delivered tree: every new link target/image must exist at that merge boundary.

R2. L-start publishes links to unfinished siblings. Make it the navigation/cutover owner and depend on advertised destinations.

R3. “Last leaf removes guide” has no identifiable owner or deletes files whose tests remain. Assign final removal to a named leaf and list remaining legacy consumers in its contract.

R4. All SVG work is one unbounded leaf. Fix the concept/asset inventory at the door, then size coherent bundles. Do not impose an arbitrary maximum or quietly drop the operator's every-new-concept requirement.

### Missing question

Q1a. Are bounded intermediate legacy/new copies acceptable until a named final cutover, or must replacement be atomic on main? The five-way proposal needs a stated migration answer, not an assumption that fixed paths resolve it.

## Q2. Test changes during migration

### Pick, reason and cost

Pick (a)'s requirement that every merge remains valid, with one explicit owner per shared test file and test consumer. “Each leaf fixes its own tests” is insufficient where one test reads several leaves' pages.

Suggested ownership to make the five-area shape concrete:

T1. L-reference owns tests/docs-links.test.ts recursion/used image syntax, tests/hold-retired.test.ts and tests/run-permit.test.ts broad docs scanning, and tests/command-reference.test.ts relocation to the new canonical command page plus removal of its wording-only guide checks. Preserve existing source/skill scans and runtime retirement tests. This can land while old guide files still exist, avoiding special transitional fallbacks.

T2. L-use owns tests/rollback.test.ts's documentation pointer when the canonical rollback task exists and deletion of the affected docs wording assertion in tests/door-reset.test.ts. Preserve actual broken-release recovery and handover behavior tests. Retargeting does not make the rollback test execute the literal shell block.

T3. L-start owns removal of the README wording-only requirement in tests/log-reader.test.ts and the final legacy-link/removal verification. Preserve log-reader runtime tests and unrelated skill checks. If another leaf must edit any of these files, assign that explicitly rather than quietly giving two leaves ownership of the same test file.

Keep one deliberate-break demonstration per retargeted functional check, as already taken. Dead nested docs links, a missing command row and a prohibited existing retired literal in a nested docs page are meaningful examples. A deleted prose-word expectation is not a retargeted functional check needing a replacement word assertion.

Cost: earlier shared test migration and a small amount of dependency ordering. Existing tests already provide the checking surface; no new test file or duplicate inventory is required.

### Rejected options

(b), tests fixed at the end: leaves red or silently incomplete main during the migration. A later passing tree does not validate the intermediate delivered leaves.

(c), standalone tests-first prerequisite: cannot retarget readers to pages that do not exist without transitional guards or placeholder content. Fold discovery changes into the first leaf that has a real product destination. No new leaf is justified solely to move path strings.

### Evidence, tier, source and date

E4. Tier 3, named test consumers rechecked 2026-10-23: command-reference reads README, files.md and next.md; rollback reads README; door-reset reads chart.md; run-permit names setup.md/files.md; docs-links calls readdirSync on docs/guide. hold-retired already recursively scans docs. Therefore the affected test files do not partition automatically along the proposed content folders.

E5. Tier 3, standing-design.md Standing design lines, held from this session: smallest sufficient proof, retained real regression tests, reasoned deletion of false expectations and no hand-copied entry lists. Retarget existing checks without creating another docs test harness.

### Pitfalls and removal steps

R5. A test is green because it no longer discovers moved files. The required deliberate break must be inside the new nested destination and show the actual discovery path catches it.

R6. Tests force a second command table to remain in README. Move the consumer with its canonical table before README removes its copy. Final cutover removes obsolete authoritative duplication.

R7. Recursive retirement scanning starts reading chart provenance. Keep it scoped to README/docs plus the already owned scans. Chart research deliberately contains dates, private evidence and historical mechanisms; it is not the human publication surface.

### Missing question

Q2a. Will the handoff name one owner for each shared test file and each old page deletion? Without that, Q2(a) is a desired result, not an executable split.

## Q3. Pictures and publication checks

### Pick, reason and cost

Pick (a): explicit done-criteria using existing tools, existing link checks and B's semantic/visual review. No new SVG/privacy test file.

For every animated asset, preserve the taken direct-open reduced-motion check and save evidence of the full still state. Also inspect its intended img embedding at actual page width with normal motion at multiple points, both surrounding theme backgrounds and a narrow viewport. The earlier GitHub probe establishes the chosen embedding technique only within its recorded limits. A direct-open motion test is not proof of preference propagation into GitHub's embedded image document.

Review the diagram's meaning against the named source/skill, including allowed mode/route combinations and optional review/repair. Test image existence through docs-links. Neither check proves legibility or correct workflow arrows by itself.

For every published case and the start narrative, B reviews prose, quoted output, links, alt text and assets against the scrub list and the private source provenance. Recheck the selected external direct-route/landing evidence and Varhop's failed/merged distinction. Do not add dates or private source identities to the public page as a proof shortcut. A real watch intervention is included only when verified; otherwise current how-to documentation suffices.

Cost: bounded visual inspection per actual asset and semantic review per actual narrative. Fix the inventory before handoff so this cost is reviewable. Use the existing blepsis/browser path without adding a screenshot suite, privacy classifier or new dependencies just for this check.

### Rejected options

(b), automated SVG/privacy suite: a syntactically valid asset can show wrong relationships, and a word scan cannot judge whether a sanitized account still identifies a client. New test infrastructure does not remove those judgment requirements. Existing link/retirement checks remain as taken.

(c), review alone: misses the explicitly required browser reduced-motion evidence and leaves rendering dependent on source inspection. Existing tools can demonstrate those behaviors directly.

### Evidence, tier, source and date

E6. Tier 3, SVG Taken and probe limits held from this session: actual CSS-in-SVG animation worked in Chromium; embedded reduced-motion propagation was unproven. The taken criterion requires direct browser opening with reduced motion. Preserve its exact evidence scope.

E7. Tier 3, machine inspection earlier this session: blepsis and Chromium exist, blepsis supports reduced-motion emulation, viewport control and screenshots. package.json does not declare Playwright even though playwright-core happens to exist in local node_modules. Do not treat an incidental install as a reproducible consumer dependency.

E8. Tier 1, examples Taken read this turn: all public narratives use external projects, private cases are unnamed, dates are absent, current reference is linked and output is quoted only where still accurate. The leaf must verify landing and resolve the Varhop record conflict.

### Pitfalls and removal steps

R8. Screenshots show motion's end but not reduced-motion behavior. Capture immediately after loading with preference already set, then again later. A still appearance at the natural animation end proves little.

R9. Every image is readable at full resolution but illegible embedded. Inspect the final intended width and narrow layout. Keep labels visible throughout and at rest.

R10. Scrub review omits the start story or image metadata. Apply the publication criterion to every externally sourced narrative and associated asset, not only files under examples/.

### Missing question

Q3a. Will the asset/page inventory and existing-tool invocation be fixed before criteria are handed off, so the operator can see the actual visual-review scope? No new framework or live model proof is needed for these checks.

## Carried lock

One issue may hold all leaves. The owner ISSUE.md must begin with slots front matter setting A to harness claude, model claude-opus-5-5, effort medium before any leaf state is written. No B override is inferred. These notes propose dependencies and ownership, not permission to add runtime behavior or unrelated test cleanup.

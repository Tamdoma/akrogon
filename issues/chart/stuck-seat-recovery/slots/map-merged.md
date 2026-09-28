# Map merged: drain of framework #68-#85 and akrogon #32

Framework at 2708b59f1. Attribution: (A), (B), (C) or combinations.

## Ground facts (A,B,C)

- All 17 framework reports came from legacy Astro runs.
- v2 removes dev-build-astro and dev-anonymize-dom from the v2 route only (blueprint-route brief.md:12).
- The legacy route is still supported and rebuilt: runbook.md:106-114 "Legacy Old-Contract Rebuild" and :156 "stay on v1". Lock Q12 keeps the anonymizer for old-contract networks. legacy-scoped-style criterion 8 repeats the rebuild step. (B,C; A saw the runbook but underweighted it)
- v2 leaves merged except pool-smell-freeze (implement) and live-replay (failed at content-prep on pool smell). There is no proven end-to-end v2 run yet, so there is no proven migration path for old networks. (B,C)
- Shared code runs on both routes: generate-sitemap.ts, link-allocator.ts, content-weaver-contract.ts, page-kind-*.md, generate-persona.ts. A fix there helps both. (C)
- Renderer fixes need a new frozen renderer version and explicit upgrade for pinned sites, not edits to renderers/1.0.0/ (satellite-update-loop Q40-44). (B)

## Disposition

| # | v2 status | Legacy status | Evidence |
|---|---|---|---|
| 68 | applies | applies | generate-sitemap.ts:283-289 modulo parent, called by network-plan.ts (A,B,C) |
| 69 | obsolete | applies to every legacy rebuild | validate-parallel-execution.ts:240,292 blocks per-site-build (B,C) |
| 70 | obsolete, except the 404 residue: self canonical, no noindex (render-page.ts:240-251) | applies (pattern-layout-template.astro:32) | (A,B,C) |
| 72 | covered by satellite-build (render-page.ts:42,168-184) | raw `<footer><a>` still emitted by content-weaver-contract.ts:157-173 | (A,B,C). Remaining coverage problem moves to #80. (B) |
| 73, 74 | obsolete as shipped: v2 has no raster photos, only SVG logo, background, OG (site-dist.ts:19,294,404) | applies (build-image-model.mjs:51-69, generic prompts, prompt as alt) | (A,B,C). Whether v2 gets photos is a fork. (B,C) |
| 75 | covered for new networks by research pools and pool-smell | legacy slug pools unchanged | (A,B,C). Residue: `titleize(rawSlug)` and slugs not bound to a subject record (generate-sitemap.ts:443-482). (A,B) |
| 76 | applies: dilutor anchor = raw fetched title (link-allocator.ts:286-289, content-weaver-contract.ts:210) | applies | (A,B,C) |
| 77 | applies: page-kind rules print URLs in code spans | applies | (A,B,C) |
| 78 | applies: topn_list takes the full provider order, reviews take a slice (generate-sitemap.ts:447,482) | applies | (A,B,C) |
| 79 | partly covered by satellite-build variants and satellite-review. Residue: shared nav and 404 copy, nav wraps (styles.ts:69), no mobile menu, no menu-open or scrolled-state review | applies | (A,B,C) |
| 80 | applies and locked: plan-script criterion 6 "exactly one primary-client referral" per page. Worse on v2: site-dist.ts:173-189 plus render-page.ts:169 put one footer client link on 100% of pages | applies | (A,B,C) |
| 81 | article note removed. Uniform site footer `© name` plus one hostname link persists | applies | (A,B,C) |
| 82 | applies: persona has no author facts, page-kind-about.md demands an origin story | applies | (A,B,C) |
| 83 | applies: contact only in partner_business mix. Renderer bans raw HTML (render-page.ts:70) | applies | (A,B,C). Framework already has a Formspark library (`_shared/libraries/formspark/INDEX.md`). (B) |
| 84 | applies: static header only, no behaviour axis (styles.ts:67) | applies | (A,B,C) |
| 85.1, 85.3-5 | obsolete | applies (hash-asset-filenames.ts:7 `_astro` vs kit `_assets`, hash-css-classes.ts:191-230 halts, no `[class~=` rewrite) | (A,B,C). The operator's local patch is in a consumer tree, not the framework. (C) |
| 85.2 | obsolete | covered by legacy-scoped-style | (A,B,C) |

## Forks, most reshaping first

### L1 · What happens to the legacy route? (reshapes #69, #70, #85, legacy #73-#75)

- Stop rebuilding legacy, and move old networks onto v2 once v2 has a proven end-to-end run. Then retire dev-anonymize-dom and the legacy blueprint. Removes the whole anonymizer class. (C recommends, A close to it: A proposed closing the legacy reports as superseded)
- Keep rebuilding, and ship one bounded legacy repair leaf: parallel-hook dispatch fix, `_assets` guard, JS and `[class~=` forms, with before/after evidence. (B recommends: least rework for already-built networks)
- Freeze legacy output as-is, no rebuilds and no migration. (C lists)
- Pitfall: v2 live-replay is failed, so migration has no proven path today. Stopping rebuilds needs Q12 re-locked, and the runbook's rebuild section rewritten. (B,C)
- Pitfall: neither option ports the anonymizer into v2. (B)

### L2 · Must every page link the client? (reshapes #72, #76, #77, #80, #81)

- Recommended (A,B,C): no. Drop the 100% rule and the renderer's site-wide footer client link. B: zero or one contextual referral where it helps the reader. C: per-site rate with a ceiling. A: planned subset, body only.
- Alternative: keep one per page and vary placement and anchor. The footprint stays countable. (A,B,C)
- Pitfall: plan-script criterion 6 and every count of "exactly one referral" (content-batch, verify) change together. Citations to the client domain count against the same budget. (B,C)
- Source: Google Search spam policies on distributed footer links and ranking-driven links, accessed 2026-09-28. (B)

### L3 · Does v2 get raster photos? (reshapes #73, #74)

- Recommended (B,C): no, keep SVG and text. #73/#74 close for v2, and any future raster lane must carry image purpose and alt, never prompt text.
- Alternative: add a v2 fill step with separately authored alt. Restores a removed lane.
- Pitfall: photo-less sites are their own pattern. (C)

### L4 · Page planning shape (#68, #75 residue, #78)

- (B) Freeze subject, title, slug and parent-group records in research, and let scripts pick a coherent subset. Removes the mismatch at its source.
- (A,C) Hub-aware parent assignment in generate-sitemap plus topn count bound to actual review pages. Smaller change.
- #78 sub-choice (B): unreviewed ranked providers link to their sourced public site, or the list is cut to reviewed providers. B recommends the first.
- Pitfall: published routes must not be re-slugged on update. (B)

### L5 · About page (#82)

- (B) Recommended: real operator-supplied publisher facts, no personal origin story when none exists.
- (C) Persona gains a named author or founder. Held disagreement: B says a generated name is invented identity.
- Human prerequisite under B: the operator supplies publisher facts per network.

### L6 · Contact (#83)

- (B) Renderer-owned static Formspark form, using the existing Formspark library, with per-site form IDs.
- (A) Static contact page with email or an outbound link, no form.
- (C) Contact module with a mailto or external form URL.
- Human prerequisite under B: the owner creates the forms and supplies IDs before launch.

### L7 · Header and nav (#79 residue, #84)

- Recommended (B, C agrees on the axis): static or small pinned-nav variants, accessible mobile navigation, tested with long titles, open menu and scrolling. No compact-on-scroll animation.
- Source: Nielsen Norman Group, Page Laubheimer, Sticky Headers (2021), accessed 2026-09-28: stickiness depends on the task, it is not a default. (B)

## Proposed destinations

- D1 Referrals and citations: #76, #77, #80, #81, #72 residue. (B groups #76/#77 here, C puts #76 with #80 and #77 with #82, A splits #76/#77 off)
- D2 Topical page planning: #68, #78, #75 residue, #83 page mix. (A,B,C)
- D3 Publisher identity and contact: #82, #83 page. (B)
- D4 Renderer chrome and nav: #79, #84, #70 404 residue, contact module if L6 needs markup. (A,B,C)
- D5 Legacy route: #69, #70, #85 items 1/3/4/5, legacy #73-#75. Content set by L1. (A,B,C)
- D6 akrogon #32 (separate repos). (A,B,C)

## akrogon #32

Chain (A,B,C): `pi:manager.ts:1120-1127` records a retirement that missed its shutdown deadline. `:1252-1258` keeps the admission fault while capacity is 0. It clears only if the shutdown later resolves (`:1143-1150`) or the manager closes. `pi:index.ts:133-134` emits `herdr:blocked`. `pi:herdr-agent-state.ts:191-193` lets `blockedCount > 0` win over activity. akrogon `next.ts:175` counts blocked as busy, `:414` skips dispatch. watch-issues acts only on idle or absent seats and lists `/reload` under Never.

- (B) Nuance: an unconfirmed retirement does not prove the child stopped. The parent can be idle with a real unresolved fault.
- (A,B,C) The 1 h busy notification already exists in next.ts:181-200.

Fork K1 · Where does the fix go?
- (A,C) pi-extensions: stop publishing an admission fault as herdr `blocked` (A: drop the held claim, keep the one-shot notification. C: drop it, or use a distinct fault state that clears when the rejected pane is gone). Removes the misclassification for every consumer.
- (B) akrogon watch: show cause and activity evidence, notify on the first tick, allow one guarded `/reload` only when the parent is idle, input is empty and no live child is known. Fix upstream in parallel.
- Pitfall: `blocked` also covers real approval dialogs. Never treat every blocked pane as idle. (B,C)
- Pitfall: pi-extensions is its own repo with its own seat, currently running subagent-concurrency-three. (A,C)

Fork K2 (B) · Elapsed time: keep job age, add status age and last-progress evidence, one notification per condition. `busy_since` is only a lower bound on status age. (A noted the same gap as F4.)

## Rebuttal corrections (accepted, override the lines above)

- (B) link-allocator.ts is v2 only. Legacy link planning dispatches write-network-link-plan (satellite-network.md:41). An allocator fix does not repair legacy.
- (B,C) #68: local-QA parenting already covered (generate-sitemap.ts:291,470), article modulo parent remains (:283). #75: partly covered, unproven. pool-smell-freeze is still implement and live-replay failed on that check. Subject-slug binding is missing (:443,468,479).
- (B) #73: displayed photos are absent on v2, but the producer remains. site-dist.ts:355 calls bootstrap, and build-image-model.mjs:58,69 still emits subjectless prompts. #74 stays obsolete for v2.
- (B) #79 functional defect: site-dist.ts:397 builds nav from depth-0 pages only, and generate-sitemap.ts:480 gives every non-home route positive depth. So v2 nav omits sections. D4 acceptance needs usable section links.
- (B) #77: page-kind-topn_list.md:19 asks for the source URL in the sentence or a footnote. Code spans are the observed output, not an instruction. The fix defines readable citation output.
- (B) watch-issues SKILL.md:40 does act on busy seats with evidence. Its Never list (:47) does not mention /reload. The gap is no admission-fault diagnosis or recovery. The 1 h alert in next.ts:184,200 can be missed because the watch need not call next for a blocked-only leaf.
- (C) Chain adds: akrogon src/shell.ts:100 marks agent_blocked retryable, so dispatch retries in a loop.
- (C) Root cause: a permanent admission fault is published under a transient herdr status (`blocked`, meant for human input), so no consumer owns clearing it.
- (B) K1 reload condition: reload only with evidence that no live child ownership remains (manager.ts:1122 uncertain retirement, :1141 cleared on confirmed shutdown). Unknown means notify, not reload.
- (B) K2: busy_since is kept across working to blocked (next.ts:196), so the watch can overstate blocked age. It is not a lower bound.
- (C) K1 pitfall about the subagent-concurrency-three seat is (A) only.
- (C) L5: the persona already invents business_name, archetype and voice (generate-persona.ts:104-113). The real fork is operator-supplied versus generated facts for the whole persona.

## Sources

- better-than-training · inspected framework code at 2708b59f1, pi-extensions installed tamdoma-subagents, akrogon src and watch-issues, read 2026-09-28.
- better-than-training · Google Search spam policies, accessed 2026-09-28 (B). W3C WAI Images Tutorial (B). Formspark setup docs (B). Astro build.format reference (B).
- practitioner · Page Laubheimer, Nielsen Norman Group, Sticky Headers, 2021-04-04, accessed 2026-09-28 (B).
- Empty searches behind obsolete verdicts (C): parallel_override in orchestrator-wrapper.ts and runbook, design-fill-image-slots outside its skill, contact and formspark in dev-render-satellite, class~= in dev-anonymize-dom, sticky in styles.ts.

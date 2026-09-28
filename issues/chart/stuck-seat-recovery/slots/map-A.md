# Map A: uncharted drain (framework #68-#85, akrogon #32)

## Framework: route status

All 17 reports came from legacy runs (networks my-aesthetic-doctor-2026-q3, hoboken-nj-aesthetics-2026-q3, release 44612466, phases per-site-ia, per-site-build, per-site-dom-anonymize). The v2 manifest is `.claude/workspaces/seo/blueprints/satellite-network-v2.md:12-69`. Its satellite leaves are merged except live-replay (failed on pool-smell) and pool-smell-freeze (implement).

- OBSOLETE under v2: #69 (dev-build-astro leaves the route, blueprint-route brief.md:12), #70 (canonical is `siteUrl + urlPath`, render-page.ts:193-214), #73 (no photo slots, site-dist.ts:405-420), #74 (only `<img>` is the logo with `alt=""`, render-page.ts:117), #85 items 1-5 (no anonymizer; item 2 also covered on legacy by legacy-scoped-style).
- COVERED: #72 (footer block moved to renderer markup, satellite-build brief.md:45, render-page.ts:168-185), #75 (sourced pools plus pool-smell, research-pools brief.md:8, content-batch brief.md:35, pool-smell-freeze).
- APPLIES to v2:
  - #68: `resolveParentUrl` rotates `candidates[index % candidates.length]` (generate-sitemap.ts:283-289), imported by network-plan.ts:43.
  - #78: reviews take `providerOrder.slice(0, count)` but topn_list takes the full order (generate-sitemap.ts:465, 485).
  - #83: `contact` only in the partner_business mix (page-mix-tables.json). The renderer halts on raw HTML (render-page.ts:70-80), so no form path.
  - #76: dilutor anchor is the raw `<title>` (content-weaver-contract.ts:210, link-allocator.ts:288).
  - #77: page-kind rules print source URLs in code spans (page-kind-provider_review.md:20, page-kind-topn_list.md:19, page-kind-comparison.md:20).
  - #80, #81: one client link on every page, about 60% footer (link-allocator.ts:237-249, 293-307). New in v2: the renderer takes the first footer link site-wide and puts it in every page's footer (site-dist.ts:173-189, render-page.ts:169-172), a site-wide link on 100% of pages.
  - #82: persona has no author identity (generate-persona.ts:107-112).
  - #79, #84: renderer copy identical across sites ("Skip to content", 404, "Home", render-page.ts:143, 221, 243-248). No sticky header or header-behaviour variant (styles.ts:67, modules.json).
  - Residues: 404 gets a self canonical and no noindex (render-page.ts:240-251). Titles are `titleize(rawSlug)` (generate-sitemap.ts:482).
- Legacy is maintained on purpose: v1 manifest unchanged, runbook.md:156 "stay on v1", runbook.md:108-114 legacy rebuild, satellite-update-loop excludes legacy (forks/update-loop.md:15). Retirement waits for the operator to confirm none remain (satellite-build design.md:29).

## Framework: destinations for APPLIES items

1. Sitemap and page mix (plan-script): #68, #78, #83 contact page, titleize residue.
2. Client-link plan and placement (link-allocator plus renderer footer): #80, #81, the site-wide footer link.
3. Writer link rendering (content-weaver plus page-kind rules): #76, #77.
4. Persona author identity (generate-persona plus page-kind-about): #82.
5. Renderer chrome variety (renderer): #79, #84, 404 residue.

## Framework forks

Q1 · Do legacy-route defects get fixed? (reshapes #69, #85, and the legacy half of every APPLIES item)
- A (recommended) No new legacy fixes. v2 fixes only. #69, #70, #73, #74 and #85 close as superseded by v2, citing the v2 lines above. The live legacy networks keep the operator's local anonymizer patch until they move or retire. One route to fix instead of two.
- B Fix legacy blockers too (#69 per-site-build, #85 items 1/3/4/5). Keeps legacy rebuilds working, but doubles every fix across two builders.
Pitfall: v2 has no migration path for existing networks. Under A, a legacy rebuild depends on an uncommitted local patch.

Q2 · Client link: one per page, or a page subset? (#80, #81, and the renderer's site-wide footer link)
- A (recommended) Client link on a planned subset of pages, body position only. Delete footer-position client links and the renderer's site-wide footer link. Removes the network-wide 100% footprint and the uniform end-of-article marker at once.
- B Keep one per page, vary footer placement per site. Keeps the 100% footprint, which is the detectable pattern.
Pitfall: plan-script brief.md:33 locks "exactly one primary-client referral"; A changes that lock.

Q3 · Contact page on non-partner sites without a form? (#83)
- A (recommended) Add a static contact page (email or an outbound link, no form) to every mix. The renderer's no-raw-HTML rule stays.
- B Add a form path. Needs a form backend and a raw-HTML exception.

Further forks for the per-destination rounds: #82 author identity source (research pools vs generated), #79/#84 which chrome elements vary and how the review checks it, #68 topical matching rule.

## akrogon #32

Root cause: tamdoma-subagents holds a `herdr:blocked` claim for the whole admission-fault episode (index.ts:133-134, admission-fault-surface brief.md:2-3, criterion 3: the episode ends only at manager disposal). herdr "blocked" means waiting on user input. The seat finished its phase without helpers and was not waiting for anyone. akrogon counts `blocked` as busy (src/next.ts:175), so the leaf stalled.

Already present: akrogon next notifies a seat busy over 1 h (next.ts:180-212, `STALL_MS`, `busy_notified`), which covers the report's F3. The watch's age suffix uses `busy_since` (observe.ts:224-225), which is set on first busy observation, not status entry (F4).

Q4 · Where does the fix go?
- A (recommended) pi-extensions: drop the held `herdr:blocked` claim on admission faults and keep the one-shot `herdr notification show`. The pane then reports its real state, so akrogon and the watch need no new rule. Removes the class: a stale flag cannot exist.
- B akrogon watch-issues: add a rule for blocked seats that look idle, with `herdr pane run /reload`. Adds a remedy that types into a pane herdr says needs input.
Pitfall: A undoes part of admission-fault-surface (akrogon#16), whose aim was an operator signal. The notification keeps that signal. The pi-extensions seat also runs the other session's subagent-concurrency-three leaf.

## Sources

- better-than-training · inspected code at the lines above, read 2026-09-28.
- better-than-training · pi-extensions issues/closed/subagent-admission-stall/admission-fault-surface/brief.md, read 2026-09-28 · why the held claim exists.
- practitioner · not searched yet for link-footprint (Q2); to be researched in that fork's round.

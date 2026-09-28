# Territory map C: framework #68-#85 (anonymizer items) + akrogon #32

Written 2026-09-28 against framework origin/main 2708b59f1 and akrogon working tree. All paths relative to `/home/ivan/Work/infra/tamdoma/framework` unless prefixed `akrogon:` or `pi:` (`~/.pi/agent/extensions/tamdoma-subagents`).

## 0. Ground facts the whole map rests on

- **Two routes exist.** Legacy blueprint `satellite-network.md` (Astro via `dev-build-astro`, then `dev-anonymize-dom`). v2 blueprint `satellite-network-v2.md` (14 phases, `dev-render-satellite` renderer, no anonymizer, lock process-shape Q2). `blueprint-route` brief line 12: dev-anonymize-dom and dev-build-astro leave the v2 route.
- **Old-contract networks are still rebuilt on the legacy route.** Evidence: `.claude/workspaces/seo/satellite-network/runbook.md:106-114` "Legacy Old-Contract Rebuild ... 2. Rerun per-site-build, per-site-dom-anonymize, per-site-audit on this release ... #53 stays open for any old output not rebuilt". Lock legacy-retirement Q12 keeps the anonymizer for them. Merged leaf `legacy-scoped-style` criterion 8 repeats the same rebuild step. So every "legacy-only" defect below is live until either the rebuild mandate is withdrawn or those networks are migrated to v2 (fork F1).
- **v2 leaves** (all `phase: merged` except `pool-smell-freeze` implement and `live-replay` failed at content-prep): fixture-network, research-pools, plan-script, design-tokens, content-batch, satellite-build, satellite-review, blueprint-route, legacy-scoped-style.
- **Shared v2 code under legacy and v2:** `arch-differentiate-satellite-anatomy/scripts/generate-sitemap.ts`, `arch-plan-satellite-network/scripts/link-allocator.ts`, `write-satellite-content/scripts/content-weaver-contract.ts`, `write-satellite-content/subroutines/targeted/page-kind-*.md`, `arch-define-entity/scripts/generate-persona.ts`. Defects there hit both routes.

## 1. Per-report disposition

| # | Route that produced it | Status under v2 | Surface (v2) or legacy evidence |
|---|---|---|---|
| 68 round-robin section parents | Legacy run, shared code | **Still applies (v2)** | `generate-sitemap.ts:283-289` `resolveParentUrl` returns `candidates[index % candidates.length]`; hub and leaf slugs drawn independently at `:440-446`. Runs in v2 plan-script. |
| 69 parallel mandate blocks dev-build-astro | Legacy only | **Obsolete on v2; still bites every legacy rebuild** | Hook `.claude/hooks/validation/validate-parallel-execution.ts:240` reads `parallel_override`, `:292` BLOCK. Grep for `parallel_override` in orchestrator-wrapper.ts and the runbook: nothing. Legacy blueprint per-site-build still `parallelizable: true, parallel-with: per-site-dom-anonymize`. |
| 70 `.html` canonical / `_astro` paths | Legacy only | **Obsolete on v2; legacy still applies** | Legacy: `dev-build-astro/kit/pattern-layout-template.astro:32` `canonicalUrl = Astro.url.href`, `kit/pattern-astro-config-template.mjs:87` `format: 'file'`. v2: `dev-render-satellite/scripts/render-page.ts:193-194` `canonicalUrl = siteUrl + urlPath`. |
| 72 bare footer client link outside chrome | Legacy run, shared contract | **Resolved by merged satellite-build (renderer)** | `render-page.ts:42` strips the authored `<footer>`, `:168-184` puts the link inside real footer chrome. The contract still emits the bare `<footer><a>` at `content-weaver-contract.ts:157-160,173`; harmless on v2, still raw on legacy. |
| 73 image prompt codex duplicates | Legacy only | **Obsolete on v2 as shipped, because v2 has no photo fill at all** | `dev-render-satellite/scripts/site-dist.ts:19` runs only `design-bootstrap-image-slots` (SVG logo/background/og-card, `:294`). No reference to `design-fill-image-slots` outside its own skill. Renderer's only `<img>` is the logo, `render-page.ts:117`. `prompt-components.json:10-15` subjects still generic for legacy. |
| 74 prompt text used as alt | Legacy only | **Obsolete on v2 (same reason as #73); legacy still applies** | Same evidence. Logo alt is `""` at `render-page.ts:117`. |
| 75 machine-looking slugs | Legacy pools | **Obsolete for new v2 networks; legacy pools still formulaic** | v2 pools come from research citations, `arch-discover-providers/subroutines/discovery/search-pools-citations.md:24`; `_shared/scripts/pool-smell.ts:104-114` + `llm-tic-bans.json` ban `^top-[0-9]+` etc. Legacy `data/slug-pools/` unchanged (blocked by pool-smell-freeze, still `implement`). |
| 76 dilutor anchor = page title | Legacy run, shared code | **Still applies (v2)** | `link-allocator.ts:286-289` dilutor `{title: citation.title}`; `content-weaver-contract.ts:210` renders `[title](url)`; called from `assemble-page.ts:303,326`. |
| 77 raw URLs in code spans | Legacy run, shared prose rules | **Still applies (v2)** | Rule unchanged in `page-kind-provider_review.md:20`, `page-kind-topn_list.md:19`, `page-kind-comparison.md:20`; content-batch maps units to these; renderer markdown-it `html:false` (`render-page.ts:80`) renders code spans verbatim. |
| 78 topn ranks more providers than review pages | Legacy run, shared code | **Still applies (v2)** | `generate-sitemap.ts:411` loads full provider order, `:447` review pages take `slice(0, count)`, `:482` topn_list gets the whole order. |
| 79 chrome convergence | Legacy only (Astro kit chrome) | **Largely covered by merged satellite-build + satellite-review** (Q10/Q11 distinctness) | v2 chrome is renderer-fixed: `render-page.ts:107-126` three header variants, `modules.json` 3/3/2/2/2 variants. Residual: nav `flex-wrap: wrap` (`templates/styles.ts:69`) and no mobile menu on any site. |
| 80 every page links the client | Legacy run, shared plan | **Still applies (v2), and is locked in** | `link-allocator.ts:216-250` `placementsFor` gives every page footer or body placement; plan-script criterion 6 "Every page has exactly one primary-client referral". `site-dist.ts:173-189` additionally puts one site-wide footer link on every page. |
| 81 uniform footer marker across sites | Legacy run | **Persists on v2 in a new form** | Every v2 site footer = `© name` + one `<p><a class="text-role-link">hostname</a></p>` (`render-page.ts:168-184`, `site-dist.ts:173-189`); only two footer variants in `modules.json`. |
| 82 persona lacks author identity | Legacy run, shared code | **Still applies (v2)** | `generate-persona.ts:104-113` Persona has no founder/author fields; `page-kind-about.md:11,20,33` asks for an origin narrative from that persona. |
| 83 no contact page | Legacy run, shared mix + renderer | **Still applies (v2)** | `page-mix-tables.json` gives `contact` only to partner_business (`generate-sitemap.ts:171-172`). Renderer has no contact/form module (grep `contact`, `formspark` in dev-render-satellite: nothing); `assertNoRawHtml` `render-page.ts:69` blocks a hand-written form. |
| 84 no sticky header | Legacy run | **Still applies (v2)** | `templates/styles.ts:67-70` `.site-header` static; `modules.json` header_nav has no behaviour axis. |
| 85 item 1 `_astro` rename halts | Legacy only | **Obsolete on v2; legacy still applies** (CHART lists #42.3 obsolete under renderer, but the rebuild mandate keeps it live) | `dev-anonymize-dom/scripts/hash-asset-filenames.ts:7` hardcodes `_astro`, `:12` renames without a guard; kit writes `assets: '_assets'` (`pattern-astro-config-template.mjs:90`). |
| 85 item 2 `data-astro-cid` residue | Legacy only | **Covered by merged legacy-scoped-style (#53)** | `verify-post-anonymization.ts:80` now checks `data-astro`; `whole-skill-default.md:257` writes `scopedStyleStrategy: 'class'`. |
| 85 items 3-4 class hasher halts on dynamic classes / unknown API names | Legacy only | **Obsolete on v2; legacy still applies** (= #44 residual) | `hash-css-classes.ts:191,219,225,230` halt on non-StringLiteral; `:147` `unknownClassApiNames`. |
| 85 item 5 `[class~=` selectors unhashed | Legacy only | **Obsolete on v2; legacy still applies** | grep `class~=` in dev-anonymize-dom scripts: nothing. Operator's local patch is in a consumer tree, not framework (git status clean at HEAD). |

Off route, not mapped: #85 logs/dev item (already moved to #86 with the effort items).

## 2. Proposed destinations (grouped by shared outcome)

- **G1 Sitemap topical structure** (#68, #78, #83 page mix): one leaf on `generate-sitemap.ts`. Hub-aware parent assignment, topn count derived from actual review pages, contact page in every mix. Outcome: a sitemap a human would draw.
- **G2 Client-link footprint** (#80, #81, #76): one leaf on `link-allocator.ts` + `site-dist.ts` + `content-weaver-contract.ts`. Per-site link rate below 100%, drop the site-wide footer link or make it a variant, dilutor anchors from citation context not title. Outcome: no per-site footprint that names the client on every page. Needs plan-script criterion 6 amendment (fork F2).
- **G3 Prose rules** (#77, #82): one leaf on `generate-persona.ts` + `page-kind-*.md`. Persona gains a named author/founder, citation rule replaces code spans with linked source names. Outcome: pages read as written by someone.
- **G4 Renderer chrome behaviour** (#84, #83 contact module, #79 residual): one leaf on `dev-render-satellite`. Header behaviour axis (static/sticky), contact module with a mailto or external form URL, nav overflow variant. Outcome: chrome variety on axes a visitor notices.
- **G5 v2 photo fill gap** (#73/#74 reframed): v2 ships SVG-only. Either accept SVG-only as the v2 design (close #73/#74 as obsolete) or plan a v2 fill step with alt text authored separately from prompts. Decide in fork F3.
- **G6 Legacy rebuild** (#69, #70, #72 raw footer, #85 items 1,3,4,5, legacy #73/#74/#75): either one "legacy patch" leaf (route dev-build-astro off the parallel hook, `_assets` guard, `[class~=` handling, halt-to-warn on unknown class APIs) or zero work if legacy rebuilds stop. Decide in fork F1.
- **G7 akrogon #32** (section 4): fix in pi-extensions, akrogon, or watch-issues rules. Fork F4.

## 3. Material forks

**F1. Do old-contract networks keep being rebuilt on the legacy route?** (reshapes G6, and the #85 scope)
- O1 Stop rebuilding legacy. Migrate old networks through v2 network-build once the renderer is stable, retire dev-anonymize-dom and the legacy blueprint. Recommended. Removes the whole anonymizer problem class (#69, #70, #85 items 1,3-5, legacy #73-#75) instead of patching five scripts. Pitfall: v2 live-replay is still failed at content-prep (pool-smell-vs-recorded-pools), so migration has no proven end-to-end run yet; Q12 must be re-locked.
- O2 Keep rebuilding, ship one legacy patch leaf for G6. Cheapest short term, but every future legacy defect re-enters the same queue.
- O3 Freeze legacy output as-is (no rebuilds, no migration). Zero work, leaves #53-class residue live on old domains.

**F2. Must every page link the client?** (reshapes G2)
- O1 Amend plan-script criterion 6 to a per-site rate with a ceiling (recommended, matches #80's own evidence that 100% is a footprint). Pitfall: content-batch and verify steps that count "exactly one referral per page" need the same amendment.
- O2 Keep 100% but vary placement and anchor. Cheaper, footprint remains countable.

**F3. Does v2 get raster photos at all?**
- O1 Accept SVG-only, close #73/#74 obsolete (recommended for now, cost and the token-only colour lock Q34 already point this way). Pitfall: sites without photos are their own recognisable pattern.
- O2 Add a v2 fill step reusing `design-fill-image-slots` with alt authored by the page writer. Reopens the prompt-codex work.

**F4. Where does #32 get fixed?** See section 4.

## 4. akrogon #32 root cause

Chain, with file:line:
1. `pi:manager.ts:1120-1127` a retirement that misses its shutdown deadline is recorded in `rejectedRetirements` and `updateAdmissionFault` runs. `:1252-1258` `impossibleAdmission` keeps returning the fault while capacity is 0 and `rejectedRetirements` is non-empty. It clears only if the shutdown later resolves (`:1143-1150`) or the manager closes. Under a pane that never confirms, this is permanent.
2. `pi:index.ts:133-134` `onAdmissionFault` emits `herdr:blocked`. `pi:herdr-agent-state.ts:191-193` any `blockedCount > 0` yields state `blocked` regardless of `agentActive`; `:211-226` only decrements on an inactive event that never comes.
3. `akrogon:src/next.ts:174-176` `busy()` counts `blocked` as busy; `:414` skips dispatch for a busy pane; `:458` never re-dispatches. `akrogon:src/shell.ts:100` marks `agent_blocked` retryable, so retries loop. `skills/watch-issues/SKILL.md:36,40,47-57` Waiting acts only on idle/absent, Busy judges the screen only, and `/reload` is on the Never list. `next.ts:183-199` starts `busy_since`; STALL_MS 60 min only notifies.

Root cause in one line: a permanent subagent-admission fault is published under the herdr status `blocked`, which every consumer treats as "agent is busy waiting for a human", so nothing owns clearing it.

Forks:
- O1 Fix at the source in pi-extensions: do not emit `herdr:blocked` for an admission fault, or emit a distinct `herdr:fault` state and auto-clear when the rejected pane is gone. Recommended. Removes the misclassification for every consumer, akrogon included. Pitfall: pi-extensions is a separate repo with its own release path; needs a herdr state enum change.
- O2 Fix in akrogon: treat `blocked` with an idle screen and no pending prompt as idle after N minutes, and allow a `/reload` dispatch. Guards the symptom, keeps the wrong state in herdr.
- O3 Fix in watch-issues rules only: let Waiting act on `blocked` + idle screen. Cheapest, but the rule then contradicts the Never list and relies on screen reading.

## 5. Sources

- Framework seeds `issues/seeds/68..85-*.md`, dated 2026-09-15 to 2026-09-27. akrogon `issues/seeds/32-*.md`.
- `issues/chart/satellite-network-simplify/CHART.md` (handed off 2026-09-26, Bug disposition covers #39-#65), `issues/open/satellite-network-simplify/` EPIC, ISSUE.md, leaf briefs listed in section 0. Locks quoted: process-shape Q2, Q10, Q11, Q16, Q33, Q34; legacy-retirement Q12; blueprint-route brief line 12.
- Charts read: satellite-update-loop (depends on renderer, amendments A3-A8), satellite-network-operations (resolved 2026-09-13).
- Skills read: dev-render-satellite, dev-build-astro, dev-anonymize-dom, design-bootstrap-image-slots, design-fill-image-slots, arch-differentiate-satellite-anatomy, arch-plan-satellite-network, arch-define-entity, arch-discover-providers, write-satellite-content, write-satellite-batch, `_shared/scripts/pool-smell.ts`, `.claude/workspaces/seo/satellite-network/runbook.md`.
- pi-extensions `~/.pi/agent/extensions/tamdoma-subagents` at commits ca69dbb, 6eb2a10. akrogon `src/next.ts`, `src/observe.ts`, `src/shell.ts`, `skills/watch-issues/SKILL.md`.
- Anthropic "Building Effective AI Agents" (2024-12-19), cited by process-shape, not re-fetched.
- Searches that found nothing: `parallel_override` in orchestrator-wrapper.ts and runbook; `design-fill-image-slots` referenced outside its own skill; `contact` and `formspark` in dev-render-satellite; `hero`, `inline_1`, `webp` in render-page.ts; `class~=` in dev-anonymize-dom scripts; `sticky` in `templates/styles.ts`; herdr binary source for the `agent_blocked` refusal under `~/Work`.
- framework `git status` clean at HEAD 2708b59f1 on 2026-09-28; the #85 local anonymizer patch is not in this tree.

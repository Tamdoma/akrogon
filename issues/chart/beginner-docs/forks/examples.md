# examples

## Question

Q1. What story does start/ "how one change flows" tell (an explained walk-through, not a task for the reader): (a) one real, small, finished akrogon change retold from its records, with real commands and trimmed real output; (b) an invented change in an invented project, with made-up output; (c) an invented story that every step links to a real case?

Q2. Which real cases go into examples/: (a) a small set where each case shows one distinct way of working (direct route, full lifecycle, autopilot charting, a failed leaf carried forward, watch while away), taken only from public repos or scrubbed; (b) akrogon's own cases only; (c) no real cases?

Q3. How do case pages stay true as the tool changes: (a) dated case studies ("what happened on <date> at commit <sha>") that explain and link to current reference pages, never act as instructions; (b) kept up to date as how-to pages; (c) no rule?

Q4. What must be removed from a published case: (a) other people's paths and names, client/customer names, private repo names, secrets and session ids, checked by a review list in the leaf; (b) only secrets; (c) publish only what is already public on GitHub?

### Carries

- Taken: forks/reader-and-home.md (beginner with terminal + one agent CLI, Linux), forks/doc-architecture.md (start/ use/ reference/ examples/; start/ is an ordered explanation ending in a narrated example, no tutorial, no practice project), forks/fact-ownership.md (docs describe current state only), forks/svg-set.md.
- Lock: implementation seat A = claude, claude-opus-5-5, effort medium.
- Operator words (intake): "real-life use cases", "follow my real workflow from the past 2-3 weeks", Q3 doc-architecture: "Don't make this a tutorial ... don't ask them to do something specifically as a task."

## Findings

Merged notes: slots/examples-merged.md (A,B agree on 1a with orphan-pane, 2a public-first with three cases, 3a with date as provenance only, 4a keeping public names and links). B notes: slots/examples-B.md. Rebuttal: slots/examples-rebuttal-B.md (attribution only, applied). Visibility via gh repo view 2026-10-23: akrogon and varhop public, P1 and P2 private.

## Taken
- Operator 2026-10-23, verbatim: "1 - make it something more realistic based on some of the real projects, not akrogon iteself | 2 - make them from projects outside of akrogon | 3 - don't mention dates | 4a". Final-shape check: slots/examples-final-check-B.md (applied).
- Q1: the start/ narrated change is based on a real change in a real project outside akrogon (candidates: P1 autopilot batch, a P2 leaf, varhop overlay-rework). Private projects are described by what they are ("a company website", "a translation web app"), never by name. Steps use today's commands and files. Recorded output is quoted only where it matches today's tool, otherwise plain prose.
- Q2: examples/ cases come only from projects outside akrogon, each showing a different way of working. Verified on main 2026-10-23: direct route = P1 direct fix ((sha in provenance), private, unnamed); autopilot charting into lifecycle = P1 autopilot batch (private, unnamed); failed leaf carried forward = varhop overlay-rework (public, may be named and linked). Watch gets a case only with a record proving the watcher's effect; otherwise a how-to only. The leaf re-checks landing on main and the failed-then-merged record conflict in varhop before telling it.
- Q3: no dates on any page. Cases describe what happened using today's commands and link current reference pages. Provenance (repo, commit, record path) stays in chart and leaf notes only.
- Q4 = a: remove home paths, other people's names, client names, private repo names, session ids and secrets. Keep public names and links (varhop). One review per page of text, links and images.
- Privacy of this chart (2026-10-23): issues/chart is pushed to public main, so private project names, paths and SHAs were moved to scratch/provenance.md (gitignored, registered root) and replaced by P1/P2 in chart files (slots/page-map-B.md F1). Start story chosen: P2 two-step sign-in leaf (merged, landing checked by B).

# Signposts missed angles (slot C)

Keep draft Q1 (route/mode vocabulary — genuine collision between operator's "manual route" and skill's "manual mode"; evidence cannot settle it). Drop or replace Q2–Q6 and the carried-over `unblocked-runs` priority rank as below.

## Draft items evidence already settles (do not ask)

- **Carried-over priority ("speed and price")**: Engineering tradeoff from `unblocked-runs`; does not resolve the real tension in `INTAKE.md` (`Source: operator`) between "explain everything in detail" and "do not get bogged down into technical details." Replace with Angle 1.
- **Draft Q2 (two layers vs one mixed layer)**: Settled by `INTAKE.md` + tests. Mixing CLI flags, JSONL schemas, and shell recovery into PM prose violates the intake; dropping them breaks `tests/command-reference.test.ts`, `tests/docs-links.test.ts` (`checks.md`, `files.md`), `tests/rollback.test.ts` (`roll-back-a-release.md`), and `tests/watch-timer.test.ts` (`watch-while-away.md`, `skills.md`, `watch-loop.svg`). Replace with Angle 3.
- **Draft Q3 (rebuild vs add on top of 33 pages)**: Settled by `INTAKE.md` ("redo the structure", "rewrite the entire documentation architecture") and `docs/reference/where-things-go.md` (`One home per fact`). Replace with Angle 3.
- **Draft Q4 (static vs "keep animated SVGs")**: Misframed. Only 5 of 19 SVGs in `docs/pictures/` animate (`factory-overview`, `chart-door`, `two-seats`, `change-flow`, `working-day`), all rejected as unintuitive, and `INTAKE.md` already dedicates Opus 5.5 to redrawing SVGs. Replace with Angle 5.
- **Draft Q5 (name `akrogon`/`framework` vs every registered repo)**: Settled by confidentiality. `~/.akrogon/config.yaml` lists private client repos (`MDConsultingNY/*`, `clinique-la-roya`, `boulevard-automation`) that public docs already anonymize (`docs/examples/autopilot-story.md`), while `INTAKE.md` names `framework` and `docs/examples/recovery-story.md` already publicly links `varhop`. Replace with Angle 6.
- **Draft Q6 (three-tab Herdr recommended vs only way)**: Settled by code + `INTAKE.md`. `src/hc.ts` (`resolveSpace`) mechanically requires a live `herdr-app` space named after the repo (and direct, autopilot, and watch require `hc`), while the `t-`/`c-`/`w-` tab names are unchecked convention. Draft 6a ("not required") risks falsely implying Herdr is optional. Teach the operator's 3-tab setup and note space = required, tab names = convention.

## Missed angles to ask

1. **Docs priority order when goals collide?**
   - **a (rec)**: First-time PM clarity and scanability first, then exact factual accuracy, then full feature breadth.
   - **b**: Complete day-to-day detail first, then plain language, then brevity.
   - **Steers**: Page length ceiling, how much edge-case detail stays in chapters vs gets cut or linked, and writer-leaf guardrails.

2. **What job does `README.md` do on GitHub versus `docs/`?**
   - **a (rec)**: Short GitHub front door (PM value prop, one hero SVG, plain prerequisites, numbered chapter map into `docs/`).
   - **b**: Self-contained guide in `README.md` (3 tabs, charting, lifecycle, merge on the front page; `docs/` only for install and reference).
   - **c**: `README.md` holds Chapter 1 (install/setup + multi-repo map); remaining chapters live in `docs/`.
   - **Steers**: `README.md` length, hero SVG placement, whether `docs/README.md` stays, chapter split, and leaf split.

3. **Cut line for secondary features and test-pinned technical pages?**
   - **a (rec)**: Core chapters (setup + 3 tabs, charting, lifecycle, merge + watch) plus 1 short "When work stops & optional tools" chapter; keep `docs/reference/` (and test-pinned rollback/watch contracts) as an out-of-the-way lookup shelf so tests stay green untouched.
   - **b**: Core chapters only; push every secondary topic (recovery, park/pause/stop, GitHub seeds, lessons, Discord broadcast, sync) into `docs/reference/`.
   - **c**: Strip technical reference/rollback pages out of human docs and update the 4 doc-pinning tests (keeping `docs/README.md` and `docs/reference/where-things-go.md` that out-of-scope `docs/reference-index.md` links).
   - **Steers**: Final page list, what is cut vs folded, whether this chart stays docs-only or adds a test-update leaf, and maintenance scope.

4. **What technical baseline does Chapter 1 assume?**
   - **a (rec)**: Reader already runs a coding agent in a terminal; explain *why* each piece exists in plain English, give one starter config + brief model/harness pairing guidance (charting vs seats A/B), and link out for OS/tool installs.
   - **b**: Zero-to-one onboarding explaining Linux/systemd, Git worktrees, Herdr, and CLI setup from scratch.
   - **c**: Minimal setup page that delegates setup to `/init-akrogon` and focuses almost entirely on daily workflow.
   - **Steers**: Chapter 1 depth, glossary floor, whether grounding/worktrees/systemd appear in the guide, and whether harness/model recipes are covered.

5. **Visual grammar and GitHub theme handling for the new Opus 5.5 SVGs?**
   - **a (rec)**: 5–7 wide, static, plain-English workspace/story diagrams (3-tab Herdr mockup, one-Akrogon-to-many-repos hub with `framework`, route/mode comparison, A/B handoff swimlane, merge + overnight watch), styled for both GitHub light and dark themes.
   - **b**: Minimalist box-and-arrow flowcharts only (no workspace/UI mockups), static, landscape.
   - **c**: Same visual story diagrams as (a) with subtle looping motion on flow arrows.
   - **Steers**: SVG count and leaf scope, Opus 5.5 art brief, label vocabulary, and dark/light rendering method.

6. **How should examples teach the workflow (including `framework` and `docs/examples/`)?**
   - **a (rec)**: Thread one concrete PM-relatable example (a feature + a quick fix) across chapters, use `framework` + `akrogon` in Chapter 1's multi-repo diagram to show one install driving registered repos, and retire `docs/examples/` and `docs/start/one-change.md`.
   - **b**: Rewrite today's real-world stories (`framework`, `varhop`) in plain PM prose as a dedicated Examples chapter instead of a threaded walkthrough.
   - **c**: Short inline mini-examples per concept only; drop `docs/examples/` and `docs/start/one-change.md`.
   - **Steers**: Whether `docs/examples/` survives, cross-chapter narrative continuity, how `framework` is showcased, and writer-leaf boundaries.

# Documentation upkeep: independent territory map B

The updater is **implement-issue**, not a documentation generator. It already tells the implementation seat to update affected docs before review. This sometimes works for both agent and human docs, but it does not reliably discover omissions. The smallest useful change is to make documentation impact explicit in planning, implementation and review, using existing repository entry points. No watcher, additional phase, standalone program or mandatory new config field is needed.

## Current mechanism and its limits

1. **M1 — Initialization:** `skills/init-issues/SKILL.md:56-60` reuses a suitable index or creates `docs/reference-index.md`, adding AREA files only when an area needs more than an index line. AREA files are not required in every repo. This is setup, not a continuous inventory builder.
2. **M2 — Discovery:** `skills/plan-issue/SKILL.md:25-27` reads the configured index and relevant areas, carries useful paths into the plan and reports missing resources. It does not explicitly require identifying human-facing instructions affected by the planned behavior.
3. **M3 — Updating:** `skills/implement-issue/SKILL.md:27` says to update affected docs and area index entries before review. Line 57 repeats this for repair passes. “Docs” already encompasses human documentation, but the rule does not say how to find it or explain why none needs changing. Index reads are limited to gaps.
4. **M4 — Review:** `skills/check-issue/SKILL.md:33` follows affected docs/index pointers, but line 35 explicitly checks only AREA files in the diff and forbids opening other area files for that check. It does not cover an unchanged stale AREA file or reference index. Line 47 leaves authorship with B, so review should report defects rather than become a second writer.
5. **M5 — Configuration:** `src/config.ts:35-43` already accepts `grounding.index`, `grounding.docs`, `grounding.surfaces`, `grounding.indexed_scopes`, or `grounding: none`. A search of `src/` and `skills/` found no explicit readers of the three non-index subfields. Adding another path list without a defined consuming instruction would not solve discovery.

This is an agent-followed instruction chain. Git evidence demonstrates updates, not that the instruction caused them. A link check proves a target exists, not that its description remains true. No basis was found to promise flawless automatic freshness.

## Measurement method and repository coverage

Read `akrogon config` to enumerate all six registered roots. Inspected tracked AREA/reference-index files outside `issues/` and confirmed the inventory with `rg --files --hidden`. Checked Markdown links relative to their document and concrete inline repository paths from the repo root. Commands, slash commands, package names, globs, example placeholders and contextual filename abbreviations were adjudicated separately rather than reported as broken files. Never opened env files.

For history, filtered each `issues/log.jsonl` to `repo == registered key` and `to == merged`. Measured the latest ten such integration windows, or all when fewer exist: previous matching merged head to current merged head, using Git ancestry and `git diff --name-only`. The first available event uses its head's parent. Checked `git log -1 -- <doc>` for last doc updates. These windows include intervening direct commits and possibly concurrent work, so the counts are **co-change observations, not per-leaf compliance percentages**. A unchanged index is often correct when its descriptions still apply. Root snapshots below identify the observed checkout, not a remote freshness guarantee.

| Repo and observed HEAD | Agent docs | Recent matching merged windows | AREA co-change | Reference-index co-change | Interpretation |
| --- | --- | --- | --- | --- | --- |
| akrogon `b1bdde3` | 3 AREA + index | 10 of 51 own merged records | 6/10 windows updated an AREA; all 10 touched an area with an AREA file | 1/10 | Rule is active, but new skill discovery was missed. |
| framework `5234db466` | 3 AREA + index | 10 of 133 | 1/10; all 10 touched described areas | 0/10 | Selective updates, not blanket refresh. Most unchanged AREA descriptions cannot be called wrong from history alone. |
| pi-extensions `2210403` | index only | 10 of 14 | N/A | 3/10 | New capabilities do update the index; two deleted targets still survive in it. |
| mdcny-ghl-data-pulls `9caaa9d` | index only | all 6 | N/A | 0/6 | Index stayed a lifecycle scaffold while product code and human README grew. |
| boulevard-automation `77dc0aa` | neither | all 9 | N/A | N/A | `issues/config.yaml:13` explicitly sets `grounding: none`; absence is not a failed updater. |
| clinique-la-roya `35d207d8` | 3 inherited AREA + index | **0 own** | Not attributable | Not attributable | All 96 merged records in its log belong to framework. Do not count inherited history as consumer lifecycle success. |

Registered roots: akrogon `/home/ivan/Work/infra/akrogon`; framework `/home/ivan/Work/infra/tamdoma/framework`; pi-extensions `/home/ivan/.pi/agent/extensions`; the other three under `/home/ivan/Work/personal/MDConsultingNY/<repo-key>`.

### Reproducible examples behind the counts

- Akrogon: `issues/log.jsonl:245` records `skills-env-file-rule` at `0469b588`, whose integration window changes the phase skills and `skills/AREA.md`. Line 248 records `one-attempt-per-pass` at `27045436`, changing dispatch, `src/AREA.md` and `docs/reference-index.md`. Line 254 records `watch-issues-skill` at `391bc823`; `git show --stat 391bc823` adds the skill and install test but no index/AREA update. `tests/AREA.md` last changed at `421934b` on September 11, despite later test changes. That date alone is not proof its summary is stale.
- Framework: `issues/log.jsonl:660` records `batch-read-inputs` at `fe45d4f0`, updating `.claude/skills/AREA.md:18` for the new shared preflight. Its following windows, through `60020656` at line 672, change skills/hooks without another AREA update. `single-skill-factory-update` at line 664 (`e193d609`, including implementation `0d5f5c96c`) changes `.claude/docs/architecture.md`, `commands.md`, `getting-started.md` and `llm-context.md`. Human docs already participate in this lifecycle.
- Pi: `issues/log.jsonl:54,59,66` records child-question delivery, bash timeouts and env guard at `f9aa1e81`, `e5116c7d`, `bfe61d01`. All three windows update the index. The last index edit is `2c3a401` on September 19, within the env-guard window, not its final repair commit. Looking only at the merge-head commit would miss that update.
- Data pulls: `git log -- docs/reference-index.md` contains only `56a9b79` (September 14 initial push). `issues/log.jsonl:14,19` records the worker and New York cron leaves at `b757a8b2` and `534e007b`; both integration windows change README, not the agent index. README now explains the schedule and rerun procedure (`README.md:3-17`).
- Boulevard: log lines 7–52 cover its nine own merges, ending at `e333644a`. There are no agent-doc files to update. It does have a human operating document, `ghl-setup-steps.md`, changed in the appointment-mirror window ending at `3747e499` (`issues/log.jsonl:36`).
- Clinique: framework-derived docs last changed at `67477c80` (hooks), `cc19f389` (skills), `2abbc9d7` (workflow/index). Its application changes include `7af02cc1`, changing landing-page phone numbers. These are Git changes, but not own merged-leaf events in the inspected log, and are outside the inherited AREA files' named framework areas.

## Path audit and concrete defects

Across all six roots there are **14 agent-doc files**: nine AREA files and five indexes. The following distinguishes actual bad references from parser false positives.

1. **F1 — Review blind spot, akrogon:** `skills/check-issue/SKILL.md:35` restricts the path check to AREA files already in the diff. A source deletion with an omitted documentation edit escapes that check, and an index-only change is outside it. This is a concrete coverage defect in the mechanism, not proof that every unchanged document is stale.
2. **F2 — Two dead pi index entries:** `/home/ivan/.pi/agent/extensions/docs/reference-index.md:24` names `tamdoma-forced-native-compaction/index.ts`, and line 73 names `tamdoma-subagents/btw.ts`. Neither exists in the working tree or HEAD. `git log --all --diff-filter=D -- <path>` traces their deletion to `52dd56a` on September 12. The index has been updated subsequently, including September 19. Both are genuine stale pointers. The deletion was an `add issues` commit, so do not attribute its creation to a particular merged leaf without evidence.
3. **F3 — Newly added skill absent from discovery, akrogon:** `docs/reference-index.md:5` still describes eight workflows, while `391bc823` adds `skills/watch-issues/SKILL.md`. `README.md:50-61` also lists the old eight skills. This is observable missing user-facing discovery after the merged watch leaf (`issues/log.jsonl:254`). The AREA file's short key-file list need not be exhaustive, but a numerical count and the public workflow table need attention.
4. **F4 — Agent index never grew with the application, data pulls:** its `docs/reference-index.md:3-5` only names lifecycle config, open issues and learnings. All six own merged leaves added/changed application surfaces without adding a product entry point. The index does not help the planner find the code described by `README.md:3-17`. Its `../issues/open/` link at line 4 is also absent now. This is an empty-directory lifecycle condition, not permission to create a sentinel under `issues/` on a leaf branch. Link to a stable entry point or describe the optional runtime directory as text.
5. **F5 — Literal-root path checking can produce false Fixes:** framework `.claude/hooks/AREA.md:24` says `harness/run-hook.ts`, whose actual path is `.claude/hooks/tests/harness/run-hook.ts`. `.claude/skills/AREA.md:18` abbreviates `check-batch-reads.ts`, which exists under `.claude/skills/_shared/scripts/`. The reviewer instruction demands checking paths from repository root and forbids extra reads (`skills/check-issue/SKILL.md:35`), while initialization prescribes repo-relative AREA paths (`skills/init-issues/SKILL.md:58`). Make concrete pointers unambiguous, and distinguish patterns/commands from file claims. Do not diagnose these files as deleted. Equivalent contextual shorthand exists in clinique's inherited AREA files.

Other path outcomes: no missing concrete target found in akrogon's four agent docs, framework's explicit links/full paths, or clinique's explicit links/full paths. In pi, `shell-timeout.ts` is a contextual abbreviation resolved under `tamdoma-pi-tweaks/`, `/clear`, `/context`, `/subagents` and `/btw` are commands, and the manifest is explicitly marked generated (`docs/reference-index.md:21,27,35,72-78`). They are not additional missing-file findings. Boulevard has no files in this inventory. Existing paths do not prove prose accuracy. Framework's index also hardcodes a skill count (`docs/reference-index.md:5`); prefer removing brittle counts rather than automatically rewriting them on every change.

## Material forks

### Q1 · Should human-doc discovery use the existing entry points, or a configured path list?

Research: operator · intake asks for the smallest solution; repository primary · `implement-issue/SKILL.md:27` already covers affected docs, `plan-issue/SKILL.md:25` already reads the index, and `src/config.ts:35-43` already admits optional documentation fields. Human locations vary: akrogon's README/guide, framework's `.claude/docs/`, pi's package READMEs, data pulls' README, Boulevard's `ghl-setup-steps.md`.

- **A (recommended):** Planning starts from the existing grounding index, README and relevant linked docs, then names the documentation affected by the planned behavior in its existing change/read-first lists. For a repo without an index or README, inspect its top-level documentation and nearby docs for the changed feature. Implementation updates those docs and checks whether the actual diff exposes another affected page. Do not invent docs when there is no relevant existing page unless the new behavior needs instructions.
- **B:** Explicitly designate human-doc paths in configuration. Prefer defining how the already accepted `grounding.docs` is consumed over adding `human_docs`. This makes discovery deterministic, but creates a list that itself needs maintenance and must have a clear interpretation when `grounding: none` is chosen.

Pitfalls: a path list does not tell an agent which claim changed. Do not walk every document in every consumer on each leaf, or assume every human doc lives under `docs/`. Keep numerical inventories out of indexes unless they serve a reader need. An existing grounding opt-out must not silently become an instruction to create AREA files.

### Q2 · Should review check documentation impact from the code change, or retain its changed-AREA-only check?

Research: repository primary · `check-issue/SKILL.md:33-35,39-47` owns initial review, Fix evidence and repair routing; F1–F3 expose the omission case. Successful updates in the Git windows show the implementation rule can work, so a second author or new phase is unnecessary.

- **A (recommended):** Initial review checks the changed behavior against the relevant agent and human docs, including an unchanged page whose claim was invalidated. Permit narrowly scoped reads of those pages and the affected index. Broken live pointers or wrong operational guidance are concrete defects routed through the existing repair pass. The report briefly identifies updated docs or explains why the behavior does not change any documented contract. No forced doc edit for every code change.
- **B:** Keep review limited to documents in the diff and strengthen only implement-issue's wording. Smaller instruction change, but the exact omission demonstrated by F1 remains unchecked.

Pitfalls: revise the “open no area file outside that diff” restriction if A is chosen. Test re-review stays limited to the repair and its affected contracts. Do not require exact sections or a standalone docs report, and do not treat stylistic preferences as Fixes. A missing link in old unrelated docs is separate debt, not an excuse to expand every leaf.

### Q3 · Should this delivery repair the measured gaps, or only improve future upkeep?

Research: repository primary · pi index lines 24/73 are known dead targets; data-pulls index lines 3-5 lacks application entry points; Boulevard config explicitly disables grounding. The mechanism change lives in akrogon, while the stale documents belong to their own registered repositories.

- **A (recommended):** Separate the small lifecycle-rule change from narrowly owned baseline repairs. Repair confirmed stale pointers/discovery gaps in their destination repos, without a universal documentation rewrite or forcing indexes onto opted-out repos. This stops known debt from being left behind while keeping the systemic change reviewable.
- **B:** Ship only the prospective rule and record existing defects for later intake. Smaller immediate scope, but the operator should not be told all six repositories are now current.

Pitfalls: do not reopen the pending `guide-markdown` rewrite as another migration. Its existing ownership includes akrogon's human guide/README and can account for the new watch skill. Historical log copies in clinique are not evidence that its own lifecycle updated docs. Creating or changing `issues/config.yaml` is an operator-side config action, not an incidental leaf-branch edit.

## Proposed leaves and ownership

1. **L1 — Akrogon documentation-impact rule:** own the relevant prose in `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md` and affected `skills/AREA.md` wording if needed. Establish discovery during planning, updates during implementation/repair, and omission-sensitive review. No core schema, command, watcher or extra program under recommended Q1-A/Q2-A. Respect explicit leaf exclusions: surface an ownership conflict rather than treating this rule as permission for unrelated edits. Validation is a small set of walkthroughs: renamed documented file with unchanged AREA; changed operator command with unchanged human page; internal refactor needing no prose edit; grounding-none repo with a human runbook; explicit excluded doc requiring escalation. Do not add tests that match skill wording.
2. **L2 — Pi index repair:** own only the stale parts of `docs/reference-index.md` and relevant existing overview links. Remove or replace the two dead entries and verify real target paths. Can run independently of L1.
3. **L3 — Data-pulls discovery repair:** own `docs/reference-index.md` and only such small AREA files as the actual application needs. Point to live README/source/test entry points, and remove the dependency on an empty `issues/open/` directory. No runtime changes. Can run independently of L1/L2.

Framework/clinique shorthand normalization is a small optional follow-up if strict repo-root path conventions remain desired, not evidence of missing implementation files. Boulevard needs no baseline AREA leaf while its deliberate opt-out stands. Akrogon's pending `github-markdown-guide/guide-markdown` owns the human-doc baseline; coordinate the watch-skill omission with that owner rather than launching a competing rewrite. No dependency on the Markdown migration is needed for the general skill rule: it must maintain whichever documentation currently exists.

Challenge check: the evidence does not support “agent docs update automatically and only human docs need adding.” Both kinds sometimes update already. The missing mechanism is recognizing and reviewing affected documentation that was left out, plus limited repair of pre-existing gaps. Adding a config key alone addresses neither.

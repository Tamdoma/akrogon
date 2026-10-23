# Blind notes B: doc-architecture

Independent notes, 2026-10-23. Read only the current fork's Question/Carries and the related reader-and-home Taken decision. No A notes, merged notes or current Findings read. Existing source observations and practitioner sources from this session are reused without rereading held content.

## Q1. Page architecture

### Pick, reason and cost

Pick (a): start, use, reference and examples under docs/. The labels answer what the reader needs now. Apply Diataxis to each page's purpose without requiring its four category names as the navigation.

Keep start short and ordered: understand the factory -> install/configure the machine -> initialize a project -> complete one small change. Prepared readers take the agreed readiness shortcut. A first-run tutorial should reach recognizable checked, merged work, not end after writing state files. Explain the few concepts needed for each step there, with links to deeper explanations. A conceptual introduction can explain why the process works without making full state/config reference compulsory reading.

Give use pages concrete outcomes: capture an observation, chart a change, choose eligible direct work, hand a fixed list to autopilot, run and watch work, stop or recover work, inspect landing, save records and handle lessons. This is a task inventory, not a demand for one file per command. Combine closely related steps when the reader has one goal. Conversely, do not put all charting modes back into one long page merely because one skill implements them.

Reference owns exact commands, configuration/seat precedence, phases, artifacts and terminology. It can explain non-obvious semantics, but should not become the first-change path. Keep docs/reference-index.md as the agent's code-grounding index, with a link to the human documentation home.

Cost: moving existing pages, updating links/anchors and agreeing canonical ownership before authors work. The folder choice alone does not make writing easier. The implementation contract must say which page owns each existing subject so useful content is neither lost nor copied.

### Current content placement

P1. README's overview plus docs/guide/idea.md and the minimum terms from parts.md feed start. Full issue/epic folder layouts and state fields move to reference. Correct the simplified seat/merge descriptions while moving them.

P2. install.md and setup.md supply start's installation and project setup steps. Put long environment, check receipt and seat override details in config/reference and link at the point of need. Preserve the clean-machine prerequisite/config ordering already taken.

P3. create.md splits by reader goal: seed/report intake and chart entry in use, manual issue/leaf construction and dependency fields in reference. The beginner's normal route should use the charting skill rather than first authoring state YAML.

P4. chart.md supplies use/chart, use/direct and use/autopilot. Keep researcher tiers, peer-script mechanics and session-record internals out of the everyday task path unless the operator must act on them. Link to the owning skill for exact agent policy. Explain consultant roles versus execution seats once in the appropriate concept/reference page.

P5. next.md, in-practice.md, problems.md and limits.md supply run/watch and stop/recover tasks. Put exact dispatch selection and command syntax in reference. Distinguish park, pause, stop and stop-run through the user's intended effect, rather than making them learn internal state names first.

P6. merge.md supplies a short explanation of expected landing and optional broadcast, plus exceptional recovery tasks. Correct its stale normal-B-merge and cleanup-only-on-sweep claims. Keep receipts, attempt fields and agent phase calls in reference or the owning skill rather than requiring the operator to perform them.

P7. files.md, state.md and phases.md primarily become reference. Its timing/flaky/log inspection material also needs direct links from troubleshooting tasks. Exact record schemas need not be copied into those task pages.

P8. learn.md belongs with the lesson-triage task. gacp.md should be reachable from saving work, with its distinction from akrogon sync, rather than remain a compulsory chapter between files and merge. Preserve only the currently supported content after checking its actual helper. It is not a new core factory stage.

P9. cheat.md becomes a concise task/command lookup, or its useful entries are absorbed by the use index and command reference. Do not retain a second exhaustive syntax table that must change with the canonical reference.

P10. Examples use selected actual histories: attended product questions, fixed-list autopilot handoff and recovery of failed work. Examples link to current task instructions rather than restating a full alternate manual. Verify delivered outcomes before calling a case successful.

### Rejected options

(b), keep the flat book: flat files are not inherently bad, and better ordering would improve today's guide. The cost here is preserving a book-shaped expectation around materially different reader needs. As features arrive, authors are likely to append another long section to chart.md, setup.md or files.md. The current headings and recent feature additions show that pressure. This option could work only with the same purpose separation and task index proposed above, reducing its claimed migration advantage.

(c), four Diataxis folders: sound for some projects, but the reader does not need to classify their need as explanation versus tutorial to find the first run. A strict explanation/tutorial split can also scatter first-principles context from the learning sequence if applied mechanically. Use the framework to improve content, not as a mandatory folder taxonomy. No rejection of Diataxis principles is implied.

### Evidence, tier, source and date

E1. Tier 1, operator intake 2026-10-23, issues/chart/beginner-docs/INTAKE.md, already read: first principles, information at the right time, all current features and real use cases are explicit requirements.

E2. Tier 3, local documentation inspected 2026-10-23: README currently routes through idea, parts and state before install/setup. chart.md places Direct route and Autopilot after extensive chart mechanics. setup.md mixes initial setup with dense checks/environment details. files.md mixes artifact reference with timing/flaky inspection and sync. Current headings were checked again for this fork. These are concrete examples of mixed reader purposes.

E3. Tier 1, sampled operator messages from October 13–21, read earlier this session: transcript transcript T1 asks for overnight failure diagnosis, parallelism and B repairs; transcript T2 asks for seat overrides and a small direct fix. Registered framework's P1 autopilot batch CHART records fixed-list autopilot and handovers. These needs support task entries beyond one linear happy path. This is qualitative evidence, not a claim that the sample proves the optimal workflow.

E4. Tier 2, named practitioner Daniele Procida's Diataxis framework, https://diataxis.fr/start-here/ and https://www.diataxis.fr/how-to-use-diataxis/, read 2026-10-23 earlier this session: distinguish learning, work, explanation and reference needs, and improve actual content rather than impose empty structural categories. The purpose-folder recommendation is B's application of those principles, not a layout mandated by the source.

### Pitfalls and removal steps

R1. New folders merely redistribute the same long mixed pages. Define one reader goal and canonical subject ownership per page before moving content. Review the result by following a task, not checking directory names.

R2. Every new feature creates a new mandatory beginner chapter. Add it to the relevant task chooser and reference first. Change the first-run route only when the minimum successful workflow changes.

R3. Too many small pages force constant clicking. Split at distinct goals or depth, keep complete task steps together and give every page an obvious next action. Do not enforce arbitrary page length.

R4. Introductory explanations duplicate exact runtime rules. Keep introductions concise and link authoritative details. Existing stale-rule and cleanup history shows why repeated policy text drifts: learnings/history/2026-09-11-stale-rule-in-docs.md and 2026-10-11-cleanup-timing-guide-claims.md, inspected earlier this session.

R5. Examples become obsolete alternate instructions. Keep the example's intent, decisions and verified outcome, with current instructions linked separately. Historical settings are not current configuration evidence.

### Missing question

Q1a. What is the single first-run success criterion? I recommend one small change reaching checked, merged code. Installation alone or a handed-off contract alone would not satisfy “finished change.” Set this before writing the sequence.

## Q2. README boundary

### Pick, reason and cost

Pick (a): a short front door with identity/outcome, agreed audience/prerequisites box, useful overview SVG, start link and a small task chooser. Respect the already binding prerequisite box near the top. The overview should show what the user decides, what the factory does and where execution starts, without requiring every internal phase.

Remove the full command table, install chapter and rollback internals from README after relocating each useful piece. A newcomer gets a clear next step. An existing user gets task/reference links. The full clean-machine path remains in start, not omitted from the product.

Cost: readers click through for exact commands, and maintainers must keep the small set of entry links accurate. This is preferable to maintaining parallel full descriptions in README and docs.

### Rejected option

(b), complete manual with collapsed sections: collapse hides length but preserves duplicated authoritative facts and makes README navigation harder to scan. It also tempts every new feature author to add another summary with policy details. Collapse may help an occasional optional example within a page, but should not be the architecture for the entire manual.

### Evidence, tier, source and date

E5. Tier 3, README.md inspected earlier this session and headings rechecked 2026-10-23: contains install, rollback, initialization, command and skill reference as well as the 17-page route. Its command table is fenced as text. Existing install/merge/limits pages disagree on some behavior despite extensive README updates. This supports separating introduction from canonical detail.

E6. Tier 3, GitHub Docs, https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-collapsed-sections, read earlier 2026-10-23: details blocks hide content until opened. They do not remove its maintenance requirement. The duplication conclusion is B's engineering judgment.

E7. Tier 3, Docker documentation team, https://docs.docker.com/get-started/, read earlier 2026-10-23: installation and tutorial choices have distinct entry points. This is an example of reader-oriented routing, not evidence Akrogon should copy Docker's exact page design.

### Pitfalls and removal steps

R6. Short README becomes vague marketing. State the concrete workflow/result, actual machine prerequisites and one clear starting action. Preserve useful explanation in start rather than replacing it with slogans.

R7. The overview suggests autopilot also starts execution or deployment. Keep handoff and execution boundaries explicit. Autopilot charting, lifecycle event dispatch and the optional Claude watcher are separate behaviors in the current source and guide.

R8. Removed material disappears or links break. Map each removed README section to its owning destination before deletion, update inbound links with the move as already taken, and verify headings and images in GitHub rendering.

### Missing question

Q2a. Should the README's task chooser optimize for newcomers only or also daily operators? I recommend one dominant start link followed by a compact set of daily task/reference links. Avoid reproducing the whole documentation table of contents.

## Carried lock

Implementation A for every resulting leaf remains claude, claude-opus-5-5, medium. No other seat choice is inferred.

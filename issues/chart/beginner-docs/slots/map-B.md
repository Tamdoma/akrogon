# Slot B territory map

Independent consultant map, read date 2026-10-23. No other slot's map read. No repository edits. Recommendations below are choices for the door, not operator decisions.

## Evidence and confidence

E1. Inspected README.md, docs/reference-index.md, the guide's introduction, parts, state, install, setup, create, chart, in-practice, limits, merge and cheat material, plus headings/searches of next, phases, files, problems, gacp and learn. Some initial combined reads were truncated. Findings below rely on visible text or focused follow-up reads, not an assumed complete audit of every page.

E2. Inspected command entry points in src/akrogon.ts, src/AREA.md, src/config.ts seat lookup, src/next.ts reconciliation call sites, skills/chart-issues/SKILL.md and merge skill section/search evidence. `bun src/akrogon.ts config` confirms registered framework, P2 and varhop roots. Local source is runtime evidence, not proof every deployed release is identical.

E3. Inspected git history since 2026-10-01, particularly README/guide commits. It includes autopilot, consultant resets, door handover, receipts, automatic green landing, stop/start, stop-run, release/rollback, cleanup, evidence packs, timing, flaky checks and changed merge behavior. Documentation already received many feature updates. The core problem is also placement, duplication and contradictory summaries.

E4. Sampled original user messages in ~/.claude/projects/-home-ivan-Work-infra-akrogon/*.jsonl dated October 13–21. Excluded the current door transcript. This is a qualitative sample, not a frequency study or proof of an optimal workflow. See use cases below for exact filenames.

E5. Inspected issues/chart/autopilot/CHART.md, night-flow/CHART.md and usage-windows records/searches. Inspected external registered roots' chart records for P1 autopilot batch, varhop overlay-rework and P2 P2 chart. Historical choices can be obsolete. For example varhop's October 13 chart says `direct: false`, while current chart-issues no longer requires that setting. Use live source to explain today's operation.

## Concrete defects and feature placement gaps

F1. README.md's reading path puts State before Install and Setup. A beginner must absorb state YAML and runtime bookkeeping before running anything. The README then repeats extensive installation, rollback, reconciliation, command and skill references. The numbered 17-page route gives no short path to a first result. This is a structural defect, not merely a word-count issue.

F2. README.md's Command table is inside a `text` code fence, so GitHub displays literal pipes instead of a rendered table. Move the detailed command material to its canonical reference and render it as actual Markdown there.

F3. docs/guide/merge.md starts with “Seat B merges reviewed work” and describes B being prompted for the normal rebased top. Current skills/merge-issue/SKILL.md, section merge, says the command launches `akrogon land` in a user unit and lands a green top without a seat. B gets exceptional attempts and completion broadcasting. README already lists land. This changes what a user should expect to see and is a confirmed stale feature description.

F4. docs/guide/limits.md says only manual sweeps and startup cleanup delete completed worktrees and branches. docs/guide/merge.md repeats removal only after owner closure. README and src/AREA.md describe per-pass reconciliation, and src/next.ts calls reconciliation in targeted, current-repo, automatic and tab-closed flows. learnings/history/2026-10-11-cleanup-timing-guide-claims.md records this exact mismatch. Correct the canonical explanation, then link to it.

F5. docs/guide/create.md describes charting unconditionally as operator-led. docs/guide/chart.md later explains autopilot and direct mode, but only near its end after research tiers, consultant scripts, session tracking and other internals. README's main diagram only shows lifecycle/manual dispatch. These features are present but not discoverable where a reader chooses how to start work. This is not evidence that autopilot is wholly undocumented.

F6. docs/guide/cheat.md includes agent phase/verdict commands alongside operator actions, while stop/start, stop-run, leftovers, rollback and autopilot have no comparable quick entry there. This invites a novice to use phase mutation as routine control before learning the supported stop/resume path. Split operator tasks from agent transition reference.

F7. docs/guide/install.md assumes an existing “Akrogon workspace checkout” but does not show how to acquire it. Its prerequisites correctly name systemd 254, but the example checks do not check systemd. The same page includes a historical “When this containment first ships” migration instruction. A clean install and an existing-user migration are distinct tasks. Confirm the supported OS/runtime scope before promising broad onboarding.

F8. docs/guide/setup.md's first configuration list contains long receipt, environment, system bus, GitHub token and test scope explanations. They are useful reference facts, but obscure the beginner's immediate questions: what is being configured, what must I approve, how do I know setup worked? The following command reference should own exact semantics.

F9. docs/guide/in-practice.md is a generic CSV example plus watcher FAQ. The inspected real history contains richer, relevant scenarios: original product questions, fixed-list autopilot, recovering a failed leaf, seat overrides, runtime failures and permission-bound work. Current material is not grounded in named delivered use cases.

F10. docs/guide/idea.md explains why two seats and durable records matter well, but the content is tied to the lifecycle route and says B handles merge. Keep the useful first-principles reasoning and update its simplifications for command-owned green landing and charting consultants versus execution seats.

F11. docs/reference-index.md is an agent/code area index. Do not make it the only human documentation home. It currently links “Documentation” to a directory, while README owns the human sequence. Preserve the grounding index's distinct function when adding human navigation.

F12. No SVG assets were established in the inspected README/guide path. Existing visuals there are ASCII diagrams. Asset inventory and actual GitHub animation behavior remain implementation checks, not completed validation.

## Material forks

D1. Audience and promise: teach a project owner who can describe an outcome, with a clearly marked machine setup prerequisite. Do not imply that plain English removes Git, agent CLI, Herdr and Linux/systemd setup requirements. Alternative: target experienced agent users only, matching today's README opening. Cost of the broader audience is explaining repository, terminal location, worktree and successful checks at first use. Ask the operator whether a total beginner installs the factory personally or receives an already prepared machine. This changes the first tutorial substantially. Evidence: README opening, install prerequisites, setup skill/command distinction.

D2. Reading architecture: use a short guided first run, with separate task pages and deeper reference/explanation. Suggested human entry points: “Understand the factory”, “Set up”, “Complete your first change”, “Run daily work”, “Find a command or setting”. Use Diataxis to judge page purpose without forcing readers through academic category labels. Alternative: keep the existing linear 17-page manual and edit prose. That costs less migration but preserves the requirement to read state internals before a first result. Alternative: impose four empty directory trees first. That creates work without improving the learning sequence. Sources S1/S2 below explicitly support separating reader needs and avoiding premature structure.

D3. README boundary: identify the outcome, who it serves, prerequisites at a glance, one overview SVG, first-run link and task links. Exact CLI syntax, state fields, rollback internals and reconciliation rules belong in reference/how-to pages. Keep a small usable installation entry or link depending on D1, not a duplicate complete install chapter. Alternative: comprehensive README with collapsed details. GitHub supports details (S5), but nesting everything still leaves duplicated facts and weak next-step navigation. Keep current deep links working or update every repository link when moving content.

D4. Introduce concepts when needed: request -> researched choices -> agreed contract -> execution -> checked landing -> optional notification. Before dispatch, explain what the user controls and what the agents do. Introduce issue/leaf/worktree at their first visible use, not a full directory taxonomy first. Keep the guide's useful durable-state and independent-review explanations in a deeper concept page. Alternative: require complete glossary/state knowledge up front. Its cost is visible in current State-before-Install ordering. Distinguish consultant A/B from lifecycle A/B explicitly. Naming a charting consultant does not turn on paired implementation planning, per chart skill Handoff.

D5. Modes and handoff: put attended charting, small direct work, fixed-list autopilot and watcher in the task chooser, each with its trigger, result and next human action. Autopilot answers chart decisions and hands off contracts. It does not start execution or prove a watcher is running. Direct mode implements eligible small settled work with B review and is unavailable under autopilot. Watcher is an operator-started Claude Code session cron, separate from Herdr event dispatch and from autopilot. Alternative: teach a single “fully automatic” pipeline. That would misstate current contracts. Do not add runtime features to make a nicer diagram true. Evidence: chart skill Autopilot/Direct route, guide in-practice, autopilot chart.

D6. SVG delivery: prefer a small number of checked-in, editable, self-contained SVGs with internal CSS animation. Candidate animations: the main workflow's handoff points and the review/repair loop. Keep all labels and edges meaningful when motion is disabled. Static diagrams can cover folder/config relationships where motion adds little. Alternative SMIL is feasible, but must demonstrate an equally simple reduced-motion path. A JavaScript animation tool/runtime is unsuitable for SVG image embedding because script is disabled (S3). A generator is justified only by actual repeated layout work. package.json currently has no diagram toolchain. Do not introduce a diagram framework by default.

D7. GitHub visual validation: require an early small rendering probe before finalizing the art approach. Validate actual README image embedding, animation, GitHub light/dark themes, narrow viewport, text size and reduced motion. A locally opened SVG does not prove GitHub's image path behaves the same. Prefer a single intentional background and palette that remain legible in both themes when possible. GitHub supports theme-specific images (S6), but two art variants double maintenance. Animation should highlight sequence, never imply simultaneous stages or periodic watcher behavior where none exists. Low confidence: this session has not measured the current GitHub proxy/sanitizer's handling of the proposed animation. Docs establish browser primitives, not that end-to-end result.

D8. Staying current: pick one canonical owner per kind of fact. Runtime syntax/config from source, agent policy from the skill, operator steps from their task page, illustration from the same concept. Use links for exceptional detail instead of copying the skill's operational rules into beginner prose. At feature review, inspect the affected human journey and diagram alongside the source/skill. Existing stale-rule and cleanup lessons already require semantic attention. Alternative generated docs: useful for command names and typed fields, but cannot judge audience, causal explanations or safe recovery steps. Alternative a second exhaustive feature catalog: likely to drift again. A compact feature-to-page/source coverage table in the chart is enough for this rewrite. Only retain a permanent maintenance file if existing ownership cannot express it.

D9. Use-case source: publish short reconstructed walkthroughs from selected actual records, with enough public provenance to verify them. Keep raw transcript paths and private/customer details in chart research. Use source files/commits that will exist on GitHub for public links. Alternative retain CSV as the only example: consistent but fails the request for real use across the factory. Alternative reproduce chronological transcripts: leaks unrelated details and teaches obsolete commands. Historical use is evidence of needs, current code/skills are evidence of today's instructions.

## Recent workflow evidence and candidate use cases

U1. Attended product work: P2/issues/chart/P2 chart/CHART.md starts from a translator need, then leaves editor shape, change history, quality checks and certification as open product questions. Good example of why charting exists before implementation. It is an open chart, so do not present it as a delivered success. Confidence high on recorded intent, low on later outcome without further leaf/merge inspection.

U2. Recover existing work: varhop/issues/chart/overlay-rework/CHART.md records carrying a failed overlay leaf's code forward, defining keyboard and human spot-check evidence, splitting two dependent leaves, and applying an issue-level Claude Opus seat override. It demonstrates requirements, reuse, dependencies and permissions in one real change. It also records a separate post-merge installed-plugin step. Describe the boundary without running its historical commands. Confirm closed leaf records and current source before writing a success story.

U3. Fixed-list autopilot: framework/issues/chart/P1 autopilot batch/CHART.md records October 22–23 mode entries, fresh-A handovers, a dropped Codex consultant, three handed-off standalone issues and mode ending after all handed work. This supports explaining finite list, handoff, consultant loss and resuming from records. Do not equate Handed off with merged or deploy success. Raw session identifiers are unnecessary in beginner docs.

U4. Operator control and troubleshooting: akrogon transcript transcript T1, October 13–14, contains requests for peer consultation, parallelism, CPU/browser process diagnosis, overnight failure inspection and B actually repairing findings. The same transcript contains framework watcher reports naming human-only proof constraints and completed merges. This is stronger evidence for teaching monitoring, failure reasons and resource/control differences than inventing a generic happy day.

U5. Seats and small direct work: transcript transcript T2, October 19–20, requests Claude Opus 5.5 medium as implementation A, debate no, and a small direct fix with B consultation. Transcript transcript T3, October 21, requests existing B/C panes. These support showing roles versus models and separating chart consultants from execution overrides. They do not establish one universal recommended model.

## Practitioner questions and named sources

All sources read 2026-10-23. These are primary frameworks, product docs or standards documentation, not inferred practitioner interviews.

S1. Daniele Procida / Diataxis, https://diataxis.fr/start-here/ and https://diataxis.fr/ . Distinguishes tutorial, task instructions, reference and explanation. Q1: Can a new user achieve one result without first learning the whole mechanism? Q2: Which paragraphs answer a different reader need and should move out of that tutorial?

S2. Diataxis, https://www.diataxis.fr/how-to-use-diataxis/ . Advises applying the framework through improvements rather than imposing empty structure. Q3: Does each proposed page remove a real confusion seen in the current docs or history? Avoid a site migration for its own sake.

S3. MDN, https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/SVG_as_an_image and https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/SVG_animation_with_SMIL . SVG image contexts disable scripting and restrict external resources. SMIL supports declarative animation. Q4: Does the exact exported file work as an image with no external runtime?

S4. MDN, https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion . Documents motion preference detection. Q5: Can someone understand the entire diagram with motion turned off? Test the embedded artifact, not only the CSS.

S5. GitHub Docs, https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams and https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-collapsed-sections . GitHub supports Mermaid and collapsed details. Q6: Which diagrams need animation, and which are clearer as simple static source? Mermaid is an available static option, not a substitute for the operator's requested useful SVG animations.

S6. GitHub Changelog, https://github.blog/changelog/2022-05-19-specify-theme-context-for-images-in-markdown-beta/ and https://github.blog/changelog/2021-11-24-specify-theme-context-for-images-in-markdown/ . Documents picture/theme-specific image support. Q7: Is one readable asset enough before accepting a pair of theme variants?

S7. Docker documentation team, https://docs.docker.com/get-started/ . The inspected page separates installation from role/task tutorial entry points. Q8: Can the reader tell immediately whether they need setup, their first change or everyday operation? This is a navigation example, not proof Docker's exact architecture should be copied.

## Lifetime pitfalls and removal steps

R1. README and guide drift independently. Remove duplicate authoritative command/config prose and assign one destination per fact. Evidence F3/F4 and learnings/history/2026-09-11-stale-rule-in-docs.md, including its October 19 dispatch-order example.

R2. New features append more internals to the beginner route. Give each page one reader goal and route exceptions to linked task/reference pages. Evidence F5/F8 and S1.

R3. “Automatic” becomes an unsafe expectation. Diagram attended charting, autopilot charting, event dispatch, watcher and deployment with their actual boundaries. Evidence D5/U3, current chart skill and guide watcher limitations.

R4. Historical walkthroughs become current instructions. Verify every command and role against source, label example outcomes, link public records and omit obsolete settings. Evidence varhop's old direct flag versus current skill.

R5. Animations become another contradictory specification. Reuse the same concept labels and ownership as prose, avoid moving-only information, review the image when behavior changes and inspect static/reduced-motion state. Evidence F3/F4 and S3/S4.

R6. Beginner recovery bypasses the intended controls. Put inspect reason -> resolve prerequisite -> choose supported resume action before low-level phase mutation. Distinguish pause, park, stop and stop-run at the task level. Evidence current next headings, cheat examples and October 14 operator reports.

R7. “Complete documentation” balloons into deployment, machine reconfiguration or new infrastructure. Keep this chart to README, GitHub-readable docs, useful assets and scoped maintenance ownership. Existing runtime, watcher and model settings are described rather than redesigned. The operator's implementation A seat is a handoff lock, not a public default.

## Suggested leaf boundaries and validation

A1. First lock the audience, first-run outcome, page ownership and migration/link plan at the chart door. Record the source/feature coverage table there. This is a prerequisite decision, not a documentation-system feature.

A2. Foundation and first run leaf: owns README, human docs entry, concept overview and setup/first-change path. Include precise prompts, terminal locations, expected result and handoff/dispatch boundary. One author owns the narrative and vocabulary. Do not dispatch a first-run experiment against real user work as a documentation check.

A3. Daily operations and reference leaf: owns charting modes, everyday tasks, controls/recovery, command/config/state reference and moved deep guide material. Correct automatic landing and cleanup claims against live source. It depends on A1's structure and owns its own existing-link updates. Avoid parallel editing of the same README/navigation files as A2.

A4. Real use cases leaf: owns a small set of public, source-checked walkthroughs. It can research independently after A1, but final links depend on A2/A3 destinations. Minimum useful set: attended product choice, fixed-list autopilot plus watcher handoff, failed work recovered. Verify delivery status where claimed. Do not add customer/private transcript data to the repository.

A5. SVG leaf: starts with one actual GitHub embedding probe, then owns only the useful agreed assets. Text authors own embedding locations to avoid collisions. Explain the main factory path and one time-dependent concept if that second animation helps. It depends on stable D4/D5 semantics, not the whole prose implementation. A diagram framework or build pipeline is not assumed.

A6. Final integration belongs to the leaf that owns entry/navigation, rather than an automatic extra issue. Check repository links/anchors, shell syntax and current command surface, view GitHub Markdown/image rendering in both themes and reduced motion, and have an unfamiliar reader follow the first-run instructions. Mechanical checks should validate links, valid assets and executable syntax. An agent judges clarity and completeness. Do not assert beginner usability from passing a link checker.

Each actual leaf must carry the locked implementation A seat via owner front matter: harness claude, model claude-opus-5-5, effort medium. No override for B is implied. The door should confirm final leaves after settling architecture rather than treating this candidate split as agreed scope.

## Remaining uncertainty

Q9. Does the intended beginner start with a configured machine and repository, or need a complete clean-machine installation? This is the largest unresolved audience fork.

Q10. What first completed result should the tutorial teach, and can it use a tiny disposable example without adding a maintained sample application? CSV is already consistent, but the user requested real-life use cases as well.

Q11. Is GitHub repository Markdown the complete publication target, or is a GitHub Pages site wanted? Current intake only warrants excellent repository docs. Do not infer a new hosting/toolchain requirement.

Q12. Which historical example may be published with project names? Public source records may be enough, but raw local transcripts should remain research evidence. No public success claims should be made until the relevant closed record/commit is verified.

The strongest intervention is to give beginners one short, truthful path to a completed change, then put exact details in one place each. The inspected history shows that repeatedly appending new feature rules to long pages has not kept their summaries consistent.

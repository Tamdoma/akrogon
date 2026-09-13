# Design: guide-chart-picture

## Binding decisions, verbatim

### Do the disk names change with the words?

Operator, round 1: "1b, 2a, 3b".
Q1: rename on disk. `decisions/` -> `forks/`; CHART.md `## Decisions So Far` -> `## Forks taken`, `## Open Decisions` -> `## Forks open`, `## Not Yet Specified` -> `## Fog`, `## Out Of Scope` -> `## Off route`; fork file `## Resolution` -> `## Taken`; `Handed off <date>` unchanged. src/status.ts chartRow and header (`DECIDED` -> `TAKEN`, `UNSPECIFIED` -> `FOG`) and tests/status.test.ts follow. Done-criterion 3 becomes "full suite passes". Migrate every existing chart: issues/chart/status-empty-open, issues/chart/charting-vocabulary (this one, B final check F1) and all issues/closed/*/chart, folder rename, heading rewrite, `decisions/` links, bodies otherwise byte-identical. Reason: the intake wants one picture on disk as well as in prose. Closed: prose-only rename.
Q2: fog is bullets, one patch per bullet, so status counts it. Closed: free prose.
Q3: docs change. docs/guide/files.html:106, docs/guide/in-practice.html:75 and docs/guide/create.html:58 (B final check F2) reword to forks, taken, fog. Closed: leaving docs stale.

### When is a fork with several questions taken?

Operator, round 1, verbatim: "4 - this must be as detailed as each individual question is now, the fork is just a batch of those questions. Everything stays the same as now, it's just a category of questions about the same topic, that's why it should be called a fork. And what was called fork before is just a fork decision now. Is that understood? We're not overcomplicating? The goal is to simplify the mental model and the naming conventions and concepts follow." Follow-up: "keep in mind, all the questions ALWAYS have to be exhaustive, and new forks can start appearing as always based on the decisions that were made."
Recorded: a fork is a topic grouping one or more questions in one file, always shown together in a round. Each question keeps today's full Q block: explainer, evidence, options with one recommended, pitfalls. Answer rules stay exactly as in questions.md: an explicit choice takes a question, a request for explanation does not, an omitted material answer stays open. A fork is taken when every material question in it is taken; partial answers are recorded under Findings and `## Taken` is written only then. All currently material questions across all forks go in one round with continuous numbering. New forks appear after any answer, challenge check or live-surface inspection, as today. Closed: taking a fork on any reply.
Open, round 2 Q6: the name of the individual split (operator said "fork decision").
Operator, round 2: "6a". The individual split is a question. Eight words: territory, map, fog, fork, question, round, chart, off route. "Decision" survives only in leaf designs (binding decisions) and plan D1…Dn. Closed: "fork decision".

### How is a taken fork corrected before handoff?

Operator, round 1: "5a". Original stays verbatim, a new fork names the one it supersedes, only the effective answer becomes a binding decision. Reason: keeps the record and the "never reopened" rule. Closed: editing a taken fork in place.

### How do the other registered repos migrate and what about running work?

Operator, round 3: "7a | 8a | Keep in mind, this has to be done in pi-extensions and portal as well. The others don't have akrogon, yet."
Q7: one `migrate-charts` leaf per repo holding charts, dispatched after the akrogon leaf merges and the command reinstalls. Reason: no new code, the leaf leaves a record. Closed: a migrate subcommand, dual-format parsing.
Q8: nothing waits for `legacy-scripts-retirement`. Reason: leaves never read charts and that issue never touches issues/chart. Closed: waiting.
Portal correction: /home/ivan/Work/infra/tamdoma/portal has issues/config.yaml and issues/worktrees only, no charts, no open or closed leaves, and is not in `akrogon config` repos. There is nothing to migrate there and no registered destination for a leaf. It picks up the new format on its first chart. Repos with charts: akrogon (2 live, 8 closed), framework (7 live, 4 closed), pi-extensions (1 closed).

### How do the docs carry the charting picture for beginners?

Operator, round 4: "9a | 10a".
Q9: the eight words join "The words, one at a time" in docs/guide/parts.html, and a new page chart.html between Create and Next tells the flow with the intake's session example. create.html, files.html, in-practice.html and cheat.html sync their chart lines. Reason: one page per step, charting has no step page today. Closed: expanding Create with the picture.
Q10: only the pages Q9 touches are rewritten for a beginner: short sentences, one idea per paragraph, terms used only after Parts defines them. Reason: checkable in review. Closed: a full pass over all sixteen pages, which would need its own chart and criterion.

Exclusions: the disk rename, status command, chart migration and the four docs word swaps in disk-names.md are owned by rename-vocabulary and are complete before this leaf opens. The migrations in other-repos.md belong to other repos.

### Standing design lines

- Never mock auth.
- Server-side authorization on every non-public path.
- State changes as real backend mutations.
- No hardcoded secrets.
- No vanity tests.
- Mandatory negative and edge-case tests.
- Any leaf touching a user-visible flow must carry at least one verification command that exercises the flow end to end and leaves an artifact. Browser flows use Playwright only: headless Chromium, trace on, no video, installed as a consumer-repo dev dependency by the first leaf needing it. Non-browser flows use a real request or invocation. The blocking `checks` commands judge the exit code and the implementation report records the artifact path as evidence.
- Leaf work is agent-owned. A step physically requiring the operator is a human-only prerequisite completed before the leaf opens. Credential access alone never qualifies. An unforeseen physical blocker ends the attempt and informs the operator.
- Every secret including production lives in the consumer repo's gitignored .env. The operator explicitly accepts that agents can read it. No secret vault, broker, or off-machine credential pile exists.

## Leaf architecture
Owned surfaces: `docs/guide/chart.html` (new), `docs/guide/parts.html`, `docs/guide/create.html`, `docs/guide/files.html`, `docs/guide/in-practice.html`, `docs/guide/cheat.html`, `docs/guide/index.html` (page list and nav), the header nav block of every other guide page (one new link), and `tests/browser/docs-shell.pw.ts` only if its page list is enumerated there.

Literal interfaces:
- `chart.html` follows the existing page skeleton: same header nav, `aria-current="page"` on its own link, numbered title in the `NN · Create work` style with the number after Create and the following pages renumbered if the guide numbers them, previous link Create, next link Next, same footer line, same `style.css`.
- Nav order on every page: Home, The idea, Parts, State, Install, Setup, Create, Chart, Next, Phases, Files, Merge, In practice, Limits, Problems, Learn, Cheat sheet.
- The eight words in `parts.html` use the definitions in the rename-vocabulary brief, one entry each, in the order territory, map, fog, fork, question, round, chart, off route.
- Verification: `bunx --no-install playwright test --config tests/browser/playwright.config.ts`, headless Chromium, trace on, no video; the report records the trace path.

Exclusions: no other guide page is rewritten. No change to skills, src, tests outside `tests/browser/`, or README.

Dependencies: blocked by `rename-vocabulary` so the page documents the shipped words and the already-swapped lines.

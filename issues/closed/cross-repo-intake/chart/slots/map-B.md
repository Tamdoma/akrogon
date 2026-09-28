# Slot B independent map: intake 38

Read on 2026-09-28. No existing locks or operator corrections supplied. This is an independent map, not a taken decision or handoff. No other chart-38 scratch output was read. No tracked files were edited and no GitHub writes were made.

## Findings

- **F1 · The report describes two separate gaps.** Research: **operator**, `issues/seeds/38-cross-repo-duplicate-report-stays-open.md:8-27`. The requested outcomes are destination reports visible before cross-repo handoff and `pull --all` refreshing every registered repo. Refreshing mirrors alone does not make a chart read them. This separates command work from chart workflow work.
- **F2 · The command gap reproduces.** Research: **better-than-training**, `src/pull.ts:79-102`, `src/config.ts:106-122`, and live command below. With `--all`, a recognized current repo takes the early return before the global loop. Shared Git directory resolution means registered worktrees also take that branch. The global config lists seven repos, but running `akrogon pull --all` from akrogon printed only `akrogon: 1 open issues pulled` and exited zero.
- **F3 · Global behavior was already the historical contract.** Research: **operator** supplied historical material, `issues/closed/akrogon-loop/github/pull-close/design.md:7-19` and `brief.md:7`. The recorded contract says every registered repo and calls that operation from startup. Research: **better-than-training**, `README.md:137,153` is ambiguous because it explains cwd-sensitive sweep behavior immediately before saying pull has the same option. Restore the explicit intake request and original pull contract. Do not change `next --all` as an incidental consistency fix.
- **F4 · Current tests miss the failing cwd.** Research: **better-than-training**, `tests/pull.test.ts:201-235` calls `--all` from fixture home, outside the registered repo. `tests/pull.test.ts:167-198` covers worktrees for plain pull. `tests/pull.test.ts:238-259` checks startup declaration and argument forwarding, not actual all-repo selection. All six existing pull tests passed, 73 expectations. Regression coverage should exercise inside a registered root and its worktree, plus existing outside and partial-failure cases.
- **F5 · Startup already supplies the intended flag.** Research: **better-than-training**, `plugin/herdr-plugin.toml:7-11`, `plugin/pull.sh:1-3`. It declares pull with `--all` before next with `--resume`, and the shell wrapper forwards arguments. A command fix is sufficient for repo selection regardless of startup cwd. I did not run Herdr startup or establish its cwd or failure-continuation semantics. No plugin rewrite is currently justified.
- **F6 · Destination intake has no explicit checkpoint.** Research: **better-than-training**, `skills/chart-issues/SKILL.md:23-33,41-43`, `skills/chart-issues/assets/shapes.md:3,62,162,166`. The skill refreshes at open and allows registered destinations, but never explicitly refreshes and compares a newly selected destination's reports before handoff. Identity deduplication cannot identify two different GitHub identities describing the same delivered behavior. The operator-note import restriction also needs a clear distinction between checking related destination reports and draining unrelated destination intake.
- **F7 · Closure follows sources, including cross-repo identities.** Research: **better-than-training**, `src/phase.ts:138-167`, `src/pull.ts:107-123,183-204`. Completion gathers declared identities and targets each identity's repository explicitly. No semantic search occurs at merge. Research: **operator** history, `issues/chart/stuck-seat-recovery/INTAKE.md:6-11` lists #32, #35 and later #36, while `CHART.md:19` records handoff. Research: **better-than-training**, `/home/ivan/.pi/agent/extensions/issues/closed/seat-subagent-freezes/same-repo-worktree-cwd/state.yaml:1-10` and the corresponding `admission-fault-no-block/state.yaml:1-10` record merged leaves with #32 and #35 only. #5 is absent. This is consistent with the stated cause and does not establish a completion defect.
- **F8 · The old report is already closed.** Research: **better-than-training**, authenticated GitHub reads of `repos/Tamdoma/pi-extensions/issues/5` and `/comments`. Created 2026-09-28 07:37:49Z, closed 14:40:07Z, with comment `delivered by same-repo-worktree-cwd 3b478e9` at 14:40:06Z. Its parallel outside-root confirmation hang matches the operator's described case. These observations support the incident but do not independently prove when the first destination pull occurred. There is no remaining #5 cleanup to perform.
- **F9 · One source must have one completion owner.** Research: **better-than-training**, `skills/chart-issues/assets/shapes.md:162`; `src/phase.ts:149-167` implements issue/epic source handling. The fix must preserve this constraint. Blindly putting a destination identity on another issue's leaves can create competing owners or close a partially covered report too early.
- **F10 · Checkout freshness is a real qualification.** Research: **better-than-training**, `git rev-parse HEAD` = `337ab2672369754ad91de20e2ca7ab64b3f27434`; `git rev-list --count main..origin/main` = 6. Inspected `git diff HEAD origin/main` for relevant surfaces: pull implementation, currentRepo mechanism, phase completion, plugin and chart SKILL have no relevant mechanism differences. Upstream changes add preflight/worktree support and adjust test fixtures. Citations here refer to this inspected checkout. Prepare implementation against the current integration base, without reverting the unrelated existing issue-record changes. No fetch or checkout change was performed.

## Proposed destination and split

**D1 · One akrogon destination:** reliable intake coverage before handoff and eventual source closure. Registered root: `/home/ivan/Work/infra/akrogon`. Suggested issue `cross-repo-intake`, containing two independently checkable leaves:

- **A1 · `pull-all-repos`:** fix explicit `--all` repo selection, retain plain pull's registered-root/worktree behavior and aggregate failure handling, add the missing cwd regression cases, clarify pull semantics in README. Own `src/pull.ts`, `tests/pull.test.ts`, and relevant README text. Inspect config and plugin as consumers, change them only if implementation evidence requires it.
- **A2 · `chart-destination-intake`:** define destination refresh, semantic review, provenance and source ownership at the chosen checkpoint, with matching guide text. Own `skills/chart-issues/SKILL.md`, relevant `assets/shapes.md` prose, and `docs/guide/chart.md` or `create.md` only where the behavior is explained. Verify behavior through concrete cases, not tests requiring exact wording.

Both leaves carry `Tamdoma/akrogon#38` under this single issue owner. Both can run in parallel with no blocked-by when A2 uses plain pull in each destination's registered root. A2 must not depend on a newly fixed `--all` unless the operator chooses global scanning. No pi-extensions implementation leaf, historical state edit, completion rewrite, automatic semantic matcher, new registry, new configuration, polling or unrelated command flag changes are proposed.

## Material forks

These are separate prospective rounds. Take discovery scope first because it changes remaining ownership and failure questions. Recommendations are not operator answers.

### Q1 · Should the chart inspect only its source and chosen destination repos, or every registered repo?

The missed report lived in the destination. The configured registry currently contains seven repos. Fixing `--all` makes global refresh possible, but it does not decide which reports a chart should compare or import.

Research: **operator**, intake #38 expected behavior and historical `pull-close/design.md:11-13`, read 2026-09-28; **better-than-training**, `SKILL.md:27-31`, `shapes.md:62` and live `akrogon config`. Destination coverage solves the demonstrated miss without turning each chart into a global intake drain.

- **A (recommended)** Refresh and inspect the source plus each selected destination, including destination open/closed owners and chart provenance. Compare reports related to the scoped work and leave unrelated reports for their own door. This directly covers the failed case and isolates unrelated repo failures.
- **B** Refresh and inspect every registered repo for related reports on each chart. This can find third-repo duplicates but increases scope, scan cost and exposure to unrelated unavailable repos.

Pitfalls: Destination-only coverage does not promise detection in arbitrary third repos. Pulling all repos without actually inspecting their intake changes no semantic coverage. Explicit operator notes must still allow a related-report check without silently authorizing an unrelated seed drain.

Reply `1-A`, `1-B`, or free text.

Challenge check: A globally routed reporting setup could make destination-only coverage insufficient. Current pull reads origin regardless of a seed-issue routing override (`README.md:165-175`). The intake requests destination coverage, not a redesign of report routing.

### Q1 · Should destination intake be refreshed when the destination is chosen and checked again before handoff?

A destination can become known after the opening pull, and reports can arrive during a long chart. `shapes.md:166` currently has no destination intake refresh gate.

Research: **better-than-training**, `SKILL.md:27,51`, `shapes.md:62,166`, read 2026-09-28. Failed refresh cannot authorize stale intake, and a newly found report can change scope and reopen forks.

- **A (recommended)** Refresh and compare when each destination is selected, then refresh before the final contract review/handoff and inspect new or changed reports. A relevant change reopens the affected discussion. This catches mid-chart intake while avoiding discovery only after contract drafting.
- **B** Refresh and compare once at final handoff review. This is simpler but can expose scope changes late.
- **C** Refresh only on destination selection. This is cheaper but knowingly misses reports arriving during the chart.

Pitfalls: No checkpoint can promise to catch reports filed after its last successful listing. A failed required destination refresh holds the affected handoff, while independent destinations need not stop. A non-GitHub destination cannot prove coverage through a GitHub mirror and must be reported explicitly, not treated as an empty queue.

Reply `1-A`, `1-B`, `1-C`, or free text.

Challenge check: Two pulls may be disproportionate for a very short chart. The contract can treat a just-completed destination check immediately before handoff as satisfying both checkpoints, without adding arbitrary freshness timers.

### Q1 · For a matching destination report, should the chart keep it open until delivery or close it immediately as a duplicate?

A match must be judged against the report's requested behavior, not its title. #5 includes several expectations, so partial overlap cannot establish complete delivery. Existing skill language closes reports recorded as duplicates during the chart, whereas the intake expects destination reports to enter leaf sources and close with delivery.

Research: **operator**, intake #38 expected behavior; **better-than-training**, `SKILL.md:33`, `shapes.md:162`, `src/phase.ts:149-167`, and the fetched #5 body, read 2026-09-28. This exposes a real policy choice between duplicate closure now and completion-linked closure later.

- **A (recommended)** For fully covered, unowned reports, preserve the report verbatim and attach its identity to every leaf under the delivering owner. Close through existing completion behavior. This meets the intake's expected behavior and keeps unresolved work visible.
- **B** Close a confirmed duplicate during charting with a reference to the canonical report, keeping only the canonical identity as a completion source. This reduces the open queue earlier but does not provide the requested delivery-linked closure for the duplicate.

Pitfalls: A report already owned by another active issue or handed-off chart cannot be silently assigned again. Surface that conflict for an operator decision before emission. A report proven already delivered uses the existing delivered-report path. A partial match remains open until its uncovered behavior is explicitly included or separately resolved. Historical emitted contracts must not be silently rewritten.

Reply `1-A`, `1-B`, or free text.

Challenge check: A changes how the existing generic “duplicate” instruction applies to reports of still-unfinished work. The final skill must distinguish those from already delivered reports explicitly. This is an ownership policy choice, not justification for a merge-time semantic search.

## Already specified rather than an invented fork

**D2 · Explicit `pull --all` is global from any cwd.** Intake #38 asks for this directly, and the original operator contract agrees. Plain pull remains local and requires registration. Preserve attempts across all registrations and nonzero aggregate failure as currently implemented in the global branch. There is no need to ask the operator to reconfirm the explicit request. Clarify README so pull is not read as inheriting next's cwd-sensitive sweep behavior.

## Probe record and verification limits

2026-09-28, installed command resolves to `/home/ivan/Work/infra/akrogon/src/akrogon.ts`, commit above. GitHub CLI `2.101.0`, Bun `1.4.2`. Identity reference: existing GitHub CLI login `ivanjuras`, verified with `gh api --hostname github.com user --jq .login`. No credential values were read or printed.

- **P1** `akrogon config` in akrogon: seven registered roots, akrogon selected, grounding index `docs/reference-index.md`. Read that index, relevant area files and `learnings/LESSONS.md`.
- **P2** `akrogon pull --all` in akrogon: exit 0, only `akrogon: 1 open issues pulled`. This reproduces selection failure, not seven-repo success after a fix.
- **P3** `akrogon pull` in `/home/ivan/.pi/agent/extensions`: exit 0, `pi-extensions: 0 open issues pulled`. Confirms destination read access now. It cannot reconstruct the original pre-fix seed listing.
- **P4** `gh api --hostname github.com repos/Tamdoma/pi-extensions/issues/5` and `/comments`: read-only incident confirmation described in F8. Local `gh api --help` documents `--paginate` fetching all pages and `--slurp` wrapping their arrays, consistent with `src/pull.ts:51-63`. No GitHub close/comment operation was run.
- **P5** `bun test tests/pull.test.ts`: six pass, zero fail, 73 expectations. Fixture cleanup is performed by the tests. Passing tests do not cover the reproduced global-selection bug.

Only gitignored seed mirrors were refreshed. No probe scratch files were created, so no scratch cleanup was needed. This map is the sole requested retained output. No historical lesson edits or pruning were performed because this slot is read-only. Any eventual handoff must record operation proof for its actual selected contract. GitHub writes remain explicitly unauthorized in this mapping pass.

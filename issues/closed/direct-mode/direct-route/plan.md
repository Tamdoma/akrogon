# Plan: direct-route

Debate: no. Synthesis written directly from brief.md and design.md. Prerequisites hand-built-removal and direct-setting are
landed on `origin/main` (`d17029e`, `eea5a2d`); `akrogon config` already prints `direct` (src/config.ts:43). No credential
is named by this leaf and `akrogon status direct-route` prints no `Missing:` lines.

## Read first

- `docs/reference-index.md`, `skills/AREA.md`, `tests/AREA.md`
- `learnings/LESSONS.md` (relevant: review by running code 2026-09-10, uncommitted handoff 2026-09-11, stale rule in docs
  2026-09-11, prose assertions 2026-10-01)
- `src/phase.ts:270-375` (guard call order and the four exported guards), `src/config.ts:160-225` (`readGlobal`, `readRepo`,
  `target`), `src/test-files.ts`, `src/akrogon.ts` (uncaught error = stderr + non-zero exit)
- `tests/helpers.ts` (`fixture`), `tests/phase.test.ts:204-235` (guard refusal scenarios), `tests/chart-usage.test.ts`
  (script-spawning test shape)
- `skills/chart-issues/SKILL.md:47,59,67-85`, `skills/chart-issues/assets/shapes.md:5-35,240-273`
- `skills/implement-issue/SKILL.md:10,23,86-99`, `skills/check-issue/SKILL.md` (whole), `skills/broadcast-issue/SKILL.md`
  (whole), `docs/guide/chart.md:193-239`, `docs/guide/setup.md:58`

## Decisions

- D1. Guard script is `skills/chart-issues/scripts/direct-guards.ts`, invoked
  `bun <skill-folder>/scripts/direct-guards.ts <worktree> <repo-key> <chart-folder>`. Args parsed with a zod tuple. Repo
  loaded with `readGlobal()` and `readRepo(key, global.repos[key])`; an unregistered key throws `Unknown repo key: <key>`.
- D2. The script awaits, in `src/phase.ts:275-278` order, `requireClean(worktree)`,
  `requireNoIssueFiles(repo, worktree, chartFolder)`, `requireTestChangeCitations(repo, worktree)`,
  `requireNonEmpty(repo, worktree)` with default `from`/`to`. No try/catch: the first guard error propagates, so bun
  prints the identical message to stderr and exits non-zero, the same way `akrogon phase` surfaces it. Success prints one
  line `direct guards passed` and exits 0. src/phase.ts is imported unchanged.
- D3. The guards compare against `<remote>/<default_branch>`, so the door runs the script only after its fetch and rebase
  (landing order step). The skill says so in one clause.
- D4. Direct artifact layout under the chart folder: `<chart>/direct/plan.md` and `<chart>/direct/report.md` (implement-issue
  direct form), `<chart>/slots/review-B-<n>.md` (B's return file per round, n = 1 for initial review). The door names the
  exact path in each prompt to B. The worktree is `<worktree_root>/<slug>` on branch `<slug>`, slug chosen at attempt start
  and recorded in CHART.md.
- D5. CHART.md records the chosen route under the handoff review as a `Route: lifecycle (debate yes|no)` or
  `Route: direct` line. shapes.md gains a `## Direct attempt` section shape in the chart record: branch, worktree, base,
  head, rounds used / `fix_rounds`, push attempts, done, not done, trigger, review file paths, landed SHA. The section is
  written at attempt start and updated each round, so the round count survives session replacement.
- D6. chart-issues gets one new `## Direct route` section after `## Handoff` holding: eligibility refusals (verbatim list
  from eligibility 1a), the route question, the protocol (implement → B review → repair rounds → landing → completion →
  cleanup), repair bound, growth stop with its two continuations, and the one-live-branch rule. Existing lines change only
  where they must admit the route: line 47 (direct single item proceeds to handoff review, where the route is chosen),
  line 59 (human prerequisite complete before opening a leaf or starting a direct attempt), line 69 (handoff review lists
  the route question or the one-line unavailable notice), line 85 (`Closed` follows a direct landing after cleanup;
  `Held` follows abandon). No `state.yaml` is written on the direct route.
- D7. Unavailable notice: when `akrogon config` in the destination does not print `direct: true`, the review shows one
  line `Direct route unavailable: <repo> has not opted in.` and is otherwise unchanged. When on but ineligible, the review
  names the refusal reason in one line and asks the lifecycle questions as today.
- D8. Route question: one combined question `lifecycle (debate no) | lifecycle (debate yes) | direct` with the door's
  recommendation, replacing the separate debate question for that chart. Explicit direct authorization already given in
  the session counts as the answer. A later `direct` setting change does not alter an approved route.
- D9. Landing order is stated as a numbered list in chart-issues exactly as brief criterion 3 and landing 1a: committed head
  with B ready/nits → fetch, rebase onto `<remote>/<default_branch>`, refresh `AKROGON_BASE` from `akrogon config` in the
  worktree → conflict resolution sends B a focused re-check with range-diff recorded, a clean rebase reruns checks only →
  `checks` then `merge_checks` → guard script green → `git push <remote> <sha>:refs/heads/<default_branch>`, never force,
  at most 2 attempts each with fresh rebase, checks and B conflict re-check → `akrogon close <id> --by "<chart> direct <sha>"`
  per delivered source after checking other owners' outstanding work → broadcast-issue when broadcast is configured,
  failure does not reopen → `git worktree remove`, verified by `git worktree list`; `git branch -D <slug>`, verified by
  empty `git branch --list <slug>` → landed SHA into `Direct attempt` → `Closed <date>`. Root checkout is never reset; a
  failed local update is reported.
- D10. Repair round = B `fix` (or a blocking landing-check failure) + one door repair pass over all Fixes + B re-check of
  the repair diff. Bound = repo `fix_rounds` from `akrogon config`. Exhaustion stops with open Fixes listed; operator
  chooses one more round, lifecycle handoff, or abandon. Push attempts are not rounds.
- D11. Growth stop triggers (verbatim from growth 1a): a locked decision must change, a need eligibility 1a excludes, a
  criterion cannot pass in scope after permitted repairs, a second outcome. Action: stop coding and landing, one
  partial-labelled commit for a clean tree, keep the worktree, write `Direct attempt`, open the trigger as a new fork.
  Continuations: lifecycle handoff (leaf slug = branch so `ensureWorktree` adopts it, leaf starts at its normal planning
  phase) or abandon (branch and worktree removed, `Held <date>`).
- D12. implement-issue Standalone gains a direct-form paragraph: prompt `implement-issue direct chart=<chart-folder>
  worktree=<path>`; task = the chart's draft brief and design read in place; checkout = the worktree; `checks` and base
  from `akrogon config` in that worktree; plan and report under `<chart>/direct/`; delegation as Standalone; it returns to
  the door instead of finishing. Lines 10, 23 and 90 are edited to admit this form (config read and chart-folder
  artifacts only in the direct form).
- D13. check-issue gains `## Standalone review`: prompt `check-issue direct slot=B chart=<chart-folder> worktree=<path>
  base=<sha> head=<sha> out=<chart>/slots/<file>`; inputs are the chart's brief and design, worktree, base, head; the
  Fix/Nit bar, base-run rule, verdicts and re-check scope of check.review/check.repair apply by reference; B writes only
  the named file, runs no phase command and returns.
- D14. broadcast-issue gains a direct trigger: the door is the sender after a direct landing; context is the chart's
  brief plus pushed SHA and closed sources; the description, line 10 and the merge-slot clause (line 43) name this case.
- D15. docs/guide/chart.md gets one short section `## Direct route` before the handoff diagram's closing paragraph: who
  opts in (link setup.md), when the door offers it, what A and B do, what lands and how the chart closes, what a stop
  leaves behind. It links to skills rather than restating eligibility or landing rules.

## Notes for review

- Brief criterion 1 says "combined route question (lifecycle with debate yes/no, or direct)"; D8 renders that as three
  choices. No conflict with the design.
- `docs/guide/merge.md:64,97` describe broadcast as running only on issue or epic completion. Not owned by this leaf;
  implementation reports it as an out-of-scope stale hit (lesson 2026-09-11), not edited.

## Checklist

### Wave 1 (three independent units, disjoint paths, no shared test resource)

U1. Guard script and test
- Owns: `skills/chart-issues/scripts/direct-guards.ts`, `tests/direct-guards.test.ts`.
- Shared test resource: none (each test makes its own `fixture()` repo and `git worktree add -b <slug>`).
- Prerequisites: none.
- Work: D1, D2. Test spawns `bun <script> <worktree> repo <chart-folder>` with `AKROGON_HOME=f.home`, one test per case:
  dirty tree → stderr contains `Uncommitted work`; committed `issues/` file on branch → `Issue files on leaf branch`;
  no commits on branch → `Empty leaf branch`; modified test file already on `origin/main` without trailer →
  `Changed test files need a citation`; same change with a `Test-Change: <path> <reason>` trailer plus a code change →
  exit 0. Each refusal is shown red once by removing its guard call; the report records each break and restore.
- Criterion: 5.

U2. chart-issues skill and shape
- Owns: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`.
- Shared test resource: none.
- Prerequisites: none (script name and artifact paths are fixed by D1 and D4).
- Work: D3, D5–D11. shapes.md: `Direct attempt` section shape in the CHART.md example and the `Route:` line; line 259
  area states no `state.yaml` is written on the direct route.
- Criteria: 1, 2, 3, 4.

U3. Peer skills and guide
- Owns: `skills/implement-issue/SKILL.md` (lines 3, 10, 23, Standalone), `skills/check-issue/SKILL.md` (description, new
  section), `skills/broadcast-issue/SKILL.md` (description, lines 10, 14, 43), `docs/guide/chart.md` (new section).
- Shared test resource: `tests/docs-links.test.ts` reads the guide; it is read-only and not shared with U1 or U2.
- Prerequisites: none (terms fixed by D4, D12–D15).
- Work: D12–D15.
- Criterion: 6.

### Docs

- `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`: U2.
- `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/broadcast-issue/SKILL.md`: U3.
- `docs/guide/chart.md`: U3.
- `skills/AREA.md`, `tests/AREA.md`: not affected (neither lists chart-issues scripts or per-script tests).
- `docs/guide/merge.md:64,97`: reported only (see Notes).

## Verification

| Criterion | Proof | Failure caught | Size | Rerun when |
|---|---|---|---|---|
| 1 | Review of chart-issues `## Direct route` and line 69 against eligibility 2a and D7, D8 | Route asked when off; separate debate question kept; route not recorded | minutes | SKILL.md or shapes.md changes |
| 2 | Review: refusal list matches eligibility 1a item by item (inputs, grants, produces, retained, live run or outside call, >1 outcome, unfinished dependency, pending human prerequisite, B not named) | Missing or widened refusal | minutes | SKILL.md changes |
| 3 | Review: numbered landing list matches D9 and landing 1a/2a; push form and 2-attempt bound literal | Wrong order, force push, missing verification | minutes | SKILL.md changes |
| 4 | Review: repair bound, growth triggers, continuations, one-live-branch rule; shapes.md section fields per D5 | Unbounded rounds, lost round count, missing section | minutes | SKILL.md or shapes.md changes |
| 5 | `bun test tests/direct-guards.test.ts --timeout=30000` | Guard skipped, wrong order, different message, wrong exit code | seconds | script, test, or src/phase.ts guards change |
| 6 | Review of the three skills and guide against D12–D15; `bun test tests/docs-links.test.ts` | Missing section, restated rules, broken guide link | seconds + minutes | U3 files change |
| all | Repo `checks`: `bun run format`, `bun run typecheck`, `bun test --timeout=30000`, `bun test --changed="$AKROGON_BASE" --timeout=30000` | Format drift, type errors, regressions | minutes | any commit |

No test asserts skill prose wording. No `merge_checks` or whole-suite run is added beyond the repo `checks`. Not a
slow-run leaf.

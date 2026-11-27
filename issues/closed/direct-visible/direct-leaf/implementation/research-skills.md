# Research: direct-route surface to be removed or rewritten

Worktree: /home/ivan/.akrogon/worktrees/akrogon/direct-leaf. All quotes verbatim with line numbers.

## 1. skills/chart-issues/SKILL.md — the `## Direct route` section (147 lines total)

The section is lines 101-116, quoted in full:

- L101: `## Direct route`
- L103: `The direct route is a second ending for the handoff: the door implements one small settled chart itself in a worktree, B — the first named peer — reviews, and the door lands it on the default branch without leaf files. It needs no repo setting: the door offers it at its own discretion whenever the chart is eligible, and the operator can always decline.`
- L105: `Direct is not offered, and the review names the refusal in one line and the handoff goes to the lifecycle, when any of these holds:`
- Eligibility refusals, L107-112:
  - L107: `- the draft needs `inputs`, `grants`, `produces` or `retained`;`
  - L108: `- a done-criterion needs a live run or outside call during implementation (charting proofs do not count);`
  - L109: `- more than one outcome or an unfinished dependency exists (door judgment);`
  - L110: `- a human prerequisite is pending;`
  - L111: `- B is not named;`
  - L112: `- the door is running under autopilot (`## Autopilot`).`
- L114: `When eligible, the review asks one route question with the door's recommendation and a reply key: lifecycle or direct. The door may recommend lifecycle for a risky small job. Explicit direct authorization already given in the session is the answer. The chosen route is recorded in CHART.md as the `Route:` line. Selecting direct includes the door's push authority; push, source close and broadcast are coordination, not live calls under eligibility.`
- L116: `The door reads [direct-route.md](assets/direct-route.md) when the direct route is chosen.`

### Every other direct-route / landing / broadcast mention in SKILL.md

- L3 (front matter description, tangential): `...then hand settled work directly to leaf contracts...`
- L12: `...the fork's `## Charting proofs` record, with logs kept in the chart's `direct/` capture holder. The door sizes and raises that budget like a seat.` — `direct/` is the run-check log holder name.
- L49: `The door runs a paid charting probe with `akrogon run-check --holder <absolute-chart-folder>/direct -- <argv>...`...` — same `direct/` holder, unrelated to landing.
- L59 (Drain): `...A direct single item whose map finds no open fork and no fog writes the same chart structure and proceeds to the handoff review immediately, where the route is chosen.`
- L71: `...a paid call runs only through `akrogon run-check --holder <absolute-chart-folder>/direct -- <argv>...` with its budget in the argv...`
- L73: `...and record completion before opening a leaf or starting a direct attempt.`
- L83 (Handoff): `...the review also shows the route question or the one-line refusal from `## Direct route`;...`
- L99 (Handoff, chart tail): `On the direct route no leaf files or `state.yaml` are written, `Closed <YYYY-MM-DD>` follows a direct landing after cleanup, and `Held <YYYY-MM-DD>` follows abandon. The door runs `akrogon pack <chart>` before appending `Closed`, `Held` or `Handed off` when `<chart>/direct` holds a log. ... The markers are `Handed off <YYYY-MM-DD>`, `Closed <YYYY-MM-DD>`, and `Held <YYYY-MM-DD>`, each beginning its own line, with the last marker in the file authoritative. The door runs the usage script again when it appends `Handed off`, `Held` or `Closed`.`
- L65 "direct operator requests", L27 "directory", L47 "direction", L79 "directs" — false positives, not direct-route.

What the door does today per this file: implements the chart itself in a worktree, B reviews, the door lands it on the default branch with no leaf files; selecting direct includes push authority; the review asks one route question (lifecycle or direct) recorded as the `Route:` line in CHART.md.

## 2. skills/chart-issues/assets/direct-route.md (30 lines, read in full)

Steps 1-4 (kept flow):
- L7 step 1: create worktree sparse with no `issues/` folder: `git worktree add --lock --reason "<chart-folder> direct" --no-checkout -b <slug> <worktree_store>/<slug> <base>`, then `sparse-checkout set --no-cone '/*' '!/issues/'`, then checkout; write the `Direct attempt` section.
- L8 step 2: door runs `implement-issue direct chart=<chart-folder> worktree=<path>`, which writes `<chart>/direct/plan.md` and `<chart>/direct/report.md`.
- L9 step 3: B review via `hc send --json <B address> "check-issue direct slot=B chart=<chart-folder> worktree=<path> base=<sha> head=<sha> out=<chart>/slots/review-B-<n>.md..."`, collected under questions.md exchange rules; the Fix/Nit bar and verdicts are check-issue's.
- L10 step 4: repair rounds per the bound.

Step 5 "Landing, after B returns ready or nits on a committed head" (L11-21) — the door's own landing steps:
- L12 sub-step 1: fetch, rebase onto `<remote>/<default_branch>`, refresh `AKROGON_BASE` from `akrogon config` in the worktree.
- L13 sub-step 2: conflict resolution sends B a focused re-check of the resolved range with range-diff recorded; clean rebase reruns checks only.
- L14 sub-step 3: `akrogon verify --holder <chart>/direct` in the worktree, "which runs `checks` then `merge_checks` on a fresh checkout of the rebased head and writes the receipt direct-guards requires"; plus a long known-red retry/judgment protocol (`--known-red` on no-cause red, two-log read of head and base logs, filing base reds through seed-issue's `## Lifecycle filing`, recording judgment in `<chart>/direct/report.md`). "only a failing known-red result or a disagreeing judgment is a blocking landing-check failure".
- L15 sub-step 4: `bun <skill-folder>/scripts/direct-guards.ts <worktree> <repo-key> <chart-folder>` must exit 0, run only after fetch and rebase.
- L16 sub-step 5: `git push <remote> <sha>:refs/heads/<default_branch>` of the exact tested SHA, never force; a rejected push keeps the branch, at most 2 push attempts each with fresh rebase/checks/B re-check, then stop.
- L17 sub-step 6: per delivered source, `akrogon close <id> --by "<chart> direct <sha>"`.
- L18 sub-step 7: broadcast-issue as sender when the repo configures broadcast, with chart brief, pushed SHA and closed sources as context; a failure does not reopen.
- L19 sub-step 8: `git worktree unlock` then `git worktree remove` verified by `git worktree list`, then `git branch -D <slug>` verified by empty `git branch --list <slug>`.
- L20-21 sub-step 9 plus note: `akrogon pack <chart>` when `<chart>/direct` holds a log, then the landed SHA into the `Direct attempt` section, then `Closed <date>`. `The root checkout is never reset, and a failed local update is reported.`

L23 repair bound: one round is B `fix` (or a blocking landing-check failure — only a failing known-red result or a judgment disagreeing with a pass) + one door repair pass + B's re-check. Bound is the repo's `fix_rounds` from `akrogon config`, count kept in `Direct attempt`. A passing last round lands. Exhaustion stops with open Fixes; operator chooses one more round, lifecycle handoff, or abandon. Push attempts are not rounds.

L25 growth stop: stop coding and landing when a locked decision must change, a need eligibility excludes appears, a criterion cannot pass in scope, or a second outcome appears. Door commits as one partial-labelled commit, keeps worktree, updates `Direct attempt` (trigger, done, not done), opens trigger as new fork. Continuations L27-28:
- lifecycle handoff: `git worktree unlock <path>` before handoff "because the command's `ensureWorktree` adopts the worktree as-is and leaf rules must be able to remove it later"; leaf slug equals the branch; leaf starts at normal planning.
- abandon: unlock, branch and worktree removed, `akrogon pack <chart>` when `<chart>/direct` holds a log, then `Held <date>`.

L30: `No new direct attempt starts while a chart names a live direct branch.`

What the door does itself today: pushes (L16), broadcasts (L18), runs direct-guards (L15), closes GitHub sources (L17), rebases/verifies (L12-14), removes worktree/branch (L19), packs logs and writes end markers (L20).

## 3. skills/chart-issues/scripts/direct-guards.ts (21 lines, full)

```ts
1  #!/usr/bin/env bun
2  import { z } from 'zod';
3  import { readGlobal, readRepo, type GlobalConfig, type Repo } from '../../../src/config';
4  import { requireClean, requireNoIssueFiles, requireTestChangeCitations, requireNonEmpty } from '../../../src/phase';
5  import { command } from '../../../src/shell';
6  import { requireGreenReceipt } from '../../../src/verify';
7
8  const [worktree, key, chartFolder]: [string, string, string] = z
9    .tuple([z.string(), z.string(), z.string()])
10   .parse(process.argv.slice(2));
11 const global: GlobalConfig = readGlobal();
12 const path: string | undefined = global.repos[key];
13 if (path === undefined) throw new Error(`Unknown repo key: ${key}`);
14 const repo: Repo = readRepo(key, path);
15
16 await requireClean(worktree);
17 await requireNoIssueFiles(repo, worktree, chartFolder);
18 await requireTestChangeCitations(repo, worktree);
19 await requireNonEmpty(repo, worktree);
20 await requireGreenReceipt(repo, await command(['git', 'rev-parse', 'HEAD'], worktree), 'merge');
21 console.log('direct guards passed');
```

Inputs: three positional argv — worktree path, repo key, chart folder. Behavior: resolves the repo from global config, then runs in order:
1. `requireClean(worktree)` — throws `Uncommitted work in <worktree>:` on dirty porcelain (src/phase.ts L565-569).
2. `requireNoIssueFiles(repo, worktree, chartFolder)` — throws `Issue files on leaf branch belong in <leafPath>:` if `git diff <base>...HEAD -- issues` non-empty (src/phase.ts L571-581).
3. `requireTestChangeCitations(repo, worktree)` — throws `Changed test files need a citation:...` when M/D/T test files lack a `Test-Change:` trailer (src/phase.ts L634-648).
4. `requireNonEmpty(repo, worktree)` — throws `Empty leaf branch: no changes against <base>` (src/phase.ts L716-724).
5. `requireGreenReceipt(repo, HEAD sha, 'merge')` — yes, it runs requireGreenReceipt with scope `merge`; throws `No green merge verify receipt for <sha> under the current config; run akrogon verify on this commit` unless a green run exists for the tree under the current command set, a known-red receipt applies, or a main-red cover applies (src/verify.ts L650-667).
Output: stdout `direct guards passed` and exit 0 on success; non-zero with the thrown error on any refusal. It is a skill script, not an akrogon verb.

## 4. tests/direct-guards.test.ts (90 lines)

Five tests of the script end-to-end as a child process. Fixture shape: `fixture()` from tests/helpers.ts (L5 import) creates a temp AKROGON_HOME + git repo with an origin; `withBranch` (L11-34) writes `tests/a.test.ts`, commits, pushes `HEAD:main`, adds a worktree at `<home>/wt` on branch `direct`, and builds a `run()` closure that spawns `[process.execPath, script, wt, f.repo, resolve(f.home, 'chart')]` with `AKROGON_HOME` env via `spawnCaptured`, returning `{ code, stderr }`.

Tests:
- L41 `refuses uncommitted work`: writes uncommitted `code.ts`, expects non-zero and stderr contains `Uncommitted work`.
- L50 `refuses issue files on the branch`: commits `issues/open/x.md` + code, expects `Issue files on leaf branch`.
- L62 `refuses changed test files without a citation`: commits a change to `tests/a.test.ts` without citation, expects `Changed test files need a citation`.
- L72 `refuses an empty branch`: no changes, expects `Empty leaf branch`.
- L80 `passes a clean, cited, non-empty branch`: commits test+code change with message trailer `Test-Change: tests/a.test.ts reason here`, calls `greenReceipt(f, HEAD, 'merge')` to seed a green verify run, expects empty stderr and exit 0.

## 5. tests/receipt-gates.test.ts — the direct-guards cases

There is ONE dedicated direct-guards test, plus inline direct-guards invocations inside two merge-gate tests. Test names in file order (grep of `^test(`):
- L41 `a move into check.review needs a green leaf receipt for HEAD under the current command set`
- L63 `a repair move into merge needs a green leaf receipt for HEAD while check.fix takes none`
- L86 `the land gates stamp tested_top only with a green merge receipt for HEAD under the current command set`
- L114 `a qualifying linked pair satisfies the merge gates and a non-qualifying pair refuses them`
- L190 `merge gates accept a covered main-red head and refuse an uncovered or resolved one`
- L308 `direct guards need a green merge receipt for the worktree HEAD under the current command set`

The three direct-guards usage sites:
1. Inside L114's test: a `guards()` helper (L152-162) spawns direct-guards.ts with `[worktree, f.repo, <home>/chart]`. Assertions: L170 `expect((await guards()).code).not.toBe(0)` when only base-run evidence exists without proper coverage; L173 refusal stands for a rerun-row mismatch; L179-181 after the covered pair: `expect(passed.stderr).toBe(''); expect(passed.code).toBe(0)`.
2. Inside L190's test: same `guards()` helper shape (L228-238). L259-261 covered main-red head passes guards (exit 0, empty stderr); L276 uncovered second red unit: `expect((await guards()).code).not.toBe(0)`.
3. L308 dedicated test, quoted assertions: L323-325 `const missing: Result = await run(); expect(missing.code).not.toBe(0); expect(missing.stderr).toContain(\`No green merge verify receipt for ${head}\`)`; L326-327 with a stale-command-set receipt (`greenReceipt(f, head, 'merge', stale)`) still refused; L328-331 with a proper `greenReceipt(f, head, 'merge')`: `expect(passed.stderr).toBe(''); expect(passed.code).toBe(0)`.

So direct-guards shares the lifecycle's receipt machinery: a green merge receipt for the exact HEAD under the current command set, with main-red cover applying through requireGreenReceipt.

## 6. tests/docs-links.test.ts — direct-landing expectations

Relevant tests:
- L260 `test('chart-issues direct landing names the known-red command', (): void => {` — reads `skills/chart-issues/assets/direct-route.md` (L262) and asserts L265: `expect(content).toContain('verify --holder <chart>/direct --known-red');`
- L268 `test('seat texts and refs name every non-title red name', ...)` — L270 iterates `['skills/lifecycle-rules.md', 'skills/chart-issues/assets/direct-route.md']` requiring both contain `(script)` and `(no test name)`; also asserts five skills symlink lifecycle-rules.md.
- L294 `test('chart-issues skill names akrogon pack at every end-marker site', ...)` — L296 concatenates `skills/chart-issues/SKILL.md` and `skills/chart-issues/assets/direct-route.md`; L299 markers `['Handed off', 'Closed', 'Held']` must appear; L301-303 comment `// C6 is a doc contract: the pack command literal must stand at each of the three end-marker sites. Ordering and phrasing are judgment, not mechanics.` and assertion `expect(content.match(/\`akrogon pack <chart>\`/g)?.length ?? 0).toBeGreaterThanOrEqual(3);`

## 7. skills/chart-issues/assets/shapes.md — "Direct attempt shape"

The `## Direct attempt` section sits inside the CHART.md template fence at L78-92:

```
78  ## Direct attempt
79
80  <only on the direct route, written at attempt start and updated through landing; the route is fixed by the approved handoff review and a later `direct` setting change does not alter it>
81
82  - branch: <slug, also the worktree directory name under worktree_store>
83  - worktree: <path>
84  - base: <sha the attempt started from, then the sha after each rebase>
85  - head: <sha of the latest committed head>
86  - rounds used / fix_rounds: <n / limit>
87  - push attempts: <n / 2>
88  - done: <criteria passing>
89  - not done: <criteria open, or none>
90  - trigger: <growth stop trigger, or none>
91  - review files: <slots/review-B-<n>.md paths>
92  - landed SHA: <sha pushed, after landing>
```

Other direct mentions in shapes.md:
- L16: `slots/<pass>.md                 # peer exchanges, and direct review returns (review-B-<n>.md)`
- L17: `direct/plan.md, report.md     # only on the direct route`
- L20: `Create forks/ even for a fully settled direct item.`
- L29: `Route: <lifecycle | direct>` (CHART.md template line)
- L67: `- route: <lifecycle | direct>` (Autopilot record line)
- L417: `Replace sample values with the chosen slug, creation date and registered repo key. A direct-route chart writes no leaf files or state.yaml. ...`

## 8. "direct" mentions in the other five skills

### skills/implement-issue/SKILL.md
- L3 description: `...without a leaf, implement the prompt task standalone or, for the chart door's direct route, a charted task in a named worktree.`
- L10: `...a prompt without a leaf is a standalone task in the current checkout with this session as A, or the direct form `implement-issue direct chart=<chart-folder> worktree=<path>` run by the chart door.`
- L23: `...Standalone keeps its no-config, local-artifact behavior except in the direct form below.`
- L89: `Except for the direct form, standalone has no config or leaf reads, lifecycle state/log writes, phase call or checker...`
- L91: `### Direct form` heading.
- L93: `The prompt `implement-issue direct chart=<chart-folder> worktree=<path>` is the chart-issues direct route's implementation step, run by the chart door as A. The task is the chart's draft brief and design, read in place and not rewritten as a new brief. The checkout is `worktree=<path>`, where all code is read and edited. Run `akrogon config` there once for `checks` and the base. The plan goes in `<chart-folder>/direct/plan.md` and the report in `<chart-folder>/direct/report.md`, not in `implementation/`.`
- L95: `Direct implementation follows the Shared context command-output keeping rule with the absolute `<chart>/direct` path as holder: `akrogon run-check --holder <chart>/direct --name <label> -- <cmd>` keeps logs there. A wrong proof command is corrected under the `plan-issue` `plan.synthesis` proof-command rule and the correction is recorded in `<chart>/direct/plan.md`.`
- L97: `Delegation, checking and self-repair work as in Standalone, with A owning the result. A makes no phase call and does not finish: it returns to the door, which sends the result to B for review and back to A for repair rounds under the chart-issues direct route. Direct follows the same order rule: tests from the chart's draft brief first, committed, then code...`

### skills/check-issue/SKILL.md
- L3 description: `...also review a chart's direct-route implementation as slot B.`
- L10: `...With no leaf, the chart door prompts B with `check-issue direct slot=B chart=<chart-folder> worktree=<path> base=<sha> head=<sha> out=<chart>/slots/<file>`, followed as in Standalone review.`
- L114 (`## Standalone review`): `B follows this section, not the leaf sections, when the door prompts the direct form with no leaf. Inputs are the chart's draft brief and design in `chart=`, the code in `worktree=`, and the diff `base=..head=`. Judge them by the check.review Fix/Nit bar... Where those rules name `plan.md`, `report.md` or `AKROGON_BASE`, use `<chart>/direct/plan.md`, `<chart>/direct/report.md` and `base=`...`
- L116: `B reads no `akrogon config` leaf state, writes only the file named by `out=` (recording base, reviewed head, evidence and verdict `ready`, `nits` or `fix`), runs no `akrogon phase`, commits nothing and returns to the door. On this route the Shared context run-check rule holds with `--holder <chart>/direct` as the absolute holder...`

### skills/broadcast-issue/SKILL.md
- L3 description: `...run by the merge slot itself after `issue complete` or `epic complete`, or by the chart door after a direct landing.`
- L10: `This is the merge slot's own terminal task after `issue complete` or `epic complete`, or the chart door's after a chart-issues direct landing, never delegated, not another leaf phase. ... one completed standalone issue, one completed epic or one direct landing produces one message delivered to its configured targets.`
- L14: `...for a direct landing the door is the owner and supplies the chart's brief, the pushed SHA and the closed sources...` Also: `The sender works from supplied context alone and directs no questions elsewhere.` ("directs" — tangential)
- L43: `The sender (the merge slot, the broadcast-only B seat after a command-run merge, or the chart door after a direct landing) does not repeat the sender after its built-in retry or run a phase command because completion already happened.`

### skills/plan-issue/SKILL.md
- L43: `...records the old command, the new command, the reason and that guard's evidence in `implementation/report.md` beside the criterion it proves (B in `review-B.md`), on the direct route in `<chart>/direct/plan.md`; B judges A's recorded correction against this rule in review.`
- L45: `...a criterion whose proof needs new proof machinery ends the pass...` — contains "direct invocation of the product": `Each criterion's proof command uses a runner or script that exists at `AKROGON_BASE` or is one direct invocation of the product...` (tangential use of "direct")

### skills/watch-issues/SKILL.md
- L25: "unreadable directories" only — substring false positive.
- L61: `...`check.review` is never a direct target...` — about resume phase targets, not the direct route.
No direct-route content in watch-issues.

## 9. skills/AREA.md (36 lines)

Only line mentioning direct — L11:
`- `skills/chart-issues/SKILL.md` runs the chart door — signposts round, three modes, drain, take and handoff; `assets/` holds `shapes.md` (chart records), `questions.md` (round shape and consultant exchange), `standing-design.md` and the step files `direct-route.md`, `autopilot.md` and `handover.md`; `scripts/` holds `chart-usage.ts`, `door-reset.ts` (the handover reset, started with `hc run --bg`), `transcript.ts` (a terminal's transcript path) and `direct-guards.ts`.`

## 10. docs/use/quick-fix.md (60 lines)

The whole doc is the operator-facing direct route guide:
- L3: `The direct route lets the chart door build a small, settled change itself and land it on the default branch. Use it when one code-only change is fully charted and a separate leaf would be more ceremony than the work.`
- L9 `## What it skips and what it keeps`: skips the leaf handoff and `akrogon next`; no leaf files written; keeps charting decisions and seat B review.
- L11-24 `## When the door offers it`: no repo setting needed; chart as usual, name at least one consultant (B); the door decides eligibility at the handoff review and refuses in one line when: work needs inputs/grants/produces/retained; a done-criterion needs a live run or outside call while building; more than one outcome or unfinished dependency; a human-only step pending; no B pane named; door in Autopilot. On refusal you get normal lifecycle questions.
- L26-31: the route question lifecycle|direct with the door's pick; choice saved in CHART.md as `Route:` line.
- L33-46 `## What happens when you pick direct`: choosing direct lets the door push to the default branch. Steps: 1. branch+worktree; 2. door builds with implement-issue; 3. B reviews with check-issue; 4. repairs up to `fix_rounds`; 5. rebases, runs every configured check with `akrogon verify`, pushes the exact tested commit, never force-pushes; 6. closes delivered GitHub issues with `akrogon close`; 7. optional broadcast-issue when configured; 8. removes branch and worktree, marks chart `Closed`. `You watch the door's pane. You do not run these commands yourself.`
- L48-56 `## When it stops`: growth stop conditions (decision must change, excluded need appears, criterion cannot pass, second outcome) and rounds exhaustion; on stop the door commits partial work, keeps worktree, writes done/not-done in `Direct attempt`; operator picks: one more round, lifecycle handoff (work becomes a normal leaf at planning keeping the branch), or abandon (branch/worktree removed, chart `Held`).

## 11. docs/reference/commands.md — direct mentions

There is NO `direct` or `direct-drop` verb row. Direct appears only inside other rows:
- L63 `akrogon pack <folder>...`: `Pack the `*.log` files of a closed issue or a chart's `direct/` folder into `evidence.tar.zst`...`
- L52 `akrogon verify` row describes `--holder <dir>` generically (the direct flow uses `--holder <chart>/direct`) but never names direct.
- L22 `akrogon land <slug> --attempt <id>`: lifecycle landing — `Verify one merge attempt, run the merge checks, push and move the leaf to `merged`...` — the door landing is NOT a command today; the door runs git push itself (direct-route.md L16).
No occurrence of "direct-guards" in commands.md.

## 12. tests/command-reference.test.ts and tests/cli-help.test.ts — validation mechanics

### command-reference.test.ts (140 lines)
- L10-42: a hard-coded `contracts` map verb -> argument string, e.g. `land: '<slug> --attempt <id>'`, `verify: '[--sha <rev>] [--attempt <id>] [--holder <dir>] [--known-red]'`.
- L69-83 `checkReference(markdown, dispatcher)`: extracts the verb list by regexing `src/akrogon.ts` for the dispatch: L70 `/switch\s*\(verb\)\s*\{([\s\S]*)/` then L72 collecting `/^\s*case\s+['"]([^'"]+)['"]\s*:/gm`. It parses every table row of commands.md and asserts L77 `expect(rows.map((row) => row.verb).sort()).toEqual([...new Set(verbs)].sort())` — doc rows must exactly equal dispatched cases — and per row L80-81 the verb must exist in `contracts` and its argument groups must equal the contract.
- L91-93 test: `the commands reference covers every dispatched command and its argument contract`.
- L95-102 proves a newly dispatched verb without a doc row fails: L100 `expect(() => checkReference(valid, source.replace('switch (verb) {', "switch (verb) {\n case 'extra':"))).toThrow();`

So adding `direct` and `direct-drop` requires: (a) a `case` in akrogon.ts, (b) a row in commands.md, (c) an entry in the `contracts` map of this test — all three or the test fails.

### cli-help.test.ts (173 lines)
- L7: `import { VERB_OPTIONS, verbFlags, USAGE_LINES } from '../src/usage';` — L9 `const publicVerbs: string[] = Object.keys(VERB_OPTIONS);`
- L27-48 `every public verb answers --help with its declared flags on stdout, exit 0 and empty stderr`: loops over every VERB_OPTIONS key, expects exit 0, stdout contains `akrogon <verb>`, every declared flag printed, no undeclared flags printed, and L38 `if (USAGE_LINES[verb] !== undefined) expect(result.stdout, verb).toContain(USAGE_LINES[verb]);`
- L50-64 `akrogon --help prints the verb list...`: every public verb appears in `--help` output; bare call errors with `Usage: akrogon <install|listen|init|...` (derived from VERB_OPTIONS key order).
- L66-86 unknown flag test: exit 1, names the flag and the verb's declared flags.
- L157-173: a missing required flag value surfaces the commander-style parse error `TypeError: Option '--slot <value>' argument missing` (i.e. strict parseArgs errors propagate for non-unknown-flag errors).

So adding the verbs also requires entries in VERB_OPTIONS (or --help tests and dispatch diverge), and optionally USAGE_LINES entries if the verbs have usage lines.

## 13. src/usage.ts structure (86 lines, read in full)

- L1 `export type FlagSpec = { type: 'string' | 'boolean' };`
- L3-56 `export const VERB_OPTIONS: Record<string, Record<string, FlagSpec>>` — one key per verb, each a map of flag name (no `--` prefix) to `{ type: 'string' }` or `{ type: 'boolean' }`. Verbs in declared order: install, listen, init, config, preflight, phase, land, next, seat, pull, close, park, unpark, pause, unpause, stop, stop-run, start, sync, status, leftovers, timing, flaky, log, run-check, verify, guard, pack, notice, rollback. Examples: L16 `land: { attempt: { type: 'string' } }`; L46-51 verify: `sha`, `attempt`, `holder` strings plus `'known-red': { type: 'boolean' }`.
- L58 `export const VERB_USAGE: string = \`Usage: akrogon <${Object.keys(VERB_OPTIONS).join('|')}>\`;` — the verb list derives automatically from VERB_OPTIONS keys.
- L59-65 individual usage constants: PACK_USAGE, STOP_USAGE, TIMING_USAGE, GUARD_USAGE, RUN_CHECK_USAGE.
- L67-73 `export const USAGE_LINES: Record<string, string>` — only pack, stop, timing, guard, run-check have entries.
- L75-77 `optionsFor(verb)` returns the verb's flags plus a synthesized `help: { type: 'boolean' }`.
- L79-81 `verbFlags(verb)` returns `--<name>` strings.
- L83-86 `helpText(verb)` builds `akrogon <verb> <--flags...>` plus the USAGE_LINES line when present.

Adding `direct` and `direct-drop` involves: one new VERB_OPTIONS entry per verb (flags as needed); optionally a usage constant + USAGE_LINES entry. VERB_USAGE and `akrogon --help` pick them up automatically.

## 14. src/akrogon.ts dispatch (377 lines)

Preamble:
- L36-37: `const verb: string | undefined = process.argv[2];` and retired-verb guard (`unhold`/`hold-fix` throw RETIRED_MERGE_HOLD).
- L38-41: `--help` prints VERB_USAGE, exit 0.
- L43-59: single global `parseArgs` call: `parseArgs({ args: process.argv.slice(3), options: verb === undefined ? {} : optionsFor(verb), allowPositionals: true, strict: true })`. Catch handles only `ERR_PARSE_ARGS_UNKNOWN_OPTION`: prints `akrogon <verb> <flags>: unknown flag <flag>` on stderr, exit 1; every other parse error rethrows.
- L61-64: `--help` per verb prints helpText, exit 0.
- L69-75: hidden `tool-kill-helper` verb handled before the switch (no usage entry, not in VERB_OPTIONS).
- L80 `relocateFromToolCgroup()`, L82 `if (verb !== 'timing') await migrateStateHome();`.

Dispatch order with case line numbers:
`config` L85, `preflight` L89, `init` L93, `phase` L101, `land` L128, `next` L133, `seat` L151, `notice` L209, `pull` L223, `close` L227, `sync` L233, `pack` L237, `park`/`unpark` L243-244, `pause` L249, `unpause` L253, `stop` L260, `stop-run` L264, `start` L268, `status` L273, `leftovers` L280, `listen` L284, `install` L288, `timing` L292, `flaky` L319, `log` L323, `run-check` L335, `verify` L348, `verify-pass` L363, `guard` L368, `rollback` L371, `default` L375 throws VERB_USAGE.

Note: `verify-pass` and `verify-pass`-style internal verbs — verify-pass IS in the switch (L363) but is NOT in VERB_OPTIONS; it parses positionals only, and command-reference.test.ts's regex counts it as a dispatched verb, hence its row in commands.md L53 and contracts L34.

### Flag parsing patterns
- No repeatable/multiple flags anywhere: `FlagSpec` has only `type`; grep for `multiple` in src/usage.ts finds nothing, and `optionsFor` output feeds parseArgs directly. There is no `--reviewer`-style repeatable flag mechanism in the codebase.
- `--flag value` string pairs: declared in VERB_OPTIONS as `{ type: 'string' }`, then parsed per-case with zod. Examples:
  - L130 (land): `z.string().trim().min(1).parse(values.attempt)` — required string flag.
  - L110-114 (phase): values passed through to phaseCommand; `slot`, `verdict`, `reason`, `attempt` are strings, `check` boolean.
  - L341-343 (run-check): `const optional: z.ZodOptional<z.ZodString> = z.string().optional();` then `optional.parse(values.name)` etc.
  - L350-358 (verify): `z.string().trim().min(1).optional()` for sha/attempt/holder, `values['known-red'] === true` for booleans.
- Boolean flags: compared with `=== true`, e.g. L135-137 next (`values.all === true`), L274 status.
- Positional validation: zod tuples, e.g. L129 land `z.tuple([z.string()]).parse(positionals)`, L228 close with regex `z.string().regex(sourcePattern)`; mutual-exclusion validated manually, e.g. L134-138 next throws `'Use a target, --all, --resume or --wake, not combined'`.
- Cross-flag conflict validation example (seat, L181-182): `if (values.slot !== undefined || values.harness !== undefined || values.model !== undefined) throw new Error('Use <slug> <A|B> or --slot with --harness, --model and --effort, not both')`.
- Variadic positionals exist: `park`/`unpark` pass `positionals` array directly (L247), `pack` requires at least one positional (L238). `run-check` passes all positionals as the child argv after `--` (parseArgs treats everything after `--` as positionals).
- Handlers lazy-import their modules: `await (await import('./land')).landCommand(...)` pattern throughout.

## Cross-cutting facts for the planner

1. The direct landing is entirely agent-executed today: the door runs git push, akrogon close, broadcast-issue, direct-guards.ts, worktree cleanup, pack and end markers by hand per direct-route.md steps 5.1-5.9. No akrogon verb owns any of it — `direct-guards.ts` is a skill script run with `bun`, not a command.
2. `akrogon land` is the lifecycle's merge machinery (src/land.ts, verb at akrogon.ts L128) and is what a new `direct` verb would presumably parallel.
3. direct-guards shares lifecycle primitives from src/phase.ts (requireClean, requireNoIssueFiles, requireTestChangeCitations, requireNonEmpty) and src/verify.ts (requireGreenReceipt), so a verb implementation has the same imports available inside src.
4. The `Direct attempt` CHART.md section (shapes.md L78-92) is the record surface: branch, worktree, base, head, rounds, push attempts, done/not done, trigger, review files, landed SHA.
5. `fix_rounds` comes from `akrogon config` (direct-route.md L23); push attempts capped at 2.
6. Tests that will change with a rewrite: tests/direct-guards.test.ts (whole file), the direct-guards invocations at tests/receipt-gates.test.ts L152-181, L228-276, L308-335, and the doc-contract tests in tests/docs-links.test.ts L260-266, L268-292, L294-304, plus the contracts map in tests/command-reference.test.ts and VERB_OPTIONS-driven loops in tests/cli-help.test.ts when verbs are added.

# Implementation report: docs-use-plan

Base `40902d83` (origin/main, unchanged at refresh). Committed head `1e5d84f9`. Mode: subagents, three waves of three workers (briefs `brief-1.md` to `brief-9.md`), each in `<worktree_store>/docs-use-plan-u<N>`, cherry-picked serially, worktrees removed.

## Changed files and reasons

- `docs/use/run-work.md` (U1), `park-pause-stop.md` (U2), `watch-while-away.md` (U3), `autopilot.md` (U4), `write-issues-by-hand.md` (U5), `report-an-observation.md` (U6), `a-working-day.md` (U7), `plan-work.md` (U8), `quick-fix.md` (U9): the nine use/ part 1 pages from the page map.
- A edits: `28eed3fe` drops repeated "Optional" labels on the watch start and stop lines (watch is marked optional once in the intro). `1e5d84f9` adds the D3 wording to plan-work's ways list, makes the ways-to-run alt text show that autopilot never takes the direct route, and says in a-working-day that B can hand repairs back to A (state-and-phases: check.repair → check.fix).
- `tests/door-reset.test.ts`: planning commit `d0f4ea1d` (Test-Change trailer). Removed the `docs/guide/chart.md` read and its "handover" wording check. Reason: `docs/guide/chart.md` is an authoring source that docs-start deletes, the check matched a wording substring only, and fact-ownership Q2 deletes wording-only doc checks. Skill and shapes checks and every behavior test are unchanged (D9).

## Proof per done-criterion (all on head 1e5d84f9)

1. Pages exist and cover their subject: `ls docs/use/` lists the nine files. Optional marks: watch (a-working-day, plan-work, autopilot, watch-while-away intro, run-work), broadcast (a-working-day, quick-fix step 7), GitHub intake (a-working-day step 1, report-an-observation, write-issues-by-hand `sources`). Direct route wording (skips handoff and `akrogon next`, keeps charted decisions and B review): a-working-day, plan-work (list and handoff section), quick-fix. Autopilot wording (charts, hands off, starts no execution): a-working-day, plan-work, autopilot. Subject coverage is for B against PAGE-MAP rows 28-36.
2. Pictures and next links: `check docs-links: 0 .../check-docs-links-1792767948353-2256307.log`. `grep -n '!\['` shows non-empty alt on a-working-day (working-day), plan-work (ways-to-run, chart-door), run-work (dispatch-order), park-pause-stop (control-states), watch-while-away (watch-loop). `tail -n1` shows a `Next:` link on all nine, in the D4 chain ending at `../reference/commands.md`.
3. Door-reset: `grep -n "docs/guide" tests/door-reset.test.ts` prints nothing. `git diff 40902d83 -- tests/` touches only `tests/door-reset.test.ts` (1+, 3-). `check door-reset: 0 .../check-door-reset-1792767950318-2258406.log`.
4. Facts and retired names: `check retired: 0 .../check-retired-1792767949032-2256448.log` (hold-retired, run-permit). Date grep over `docs/use/*.md` prints nothing. `grep -oh 'akrogon [a-z-]*' docs/use/*.md | sort -u` gives close, install, land, leftovers, next, park, pause, phase, pull, start, status, stop, stop-run, sync, unpark, unpause, verify (plus prose "akrogon itself", "akrogon starts"), all in `src/akrogon.ts`. Each worker listed the `src/`/`skills/` line behind every command and behavior it wrote (worker returns below).

## Checks

`akrogon verify` on `1e5d84f9`: green (format, test 1114 pass, typecheck). Wall time 175 s. Logs: `check-test-1792768124941-2262753.log`, `check-typecheck-1792768127246-2262753.log` in this folder.

## Worker returns, folded

- U1 run-work: the old guide said plain `akrogon next` outside a repo covers all repos. The code throws (`src/next.ts:1268-1283`), so the page says it fails. Dropped unverified claims on tie order and Herdr hook context.
- U2 park-pause-stop: dropped claims that Herdr closes panes on stop, that harness sessions survive, and the merge-turn behaviour of a stopped leaf, none confirmed in `src/`.
- U3 watch-while-away: dropped "the watch stops when the open tree is empty". The skill says the job never deletes itself.
- U4 autopilot: facts from `skills/chart-issues/SKILL.md:135-145`, `assets/shapes.md:57-69`, `scripts/door-reset.ts:16-17`.
- U5 write-issues-by-hand: `ISSUE.md` is shown as where the goal goes, not required (no code requires it). State fields from `src/state.ts:80-89`. No cycle check exists (`src/turn.ts:60-66`), and the page says so.
- U6 report-an-observation: `akrogon pull` reads only the origin's open issues (`src/pull.ts:42-80`), so the page says origin, not "reports" in general.
- U7 a-working-day: the old guide's status/sync/park day routine was not carried, since it does not match the page-map flow.
- U8 plan-work: `akrogon pull` is left out because the door runs it itself.
- U9 quick-fix: the skill calls the reviewer "the first named peer". The page says the consultant B reviews as seat B, keeping D8's names apart.

## Known limitations

- Subject coverage and prose accuracy beyond the checked commands are proven only by B's review (plan Limitations).
- The next-step chain ends at the command reference until docs-use-finish or docs-start link onward.
- Brief criterion 3 vs page-map row: as plan D9 notes, only the guide read and its "handover" check were removed. Skill and shapes wording checks remain because they read no docs page.

## Unverified criteria

None beyond B's per-page source review, which criterion 4 names as its proof.

# Plan: watch-steady

Skill-text edit in one file. The watch never deletes its own job; a paused repo is observed and acted on never. No code tests: the standing design makes proof the report's sweep with the edited lines quoted.

## Decisions

- D1: `skills/watch-issues/SKILL.md` gains the sentence that the watch never self-deletes and ends only on `/watch-issues stop`, session loss or the job's own expiry. Keep the creation report of "7-day expiry" (a fact, not a warning) and add no expiry warning and no text making the watch required.
- D2: The stop rule is removed with every reference: the creation refusal clause "If that check already satisfies the stop rule, report it and create nothing."; the tick clause "It may delete through the stop rule."; the defect-notice clause "and that the watch stops once nothing else can run and restarts with `/watch-issues`"; the sentence "Delivery `shown` and a notice shown this fire both count as shown for the stop rule." (the `delivery`/`shown` judgment itself stays); the whole `## Stop` section. `/watch-issues stop` keeps its CronList/CronDelete path unchanged, as does "Create a job from a tick" under Never.
- D3: One check covers both invocations. A check begins with `akrogon status` at the open of `## Observe`: a repo it reports paused is observed never and acted on never for that fire, and the fire's reply says so. `/watch-issues` still runs its CronList/create step after a paused check, since creation is not an act on a leaf. This gates typed `akrogon next <slug>`, which ignores pause (`src/next.ts` `dispatchLeaf` `isAutomatic === false`), in one place instead of at each run site.
- D4: Brief line numbers have drifted and are ignored; the named mechanisms above are the targets. `docs/guide/in-practice.md` is out of scope: its self-stop line (`:89`) and its conditional-creation clause (`:81`) are listed as out-of-scope hits under C3, not edited.

## Read first

- `skills/watch-issues/SKILL.md` (the only owned file; every edit lands here)
- `issues/open/night-flow/watch-steady/brief.md` and `design.md`
- `docs/guide/in-practice.md` (sweep hits to report, not edit)
- `learnings/LESSONS.md` plus `learnings/history/2026-10-08-pause-dispatch.md` (format may rewrite pre-existing `src/status.ts` drift; revert it)

## Interfaces

- `akrogon status` at `<root>` prints `<repo-name> (paused)`; with a slug it prints `paused: <name>`. The gate detects either.
- `akrogon pause|unpause` writes `paused.yaml` under `AKROGON_HOME`; live probes use a scratch `AKROGON_HOME`, never the real file.

## Waves

### Wave 1

- U1 `skills/watch-issues/SKILL.md` — apply D1-D3, then run the C3 sweep. Owned: `skills/watch-issues/SKILL.md`. Shared resources: none. Depends on: none.

## Done-criteria proofs

- C1 no self-delete rule/check/notice + "never self-deletes" statement: `grep -n -E 'stop rule|CronDelete|deletes|stops when|self-delet|expiry|expir' skills/watch-issues/SKILL.md` — passes when the only deletion lines are the `/watch-issues stop` bullet, the only expiry line is the creation report, and a "never self-deletes … `/watch-issues stop`, session loss or … expiry" line is present. Catches a leftover self-delete path or missing statement. Seconds; rerun on any edit to the file.
- C2 pause-first check: the same grep plus `grep -n -E 'akrogon status|paused' skills/watch-issues/SKILL.md` shows the gate in `## Observe` ahead of the observe-script line, and no `next`/`phase`/herdr path runs before it. Supporting live probe: `AKROGON_HOME=<scratch>` with a copied `config.yaml`, `bun src/akrogon.ts pause` then `bun src/akrogon.ts status` prints the `paused` mark. Catches a gate placed after action sites or a gate on the wrong signal. Seconds; rerun on any edit to the file.
- C3 sweep `skills/ docs/ README.md` by meaning (agent-read, seeded by `grep -rn -i 'watch' skills/ docs/ README.md`): no in-scope line states the watch deletes itself or that akrogon requires the watch. Catches a second self-stop or requirement statement outside the owned file. Minutes; rerun on any edit to the file. Known out-of-scope hits to list: `docs/guide/in-practice.md:81` (conditional creation, stale after D2), `docs/guide/in-practice.md:89` (self-stop claim); `docs/guide/install.md:57` (harness requirement, not a hit).

## Checks

`format`, `test`, `typecheck`, `test_changed` from `akrogon config`; all expected green at plan time. Baseline run below. If `format` rewrites `src/status.ts`, revert that file (2026-10-08 lesson).

## Docs

- Agent docs: `skills/watch-issues/SKILL.md` (the edit itself); `skills/AREA.md` one-line description stays accurate.
- Human docs: `docs/guide/in-practice.md` self-stop lines are out of scope and reported under C3; `README.md`, `docs/guide/cheat.md`, `docs/guide/install.md`, `docs/guide/next.md`, `docs/guide/problems.md` need no change.

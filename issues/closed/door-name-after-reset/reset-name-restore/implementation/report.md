# Implementation report: reset-name-restore

Slot A, serial-solo (one unit, plan D9), 2026-11-14.
Base: `d44920b8` (unchanged at refresh; `git rebase origin/main` no-op). Head: `7071124e` (content identical to `d31c696c`; amended only to add the `Test-Change:` trailer for `tests/AREA.md`, required by the path rule — `akrogon verify` green receipt was on `d31c696c`, same tree).

## Changes

- `skills/chart-issues/scripts/door-reset.ts` — new `name` stage between `input-check` and `reset-keys` (plan D1–D6): claude keeps the last `custom-title` `customTitle` read over the whole pre transcript (`kept`); an unnamed session takes the tab name from a `docGet` at that moment, sent as `/rename <name>` via `send` with one enter on `started === false`, then waits `idle && t.turn > sent.turn` under `DOOR_RESET_TURN_BOUND_MS` (`sent`); three skip reasons logged verbatim; a still-open rename at the bound stops `turn open`, a gone terminal `identity changed`; the stage catches nothing, so a throw keeps today's error path. Header comment describes the stage.
- `skills/chart-issues/assets/handover.md` — one paragraph stating the stage, source order, no storage, the three skip reasons, the bound stop, the thrown-error ending and the claude-only limit (criterion 6).
- `tests/AREA.md` — stand-in line notes `/rename` and name carry.
- Tests and stand-in were committed at plan time (`790e1050`): `tests/door-reset.test.ts` new kept/sent/skipped/bound cases + `addTab` + `STAGES` + cancel-test tab; `tests/door-agent.ts` `/rename` turn and `custom-title` carry on `/clear`.

## Plan deviation

The plan checklist's three-unit split contradicted its own D9 serial-solo call; corrected at implement open to one unit covering code plus the two doc lines. Recorded here for review per the plan-correction note rule. No locked decision changed.

## Commands and proofs

| Command | Commit | Result |
| --- | --- | --- |
| `akrogon run-check --name door-reset-suite -- bun test --timeout=60000 tests/door-reset.test.ts` | d31c696c (tree) | green, 16 pass / 0 fail — `check door-reset-suite: 0 implementation/check-door-reset-suite-1794651857905-2818098.log` |
| `bun run typecheck` (local aid) | d31c696c | clean |
| `bunx prettier --check` on touched files (local aid) | d31c696c | clean |
| `akrogon verify` (format + test + typecheck, fresh checkout) | d31c696c (same tree as 7071124e) | green, 1183 pass / 0 fail — `check-test-1794651924184-2821111.log`; receipt `verify leaf d31c696c…: green` |

Criterion mapping, all proven green inside the suite run above (each test is the real boundary: helper started as A starts it on a real hc test core against the stand-in):

- C1 kept: `claude: a session with its own name logs name kept and sends no rename` — green.
- C2 sent + reset waits + transcript carries `C Tab_4`: `claude: a session with no name in a named tab gets the tab name sent and the reset waits for the rename turn` — green.
- C3 skips: `claude: the name stage logs skipped for tab name ""` and `"Tab\tName"` — green; the four stage-order rows assert `skipped` with `harness is not claude` / `no tab lists A or its name is blank` — green.
- C4 stop at bound: `claude: a rename turn still open at the bound stops the helper before the reset` — green.
- C5 cancel before the name stage: `an operator input record … cancels the reset with nothing sent` — green.
- C6 docs: `git diff d44920b8..7071124e -- skills/chart-issues/assets/handover.md` adds the stage paragraph carrying all seven statements.

Deliberate-break evidence for the new behavior (criterion 2's required break): recorded at plan synthesis — `check c2-break-nowait: 1 implementation/check-c2-break-nowait-1794651660303-2780446.log` (wait removed → `/clear` reaches the open rename turn, test red).

## check.fix repair (2026-11-14)

B's F1: C4's test asserted the stop log and absent inputs but never the helper's non-zero exit — `exited()` accepted the terminal finishing as a proxy. Repair commit `c4e0ef38` (after `7071124e`): `exited()` now returns `exit_code` from `hc wait --json` (the wait observes the code before `--rm` removes the terminal; null when the terminal was already gone), and the bound test asserts it is `1`.

- Red before commit (deliberate break `process.exit(0)` in `stop()`): `check c4-break-exit0: 1 implementation/check-c4-break-exit0-1794652195402-3302240.log` — `Expected: 1, Received: 0`.
- Green after: `check door-reset-suite-fix: 0 implementation/check-door-reset-suite-fix-1794652203842-3305760.log` — 16/16 on `c4e0ef38`.
- `akrogon verify` on `c4e0ef38`: green, 1183 pass / 0 fail — `check-test-1794652279306-3313561.log`.

The `exited()` contract change (it now also returns the exit code) is inert for the other callers, which ignore the return value.

## Known limitations

- Rests on claude carrying `custom-title` across `/clear` (observed on 2.1.322–2.1.325 at charting); if a later claude stops, the log shows `sent` at every handover while names stay lost — stated in the design and handover.md.
- Rename turn end is hc's turn counter passing the send's answer; the helper does not confirm claude applied the name — the receiving session's transcript is the check.
- `exited()` returns null only when `hc wait` attaches after `--rm` already removed the terminal; in the bound test the helper is necessarily still alive at attach (its bound is seconds away), so the `expect(exit).toBe(1)` reads the real code.
- Text typed into A but not submitted is not seen (existing stated limit, unchanged).

## Unverified criteria

None. No grants, env values or live sessions were needed; no grant count lines to record.

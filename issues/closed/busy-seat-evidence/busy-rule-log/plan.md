# Plan: busy-rule-log

Direct synthesis (`debate: no`). Sources: brief, design, live checkout. Design wins over brief on any conflict; none found.

## Decisions

- D1 — Closer-look line (`SKILL.md:30`): `herdr agent read <pane> --lines 80` stays for non-working seats; a seat herdr reports as `working` is read with `herdr agent read <pane> --source visible` because `--lines 80` is refused (`agent_not_idle`). The rest of the line (`issues/log.jsonl` recovery bound, Bash-timeout rule) is untouched.
- D2 — Busy rule (`SKILL.md:40`), evidence source per busy seat from the observe line already printed this fire:
  - `log<seat>=<path>`: run `bun <skill-folder>/scripts/log-tail.ts <path>` and judge the existing loop bar on its lines. `herdr agent read <pane> --source visible` is secondary context only.
  - `log<seat>=-`: judge that seat from `--source visible` and report "no log" for it.
  - `log-tail.ts` exits non-zero: judge that seat from `--source visible` and report "log unreadable: <stderr message>". A read failure alone never justifies a steer, and every other seat is still judged this fire.
- D3 — Identity semantics stated in the Busy rule text: `#<8>` on a shell line is a hash of the full command; equal hashes mean the same command. `old#<8>`/`new#<8>` on an edit line hash the old and new text; a later edit whose `old#`/`new#` are swapped is the undo. `#-` means a non-literal command and never counts as "same command". `running` means no result record yet.
- D4 — Unchanged per brief/locks: the loop bar (same command or edit three or more times with the same result, three or more consecutive errors, edit-undo cycle), actions, resteer steps, "insufficient evidence" outcome. No elapsed limit. SKILL.md stays the only owner of the loop rule; log-tail.ts carries none of it.
- D5 — Join test `skills/watch-issues/scripts/observe-log-tail.test.ts` (new, only file added): temp root; leaf `state.yaml` (phase `implement`, `pane.A`); fake `akrogon` stub printing `repo: testrepo`; fake `herdr` stub printing a `working` agent entry with `agent=pi` and `agent_session={kind:"path", value:<copied fixture>}`; `fixtures/pi-session.jsonl` copied into a temp path. Run real `observe.ts` (via `OBSERVE_AKROGON`/`OBSERVE_HERDR`), extract `logA=` from the printed line, then run real `log-tail.ts` on that path. Assert observe exits 0 and `logA=` equals the copied fixture path; assert log-tail exits 0 and prints the six expected pi-session lines. Expected lines are derived from the fixture contents with `sha256(...).slice(0,8)` computed in-test, as `log-tail.test.ts` does — never copied from the script's output. A header comment states the test proves wiring only, not the watch's judgment.
- D6 — Pi `path`-kind session needs no `HOME` derivation (observe prints `session.value` verbatim when the file exists), so the join test avoids the claude/codex path-resolution branches seat-log-path already covers.
- D7 — Scope: no edits to `observe.ts`, `log-tail.ts`, their tests, or the `:28` line-format text (already documents `log<seat>=<path|->`). No other SKILL.md section changes.

## Read-first paths

- `skills/watch-issues/SKILL.md` — lines 28, 30, 40 (field doc, closer-look, Busy rule).
- `skills/watch-issues/scripts/observe.ts` — `resolveLog`, `formatLeaf` (`log<seat>` printing).
- `skills/watch-issues/scripts/observe.test.ts` — `runObserve`, stub builders, `writeLeaf`, `lines` patterns to reuse.
- `skills/watch-issues/scripts/log-tail.ts` — output contract (line shape, `#`/`old#`/`new#`/`#-`, `running`, non-zero exits).
- `skills/watch-issues/scripts/log-tail.test.ts` — `sha8`, `runLogTail`, pi-session expected lines, fixture provenance header.
- `skills/watch-issues/scripts/fixtures/pi-session.jsonl` — recorded fixture the join test copies.
- `tests/watch-issues-scripts.test.ts` — the blocking root test that runs `bun test scripts` + `bun run typecheck`.
- `docs/reference-index.md`, `skills/AREA.md` — context; already accurate, no edits.

## Interfaces used (all live, verified)

- `observe.ts` stdout: `... A=<pane>/working[ busy=HhMMm] logA=<path|-> ...`; `log<seat>` appears only for `working` seats.
- `log-tail.ts <path>`: exit 0 prints one line per recent tool call, oldest first, at most 20: `<ts> <tool> <target> <identity> -> <status>: <excerpt>`. Non-zero exit prints `Cannot read <path>: ...` / `<path>:<line>: invalid JSON ...` / `<path>: unknown session log format` on stderr.
- `OBSERVE_HERDR`, `OBSERVE_AKROGON`, `HOME` env overrides for tests.

## Waves

### Wave 1 (2 units, disjoint paths, no shared test resource)

1. SKILL.md edit. Owns: `skills/watch-issues/SKILL.md`. Apply D1 and D2/D3 as the replacement text for line 30's `--lines 80` clause and the Busy bullet at line 40; keep the bar, actions, resteer and "insufficient evidence" sentences verbatim.
2. Join test. Owns: `skills/watch-issues/scripts/observe-log-tail.test.ts` (new). Per D5/D6. Depends on nothing in wave 1 (observe/log-tail already landed).

### Wave 2

3. Criterion proof: run `bun test scripts` and `bun run typecheck` in `skills/watch-issues`, plus a grep check that SKILL.md no longer reads a working seat with `--lines 80`.

## Docs affected

- `skills/watch-issues/SKILL.md` — the two edited lines (the file itself).
- No other doc: `skills/AREA.md` and `docs/guide/in-practice.md` describe mechanism at a level this change does not contradict; `tests/AREA.md`, `docs/guide/cheat.md` untouched. All `--lines 80` hits under `issues/` are closed records, not live docs.

## Verification (done-criteria → proof)

| Criterion | Proof command | Failure it catches | Size | Rerun trigger |
|---|---|---|---|---|
| 1. SKILL.md states items 1–3, no `--lines 80` on a working seat, `log<seat>=-`/`no log`/`log unreadable`/identity use | `grep -n "lines 80\|log-tail\|no log\|log unreadable\|--source visible" skills/watch-issues/SKILL.md` reviewed against the brief list | Missing clause, stale command | seconds | Any SKILL.md edit |
| 2. Join test proves observe→log-tail wiring on recorded fixture, expected lines independent | `bun test scripts` in `skills/watch-issues` (runs `observe-log-tail.test.ts`) | observe field rename, path resolution break, log-tail contract drift | seconds | Any change under `skills/watch-issues/scripts/` |
| 3. Blocking `test` passes incl. `tests/watch-issues-scripts.test.ts` | `bun test --timeout=30000` at worktree root (configured `checks.test`) | Root test regression, join test red inside suite | minutes | Before implement reports done |

Also run `bun run format` and `bun run typecheck` (configured checks) at worktree root before done. No `merge_checks` configured; none added.

## Notes for review

- None. Brief and design agree; no open limitations beyond those the design foreclosed.

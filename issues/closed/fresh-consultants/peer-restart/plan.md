# Plan: peer-restart

Debate off (`debate: "no"`); synthesized directly from brief and locked design. `herdr` pane close/split/start and `argv[1:]` pass-through are already proven live (fork `restart-rule.md` Proofs, `readiness.yaml` proofs); this leaf adds the door's restart command, the fake-herdr fields its tests need, and the skill/guide text.

## Read first

- `skills/chart-issues/scripts/peer-ask.ts` — style to match: zod schemas for herdr JSON, `Bun.spawnSync` array argv, stderr `herdr <cmd> failed (exit N): <stderr>`, `main()` with usage line.
- `skills/chart-issues/scripts/peer-wait.ts` — `agentListSchema` shape; real `herdr agent list` additionally emits `name` for named agents (live probe: `w8:pS3` `peer-w8-pnp-b`).
- `tests/fake-herdr.ts` — fixture: `pane split` (no `--direction` support today), `pane close` (no failure hook), `pane process-info` (returns `foreground_processes: []`), `agent start` (records `db.starts`, `invalid_agent_name`/`agent_name_taken`, `startScript`), `agent list` (no `name` field), `closeScript`-style script arrays.
- `tests/peer-ask.test.ts` — the harness pattern this leaf's test file mirrors: temp bin symlink to `fake-herdr.ts`, db JSON seed, `calls()` log assertions, `spawnCaptured`.
- `tests/fake-proc.ts` — `shellPid`, `seedShell`, `procDir` for the fake's `/proc` shadow.
- `tests/helpers.ts` — `registerTemp`, `fakeHerdr` env (`FAKE_HERDR`, `AKROGON_PROC_ROOT`, PATH).
- `issues/chart/fresh-consultants/forks/restart-rule.md` — binding Q1/Q2/Q3 text and the leaf-review correction (refusal rules, seat letters explicit, autopilot drop for every non-`restarted` seat).
- `skills/chart-issues/SKILL.md` — Open (peer pane rule, supplied-panes lock), Autopilot (drop conditions), seat record rule.
- `skills/chart-issues/assets/questions.md` — Blind peer exchange pane-creation paragraph and peer-ask rule.
- `docs/guide/chart.md` — operator-facing consultant section (`seats.yaml`/peer paragraphs).
- `learnings/LESSONS.md` — lesson: grep `docs/` and prose for a changed rule, not only old paths (2026-09-11, 2026-09-14).

## Decisions

- D1 CLI: `bun <skill-folder>/scripts/peer-restart.ts <root> <A pane> <seat> <pane> [<seat> <pane>...]`. `process.argv[2]` is root, `[3]` A pane, then seat/pane pairs; seat letters are kept verbatim in output and name derivation. Bad arity/odd tail = usage to stderr, exit 1, zero herdr calls.
- D2 Read phase, all before the first close: one `herdr agent list`, then `herdr pane process-info --pane <pane>` per seat in naming order. Per seat: live agent on its pane else refuse `no agent`; kind = that agent's `agent`; launch record = the `foreground_processes` entry whose `pid === result.process_info.foreground_process_group_id`, exactly one else refuse `no unique foreground leader`; `argv` = that entry's `argv` (`argv[0]` is the harness, never relaunched); history-token check (D4); derived-name check (D3). A failed herdr read = mid-run stop: failed command + herdr stderr, all seats still `untouched`. A refusal closes nothing: seat and reason to stderr, one JSON line per seat (`untouched`), exit 1.
- D3 Agent name `peer-<A pane id lowercased, ':'→'-'><lowercased seat>` (e.g. `w8:pA` seat B → `peer-w8-pa-b`, matching the proven `peer-w8-pnp-b`). Refuse `agent name <name> held by pane <pane>` when `agent list` shows a live agent with that `name` on a pane outside the supplied set.
- D4 History tokens refuse per kind (exact token or `--flag=...` prefix): codex `resume`/`fork`; pi and claude `--continue`/`-c`/`--resume`/`-r`/`--session-id`, pi also `--session` and `--fork`. Other kinds pass argv through; their tokens stay listed only for the three named kinds. codex `-c` is a normal flag (config), matching the proven `-c model_reasoning_effort=high` restart.
- D5 Mutate phase in three ordered groups, all steps stopping at the first failure: closes in reverse naming order; then splits in naming order — first active consultant `herdr pane split <A pane> --direction right --ratio 0.65 --cwd <root> --no-focus`, each later one `herdr pane split <previous new pane> --direction down --ratio 0.5 --cwd <root> --no-focus`; then `herdr agent start <name> --kind <kind> --pane <new pane> -- <argv[1:]` in naming order (no-argument argv still emits the trailing `--`). Per-seat state: `restarted` after its start succeeds, `closed` after its close succeeds (including a seat with a new pane but no start), `untouched` otherwise.
- D6 Stdout: one JSON object per seat in naming order, always printed (success, refusal, mid-run failure): `{"seat":"B","old":"w8:pRX","new":"w8:pS2","kind":"codex","state":"restarted"}`; `new` null unless `restarted`, `kind` null only when no agent entry was read. Failures also print `herdr <argv> failed (exit N): <herdr stderr>` to stderr. Exit 0 only when every seat is `restarted`.
- D7 `tests/fake-herdr.ts` gains: per-pane seed fields `foreground_processes` (entries `{pid, argv, ...}` passed through verbatim) and `foreground_process_group_id` (default = `shellPid`); per-pane seed field `agent_name` echoed as `name` by `agent list`; a `closeScript` array consulted by `pane close` via `scriptedFailure` before removal. `db.starts` already records the full raw `args` (including `--` and agent args), so tests assert argv pass-through exactly.
- D8 SKILL.md edits: Open — the door runs the command when it enters a chart before that chart's first consultant exchange and on re-entry after consultants worked another chart (one run covers a shared opening map; A's own work/compaction alone never triggers; only after every prompted exchange is collected, which the caller ensures and an idle pane does not prove; never for a dropped consultant); named consultant panes, supplied ones included, may be closed by this command only — the sole operator-authorized exception to never moving supplied panes; later briefs, waits and seat entries use the printed panes; a restarted seat's new `seats.yaml` entry keeps its letter and is appended when `herdr agent list` shows its new session (pi at start, codex after its first exchange), never with a null session. Autopilot — a failed restart drops every seat not `restarted`, like a herdr prompt refusal, with the printed state recorded under `consultant:`. Attended — a failed restart ends the turn.
- D9 `assets/questions.md` Blind peer exchange gains one summary line: consultant restarts happen at chart entry and re-entry per SKILL.md, restarted seats are addressed by their printed panes, supplied consultant panes may be closed only by the restart command. `docs/guide/chart.md` gains the operator-facing line in the peer-seat section: the door restarts consultants on chart entry/re-entry, supplied panes included.
- D10 No changes to `peer-ask.ts`, `peer-wait.ts`, `chart-usage.ts`, herdr itself. The command never waits for idle; the caller collects every prompted exchange first. Design names no env vars; `akrogon status` `Missing:` lines absent — no blockers.

## Interfaces provided to consumers

- `peer-restart.ts` CLI + per-seat JSON line — consumed by the chart-issues door text (SKILL.md); the operator sees the same lines.
- fake-herdr pane fields `foreground_processes`, `foreground_process_group_id`, `agent_name`, db field `closeScript` — consumed by `tests/peer-restart.test.ts` and any later pane test.

## Waves

### Wave 1 (serial-solo: single unit)

**U1 — restart command, fixture fields, tests, doc text.**
Owns: `skills/chart-issues/scripts/peer-restart.ts` (new), `tests/peer-restart.test.ts` (new), `tests/fake-herdr.ts`, `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, `docs/guide/chart.md`.
Covers: D1–D10.
Shared test resources: none. Prerequisites: none.

One unit: the doc text is the same restart contract the script implements, and the test file owns the fixture fields the script needs; splitting gains no wave.

## File/criterion checklist

- `skills/chart-issues/scripts/peer-restart.ts` — new; D1–D6.
- `tests/fake-herdr.ts` — new pane/db fields only; D7.
- `tests/peer-restart.test.ts` — new; criteria 1–3 cases below.
- `skills/chart-issues/SKILL.md` — Open restart rule + supplied-pane exception; Autopilot drop condition; D8.
- `skills/chart-issues/assets/questions.md` — Blind peer exchange summary line; D9.
- `docs/guide/chart.md` — consultant restart line; D9.
- Agent docs: none affected (no AGENTS.md content references this behavior). Human docs: the three files above only.
- Prose sweep per lesson: `git grep -n 'never moved\|peer pane\|supplied pane' docs/ skills/` — own or report any stale wording hit.

## Done-criteria → proof

| # | Criterion | Proof command | Boundary observed / failure caught | Size | Rerun trigger |
|---|-----------|---------------|-------------------------------------|------|---------------|
| 1 | B (codex, `-c model_reasoning_effort=high`), C (pi, argv with a space), unrelated agent: C then B closed, B right of A, C below B, same kind + argv array, unrelated untouched, `restarted` lines, exit 0; C-only keeps letter and splits right of A | `akrogon run-check --name peer-restart -- bun test tests/peer-restart.test.ts` | Script CLI ↔ fake-herdr; catches wrong close order, wrong split flags/source, string-joined argv (space split), wrong letters, touched foreign pane | seconds | `peer-restart.ts`, `fake-herdr.ts`, `peer-restart.test.ts` |
| 2 | Refusal cases: no unique leader, history argv (codex `resume`; pi `--session`, `-c`), name held outside — nothing closed, non-zero, seat+reason named | same `bun test tests/peer-restart.test.ts` (refusal suite) | CLI read phase; catches close-before-check, missing reason, wrong kind flag sets | seconds | same |
| 3 | Mid-close failure (C closed, B untouched), split failure (all closed), start failure (closed, `new` null): stops later steps, failed herdr command + error on stderr, per-seat states, non-zero | same `bun test tests/peer-restart.test.ts` (failure suite) | CLI mutate phase; catches continued steps, missing seat lines, wrong state names | seconds | same |
| 4 | SKILL.md, questions.md, chart.md state the trigger set, sole supplied-pane exception, printed-pane usage, seats.yaml rule, attended/autopilot failure result | `git grep -n 'peer-restart\|restart' skills/chart-issues/SKILL.md skills/chart-issues/assets/questions.md docs/guide/chart.md` plus the prose sweep above; review judgment on placement | Doc text; catches missing trigger conditions, over- or under-stated exception | seconds | doc edits |

No `merge_checks` configured and the brief names none — none added. Configured `checks` (format/test/typecheck) remain the regression gate via `akrogon verify`; criterion 4 is prose (standing design: cheapest sufficient proof is inspection, no vanity tests).

## Planned red

`tests/peer-restart.test.ts` is written and committed in plan.synthesis before any product code.

Observed red (plan.synthesis): `akrogon run-check --name 'peer-restart tests red' -- bun test tests/peer-restart.test.ts` — 0 pass / 8 fail, every test fails on `Module not found ".../skills/chart-issues/scripts/peer-restart.ts"`; `check peer-restart tests red: 1` log under `implementation/`. Criteria 1–3 each fail red on the missing command as intended. Criterion 4 is prose, proven at implementation by the named greps plus review; no test written for it (standing design: no vanity tests).

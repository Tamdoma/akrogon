# Brief 2: skill and doc wording (U2)

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/run-units-u2` (detached at the leaf head; commit your work there).

## 1. Goal

Document the new `akrogon stop-run [<run-id>]` command and run-unit behavior in the skill files and guides, replacing the recorded-PID stop rule. Plan decision D12 of `plan.md` in the leaf folder.

## 2. Numbered acceptance criteria

1. `skills/implement-issue/SKILL.md`, `skills/implement-issue/worker-protocol.md`, `skills/check-issue/SKILL.md` each contain `akrogon stop-run`, no longer contain the phrases `recorded PID` or `by the PID it recorded`, and still contain the `pkill -f` pattern-kill ban.
2. `README.md` gains a `stop-run` row naming `[<run-id>]` (the committed `tests/command-reference.test.ts` builds its expected table from the dispatcher and will include `stop-run: [<run-id>]` — the README row must exist for it).
3. `docs/guide/setup.md` (~line 70, the start-check paragraph) gains run units + 16 GiB reservations + `stop-run`.
4. `docs/guide/next.md` stop section (~lines 126-149) gains a `stop-run` line.
5. `src/AREA.md` admission/scope/stop lines updated (reservations, run-unit helpers, stop-run module); `tests/AREA.md` gains a `tests/run-units.test.ts` one-liner. Both keep their required sections.

## 3. Read-first list

- The three skill files (whole files are short enough to read where the stop rule lives: `skills/implement-issue/SKILL.md` ~line 57, `worker-protocol.md` ~line 13, `skills/check-issue/SKILL.md` ~line 63).
- `README.md` command table (~lines 147-150), `docs/guide/setup.md` ~line 70, `docs/guide/next.md` ~lines 126-149.
- `src/AREA.md`, `tests/AREA.md` — current style.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` — read before editing.

## 4. Change list and needed interfaces

Owned paths: `skills/implement-issue/SKILL.md`, `skills/implement-issue/worker-protocol.md`, `skills/check-issue/SKILL.md`, `README.md`, `docs/guide/setup.md`, `docs/guide/next.md`, `src/AREA.md`, `tests/AREA.md`. Wave 1, no prerequisites; a sibling worker owns all `src/*.ts` and implements `stop-run` itself — you write prose describing its contract: `akrogon stop-run [<run-id>]` stops runs owned by the caller's scope; the `run <uuid>` line printed on stdout at each run start carries the id.

- Skills: replace the clause "stops only a process it started, by the PID it recorded" (wording varies slightly per file — find it) with the meaning "stops a run with `akrogon stop-run <run-id>` (the `run` line printed at run start), never by pattern". Keep the surrounding pattern-kill ban (`pkill -f` etc.) intact.
- README: add the `stop-run` row in the commands table in sorted position (between `stop` and `sync`), `stop-run [<run-id>]`, short description matching table style.
- AREA.md files: one-line updates per file style; `src/AREA.md` mentions `src/stop-run.ts` and the reservation formula; `tests/AREA.md` adds `run-units.test.ts`.

## 5. Do-not, reasons and exceptions

- No code edits, no test edits — mismatch to A if wording seems wrong. Reason: code and tests are owned by the sibling unit and the committed contract.
- Do not delete the pattern-kill ban sentences — the test asserts `pkill -f` survives.
- Do not describe `stop-run` as killing by pid or reading record files; the contract is scope ownership and the printed `run` line.
- Keep edits minimal: rows and clauses, not section rewrites. Restated: docs only; preserve the ban; minimal diff.

## 6. Ordered steps

1. Three skill files (criterion 1). 2. README row (criterion 2). 3. setup.md + next.md (criteria 3,4). 4. AREA.md files (criterion 5). 5. Targeted command in §7.

Advisory: 8 files, ~35 turns.

## 7. Commands

- `bun test tests/run-units.test.ts -t "skills name akrogon stop-run" --timeout=30000`

`command-reference.test.ts` keeps failing until the sibling unit adds the verb to the dispatcher — report as known-unverified, do not chase it.

## 8. Done-when, evidence and report

The skills test passes; every file in the owned list reads coherently; commit(s) on the detached head; return commit id + this report filled.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

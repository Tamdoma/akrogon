# Worker brief: documentation updates (U2)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/durable-check-capture-u2
Leaf: durable-check-capture. You update documentation only; a sibling worker writes the code, so describe the documented contract, not current code state.

## 1. Goal

Update the docs the leaf plan names for the durable-capture contract: run-check writes command stdout/stderr into run-unique `capture-` files inside the holder from launch and prints a `capture <name>: <out> <err>` line before waiting; an owner-level `.lock` held by capture writers makes `akrogon pack` and owner completion wait for live captures; completing/packing an owner from inside its own run-check capture is refused naming the enclosing run; capture files read through `akrogon log` and never produce a completed check line, `check_end` or receipt.

## 2. Numbered acceptance criteria

1. `docs/reference/checks.md` describes the capture files, the `capture <name>: <out> <err>` early line, the holder `.lock` wait for pack/completion, the self-close refusal row, and that killed runs leave capture files but no completed check.
2. `docs/reference/files.md` records `capture-<name>-<run>-out.log`/`-err.log` and `<owner>/.lock` (never committed, never packed).
3. `docs/reference/commands.md` `run-check` row gains the capture line and `pack` row gains the wait/refusal.
4. `src/AREA.md` one-line updates: `run-check` sentence names captures + early line; `log`/`pack` sentence names the `.lock` wait; `completeOwner` sentence names the self-close refusal.
5. `tests/AREA.md` one line under Key files for `tests/durable-capture.test.ts`.
6. `bun test tests/command-reference.test.ts tests/docs-links.test.ts` green (command-row arg contract and link integrity).

## 3. Read-first list

- `docs/reference/checks.md` — sections "Keep output with akrogon run-check", "Read a log", "Refusals and what to do".
- `docs/reference/files.md` — leaf folder records table, `closed/` row.
- `docs/reference/commands.md` — `run-check`, `pack`, `log` rows.
- `src/AREA.md` — the run-check/pack/log/evidence sentences (≤40 lines rule is already met; keep it).
- `tests/AREA.md` — Key files list format.
- `src/run-check.ts`, `src/pack.ts`, `tests/durable-capture.test.ts` — the real contract being documented.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `docs/reference/checks.md`, `docs/reference/files.md`, `docs/reference/commands.md`, `src/AREA.md`, `tests/AREA.md`. Must land first: nothing. Shared test resource: none.

Contract to document (source of truth is the plan, not the not-yet-landed code):

- Capture files: `capture-<encodeURIComponent(name)>-<run-uuid>-out.log` and `...-err.log` inside the holder (`implementation/` or `--holder` dir), created before the command starts, removed after the completed log publishes, kept when the wrapper dies.
- Early stderr line: `capture <name>: <out> <err>` printed while the command runs, claiming no exit code; the `check <name>: <exit> <path>` line is unchanged and still prints after exit.
- `<owner>/.lock`: shared-held by every capture's writers and publication; `akrogon pack` and owner completion take it exclusively before snapshot/move, so they wait for live captures; basename `.lock` is never committed and never packed.
- Self-close refusal: `akrogon phase <slug> merged`/`akrogon pack` targeting the owner whose capture the caller sits inside refuses before waiting with `inside run-check run <uuid>`; a different owner waits and proceeds.
- `akrogon log` reads capture files by their plain path; a killed run produces no `check` line, `check_end` or verify receipt.

## 5. Do-not, reasons and exceptions

- Do not edit source, tests, skills or any file outside §4's list — owned by the sibling unit or out of scope. Exception: none; a doc need elsewhere is a mismatch.
- Do not document internals beyond the contract (flock carrier, env var names): user docs name observable behavior only. `src/AREA.md` may name `src/flock.ts` since it is a key-file map. Exception: none.
- Do not restructure sections or rewrite untouched prose: minimal diffs. Exception: a line made false by the contract gets the smallest true rewrite.
- Restated: anything outside these five files or beyond the contract above returns a mismatch, not an edit.

## 6. Ordered steps

1. `docs/reference/checks.md` — extend the run-check section with capture files + early line; add a "Read a log" mention that capture paths work; add a refusals-table row for `inside run-check run <uuid>`; note killed runs leave captures (AC 1).
2. `docs/reference/files.md` — leaf-folder records row for capture files; a line for `<owner>/.lock` (AC 2).
3. `docs/reference/commands.md` — `run-check` and `pack` row prose (AC 3).
4. `src/AREA.md` — update the three sentences (AC 4).
5. `tests/AREA.md` — one Key files line for `tests/durable-capture.test.ts` (AC 5).
6. `bun install --frozen-lockfile && bun test tests/command-reference.test.ts tests/docs-links.test.ts` (AC 6).

Advisory size: about 5 files and under 20 turns.

## 7. Commands

- `bun test tests/command-reference.test.ts tests/docs-links.test.ts`

Keep output through `akrogon run-check --name <label> -- <cmd>` and cite the `check <label>: <exit> <path>` line.

## 8. Done-when, evidence and report

Docs land the contract above, both test files green with the pasted `check <label>: <exit> <path>` line; commit only your chunk on the detached HEAD and return the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

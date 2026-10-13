# Sub-brief 1: worker-test-duty unit 1 — implement-issue skill files

## 1. Goal

Give implement-issue's worker test-duty rules their locked form (plan D1, D2, D3): workers run only targeted tests their brief names; A owns the changed-tests command and `checks`; the wait-on-exit rule names the background form.

## 2. Numbered acceptance criteria

1. `skills/implement-issue/brief-template.md` section 7 names the unit's targeted test commands from A's plan and states that when none are named the worker runs no changed-tests command; it no longer supplies the resolved `test_changed` command or the `AKROGON_BASE` value (no `test_changed` token and no `AKROGON_BASE` in section 7).
2. `skills/implement-issue/brief-template.md` section 2 refers to section 7's commands without calling them "the changed-test command" (no stale name for the removed resolved command).
3. `skills/implement-issue/worker-protocol.md` states workers run only the targeted test commands their brief names, never the full changed-tests command, and that A runs the resolved changed-tests command after each pick.
4. `skills/implement-issue/SKILL.md` (implement section) states workers receive only their unit's targeted test commands, never the full changed-tests command and never A's criterion proof and `checks` command runs.
5. `skills/implement-issue/SKILL.md` proof-order item 3 (wait-on-exit) names the background form: one fresh `mktemp -d "$TMPDIR/run.XXXXXX"` per run created before launch; the exact printed command started once there with `nohup`, output to `log`, exit status to `exit`, wrapper PID to `pid`; across tool calls no `exit` with the PID alive means running and no `exit` with the PID gone means incomplete; never `timeout`, never a second start for that directory.
6. `bun test tests/red-docs.test.ts tests/docs-links.test.ts tests/base-run.test.ts` passes.

## 3. Read-first

- `/home/ivan/Work/infra/akrogon/issues/open/concurrent-checks/worker-test-duty/plan.md` (D1, D2, D3)
- `skills/implement-issue/brief-template.md` sections 2 and 7
- `skills/implement-issue/worker-protocol.md` (Launch and return, Failure ownership)
- `skills/implement-issue/SKILL.md` proof-order item 3 and implement-mode paragraph
- `skills/implement-issue/ponytail.md` (house style; copy its prose register)

## 4. Change list and needed interfaces

Files owned: `skills/implement-issue/brief-template.md`, `skills/implement-issue/worker-protocol.md`, `skills/implement-issue/SKILL.md`. No prerequisites; no shared resources.

Edits:

1. `brief-template.md` §7 — replace the current paragraph (`The resolved `test_changed` command only, including the supplied `AKROGON_BASE` value for a configured leaf; A runs criterion proof and every `checks` command separately.` plus the no-runner sentence, which stays in substance) with: the unit's targeted test commands named from A's plan; when none are named the worker runs no changed-tests command; keep the no-runner sentence (name the actual targeted check derived from the checkout's tools, never the full suite); A runs the resolved changed-tests command, criterion proof and every `checks` command separately.
2. `brief-template.md` §2 — change `run under section 7's changed-test command` to `run under the commands section 7 names`.
3. `worker-protocol.md` Launch and return — `installs dependencies there before its changed tests` → `installs dependencies there before its targeted tests`; `changed-test output` → `targeted-test output`; `runs the lane changed tests after each pick` → `runs the resolved changed-tests command after each pick`.
4. `worker-protocol.md` Failure ownership — `Workers run only the brief's changed-test command against A's supplied base` → `Workers run only the targeted test commands their brief names, never the full changed-tests command`; `worker repairs with changed tests` → `worker repairs with the targeted tests its sub-brief names`.
5. `implement-issue/SKILL.md` implement paragraph — `workers receive only that command, not A's criterion proof and every `checks` command run` → `workers receive only their unit's targeted test commands, never the full changed-tests command and never A's criterion proof and `checks` command runs`.
6. `implement-issue/SKILL.md` proof-order item 3 — extend the item to name the background form verbatim: `3. Wait on exit: A waits on a slow command's exit and status, waits again when a wait returns before the command has exited, never sleeps a fixed interval and then reads the log, and treats the exit status as the result, never a quiet log. A command that may outlive the tool timeout runs as one background whole-command run: create `d=$(mktemp -d "$TMPDIR/run.XXXXXX")` fresh per run before launch, start the exact printed command once with `nohup sh -c '<cmd>; echo $? > "$0/exit"' "$d" > "$d/log" 2>&1 &` and record the wrapper PID with `echo $! > "$d/pid"`; across tool calls, no `exit` with the `pid` process alive means running, no `exit` with it gone means incomplete; never `timeout`, never a second start for that directory.`

No interface changes; skill prose only.

## 5. Do-not, reasons and exceptions

- Do not touch `skills/check-issue/SKILL.md` or any other file — another unit owns it; the exception is none.
- Do not add `merge_checks` runs or test files — the plan adds no tests (standing design bars wording tests on skill prose); return a mismatch instead if you believe a criterion needs a test.
- Do not restate the same rule in a second file beyond the listed edits — design: one rule per location.
- Return a mismatch with evidence rather than changing scope or rewording outside the listed edits; the exception is a revised brief from A.
- Do not run the resolved `test_changed` command or `format`/`typecheck` — those are A's; run only section 7's commands.

Reasons: the leaf's criteria pin exact duties per file and forbid extra scope; restating rules duplicates maintenance surface. Exceptions: only a revised brief authorizes different scope.

## 6. Ordered steps

1. `bun install --frozen-lockfile` in the worktree (flock it: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'`).
2. Apply edits 1–2 in `brief-template.md` (criteria 1, 2).
3. Apply edits 3–4 in `worker-protocol.md` (criterion 3).
4. Apply edits 5–6 in `implement-issue/SKILL.md` (criteria 4, 5).
5. Run the targeted tests (criterion 6).
6. Commit all three files in one commit on the detached HEAD; no `Test-Change:` trailer needed (no `src/test-files.ts`-matched file touched).

Advisory size: 3 files, under 15 turns.

## 7. Commands

Targeted tests for this unit: `bun test tests/red-docs.test.ts tests/docs-links.test.ts tests/base-run.test.ts` (these test files read the three edited skill files).

## 8. Done-when, evidence and report

All six criteria hold; the targeted test command output is pasted; the commit ID is returned.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

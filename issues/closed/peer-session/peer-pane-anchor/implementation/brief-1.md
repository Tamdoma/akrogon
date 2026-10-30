# Sub-brief 1: peer-anchor helper (W1-U1)

Worktree: /home/ivan/.akrogon/worktrees/akrogon/peer-pane-anchor-u1 (you are spawned there)

## 1. Goal

Implement plan decisions D1-D3: a new `skills/chart-issues/scripts/peer-anchor.ts` exporting `verifyAnchor(): string`. It is the shared entry check the five peer scripts will call: verify the inherited herdr env actually names a pane whose shell is an ancestor of this process, refuse otherwise.

## 2. Acceptance criteria

1. `HERDR_PANE_ID` absent or blank → throws `Error` naming `HERDR_PANE_ID` and `HERDR_SOCKET_PATH` (their values or "unset"); no herdr call is made.
2. `herdr pane process-info --pane <id>` exits non-zero → throws naming `HERDR_PANE_ID`, `HERDR_SOCKET_PATH` and herdr's answer (stderr body and exit code).
3. The returned `shell_pid` is not an ancestor of `process.pid` → throws naming `HERDR_PANE_ID`, `HERDR_SOCKET_PATH` and the `shell_pid` herdr returned.
4. `shell_pid` is an ancestor → returns the pane id.
5. Run directly (`bun skills/chart-issues/scripts/peer-anchor.ts`) it prints the verified pane id on stdout, exit 0; on refusal the message goes to stderr, exit 1 (a 3-line `import.meta.main` block; plan Criterion-4 decision).

## 3. Read-first

- `src/scope.ts` `startTime` — the `/proc/<pid>/stat` parse to mirror: field 4 (ppid) is index 1 after `stat.slice(stat.lastIndexOf(')') + 1).trim().split(' ')`.
- `skills/chart-issues/scripts/peer-restart.ts` `run`/`failureText` — the existing `Bun.spawnSync(['herdr', ...])` shape to copy.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and interfaces

- New file `skills/chart-issues/scripts/peer-anchor.ts`, the only file you own.
- `export function verifyAnchor(): string`. Sync implementation (spawnSync + readFileSync), matching the scripts' style; callers are entry code.
- Proc walk: start at `process.pid`, read `/proc/<pid>/stat` ppid (real `/proc` always — never `AKROGON_PROC_ROOT`), walk up until: found `shell_pid`, reached pid 1, a self-parent, a visited pid, or an unreadable/missing stat. Any end without a match is refusal 3.
- Parse `shell_pid` from the process-info stdout JSON (`result.process_info.shell_pid`, number). A non-zero exit or unparseable answer is refusal 2 — include the raw stderr/stdout text in the error.
- Zod is available (repo dependency) but a plain `JSON.parse` + shape check is acceptable; follow `peer-restart.ts`'s schema style if you use zod.
- No consumer edits: peer-*.ts and door-reset.ts changes belong to later units.

## 5. Do-not

- Do not edit any file other than `skills/chart-issues/scripts/peer-anchor.ts`; tests are committed already and owned by A.
- Do not read or write `.env*`, do not call any herdr command other than `pane process-info` inside the helper.
- Do not add flags, options, exports or call sites beyond the brief; return a mismatch with evidence instead of widening scope.

## 6. Ordered steps

1. Read `src/scope.ts` `startTime` and `peer-restart.ts` `run`.
2. Write `peer-anchor.ts`.
3. Typecheck + prettier on your file (commands below); live smoke is A's criterion-4 run, not yours.

Advisory size: 1 file, under ~8 turns.

## 7. Commands

- `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'` (once, before anything)
- `akrogon run-check --name u1-typecheck -- bun run typecheck`
- `akrogon run-check --name u1-format -- bunx prettier --check skills/chart-issues/scripts/peer-anchor.ts`

## 8. Done-when, evidence and report

Commit your change on this worktree's detached HEAD (`git add` the one file, `git commit -m "feat: add peer-anchor verifyAnchor helper"`), return the commit id, and fill:

Changed files and reasons: <paths and why>
Tests run: <commands and results, citing `check <label>: <exit> <path>` lines>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

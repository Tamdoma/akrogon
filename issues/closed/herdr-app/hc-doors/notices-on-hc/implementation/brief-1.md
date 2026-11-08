# Brief 1: U1 notice module and verb

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/notices-on-hc-u1` (detached at the leaf head). Repo: akrogon (TypeScript, bun).

## 1. Goal

Add the one module that owns akrogon's notice file contract (plan D1, D2) and the `akrogon notice` verb (D11) with its row in `docs/reference/commands.md`. Later units (engine callers, verify) import this module.

## 2. Acceptance criteria

1. `src/notice.ts` exports exactly these (D1, D2):
   - `type Notice = { title: string; body: string; attention: boolean }`
   - `noticeFolder(session: string): string` = `resolve(appHome(session), 'akrogon-notices')` (`appHome` from `src/hc.ts`; it already throws naming the expected path when the home is missing).
   - `noticeId(repo: string, ...parts: string[]): string` = `[repo, ...parts].join('.')`.
   - `noticePath(folder: string, id: string): string` = `resolve(folder, id + '.json')`.
   - `writeNotice(folder: string, id: string, notice: Notice): void`: `mkdirSync(folder, { recursive: true })`, write JSON `{title, body, attention}` to `.<id>.<pid>.tmp` in the same folder, `renameSync` to `<id>.json`. Throws on any failure (no catch). Rename stays inside the folder (cross-device lesson).
   - `noticeState(folder: string, id: string): 'pending' | 'shown'`: file present is `pending`, gone is `shown`.
   - `removeNotice(folder: string, id: string): void`: `rmSync(noticePath(folder, id), { force: true })`.
   - No herdr, herdr-app or hc call in the module besides `appHome`.
2. `akrogon notice --title <text> --body <text> [--attention]` (D11): options `title` (string), `body` (string), `attention` (boolean) in the verb option table of `src/akrogon.ts`. No positionals. `requireRepo(readGlobal(), process.cwd())` finds the repo (works from a subfolder). Title is parsed with `z.string().trim().min(1)`, body with `z.string()` (empty allowed). `repoSpace(repo)` (`src/hc.ts`) resolves the session; a refused resolution (`ok: false`) throws `new Error(resolution.reason)`. It writes `noticeId(repo.name, 'notice', randomUUID())` with `attention: values.attention === true` into `noticeFolder(resolution.session)` and prints the written path.
3. A row in `docs/reference/commands.md` under `## Run work`, matching the table's style: invocation `` `akrogon notice --title <text> --body <text> [--attention]` `` and an effect saying it writes one notice file into the `akrogon-notices/` folder of the herdr-app session holding the current repository's space, shown by herdr-setup's `session-status` bar as a toast, with the attention sound when `--attention` is given; used by the watcher's needs-you notice.
4. Planned tests green (they already exist; do not edit them): all four cases in `tests/notices.test.ts`.

## 3. Read first

- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.
- `src/hc.ts` lines 199-212 (`SpaceResolution`, `repoSpace`) and 497-504 (`appHome`).
- `src/akrogon.ts` whole (verb option table at lines 27-68, `case` pattern, e.g. `case 'stop-run'` and `case 'seat'`).
- `tests/notices.test.ts` (the planned tests), `tests/hc-fixture.ts` lines 486-512 (`noticeFiles`).
- `docs/reference/commands.md` lines 14-24.

## 4. Change list

- New `src/notice.ts` (criterion 1).
- `src/akrogon.ts`: option table entry and `case 'notice'` (criterion 2). Use dynamic `await import('./notice')` / `await import('./hc')` only if that is the file's existing pattern for verb bodies; otherwise follow what neighbouring cases do.
- `docs/reference/commands.md`: one row (criterion 3).
- Owned paths: those three. Lands first; nothing lands before it. No shared test resource.

## 5. Do-not, reasons and exceptions

- Do not edit any test file (`tests/**`): tests are locked after planning. `tests/command-reference.test.ts` will go red once the row lands because its `contracts` map lacks `notice`; A adds that entry itself. Do not "fix" it. Exception: none for workers.
- Do not touch callers in `src/next.ts`, `src/phase.ts`, `src/verify.ts`: other units own them.
- Do not add fallbacks, catch blocks or retries in `writeNotice`: a failed write must throw so callers record it.
- Do not change `src/hc.ts`.
- A requirement that conflicts with the code: return a mismatch with evidence instead of changing scope or interfaces. Exception: a revised brief from A.

Reasons restated: tests are A's; callers belong to other units; the write must fail loudly; hc.ts is engine-on-hc's surface. The only exception is a revised brief from A.

## 6. Ordered steps

1. `bun install --frozen-lockfile --backend=copyfile` in the worktree.
2. Write `src/notice.ts` (criterion 1).
3. Add the verb (criterion 2).
4. Add the docs row (criterion 3).
5. Run the commands in section 7; all four `notices.test.ts` cases green. `bun run typecheck` green.
6. Run `bunx prettier --write src/notice.ts src/akrogon.ts` then commit one commit: `feat: notice module and akrogon notice verb`.

Advisory size: 3 files, under 15 turns.

## 7. Commands

- `akrogon run-check --name u1-notices -- bun test --timeout=30000 tests/notices.test.ts`
- `akrogon run-check --name u1-typecheck -- bun run typecheck`

## 8. Done-when, evidence and report

Done when criteria 1-4 hold and the commit exists. Keep command output only through `akrogon run-check --name <label> -- <cmd>` and cite its `check <label>: <exit> <path>` line; read a log with `akrogon log <path>`. Return the commit id. Stop no process by command-line pattern.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

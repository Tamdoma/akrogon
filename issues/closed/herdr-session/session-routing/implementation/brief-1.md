# Worker brief 1 — shell.ts session routing primitives (plan U2)

## 1. Goal

Implement the session plumbing in `src/shell.ts` that every other unit consumes (plan D1, D2, D12). Every herdr call akrogon makes for a repo must carry `--session <name>`, and session resolution must follow the locked design: one `herdr session list --json` per process per executable, one `workspace list` per running session, the repo workspace is the one whose label equals the repo key exactly.

## 2. Acceptance criteria

1. `herdrArgv(args, opts?)` builds `[exe, ...('--session <name>' when session set), ...args]`; `exe` defaults to `'herdr'`.
2. `herdr(args, schema, opts?)` runs the built argv; `{session, exe, deadlineMs}` supported. `command(argv, cwd, stdin?, deadlineMs?)` passes the deadline to `run`. Discovery calls (session list, workspace list) use a 10 000 ms deadline; a deadline hit counts as an unreadable session or a failed session list.
3. `session list --json` reply is the bare `{sessions:[{name,running,socket_path,session_dir,default}]}` object — no `result` wrapper. Parse once at the boundary with a zod schema.
4. `repoSession(repo, opts?: {exe?: string})` returns `{ok: true, session: Session, workspace: {workspace_id, label}}` or `{ok: false, reason: string}` and never throws; result memoized per `(repo.name, exe)` for the process.
5. Stopped sessions (`running: false`) are never called. A session listed running whose read fails `server_not_running` is treated as stopped and skipped. Any other error, or a deadline, makes the session unreadable and the repo refused. Zero or several label matches refuse, naming session and workspace_id for duplicates. A failed `session list` refuses every repo.
6. Refusal reason strings name: the searched label, the sessions searched, the sessions skipped as stopped, and for duplicates each `session`/`workspace_id` pair; unreadable sessions are named with their error.
7. `panes(session?)`, `tabs(session?)`, `workspaces(session?)` accept the resolved session name and emit routed argv.
8. Existing tests in `tests/shell.test.ts` keep passing (sessionless calls emit no `--session`).

## 3. Read-first list

- `src/shell.ts` (whole file — current `run`, `command`, `herdr`, `panes`, `tabs`, `workspaces`, `herdrError`, `retryable`).
- `src/config.ts` `Repo` type (`repo.name` is the label key).
- `tests/fake-herdr.ts` — the fake's `session list --json`, `--session` parsing, `deadRead`, `readError`, `delayMs`, `sessionListError`, `delaySessionListMs` seams; read it to match the real contract.
- `tests/session-routing.test.ts` — the criterion tests this plumbing must eventually satisfy (do not fix them; they stay red until consumer units land).
- Skill folder `ponytail.md`.

## 4. Change list and needed interfaces

Owns: `src/shell.ts` only.

Types and signatures to add or change (these are the pinned interfaces wave 3 consumes):

```ts
export const sessionSchema = z.object({
  name: z.string(),
  running: z.boolean(),
  socket_path: z.string(),
  session_dir: z.string(),
  default: z.boolean(),
});
export type Session = z.infer<typeof sessionSchema>;
export type SessionResolution =
  | { ok: true; session: Session; workspace: Workspace }
  | { ok: false; reason: string };
export function herdrArgv(args: string[], opts: { session?: string; exe?: string } = {}): string[];
export async function command(argv: string[], cwd?: string, stdin?: string, deadlineMs?: number): Promise<string>;
export async function herdr<T>(
  args: string[],
  schema: z.ZodType<T>,
  opts: { session?: string; exe?: string; deadlineMs?: number } = {},
): Promise<T>;
export async function repoSession(repo: Repo, opts: { exe?: string } = {}): Promise<SessionResolution>;
export async function panes(session?: string, exe?: string): Promise<Pane[]>;
export async function tabs(session?: string, exe?: string): Promise<Tab[]>;
export async function workspaces(session?: string, exe?: string): Promise<Workspace[]>;
```

Discovery deadline constant: `const DISCOVERY_DEADLINE_MS = 10_000` — export it, wave 3's second-seat guard reuses it for its pane/tab lists.

`server_not_running` detection reads `herdrError(result).code === 'server_not_running'` (the error JSON arrives on stderr with exit 1).

`sessionList` fetch: call once per process per `exe`, cache the parsed result or the failure. Refusals from resolution: `{ok:false}`; a `session list` failure should also mark `scope: 'invocation'` on the failure so the caller can report it once across repos — add `scope?: 'repo' | 'invocation'` to the failure variant, default `'repo'`, `'invocation'` only for session-list failure.

## 5. Do-not, reasons and exceptions

- Do not edit any file outside `src/shell.ts`. Other files land in later units; a compile error in consumers is expected and ignored (typecheck the file standalone via the test command below, and expect callers to still compile because you only extend signatures).
- Do not add retries to discovery — the design pins plain calls with the deadline.
- Do not change `herdrError`, `retryable`, `spawnFiles`, `spawnCaptured`, `finishCaptured`, `credentialEnv`, `quote`, `writeYaml` or the schema exports beyond what is listed.
- Do not write or edit tests. Planned tests that stay red are expected; a wrong planned test is a mismatch to A, not a fix.
- A conflict between this brief and the plan is a mismatch returned to A with evidence, not a scope change; the exception is a revised brief from A.

## 6. Ordered steps

1. Read `src/shell.ts`, `tests/fake-herdr.ts`, `tests/session-routing.test.ts` criterion tests 1-3.
2. Add `herdrArgv`, extend `command`, extend `herdr`, add `sessionSchema`/`Session`/`SessionResolution`, `DISCOVERY_DEADLINE_MS`.
3. Add the process-level `session list` cache keyed by `exe` and `repoSession` with the resolution rules (skip stopped, `server_not_running`-as-stopped, duplicates, unreadable, refusal message fields).
4. Extend `panes`/`tabs`/`workspaces` with the session/exe params.
5. Run the commands in section 7; commit your chunk.

Advisory size: 1 file, under 15 turns.

## 7. Commands

Run in your worktree (install first):

```sh
flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'
akrogon run-check --name shell-unit -- bun test tests/shell.test.ts
akrogon run-check --name shell-typecheck -- bun run typecheck
```

`bun run typecheck` will report errors in `tests/session-routing.test.ts` only if the file references new symbols — it does not; expect a clean typecheck because your changes are additive to exported signatures.

## 8. Done-when, evidence and report

All acceptance criteria met, both commands above exit 0, commit on the detached HEAD. Report the commit id, then:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

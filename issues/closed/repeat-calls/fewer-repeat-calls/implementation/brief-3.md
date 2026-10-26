# Sub-brief 3 (unit U3): once-per-run root identity in src/config.ts

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/fewer-repeat-calls-u3`
Leaf: `/home/ivan/Work/infra/akrogon/issues/open/repeat-calls/fewer-repeat-calls`

## 1. Goal

Read each registered root's `git rev-parse --git-common-dir` and `git remote get-url` once per akrogon process, keeping only a successful answer (plan decision D3, corrected: null is never cached; criterion 3).

## 2. Numbered acceptance criteria

1. `commonDirectory(cwd)` in `src/config.ts` memoizes non-null successes per process, keyed by `realpathSync(cwd)` (fall back to the raw `cwd` string when realpath throws). A `null` (non-repo) result is never cached and respawns git on the next call. A thrown failure is removed from the map so the next call retries.
2. New `export async function remoteUrl(root: string, remote: string): Promise<string>` in `src/config.ts` runs `git remote get-url <remote>` at `root`, memoizes successes per `${root}\n${remote}`, throws `CommandError` on failure (nothing cached), and clears failed entries so the next call retries.
3. `src/preflight.ts`: `ensureRemote` calls `remoteUrl(repo.root, repo.config.remote)` and maps failure to `PreflightError C1` exactly as today (argv, cwd, result preserved: `new PreflightError('C1', argv, repo.root, error.result, repo)` catching `CommandError`). `remoteBase` drops its own `ensureRemote()` call — `checkBase` calls it once up front — so `remoteBase` only runs `ls-remote`.
4. `src/pull.ts`: `originSource` calls `remoteUrl(repo.root, 'origin')` in place of its inline `command(['git','remote','get-url','origin'])`.
5. `tests/config.test.ts` stays green: `commonDirectory` still spawns git once per call across four distinct cwds and failure output keeps the cwd.
6. `bun run typecheck` is clean.

## 3. Read-first list

- `src/config.ts` (`commonDirectory`, `currentRepo`, imports)
- `src/preflight.ts` (`ensureRemote`, `remoteBase`, `checkBase`, `localBase`, `PreflightError`)
- `src/pull.ts` (`originSource`, `pullRepo`)
- `tests/config.test.ts` `commonDirectory spawns git once per call` (~line 98)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- `src/config.ts`: memo map inside `commonDirectory`; new exported `remoteUrl`. Both keep `run()`/`command()` and realpath semantics of today for non-cached paths.
- `src/preflight.ts`: `ensureRemote` body swap; `remoteBase` drops `await ensureRemote(repo)`.
- `src/pull.ts`: `originSource` one-line swap; import `remoteUrl` from `./config`.
- Owned paths: `src/config.ts`, `src/preflight.ts`, `src/pull.ts`. No shared test resource. No prerequisite units. `src/next.ts ensureWorktree` switches to `commonDirectory` in a later unit (U2), not here.

## 5. Do-not, reasons and exceptions

- Do not cache `null` results or failures — criterion 3 requires a failed lookup to retry on the next call and the design names a cached non-repo null a pitfall.
- Do not change `PreflightError` construction, `checkBase`/`localBase`/`trackingRef` semantics, `ls-remote` argv, or `originSource`'s regex and error — their contracts are exercised by tests and preflight refusals.
- Do not memoize `--verify`, `HEAD`, `fetch`, `--git-path` or `--show-toplevel` — ref facts stay fresh by locked design.
- Do not edit `src/next.ts`, `src/self-update.ts` or tests — other units own them.
- Do not write or edit tests — a red planned test is a mismatch returned to A.
- On any conflict with this brief, return a mismatch with evidence instead of widening scope; the exception is a revised brief from A authorizing the change.

Restated: cache only non-null successes and only for `commonDirectory`/`remoteUrl`; keep every existing contract text and argv; no edits outside the three named files; conflicts come back as a mismatch, resolved only by a revised brief.

## 6. Ordered steps

1. Read the listed files; add the `commonDirectory` memo and `remoteUrl` in `src/config.ts` (criteria 1–2).
2. Rewire `src/preflight.ts` and `src/pull.ts` (criteria 3–4).
3. `bun run typecheck`, then run the config test file (section 7).
4. Commit with message `config: read the registered root common dir and remote url once per run` and return the sha.

Advisory size: 3 files, under 12 turns.

## 7. Commands

Run from the worktree:

- `akrogon run-check --holder /home/ivan/.akrogon/worktrees/akrogon/fewer-repeat-calls-u3 --name u3-typecheck -- bun run typecheck`
- `akrogon run-check --holder /home/ivan/.akrogon/worktrees/akrogon/fewer-repeat-calls-u3 --name u3-config -- bun test tests/config.test.ts --timeout=30000`

Cite the printed `check <name>: <exit> <path>` lines. Other planned reds in other files are expected and not yours.

## 8. Done-when, evidence and report

All acceptance criteria hold and both checks printed exit 0. Report with these four lines filled:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

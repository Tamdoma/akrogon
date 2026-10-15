# Brief U1: log resolver module

Worktree: /home/ivan/.akrogon/worktrees/akrogon/log-reader-u1

## 1. Goal

Create `src/evidence.ts`, the only code that maps a recorded log path to bytes (plan D1-D3). `akrogon log` and `akrogon flaky` consume it in later units.

## 2. Acceptance criteria

1. `locate(recorded, cwd, repo)` returns `{ownerDirs, member}` or `null` per the rules below.
2. `readMember(ownerDir, member)` returns the member's bytes from `<ownerDir>/evidence.tar.zst` or throws `LogError` kind `member` naming the archive and member; an unreadable/corrupt archive throws kind `archive` naming the archive path.
3. `readLog(repo, recorded, cwd)` returns bytes: first plain file `ownerDir/member` across `ownerDirs`; else `readMember` on the first existing `ownerDir`; no existing `ownerDir` → `LogError` kind `nomatch` naming `recorded`.
4. `readLogAcross(global, recorded)` returns bytes for the one matching repo; 0 matches → `nomatch` naming `recorded`; >1 → `ambiguous` naming the matching repo names.
5. `LogError extends Error` with readonly `kind` (`'nomatch' | 'ambiguous' | 'archive' | 'member'`), message naming the path.

## 3. Read-first list

- `src/config.ts`: `Repo`, `GlobalConfig`, `readRepo`, `expandPath`, `globalHome`, `within`
- `src/shell.ts`: `run`, `command`, `Result`
- `tests/log-reader.test.ts`: `packEvidence` shows archive shape (`evidence.tar.zst` at owner dir, members relative to it)
- `skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

New file `src/evidence.ts` only:

```ts
import { existsSync, readFileSync } from 'node:fs';
import { resolve, isAbsolute } from 'node:path';
import { expandPath, globalHome, readRepo, within, type GlobalConfig, type Repo } from './config';
import { run, type Result } from './shell';

export type LogErrorKind = 'nomatch' | 'ambiguous' | 'archive' | 'member';
export class LogError extends Error {
  readonly kind: LogErrorKind;
  constructor(kind: LogErrorKind, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.kind = kind;
  }
}
export type LogTarget = { ownerDirs: string[]; member: string };

export async function locate(recorded: string, cwd: string, repo: Repo): Promise<LogTarget | null>
export async function readMember(ownerDir: string, member: string): Promise<Uint8Array>
export async function readLog(repo: Repo, recorded: string, cwd: string): Promise<Uint8Array>
export async function readLogAcross(global: GlobalConfig, recorded: string): Promise<Uint8Array>
```

locate rules (design verbatim):
- Normalize: `absolute = isAbsolute(recorded) ? recorded : resolve(cwd, recorded)`.
- Candidate roots: `repo.root` plus every path `git worktree list` prints for repo.root (run `['git', 'worktree', 'list', '--porcelain']` there; parse `worktree <path>` lines). If `absolute` is under a root (`within` or equal), strip it to a repo-relative path. Otherwise cut at the first `/issues/open/`, `/issues/closed/`, `/issues/parked/`, or `issues/chart/` boundary, keeping the whole member suffix so a member containing its own `issues/` folder is never truncated.
- After `issues/(open|closed|parked)/`, the first part is the owner, the rest is the member; `ownerDirs` = `[issues/open/<owner>, issues/closed/<owner>, issues/parked/<owner>]` resolved under `repo.root`, in that order.
- `issues/chart/<chart>/direct/<member>`: owner folder is `<root>/issues/chart/<chart>/direct`, `ownerDirs` = that one path.
- No boundary match or empty member → `null`.

readMember: read `<ownerDir>/evidence.tar.zst`; read failure, `Bun.zstdDecompressSync` failure or `new Bun.Archive(...)`/`files()` failure → `LogError('archive', ...)` naming the archive path with the underlying error as `cause`; member absent from `files()` → `LogError('member', ...)` naming archive path and member; return `new Uint8Array(await file.arrayBuffer())`.

readLog: for each `ownerDir` of the target, if plain `ownerDir/member` exists return `readFileSync` bytes; remember the first `ownerDir` that exists. No hit → `nomatch` when no `ownerDir` exists, else `readMember(firstExisting, member)`.

readLogAcross: iterate `Object.entries(global.repos)`; per repo try `readLog(readRepo(name, expandPath(path, globalHome())), recorded, cwd)` — pass `cwd` through: signature `readLogAcross(global, recorded, cwd)`. Collect {name, bytes}; `nomatch` errors count as no match, all other `LogError` kinds are a match-attempt failure that still counts the repo as matching its shape — treat them as a match carrying the error: if exactly one repo resolves or errors non-nomatch, surface its bytes or error; multiple resolving-or-erroring repos → `ambiguous` naming them; all `nomatch` → `nomatch` naming `recorded`. Simpler equivalent: attempt each repo; bucket {ok bytes}, {err non-nomatch}, {nomatch}; total matches = ok+err; 0 → nomatch; >1 → ambiguous naming those repo names; 1 → return its bytes or throw its error.

## 5. Do-not, reasons and exceptions

- Write or edit no test file: tests are locked (plan C1-C5 red proofs exist). Exception: none — a red/wrong planned test is a mismatch returned to A.
- No other files changed; `src/akrogon.ts` and `src/flaky.ts` are other units. Exception: revised brief from A.
- No caching of worktree lists or archives; accepted cost per design. Exception: none.
- Keep the whole member suffix after the boundary — a member containing `issues/` must never be truncated. Exception: none.
- Mismatch → return evidence and smallest brief correction, never a scope change. Restated: the exclusions above stand; the only escape is a revised brief from A.

## 6. Ordered steps

1. Create `src/evidence.ts` per section 4 (criterion 1-5).
2. `bun install --frozen-lockfile`, then `bunx tsc --noEmit` (expected: only the two pre-existing `tests/flaky.test.ts` "Expected 1 arguments" errors against the not-yet-updated `flakyLines`; your file must typecheck clean).
3. Smoke probe in a temp dir: `git init` a repo, mkdir `issues/open/o`, write `issues/open/o/evidence.tar.zst` via `new Bun.Archive({'m.log': buf}).bytes()` + `Bun.zstdCompressSync(bytes,{level:19})`, call `locate`/`readLog` through `bun -e` importing your module; assert byte equality for a member containing `issues/` in its name and a `nomatch` on a missing owner. Paste output.

Advisory size: 1 file, ~15 turns.

## 7. Commands

- `bun install --frozen-lockfile`
- `bunx tsc --noEmit` (clean for `src/evidence.ts`; the two flaky.test.ts errors are expected until U3)
- The section-6 step-3 probe via `bun -e`

## 8. Done-when, evidence and report

`src/evidence.ts` exists, typechecks clean, the probe shows byte-exact member read and correct `nomatch`; commit `feat: add recorded-log resolver` (or similar) on the detached worktree HEAD and return the commit ID.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

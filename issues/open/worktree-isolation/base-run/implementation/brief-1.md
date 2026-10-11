# Brief 1: extract shared env/spawn helpers and .env emission helper

## 1. Goal

Pure refactor enabling plan D5/D6. `akrogon base-run` (next unit) needs the constructed check env, spawn-to-log step, and the `.env` emission tail from `writeLeafEnv` parameterized by name list. Extract, rename nothing else, change no behavior. All existing tests stay green.

## 2. Acceptance criteria

1. `src/run-check.ts` exports `constructedEnv(repo: Repo, runRoot: string): Record<string, string>` building exactly the env `runCheck` builds today minus `env.AKROGON_BASE` (callers set it), and `spawnLogged(argv: string[], cwd: string, env: Record<string, string>, log: string): Promise<Result>` (`Result` from `./shell`) doing the Bun.spawn + collect stdout/stderr + append both to `log` + return the Result. `runCheck` calls both and keeps its stdio passthrough by writing `result.stdout`/`result.stderr`; its visible behavior (stdio passthrough, copied log to `check-<name>-<ts>-<pid>.log`, `.owner` file, run-root removal) is unchanged.
2. `src/next.ts` `writeLeafEnv` keeps its signature and behavior; the emission tail (parse root `.env` with `parseEnv`, missing-name refusal, emit-candidate round-trip, temp-file-in-git-dir + rename, mode 0600) becomes an exported function taking explicit `names: string[]` so a caller can pass `leaf.state.env_names` instead of `repo.config.env`. `writeLeafEnv` calls it with `repo.config.env`.
3. `bun test --changed=<base>` and `bun test tests/run-check.test.ts tests/worktree-store.test.ts` pass; `bun run typecheck` clean.
4. No other file changes; no tests written or edited.

## 3. Read-first

- `src/run-check.ts` (whole file — it is ~110 lines)
- `src/next.ts` lines ~349-405 (`writeLeafEnv`)
- `src/config.ts` `leafTemp`, `base`
- `skills/implement-issue/ponytail.md`
- Existing pattern to copy: keep function placement and style of the file you edit; no new files.

## 4. Change list and interfaces

Owns: `src/run-check.ts`, `src/next.ts`. Lands first in wave 1; consumed by brief 2 (`src/base-run.ts`). No shared test resource. Exact signatures:

```ts
// run-check.ts additions
export function constructedEnv(repo: Repo, runRoot: string): Record<string, string>;
export async function spawnLogged(argv: string[], cwd: string, env: Record<string, string>, log: string): Promise<Result>;
// next.ts addition — name it emitEnvFile
export async function emitEnvFile(repo: Repo, worktree: string, names: string[]): Promise<void>;
```

`constructedEnv` = current loop over `copied` + `TMPDIR = runRoot` + `repo.config.env` passthrough; `AKROGON_BASE` moves out (runCheck sets `env.AKROGON_BASE = await base(repo, cwd)` after the call). `spawnLogged` = the Bun.spawn block, Response text collection, `appendFileSync(log, stdout); appendFileSync(log, stderr);` and `return { code, stdout, stderr }`; runCheck keeps its own `process.stdout.write`/`process.stderr.write` passthrough — spawnLogged does NOT echo to stdio. `emitEnvFile` = everything in `writeLeafEnv` from `const root = resolve(repo.root, '.env')` through `renameSync(temp, link)`, with `repo.config.env` replaced by the `names` parameter; the tracked/ignored guard block and the `live` early-return stay in `writeLeafEnv`.

## 5. Do-not

- Do not write or edit any test file. Existing tests are the contract.
- Do not change `.env` semantics, ordering, error messages, or the constructed env contents.
- Do not add parameters, options, or fallbacks beyond the signatures above.
- Do not touch `src/base-run.ts` or `src/akrogon.ts`; that is brief 2.
- A planned test that is wrong or red is a mismatch returned to A, never fixed here.
- Return a mismatch with evidence instead of changing an exported signature; the exception is a revised brief from A.
Restated: no tests, no behavior change, no extra parameters, no out-of-scope files; deviations come back as a mismatch, not edits.

## 6. Ordered steps

1. Read `src/run-check.ts` and `src/next.ts`.
2. Edit `run-check.ts`: add the two exports, rewire `runCheck` (criterion 1).
3. Edit `next.ts`: add `emitEnvFile`, rewire `writeLeafEnv` (criterion 2).
4. Run `bun run typecheck`, then section 7 command (criterion 3).

Advisory size: 2 files, under 12 turns.

## 7. Commands

```sh
bun test --changed=01ca1fbe8654b11b3cec04e56d6ec498dae87196 --timeout=30000
bun test tests/run-check.test.ts tests/worktree-store.test.ts --timeout=30000
bun run typecheck
```

## 8. Done-when, evidence and report

Both extractions in place, runCheck/writeLeafEnv rewired, the three commands pass, commit on the detached worktree HEAD with a `refactor:` message. Report the commit id.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

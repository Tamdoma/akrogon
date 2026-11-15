# Brief: cli-help unit U1 — the CLI argument boundary

Worktree: /home/ivan/.akrogon/worktrees/akrogon/cli-help-u1

## 1. Goal

Implement the cli-help product code in `src/` per plan decisions D1–D5, D6, D8: `akrogon <verb> --help` prints that verb's declared flags (built from the parser's own option declaration) on stdout and exits 0; `akrogon --help` prints the verb list; an unknown flag prints one line on stderr naming the flag and the verb's declared flags, exit 1; a wrong `timing --since` form prints the timing usage line, exit 1; none prints a stack trace or code frame. All other behavior stays.

## 2. Numbered acceptance criteria

1. Every public verb in `VERB_OPTIONS` answers `--help` per criterion 1 of the leaf brief.
2. `akrogon --help` answers per criterion 2.
3. Unknown flag and `--help`-with-unknown-flag behave per criterion 3.
4. Wrong `--since` forms behave per criterion 4.
5. Help and the two arg errors exit before `migrateStateHome()` and do no work, per criterion 5.
6. `--help` after `--` is a positional for the child, per criterion 6.
7. All other errors propagate unchanged, per criterion 7.

The committed tests in `tests/cli-help.test.ts` are the proof; they are already on HEAD. You write and edit no test.

## 3. Read-first list

- `src/akrogon.ts` — the file you change most: verb resolution, the `options` ternary chain, the single `parseArgs` call, the `timing` case, the default verb-list error.
- `src/state-home.ts` — `migrateStateHome` writes files when the tool root holds `config.yaml`; the new exits must precede it.
- `src/guard.ts`, `src/run-check.ts` — each holds one `Usage:` string that becomes an imported constant; command behavior unchanged.
- `tests/cli-help.test.ts` — imports `VERB_OPTIONS`, `verbFlags`, `USAGE_LINES` from `src/usage`; those exports must exist with exactly these names and shapes.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` — working mode.

## 4. Change list and needed interfaces

New file `src/usage.ts` exporting exactly:

```ts
export type FlagSpec = { type: 'string' | 'boolean' };
export const VERB_OPTIONS: Record<string, Record<string, FlagSpec>>;
export const USAGE_LINES: Record<string, string>;          // verbs pack|stop|timing|guard|run-check
export const VERB_USAGE: string;                           // Usage: akrogon <install|...|rollback>
export const PACK_USAGE: string;
export const STOP_USAGE: string;
export const TIMING_USAGE: string;
export const GUARD_USAGE: string;
export const RUN_CHECK_USAGE: string;
export function optionsFor(verb: string): Record<string, FlagSpec>;
export function verbFlags(verb: string): string[];          // every declared flag incl. '--help', order stable
export function helpText(verb: string): string;             // `akrogon <verb> <flags>` plus `\n`+usage line when USAGE_LINES holds the verb
```

`VERB_OPTIONS` holds the 30 public verbs in this exact order (the verb-list order today): install, listen, init, config, preflight, phase, land, next, seat, pull, close, park, unpark, pause, unpause, stop, stop-run, start, sync, status, leftovers, timing, flaky, log, run-check, verify, guard, pack, notice, rollback. `verify-pass` is NOT in it — deliberate. Each verb's flags are the ones the current `options` ternary declares for it (`pull`, `park`, `unpark`, `stop` share `{all}`; verbs with none get `{}`).

`optionsFor(verb)` returns `VERB_OPTIONS[verb]` (or `{}` for a verb not in it) plus `help: {type:'boolean'}` — one object the parser and `verbFlags` both read.

`src/akrogon.ts`, in this order: `verb` from argv[2]; retired `unhold`/`hold-fix` check unchanged; `verb === '--help'` prints `VERB_USAGE` on stdout and `process.exit(0)`; `parseArgs({args: argv.slice(3), options: verb===undefined?{}:optionsFor(verb), allowPositionals:true, strict:true})` inside try/catch where `catch` reformats ONLY `code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION'` to one stderr line `akrogon <verb> <verbFlags joined>: unknown flag <flag>` (flag extracted from the error's `Unknown option 'X'` text) then `process.exit(1)`, rethrowing all else; `values.help === true && Object.hasOwn(VERB_OPTIONS, verb)` prints `helpText(verb)` on stdout and `process.exit(0)`; `await migrateStateHome()`; the unchanged dispatch switch. In `timing`, wrap ONLY the `mode` ternary `z.iso` parses in try/catch: `z.ZodError` → `console.error(TIMING_USAGE)` + `process.exit(1)`, rethrow else; `timingCommand` stays outside the try; the shape gate keeps `throw new Error(TIMING_USAGE)`. `pack`, `stop`, and the default verb-list `throw` use the imported constants. `values` typing: `Record<string, string | boolean | undefined>` compiles under `tsc --noEmit` (the current head already typechecks this way — keep it).

`src/guard.ts` and `src/run-check.ts`: replace the inline usage strings with `GUARD_USAGE`/`RUN_CHECK_USAGE` imports.

Nothing else changes. No files under `issues/`, no tests touched, no doc changes (U2 owns those).

## 5. Do-not, reasons and exceptions

- No test writes or edits — planned tests are A's; a red or wrong planned test is a mismatch returned to A, not a fix.
- No new flags, verbs, usage lines, descriptions, `-h`, or `help` verb — the design forecloses them.
- No changes outside `src/akrogon.ts`, `src/usage.ts`, `src/guard.ts`, `src/run-check.ts`.
- No reformatting of errors beyond `ERR_PARSE_ARGS_UNKNOWN_OPTION` and the `z.ZodError` timing parse — criterion 7 requires every other error unchanged; no catch wrapping the dispatch.
- Return a mismatch instead of changing scope or an interface; the exception is a revised brief from A authorizing it.
- Restated: don't touch tests, don't widen error scope, don't add surfaces, return mismatches rather than re-scope.

## 6. Ordered steps

Advisory: ~4 files, under 20 turns.

1. Write `src/usage.ts` exactly as section 4 specifies (criteria 1–3, 5–7).
2. Edit `src/akrogon.ts` top: the help/parse/unknown-flag/help-check order and `migrateStateHome` placement (criteria 1–3, 5–7).
3. Edit the `timing` case: `mode` ternary parse wrapped, `ZodError` → usage on stderr exit 1 (criterion 4).
4. Replace the three inline usage literals in `akrogon.ts` with constants, and `guard.ts`/`run-check.ts` literals with imports.
5. Run the commands in section 7; paste results.

## 7. Commands

```sh
cd /home/ivan/.akrogon/worktrees/akrogon/cli-help-u1
flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'
bun run typecheck
akrogon run-check --name u1-tests -- bun test --timeout 30000 tests/cli-help.test.ts
```

Keep the run-check output through its printed `check u1-tests: <exit> <path>` line and cite it.

## 8. Done-when, evidence and report

All seven criteria green under `bun test tests/cli-help.test.ts`, `tsc --noEmit` clean, one commit holding only the four src files, commit ID returned.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

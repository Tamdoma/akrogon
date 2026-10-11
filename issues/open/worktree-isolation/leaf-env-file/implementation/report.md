# Implementation report: leaf-env-file

Base: `309d742605a0516067840863ffdf3be29b03fc0c` · Head: `6573c84`

Dispatch now writes a real `.env` (mode 0600) into the leaf worktree holding only repo-config `env:` names copied from the registered checkout's `.env`. No live tab rewrites it and bumps `env_generation`; a live tab freezes it. Missing declared names refuse naming only the names. Tracked/not-ignored refusals unchanged.

## Changed files and reasons

- `src/next.ts` — `linkEnv` → `writeLeafEnv(repo, worktree, live): Promise<boolean>`; refusals first, `live` short-circuit, `parseEnv` of root `.env`, missing-name refusal (names only), `KEY=`+`JSON.stringify(value)` lines, atomic write via temp in `git rev-parse --git-dir` + `renameSync`. `ensureWorktree(repo, leaf, live)` merges `env_names`/`env_generation`; `allocate` passes `matches.length === 1`.
- `src/state.ts` — `stateSchema` gains `env_names` default `[]`, `env_generation` default `0`.
- `tests/next.test.ts` — `.env` block rewritten for the new behavior (subset file, mode, live freeze/dead rewrite with generation 0→1, missing-name refusal with sentinel non-leak in stdout/stderr/state.yaml, refusals kept, real-file/stale-link replaced, empty `env:` cases).
- `tests/batch-dispatch.test.ts` — symlink assertions → regular empty file.
- `tests/state.test.ts` — `supported: State` fixture gains the two defaulted fields.
- `src/AREA.md` — symlink line rewritten for the written file.
- `skills/implement-issue/SKILL.md`, `skills/plan-issue/SKILL.md` — "the worktree link" → "the worktree `.env`" in `produces[].save` sentences.

## Worker waves

- Wave 1: `17ad882` (next.test.ts) + `f23c7ee` (batch-dispatch) — landed red as designed; wave-2 implementation turned them green.
- Wave 2: `6573c84` — implementation. Worker's noted mismatch resolved: tests fix generation semantics as rewrite count (first write 0, rewrites +1); plan.md Implementation notes updated to match.

## Commands and results

| Command | Result | Wall time |
|---|---|---|
| `bun run format` | clean (reverted prettier drift in `src/status.ts`, `skills/chart-issues/scripts/peer-wait.ts`, not ours) | seconds |
| `bun run typecheck` | exit 0 | seconds |
| `AKROGON_BASE=309d742… bun test --changed="$AKROGON_BASE" --timeout=30000` | 572 pass, 0 fail, 18 files | 57.87s |
| `bun test --timeout=30000` | 717 pass, 0 fail, 36 files | 78.21s |

Logs: `$TMPDIR/test-changed.log`, `$TMPDIR/test-full.log` (leaf scratch TMPDIR).

## Criterion mapping

1. Regular file 0600, declared subset only — `a dispatched worktree gets a real .env file with the declared subset`, `an empty env list writes an empty .env file with/without a registered .env`.
2. Live tab frozen; dead-tab dispatch rewrites + bumps — `a live tab freezes .env while a dead tab lets the next dispatch rewrite it`, `dispatch recreates a deleted .env file … once its tab is gone`.
3. Missing declared name stops dispatch naming it; no value in output/state — `next refuses a declared name missing from the registered .env without leaking its values` (sentinel grep over stdout, stderr, state.yaml).
4. Tracked/not-ignored refusals — `next refuses an .env write over tracked file|unignored`, `next refuses to write .env not ignored in the registered checkout`.

## check.fix repair (2026-10-11)

Review-B F1: `JSON.stringify` emission corrupted declared values containing quotes/backslashes (`parseEnv` doesn't decode JSON escapes). Repairs:

- `6055590` — failing test commit: `a dispatched .env file round-trips quotes and backslashes through dotenv parsing` (fails under old serializer: `has\"quote` → `has\\\"quote`, `path\\\\segment` → `path\\\\\\\\segment`) plus subset-expectation correction to raw copied text.
- `d1e9c10` — fix: presence still via `parseEnv`; emission copies the raw `KEY=<text>` assignment line (last occurrence, `export` tolerated, trailing whitespace stripped). `plan.md` D3 and Implementation notes updated (plan artifact, not locked design).

Evidence: `tests/next.test.ts` 228 pass / 0 fail (was 226 pass / 2 fail before fix); `bun run typecheck` clean; `bun run format` clean (same unrelated drift reverted); changed tests 573 pass / 0 fail; full suite 718 pass / 0 fail (70.64s). New head: `d1e9c10`.

## check.fix repair 2 — F2 (2026-10-11)

Review-B F2: the raw-line scanner diverged from `parseEnv`'s grammar — `KEY = v` emitted `KEY=undefined`, multiline quoted values truncated at the first physical line, and `KEY=inside` inside an undeclared multiline value overwrote `outside`. Repairs:

- `41097c7` — failing tests: spaced `=` / multiline / nested-assignment round-trip plus the unwritable-value refusal (red under the scanner: 227 pass / 3 fail).
- `2c92c02` — fix: emission re-encodes `parseEnv`'s parsed value — unquoted when safe (no `#`, quote or whitespace edge), verbatim single quotes (not on `'` or literal `\r`), double quotes with `\r` escape (not on `"` or literal `\n`/`\r` sequences), else `unwritable declared values` refusal naming the name. Grammar probe-verified in memory across 18 value classes (0 failures). `plan.md` D3 updated.

Evidence: `tests/next.test.ts` 230 pass / 0 fail; typecheck clean; format clean; changed tests 575 pass / 0 fail; full suite 720 pass / 0 fail (69.24s). New head: `2c92c02`.

## check.fix repair 3 — F3 (2026-10-11)

Review-B F3: the encoder treated quote chars as quoters anywhere — `a'b"c` was refused though `parseEnv` reads it unquoted, and `` `literal` `` values were corrupted (backticks are quote chars too). Repairs:

- `1a072ba` — failing test: mixed quotes / backtick / escape-looking round-trip (dispatch refused under the old encoder) plus a repointed unwritable-value refusal for the `"`+`\r` class.
- `a7f589b` — fix: emission order unquoted (no `#`/newline/edge-space, first char not a quote) → verbatim single quotes (no `'` or literal `\r`) → verbatim backticks (no `` ` `` or `\r`) → double quotes with `\r` escape (no `"` or literal `\n`/`\r` sequences) → `unwritable declared values` refusal. Grammar probe-verified across 132 generated values (0 round-trip failures).

Evidence: `tests/next.test.ts` 231 pass / 0 fail; typecheck clean; format clean; changed tests 576 pass / 0 fail; full suite 721 pass / 0 fail (72.40s). New head: `a7f589b`.

## Known limitations

- A live tab with absent `.env` gets no file until the tab dies and dispatch reruns (locked D8).
- A `.env` directory propagates the `rename` error; not special-cased (recorded in plan notes).

## Unverified criteria

None.

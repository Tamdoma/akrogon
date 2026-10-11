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

## check.fix repair 4 — F3 completion (2026-10-11)

B's re-check proved the `"`+`\r` refusal wrong: `a\r\"b` round-trips in double quotes because `\"` parses literally. Also, the backtick regression fixture needed literal backticks single-quoted, and emission had unguarded trailing-backslash and `\r`-adjacency edges. Repairs:

- `4d2384d` — failing test: `a\r\"b` preservation (red: dispatch refused it), literal-backtick regression corrected, refusal repointed to all-quotes+`\r`.
- `f860f00` — fix: dq emits `\r` as `\\r` with `"` allowed when preceded by `\`; guards for bare `"`, trailing `\`, and `[nr]`-adjacency around a real `\r`. Verified against a ~1900-value brute-force round-trip matrix: zero mismatches.
- `787867a` — refusal fixture repointed to `'\``+`\`+`\r` (truly unwritable: every emission path fails) after the all-quotes value proved representable.

Evidence: `tests/next.test.ts` 231 pass / 0 fail; typecheck clean; format clean; changed tests 576 pass / 0 fail; full suite 721 pass / 0 fail (70.11s). New head: `787867a`.

## check.fix repair 5 — F4 (2026-10-11)

B's re-check proved the hand-written grammar guards wrong three ways: a trailing backslash was refused though unquoted emission round-trips (S6), supplementary Unicode broke the bare-quote scan's UTF-16/code-point index arithmetic (S7), and the all-quoters refusal fixture is representable by its own root assignment (S8). Repairs:

- `b82c1e6` — failing tests: `path\` and `😀a\r\"b` preservation, refusal rewritten as the representable `a'b\`c\\<CR>` success case. Both red against `787867a`.
- `6e90af7` — the emitter now tries each encoding and keeps the first that `parseEnv` itself reparses to the value; verification is done by the parser, not a handwritten grammar. All guards removed.
- `1e3bc35` — candidates verified sandwiched between context lines (an unclosed quote cannot swallow the next emitted line), plus a whole-file reparse deep-equal before writing. Aligned with revised D3, whose candidate order is bare-first so `SYNTHETIC_ONE=1` stays unquoted.

Evidence: `tests/next.test.ts` 231 pass / 0 fail; typecheck and format clean; changed tests 576 pass / 0 fail; full suite 721 pass / 0 fail (76.75s). New head: `1e3bc35`.

## Merge repair — herdrless log append (2026-10-11)

Merge attempt `3cf418ba` went red on `tests/phase.test.ts` merge-turn refusal: `phase aa merged` exited 1 after committing because `logMove`'s pane-session lookup crashed when `herdr` was unreachable (run-check copies only HOME/PATH/XDG_CACHE_HOME/NODE_DISABLE_COMPILE_CACHE plus AKROGON_BASE, stripping `HERDR_SOCKET_PATH`).

### Rejected runs

- B's configured run: base `525161df04420b2dfa5c45971d26b6ba65fc8362`, head `cd6ef1301c724c0c9e5f6d60dfee7b3eebf8e0d6`. Command: `akrogon run-check --name 'test' -- sh -c 'akrogon guard ancestors && akrogon guard own-modules && sh -c '\''bun test --timeout=30000'\'''` with `AKROGON_BASE=525161df04420b2dfa5c45971d26b6ba65fc8362`. Result: exit 1, 741 pass / 2 fail (the two failures, incl. the fixture break B later repaired as `8e3b75e`). Log: `implementation/check-test-1791700113376-1125125.log`.
- A's rerun of the same command at head `8e3b75e66104fd9a10cd9fe757081a46cf738042`, same base and `AKROGON_BASE`: exit 1, 742 pass / 1 fail — only `merge turn refusal names the holder...` remained after `8e3b75e` fixed the fixture. Logs: `check-test-1791700360618-1563338.log`, `check-test-1791700649206-2191494.log`.

### Base-red proof

B's detached-base run never started tests (`No leaf worktree matches cwd`), so it did not establish base-red. A's proof ran on detached checkout `525161df04420b2dfa5c45971d26b6ba65fc8362` (worktree `$TMPDIR/base-wt`, since removed) under a stripped env mirroring run-check: `env -i HOME="$HOME" PATH="$PATH" TMPDIR=<scratch> bun test tests/phase.test.ts --test-name-pattern 'merge turn refusal names' --timeout=30000`. Result: 1 fail — the same test fails on base, so the defect is inherited from `525161d`, not introduced by the leaf. A manual reproduction driving the same `cli` sequence against the base entry point also exited 1 at the logMove pane lookup.

### Repair commits

- `cd1aad2` — failing test: a `check.review -> merge` move with a recorded pane and an absent `HERDR_SOCKET_PATH` must still move, log `session: null`. Red at `8e3b75e` (moved code 1), green after fix.
- `01ca1fb` — fix: `logMove` catches `CommandError` from `panes()` and logs `session: null`; schema or parse failures still propagate. The pane lookup already tolerated a missing pane.

### Rerun

Base `525161df04420b2dfa5c45971d26b6ba65fc8362`, head `01ca1fbe8654b11b3cec04e56d6ec498dae87196`. Exact rejected command replayed verbatim:

```sh
AKROGON_BASE=525161df04420b2dfa5c45971d26b6ba65fc8362 akrogon run-check --name 'test' -- sh -c 'akrogon guard ancestors && akrogon guard own-modules && sh -c '\''bun test --timeout=30000'\'''
```

Result: exit 0, 744 pass / 0 fail, 7774 assertions (72.47s). Log: `implementation/check-test-1791700910513-2646622.log`. `format` and `typecheck` under the same wrapper exited 0; `test_changed` exited 0 (590 pass / 0 fail, 5425 assertions; logs `check-test_changed-1791700922596-2850852.log`, `check-test_changed-1791700978250-2851122.log`). Targeted stripped-env rerun at `01ca1fb`: `merge turn refusal` and `herdr is unreachable` tests 2 pass / 0 fail.

## Known limitations

- A live tab with absent `.env` gets no file until the tab dies and dispatch reruns (locked D8).
- A `.env` directory propagates the `rename` error; not special-cased (recorded in plan notes).

## Unverified criteria

None.

# Plan: leaf-env-file

Dispatch writes a real `.env` file (mode 0600) into the leaf worktree holding only the names declared in repo config `env:`, values copied from the registered checkout's `.env`; the symlink is gone. Rewritten at each new dispatch, reused while a tab is live, removed with the worktree. State records `env_names` and `env_generation`, never values.

## Read first

- `brief.md`, `design.md` (this folder; design is locked)
- `src/next.ts` — `allocate` (:353), `ensureWorktree` (:277), `linkEnv` (:312), `report` (:126), `dispatchLeaf` (:644)
- `src/state.ts` — `stateSchema`, `saveState`
- `src/config.ts` — `repoSchema.env` (:53), env-name validation (:78-83)
- `src/readiness.ts` — `parseEnv` use (:110)
- `tests/helpers.ts` — `fixture` writes `.gitignore` with `.env` (:22) and `issues/config.yaml` (:30); `leaf()`, `yaml()`
- `tests/next.test.ts` — `.env` block (:4279-4420), `dispatchFixture`, `database`, `saveDatabase`, `next`
- `tests/fake-herdr.ts` — `Database` shape (tabs/panes deletion simulates a dead tab)
- `tests/batch-dispatch.test.ts` — symlink assertions (:936-938)
- `src/AREA.md` — stale symlink line (:32)

## Decisions

- D1: `linkEnv` becomes `writeLeafEnv(repo: Repo, worktree: string, live: boolean): Promise<State['env_generation']>` returning the generation written, or `undefined` when `live` is true (skip). `ensureWorktree(repo, leaf, live)` gains the flag and merges the result: `{ ...leaf.state, worktree: path, env_names: envGeneration === undefined ? leaf.state.env_names : repo.config.env, env_generation: envGeneration ?? leaf.state.env_generation }`. (design, verbatim 2a)
- D2: `live` is `matches.length === 1` in `allocate` (the only caller of `ensureWorktree`, src/next.ts:370), computed before `ensureWorktree` runs. `matches.length > 1` throws earlier; `matches.length === 0` means a new dispatch, so rewrite. (brief criterion 2)
- D3: Parse the root `.env` with `node:util`'s `parseEnv` (same as `src/readiness.ts:110`) for both presence and values; malformed lines are skipped by the parser, so a skipped declared name lands on the missing-name refusal. Emit one `KEY=<encoded>` line per declared name in `env:` order; trailing newline after the last line only. Encoding reproduces the parsed value for a `parseEnv` consumer under its probe-verified grammar: unquoted when no `#`, newline or edge whitespace and the first char is not a quote (interior quotes and spaces allowed); verbatim single quotes otherwise (not on `'` or literal `\r`); verbatim backticks (not on `` ` `` or `\r`); double quotes with `\r` escape (not on `"` or literal `\n`/`\r` sequences); else an `unwritable declared values` refusal naming the name (only `"`+`\r` or `'`+literal `\n`/`\r` sequences). `JSON.stringify` is not used because `parseEnv` does not decode JSON escapes (review-B F1); a physical-line scanner is not used because it loses spaced assignments, multiline quotes and quote context (review-B F2); interior-quote values are not refused because parseEnv reads them unquoted (review-B F3).
- D4: Missing root `.env` or declared names absent from it refuse before any write with `Refusing .env write at <link>: missing declared names in <root>/.env: <NAME>, ...` — names only, never values; no `Missing:`-style leak anywhere in `report` output (criterion 3; `report` prints `error.message` to stderr).
- D5: Write is atomic: temp file under the worktree's `.git` dir (resolved via `git rev-parse --git-dir`, guaranteed same filesystem) created with `mode: 0o600`, then `rename` over `.env` — replacing a symlink or real file without an extra unlink. Temp residue is invisible to `git status`, so a leftover never blocks phase moves.
- D6: The tracked/ignored refusals run unchanged, in the same order, before the `live` check and any parse: tracked `.env`, not ignored in worktree, not ignored in registered checkout. They apply on every dispatch, live tab or not (criterion 4).
- D7: `stateSchema` gains optional `env_names: z.array(z.string()).optional()` and `env_generation: z.number().int().nonnegative().optional()`. Generation is `(leaf.state.env_generation ?? 0) + 1` on each rewrite.
- D8: Edge case per design literal "skips rewrite when a live tab matches": if `.env` is absent while a tab is live, nothing is written and the state fields stay untouched; the next dispatch after the tab dies writes it. Recorded here for review.

## Interfaces

- `writeLeafEnv(repo: Repo, worktree: string, live: boolean): Promise<number | undefined>` — `src/next.ts`, called only from `ensureWorktree`.
- `ensureWorktree(repo: Repo, leaf: Leaf, live: boolean): Promise<State>` — signature change; single call site updated.
- `State` — `env_names?: string[]`, `env_generation?: number` (`src/state.ts`).

## Units and waves

### Wave 1

- U1 `.env` write tests — owns `tests/helpers.ts`, `tests/next.test.ts`. Fixture: tests write `issues/config.yaml` per scenario via `yaml()`; add a helper only if needed. Rewrite the `.env` block for D1-D7: real file mode 0600, declared-subset contents, sentinel absent from stdout/stderr/state, live-tab reuse (dispatch again while tab lives — generation unchanged, root edits not reflected), rewrite after tab death (remove the tab/panes from the fake db — generation bumps), missing-name refusal naming the name without the sentinel, tracked/not-ignored refusals unchanged, real-file and stale-link replaced by a regular file. Update `merged leaf cleanup` and `pre-linked worktree` tests. Depends on: none. Lands red; U3 turns it green.
- U2 Batch-dispatch fix — owns `tests/batch-dispatch.test.ts`. Update the symlink assertions at :936-938 to a regular file assertion; the root `.env` there is `secret\n` (no `KEY=`), so with empty `env:` the leaf file is empty — assert that. Depends on: none. Lands red; U3 turns it green.

### Wave 2

- U3 Implementation — owns `src/state.ts`, `src/next.ts`, `src/AREA.md`, `skills/implement-issue/SKILL.md`, `skills/plan-issue/SKILL.md`. Apply D1-D8; update the `src/AREA.md` symlink line to describe the real 0600 file; reword the stale "worktree link" phrase in the two skill `produces[].save` lines to "worktree `.env`" (same intent). Depends on: U1, U2 (turns their new assertions green).

Units per wave ≤ 3; U1 and U2 own disjoint paths and share no test resource.

## Criterion mapping

| Done-criterion | Proof | Failure it catches | Size | Rerun trigger |
|---|---|---|---|---|
| 1. Regular file, 0600, declared subset, undeclared absent | `bun test tests/next.test.ts` (U2 tests) | symlink path kept, wrong mode, wrong/missing names | minutes | src/next.ts, src/state.ts diff |
| 2. Live tab frozen; next dispatch rewrites + bumps | `bun test tests/next.test.ts` (live-skip, dead-tab-bump tests) | rewrite under live tab; missing generation bump | minutes | allocate/ensureWorktree diff |
| 3. Missing declared name stops dispatch naming it; no value in output/state | `bun test tests/next.test.ts` (sentinel grep over `result.stdout`, `result.stderr`, `state.yaml`) | value leak in error/state; dispatch proceeds without the name | minutes | writeLeafEnv diff |
| 4. Tracked / not-ignored refusals | `bun test tests/next.test.ts` (existing refusal tests updated) | dropped guard | minutes | writeLeafEnv diff |
| Whole suite stays green | `checks`: `bun run format`, `bun run typecheck`, `bun test --timeout=30000`, `test_changed` | regressions across command surface | minutes (bun test minutes) | any diff |

Restart boundaries: none — no slow-running live resources; all tests run in isolated temp repos.

## Docs checklist

- `src/AREA.md` — rewrite the `.env` symlink line (U1).
- `skills/implement-issue/SKILL.md` — "worktree link" → "worktree `.env`" (U1).
- `skills/plan-issue/SKILL.md` — same reword (U1).
- No other agent or human doc affected: README and `docs/` carry no `.env` statement (verified by grep).

## Implementation notes (2026-10-10)

- `writeLeafEnv` returns `Promise<boolean>` (wrote/skipped), not the generation. `ensureWorktree` bumps `env_generation` only when the leaf already has a recorded `worktree` — i.e. generation counts rewrites (dispatch generations after the first), so the first write records 0 and each later no-live-tab write records +1. Refines the plan Interfaces line; the design's 3-parameter signature stands.
- `stateSchema` fields use `.default([])` / `.default(0)` (repo pattern like `done`, `fix_rounds`) rather than optional, so `leaf.state.env_generation` is always a number and old states parse unchanged. Refines D7.
- Temp file lives inside the worktree's git dir resolved by `git rev-parse --git-dir` (same filesystem, invisible to `git status`), name `akrogon-env-<pid>`; `rename` over `.env` replaces symlinks and files. A `.env` directory propagates the rename error — dispatch refuses without a dedicated message.
- Order inside `writeLeafEnv`: tracked/not-ignored refusals always run (every dispatch, live or not), then `live` short-circuits, then root parse and missing-name refusal.
- `parseEnv` skips malformed lines silently; a malformed declared name therefore lands on the missing-name refusal, which is the intended path.
- Emission re-encodes `parseEnv`'s parsed value (D3), never copies raw text: unquoted (no `#`/newline/edge space, first char not a quote), verbatim single quotes (not `'` or literal `\r`), verbatim backticks (not `` ` `` or `\r`), double quotes with `\r` escape (not `"` or literal `\n`/`\r` sequences), else the unwritable-value refusal. Repaired under review-B F1 (JSON quoting corrupted quotes/backslashes), F2 (a regex line scanner lost spaced `=`, multiline quotes and nested quote context) and F3 (encoder treated interior quotes as quoters, corrupted backticks and refused representable mixed-quote values) on 2026-10-11.
- Wave order is tests-first: U1/U2 land red against the old symlink code and U3's implementation turns them green, giving fail-before/pass-after evidence for the new behavior.

## Notes and limitations

- `debate: "no"` — synthesized directly from brief/design, no positions or rebuttals existed.
- `check-env` is merged; the `env:` schema consumed here is live in `src/config.ts`.
- Known limitation (D8): a live tab with a missing `.env` gets no file until the tab dies and dispatch reruns — locked design behavior, not a defect.
- Repo `env:` for akrogon itself is empty, so this leaf's own worktree `.env` will be empty; akrogon's secrets live in `~/.config/akrogon/env`, which dispatch never reads.

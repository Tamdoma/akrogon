# Review A: watch-issues-skill

Base: `e7d74ae70bb8a412c9f7f25e4f31c5aa6486a901` — Reviewed head: `391bc82` (clean worktree, 7 files, +839).

## Verification evidence

- `cd skills/watch-issues && bun run test` — 20 pass, 0 fail, 53 expects (rerun this pass).
- `cd skills/watch-issues && bun run typecheck` — exit 0 (rerun).
- `bun install --cwd skills/watch-issues --frozen-lockfile` — `Checked 7 installs across 27 packages (no changes)` (rerun).
- `bun test tests/install.test.ts` — 15 pass, 0 fail (rerun).
- `bun run format` — all files unchanged (rerun; format scope is `src tests`, skill files outside it, same as broadcast-issue).
- `bun run typecheck` (root) — exit 0 (rerun).
- `bun test` (root) — 270 pass, 0 fail, 3260 expects (rerun).
- `bunfig.toml` scopes root `bun test` to `tests/`; skill suite runs under its own `bun run test` (D11 confirmed).
- No `AREA.md` files in the diff; no area-path check applies.

## Contract checks

- `observe.ts` state schema is field-identical to `src/state.ts` `stateSchema` (verified line by line), including `counts.prefault`, `deliveryErrorSchema`, `sourcePattern`, legacy `priority`/`slot`/`failed_notified` strip, `validateLeafDepth` 2/3, duplicate-slug and `RepoMismatchError` message parity (D1, D3).
- `herdr agent list` parsed once as `{result:{agents:[{pane_id, agent_status}]}}`; `agent_status` enum matches `paneSchema` in `src/shell.ts`; non-zero exit, non-JSON and schema-invalid responses each exit non-zero naming the cause (D4).
- Line format matches D5 verbatim, including `failed=<cause>@<phase> delivery=<value|-> reason="..."` and `failed=unknown`; pane absent prints `-` status; seat without pane prints `-` pane; busy age only when `busy_since` parses.
- Required-seat table in SKILL.md matches `requiredSlots` in `src/routing.ts` including the `fix_rounds > 0` check.review rule (D6).
- Recovery-bound algorithm in SKILL.md matches D7 and `src/log.ts` record shape (`ts, repo, slug, from, to, slot, ...`).
- `akrogon phase <slug> <failure.phase>` without `--slot` is legal from `failed` (`src/phase.ts`: `requiredSlots` empty, slot check skipped) (D8).
- `package.json`/`tsconfig.json` mirror `skills/broadcast-issue` exactly apart from names (D9); `bun.lock` produced and frozen-install clean.
- `tests/install.test.ts` gains exactly `expect(skills).toContain('watch-issues')`; `src/install.ts` enumerates `skills/` dynamically, zero code change (D10).
- SKILL.md carries every rule in plan item 6: three invocations with zero/one/several job behavior, one-sentence Claude-Code-only refusal, start suppressed when its own check satisfies stop, Observe (script under Bash timeout, `--lines 80` read, `log.jsonl` pointer, `OBSERVE_HERDR`/`OBSERVE_AKROGON` documented), all six Judge rules, Stop, complete Never list, ≤5-line Reply.
- `next` guards confirmed in `src/next.ts`: `dispatchSlot` returns early on `done` seats and busy panes; `blocked-by` dependencies must be merged or the leaf waits — so the watcher's Waiting/merged rules delegate correctly.
- Walk-through (`implementation/walkthrough.md`) covers all eight criterion-5 scenarios with real `akrogon`/`observe.ts` against scratch `AKROGON_HOME`, including literal `attempts@check.review` via `check.fix --verdict fix` at `fix_rounds: 3` (§1b), esc→wait→read→prompt once then notify, and empty-open stop.

## Findings

None blocking.

Nits:

- N1 — `reason="..."` does not escape embedded double quotes in `failure.reason`; a quoted reason would produce a slightly malformed line. Disclosed in the report; the consumer is an agent, not a parser, so impact is cosmetic.
- N2 — Pane reads use `--lines 80` everywhere including the post-esc confirm read, where the design's Observe section mentioned 60. Disclosed in plan implementation notes; 80 satisfies both call sites with one number and only adds context.
- N3 — `docs/reference-index.md` says "the eight agent workflows" while `skills/` now holds ten directories (was already nine before this leaf). Pre-existing count drift outside the owned file list; noted for B's doc pass.

## Verdict

ready — all acceptance criteria verified with rerun evidence; no Fix findings.

## Merge evidence (slot A, phase=merge)

- Rebase target: `origin/main` = `e7d74ae`; HEAD `391bc82` already ahead, rebase no-op, no conflicts.
- `AKROGON_BASE` after rebase refresh: `e7d74ae70bb8a412c9f7f25e4f31c5aa6486a901` (unchanged).
- Checks rerun in worktree: `bun run format` all unchanged; `bun run typecheck` exit 0; `bun test` 270 pass / 0 fail / 3260 expects; `AKROGON_BASE=e7d74ae… bun test --changed` 15 pass / 0 fail.
- Push: `git push origin HEAD:main` → `e7d74ae..391bc82 HEAD -> main`; confirmed `git merge-base --is-ancestor 391bc82 origin/main`.

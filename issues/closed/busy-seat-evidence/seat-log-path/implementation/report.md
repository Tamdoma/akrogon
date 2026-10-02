# Report: seat-log-path

Base: `5bb552d0e2726cab6469699541317fe53053bd6c` — HEAD: `29861c0`

## Changed files and reasons

- `skills/watch-issues/scripts/observe.ts` — `herdrListSchema` extended (optional `agent`, `cwd`, `agent_session{kind,value}`) and exported; `resolveLog(paneId, entry, home)` resolves `kind:path` verbatim, `kind:id`+claude via `$HOME/.claude/projects/<sanitized cwd>/<id>.jsonl`, `kind:id`+codex via a bounded 3-level `readdirSync` scan for `rollout-*-<id>.jsonl` (0 → `-`, >1 → throw naming pane + matches); every candidate gated by `existsSync`; `agentStatuses` returns `Map<pane_id, AgentEntry>`; `main` resolves only leaf-referenced working panes before printing (commit `543d5fa`).
- `skills/watch-issues/SKILL.md` — line 28 gains `[ logA=<path|->]` / `[ logB=<path|->]` after each seat's ` busy=` group plus the `working`-only / `-`-means-no-usable-log clause (commit `99d1938`).
- `skills/watch-issues/scripts/observe.test.ts` — `herdrOk` generalized to full stub entries; 4 existing expectations gained ` logA=-`; new tests for recorded-parse and all resolution cases (commit `29861c0`).
- `skills/watch-issues/scripts/fixtures/herdr-agent-list.json` — verbatim `herdr agent list` capture, herdr 0.9.3, 2026-10-02 (commit `29861c0`).

## Done-criteria → evidence

1. Recorded list parses: test `recorded herdr agent list parses against the schema` (fixture + version/date/command comment) — pass in `bun test scripts` (30/30, log below).
2. Resolution cases: seven new tests — claude cwd+id, codex depth-3 rollout, pi kind:path, no `agent_session` → `-`, absent file → `-`, two codex matches → non-zero naming pane + both paths, idle seat → no field — all pass.
3. Blocking `test`: `bun test --timeout=30000` at root — 356 pass / 0 fail (11.08s), including `tests/watch-issues-scripts.test.ts` which runs `bun test scripts` + `bun run typecheck` in the subpackage.
4. SKILL.md doc: line 28 carries the field and clause; doc sweep confirmed it is the only format copy.

## Commands run

- `bun test scripts` in `skills/watch-issues` — 30 pass / 0 fail / 74 expects (0.7s)
- `bun run typecheck` in `skills/watch-issues` — clean
- `bun test --timeout=30000` at root — 356 pass / 0 fail / 4139 expects (11.08s)
- `bun run typecheck` at root — clean
- `bun run format` at root — all files unchanged
- `AKROGON_BASE=5bb552d… bun test --changed=5bb552d… --timeout=30000` — ran after the U1 pick; bun's `--changed` reported no affected test files (implementation changes don't retro-mapped to test files); coverage confirmed via `bun test scripts` instead

## Notes and limitations

- `bun test --changed` only selects changed test files, not tests covering changed source; the leaf's real gate is `bun test scripts`, which ran green. No limitation to the done-criteria.
- `watch-scripts-check` still reads `phase: implement` in `issues/open`, but its deliverable `tests/watch-issues-scripts.test.ts` was already in the base; C3 passed against it.
- No credentials, env values, or operator actions required. No shared test resources. No known limitations; all criteria verified.

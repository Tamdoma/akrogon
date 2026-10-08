# Plan: subagent-seat-model

Debate: `no`. Synthesized directly from brief.md and design.md (locked 1a).

## Decisions

- **D1** `config.yaml` line 12, claude harness template: `"CLAUDE_CODE_SUBAGENT_MODEL":"sonnet"` becomes `"CLAUDE_CODE_SUBAGENT_MODEL":"{model}"`; `"CLAUDE_CODE_SUBAGENT_MODEL_FORCE":"1"` stays; nothing else on the line changes. Locked design decision, no reopening.
- **D2** One new test file `tests/harness-template.test.ts`. `launch()` is `src/next.ts:252` and not exported; `index-seats` exported no substitution helper (verified: only `src/next.ts:255` does `.replaceAll('{model}'`). The test reproduces the two `replaceAll` + `parse` steps inline; it does not spawn herdr, claude, or the akrogon CLI.
- **D3** The test reads the real tracked `config.yaml` via `readGlobal()` from `src/config.ts` with `AKROGON_HOME` set to the repo root (restored after the test), because `globalHome()` resolves `AKROGON_HOME ?? toolRoot` and `toolRoot` is the checkout root.
- **D4** The proof run executes the argv produced by substituting `{model}`=`opus`, `{effort}`=`low` into the changed template with the same replaceAll+parse chain, then appends the brief's flags. It runs from a scratch `mktemp -d` directory, no `--bare`, under the readiness grant (≤5 runs, $1 cap each, operator Claude Max login only).

## Read-first

- `config.yaml` (line 12, the only edited surface)
- `src/next.ts:252-259` (`launch()` substitution being reproduced)
- `src/shell.ts:63-65` (`quote`)
- `src/config.ts:74-85` (`toolRoot`, `globalHome`, `readGlobal`)
- `tests/helpers.ts` (fixture `fake` harness, stays unchanged)
- `tests/config.test.ts`, `tests/shell.test.ts` (test style and imports)
- `learnings/LESSONS.md` (2026-10-02: bun preload timeout is per-file; `--timeout=30000` in checks covers this)

## Interfaces

- `readGlobal(): GlobalConfig` from `src/config.ts` — returns `harnesses.claude` template string.
- `quote(value: string): string` from `src/shell.ts` — wraps the model value as `launch()` does.
- `parse` from `shell-quote` — splits the substituted line; result validated with `z.array(z.string()).min(1)` exactly as `src/next.ts:257`.

## Checklist (waves)

### Wave 1

- **U1** — owns `config.yaml`.
  Apply D1. Shared test resource: none. Depends on: none.
- **U2** — owns `tests/harness-template.test.ts`.
  Assertions, per done-criterion 1:
  1. The raw `harnesses.claude` template contains no literal subagent model name (no `sonnet`, `opus`, `haiku` substring inside the `--settings` JSON).
  2. For each sample model in `['opus', 'claude-opus-5-5']` and effort `low`: substitute `template.replaceAll('{model}', quote(model)).replaceAll('{effort}', quote(effort))`, `parse` it, find the `--settings` argv word, `JSON.parse` it, and assert `env.CLAUDE_CODE_SUBAGENT_MODEL === model` and `env.CLAUDE_CODE_SUBAGENT_MODEL_FORCE === '1'`.
  Shared test resource: none (pure function over the checked-in file). Depends on: none (red until U1 lands; green at wave end). Note: mutating `process.env.AKROGON_HOME` is safe under bunfig's concurrent glob because `cli()` overrides `AKROGON_HOME` in child envs; set and restore it inside the test.

### Wave 2

- **U3** — owns `implementation/report.md`.
  Per done-criterion 2: run `claude --version`, then in a scratch dir spawn the substituted argv (`opus`, `low`) plus `-p "<prompt asking for one general-purpose subagent>" --output-format stream-json --verbose --forward-subagent-text --max-turns 6 --max-budget-usd 1`. Record in `implementation/report.md`: full command, date, Claude Code version, exit code, and every `assistant` row carrying `parent_tool_use_id` with its `message.model`. Criterion requires exit 0, ≥1 such row, and every such `message.model` starting `claude-opus`. Shared test resource: operator Claude Max login / Anthropic API (the only unit touching it). Depends on: U1 (argv comes from the changed template).

## Docs

No agent or human doc is affected: the only `sonnet`/`CLAUDE_CODE_SUBAGENT` hits outside `config.yaml` are fixture transcripts in `skills/watch-issues/scripts/fixtures/`, which are test data excluded by the design.

## Verification

| Criterion | Proof command | Catches | Size | Rerun trigger |
|---|---|---|---|---|
| 1 (blocking) | `bun test --timeout=30000` plus `bun run format`, `bun run typecheck`, `bun test --changed=$AKROGON_BASE --timeout=30000` | literal `sonnet` restored, broken JSON word, substitution drift from `launch()` | minutes | any edit to `config.yaml`, the test, `src/shell.ts`, or `src/next.ts` launch chain |
| 2 (report evidence, non-blocking) | the U3 run above from a scratch dir | wrong routing (a `claude-sonnet` `message.model` on subagent rows), nonzero exit, missing `parent_tool_use_id` rows | minutes | template/argv fix after a failing run; max 5 total runs per the grant |

Restart boundaries: none; the leaf has no long-running service. If a run fails on a fixable template defect, fix U1, rerun `bun test tests/harness-template.test.ts`, then rerun U3 once against the bound.

## Implementation notes

- 2026-10-07: U2's committed tree (spawned at the wave HEAD before U1's pick) contains the unchanged `config.yaml`; its targeted run is expected red on the no-literal assertion and that run doubles as the new behavior's deliberate-break evidence. A cherry-picks wave 1 in order U1 then U2, so the lane's changed-tests run sees the new test against the changed config. The test file may be written freely in parallel; only its green run requires U1.
- 2026-10-07: U3 produces no branch commit. Its worker runs `claude` and writes `implementation/proof-run.jsonl` (full stream) and `implementation/proof-run.md` (command, version, exit code, filtered subagent rows) under the leaf folder, which is outside the branch; A folds it into `implementation/report.md`.

## Open limitations (preserved)

- A `model` value containing a single quote breaks the `--settings` JSON; the seat schema's no-quote rule lands in `index-seats`, which is why quoted names are out of scope here.
- The run proves routing of one general-purpose subagent, not writing quality or every subagent kind.
- `--bare` reports "Not logged in"; the proof command must not pass it.

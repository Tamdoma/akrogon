# Review A: subagent-seat-model

Base: `2645d97ed1682185eea4788844f882a541885d24`
Reviewed head: `ef813b4` (commits `afd078c` config, `87b42e1` test, `ef813b4` format)
Date: 2026-10-07

## Verification evidence

- `git diff base...HEAD`: `config.yaml` one-line substitution + new `tests/harness-template.test.ts` (37 lines). Nothing else on the branch.
- Rerun `bun test tests/harness-template.test.ts` on reviewed head: 3 pass, 0 fail.
- `implementation/proof-run.jsonl` parsed: 15 rows, exactly one `assistant` row with `parent_tool_use_id` → `message.model` `claude-opus-5-5`; `result` row `success`, `total_cost_usd` 0.24281, `num_turns` 2, not error. `proof-run.md` records the substituted argv (`opus`/`low`, `--max-budget-usd 1`, `--forward-subagent-text`, no `--bare`, mktemp cwd) and `claude --version` 2.1.293.
- `git log --format=%B`: `Test-Change: tests/harness-template.test.ts` trailer present on `ef813b4`, correctly scoped (whitespace-only prettier rewrite of the new file). The new-file commit carries no trailer, which the rule allows.
- `git status` clean at phase move.

## Findings

None.

## Criteria check

- Criterion 1: the test exercises the real tracked `config.yaml` through `readGlobal()` and the real `launch()` substitution chain (`replaceAll` + `quote` + `shell-quote` `parse`), asserting the `--settings` JSON carries the substituted model and `FORCE:"1"`, and that the raw template holds no literal `sonnet`/`opus`/`haiku`. A deliberate-break red run on the pre-change config was recorded at implement (3 failures on the literal-`sonnet` template).
- Criterion 2: single bounded run, exit 0, one `parent_tool_use_id` row reporting `claude-opus-5-5`, budget cap in argv, no `--bare` — inside the readiness grant (1 of ≤5 runs, $0.24 of $1 cap, operator Claude Max login).

## Exclusions

Held: no `src/`, `tests/helpers.ts`, skills, or docs changes; no settings file written; no interactive session. The only `sonnet`/`CLAUDE_CODE_SUBAGENT` hits outside `config.yaml` are `skills/watch-issues` fixture transcripts (test data, unchanged).

## Docs

No AREA.md in the diff. No documented behavior changed: the harness template's substituted argv shape is a `src/next.ts` mechanism with no prose contract naming the literal `sonnet`.

## Verdict

ready

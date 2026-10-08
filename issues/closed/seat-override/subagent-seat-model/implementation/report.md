# Report: subagent-seat-model

Base: `2645d97ed1682185eea4788844f882a541885d24`
Head: `ef813b4` on `subagent-seat-model`

## Changed files and reasons

- `config.yaml` — claude harness template: `"CLAUDE_CODE_SUBAGENT_MODEL":"sonnet"` → `"{model}"`, `FORCE:"1"` kept (D1, worker commit `afd078c` from `1459106`).
- `tests/harness-template.test.ts` — new test reproducing the `launch()` substitution chain (`src/next.ts:255-256`) and asserting the parsed `--settings` JSON carries the substituted model and `FORCE:"1"`, plus a no-literal-model assertion on the raw template (D2/D3, worker commit `87b42e1` from `0d23402`).
- `ef813b4` — prettier `--write` output on the new test file (whitespace only; `Test-Change:` trailer on the commit).
- `implementation/proof-run.jsonl`, `implementation/proof-run.md` — done-criterion 2 evidence under this leaf folder (not on the branch).

## Tests and commands run

| Command | Result | Wall time |
|---|---|---|
| `AKROGON_BASE=2645d97… bun test --changed="$AKROGON_BASE" --timeout=30000` (after config pick) | exit 0, no test files affected | seconds |
| same, after test pick | 3 pass, 0 fail | seconds |
| `bun test tests/harness-template.test.ts` in worker worktree at old config | 3 fail — deliberate-break evidence: literal `sonnet` still in template at that HEAD | seconds |
| `bun run format` | exit 0 (one whitespace rewrite, committed) | seconds |
| `bun run typecheck` | exit 0 | seconds |
| `bun test --timeout=30000` | 516 pass, 0 fail across 25 files | 25 s |
| Live run (argv per `proof-run.md`) | exit 0, API `duration_ms` 4256, cost $0.24281 | seconds |

## Done-criteria evidence

- **Criterion 1 (blocking):** `tests/harness-template.test.ts` reads the tracked `config.yaml` via `readGlobal()` with `AKROGON_HOME` pointed at the repo root, substitutes `opus` and `claude-opus-5-5` exactly as `launch()` does, and asserts the `--settings` argv word parses to JSON with `env.CLAUDE_CODE_SUBAGENT_MODEL` equal to the seat model and `env.CLAUDE_CODE_SUBAGENT_MODEL_FORCE` `"1"`; a separate test asserts no literal `sonnet`/`opus`/`haiku` in that word. Verified by `bun test` green above.
- **Criterion 2 (report evidence):** `implementation/proof-run.md` records the argv built from the changed template for `opus`/`low` plus the brief flags, run from an `mktemp -d` dir, exit 0, claude `2.1.293`, and the single subagent assistant row `{"type":"assistant","parent_tool_use_id":"toolu_015NiQSX5HEUtJigDu79r934","model":"claude-opus-5-5"}` in `proof-run.jsonl` (15 rows total).

Grant use: 1 run of the allowed 5, $0.24 of the $1 cap, operator Claude Max login only, no `--bare`, no settings file written.

## Known limitations

- Proves routing of one general-purpose subagent only, not writing quality or every subagent kind.
- claude CLI version was 2.1.293; readiness recorded the probe at 2.1.292.
- Model names containing a single quote would break the `--settings` JSON; the seat schema's no-quote rule is `index-seats` scope.
- `--bare` reports "Not logged in"; the proof command does not pass it.

## Unverified criteria

None.

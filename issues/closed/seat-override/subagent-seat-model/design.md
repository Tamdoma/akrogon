# Design: subagent-seat-model

## Binding decisions, verbatim

### How the seat model reaches workers (forks/worker-model.md Q1)

Taken: 1a. In the tracked machine `config.yaml` (`git ls-files` confirms it is in this repo) the claude harness template's `"CLAUDE_CODE_SUBAGENT_MODEL":"sonnet"` becomes `"CLAUDE_CODE_SUBAGENT_MODEL":"{model}"`, the same placeholder the template already uses for `--model`, with FORCE kept. Every claude seat's subagents then run the seat's model. Foreclosed: per-owner `implement: inline`, a separate worker-model field, dropping FORCE.

Probe 2026-10-07 (local, no model call): `bun -e` with `parse` from `shell-quote` and `quote` from `src/shell.ts` on the new template line; for `opus` and `claude-opus-5-5` the `--settings` argv word is valid JSON with `env.CLAUDE_CODE_SUBAGENT_MODEL` equal to the model. Limit: a model containing a single quote breaks the JSON, so the seat schema rejects quotes in `model`.

Proof form: `claude -p "<prompt>" --model <alias|id> --effort <low|medium|high|xhigh|max> --settings '<inline JSON>' --output-format stream-json --verbose --forward-subagent-text --max-turns 6 --max-budget-usd 1` runs non-interactively; `--forward-subagent-text` (v2.1.211+) emits subagent messages with `parent_tool_use_id` set and each `assistant` message carries `message.model`. Binding: the door's probe and the leaf's done-criterion both use this command with the template's substituted argv (from `launch()`), not a hand-typed line, and assert that at least one message carries `parent_tool_use_id` and every message with `parent_tool_use_id` reports the seat model. (A,B)

Proof run 2026-10-07T20:50Z: exit 0, subagent rows report `claude-opus-5-5`, cost $0.23; control with the current template reports `claude-sonnet-5-5`. Limits: `--bare` made the run report "Not logged in", so the proof command must not pass `--bare`; the proof shows routing of one general-purpose subagent, not writing quality or every subagent kind.

### Excluded here

Index front matter and resolution (forks/setting-home.md, forks/visibility.md) belong to `index-seats`. Door capture belongs to `door-seat-capture`. The seat schema's no-quote rule is implemented in `index-seats`; this leaf relies on it only as the reason quoted model names are out of scope.

## Standing design

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md. Interpretation: the blocking check is the cheapest test at the real boundary, the substituted argv read from the real `config.yaml`; the real model call is the one thing no smaller test proves (that Claude Code routes a subagent by that env), so it runs once, non-interactively, bounded by `--max-budget-usd 1`, recorded with its output in the report, and never enters `checks` because no merge requires a live model run; the test turns red when the literal `sonnet` is restored.

## Leaf architecture

Owned surfaces: `config.yaml` line 12; one new test file under `tests/` (for example `tests/harness-template.test.ts`) reading `config.yaml` from the repo root through `readGlobal()` with `AKROGON_HOME` unset or pointed at the repo root, which is the proof of done-criterion 1: it substitutes a sample model and asserts the parsed `--settings` JSON; `implementation/report.md` evidence section. (A,B)

Interfaces: the test reproduces `launch()`'s substitution (`template.replaceAll('{model}', quote(model)).replaceAll('{effort}', quote(effort))` then `parse` from `shell-quote`), as `src/next.ts:254-257` does, or imports an exported helper if `index-seats` has exported one by merge time; it does not start herdr or claude.

Exclusions: no change to `src/`, `tests/helpers.ts` (its `fake` template stays), skills or docs; no settings file written on the machine; no interactive session.

Dependencies: none. The real run uses the operator's existing Claude Max login on this machine under the grant in `readiness.yaml`.

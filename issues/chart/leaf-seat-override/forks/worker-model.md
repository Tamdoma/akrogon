# How a chosen writing model reaches delegated prose

## Question

Q1. With `implement: subagents` and the claude template forcing every subagent to `sonnet` (`config.yaml:12`), how does a seat A model choice reach the workers that author the units: replace the hardcoded `sonnet` with `{model}` in the machine template (all claude seats' workers follow their seat), allow a per-leaf `implement: inline` in the same settings block (seat A writes itself), or a separate worker-model choice on the seat?

### Carries

- Lock: `launch()` replaces every `{model}` and `{effort}` occurrence in the template (`src/next.ts:254-256`).
- Claude Code docs (sub-agents page, read 2026-10-07): with `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` the `model` field in subagent definitions is ignored and Claude cannot pass a model when it starts a subagent; requires v2.1.257 or later.
- Related: forks/setting-home.md.

## Findings

See slots/map-merged.md (writing fork) and slots/map-rebuttal-B.md R1. B: the template fix is a machine-wide change to every repository's claude seats and is sufficient only if workers should follow their seat. A: the inline override reuses an existing key but expands per-leaf execution policy and needs leaf-effective `akrogon config`. Required probe before handoff (B): installed Claude version and one disposable delegated unit with the real model, checking the worker's model; `{model}` inside the JSON `--settings` string must survive quoting.

## Taken

2026-10-07. Operator verbatim: "1a - make sure to remove teh hardcoded Sonnet, and make it a variable. Look at the entire file, and see how to abstract it in the variable."

Taken: 1a. In the tracked machine `config.yaml` (`git ls-files` confirms it is in this repo) the claude harness template's `"CLAUDE_CODE_SUBAGENT_MODEL":"sonnet"` becomes `"CLAUDE_CODE_SUBAGENT_MODEL":"{model}"`, the same placeholder the template already uses for `--model`, with FORCE kept. Every claude seat's subagents then run the seat's model. Foreclosed: per-owner `implement: inline`, a separate worker-model field, dropping FORCE.

Probe 2026-10-07 (local, no model call): `bun -e` with `parse` from `shell-quote` and `quote` from `src/shell.ts` on the new template line; for `opus` and `claude-opus-5-5` the `--settings` argv word is valid JSON with `env.CLAUDE_CODE_SUBAGENT_MODEL` equal to the model. Limit: a model containing a single quote breaks the JSON, so the seat schema rejects quotes in `model`. Still pending before handoff: one real claude session started with the new line whose subagent reports its model (installed Claude Code 2.1.292, docs require 2.1.257+).

Proof form, operator 2026-10-07: "the testing can also use claude code CLI commands to call upon specific models and efforts. Look it up in the Anthropic docs." Better-than-training, https://code.claude.com/docs/en/cli-reference and https://code.claude.com/docs/en/sub-agents read 2026-10-07: `claude -p "<prompt>" --model <alias|id> --effort <low|medium|high|xhigh|max> --settings '<inline JSON>' --output-format stream-json --verbose --forward-subagent-text --max-turns 6 --max-budget-usd 1` runs non-interactively; `--forward-subagent-text` (v2.1.211+) emits subagent messages with `parent_tool_use_id` set and each `assistant` message carries `message.model`, so the worker's model is read from stdout. Binding: the door's pending probe and the leaf's done-criterion for the template change both use this command with the template's substituted argv (from `launch()`), not a hand-typed line, and assert that every message with `parent_tool_use_id` reports the seat model.

Proof run 2026-10-07T20:50Z. Operation: launch argv from the proposed template through `parse(template.replaceAll('{model}', quote('opus')).replaceAll('{effort}', quote('low')))`, then `-p "Use the Agent tool once ... reply with the single word done" --output-format stream-json --verbose --forward-subagent-text --max-turns 6 --max-budget-usd 1`. Identity: the operator's Claude Max login on this machine (`claude auth status`), no key value involved. Version: Claude Code 2.1.292. Target: Anthropic API, read-only, no fixture. Result: exit 0, `assistant` messages with `parent_tool_use_id` set report `claude-opus-5-5`, result `done`, cost $0.23. Control with the current template (`"sonnet"`): the subagent message reports `claude-sonnet-5-5`. Cleanup: none needed, `-p` sessions left only local transcripts. Limits: `--bare` made the run report "Not logged in", so the proof command must not pass `--bare`; the proof shows routing of one general-purpose subagent, not writing quality or every subagent kind; the control cost $0.2 more.

Binding for the leaf: no other `{model}` consumer exists outside `src/next.ts:254-256`, `tests/helpers.ts` and `tests/readiness.test.ts`.

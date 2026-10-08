# Brief: subagent-seat-model

## What

In the tracked machine `config.yaml`, the claude harness template's `"CLAUDE_CODE_SUBAGENT_MODEL":"sonnet"` becomes `"CLAUDE_CODE_SUBAGENT_MODEL":"{model}"`, keeping `CLAUDE_CODE_SUBAGENT_MODEL_FORCE`. `launch()` already replaces every `{model}` occurrence, so a claude seat's subagents run the seat's model. The leaf proves it with one real non-interactive Claude Code run built from the launch argv.

## Why

With `implement: subagents`, seat A hands implementation units to subagent workers; the template pins them to sonnet, so choosing a writing model for seat A would not make that model write. One placeholder removes the pin for every claude seat.

## Done-criteria

1. Substituting any seat model into the tracked claude template in `config.yaml` the way `launch()` does yields a `--settings` argv word that is valid JSON selecting that model as `env.CLAUDE_CODE_SUBAGENT_MODEL` with `env.CLAUDE_CODE_SUBAGENT_MODEL_FORCE` `"1"`, and the template contains no literal subagent model name; proven by the blocking `checks`. (A,B)
2. One real run, recorded in `implementation/report.md` with the full command, date, Claude Code version and the relevant stdout rows: the launch argv built from the changed template for model `opus`, effort `low`, followed by `-p "<prompt asking for one general-purpose subagent>" --output-format stream-json --verbose --forward-subagent-text --max-turns 6 --max-budget-usd 1`, run from a scratch directory without `--bare`, exits 0, emits at least one `assistant` row with `parent_tool_use_id` set, and every such row carries `message.model` starting with `claude-opus`. This run is evidence in the report, not a blocking check. (A,B)

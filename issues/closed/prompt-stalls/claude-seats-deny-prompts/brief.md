# Brief: claude-seats-deny-prompts

## What

`harnessArgv` (src/seat.ts) makes every claude seat it builds argv for, both leaf seats and door-created consultants, run with `permissions.denyInsteadOfPrompting: true` inside the claude argv's single `--settings` JSON object. A prompt that Claude Code would otherwise show mid-turn under `--dangerously-skip-permissions` then becomes an immediate denial the seat can act on. That includes the "Dangerous rm operation on possibly-empty variable path" prompt, which waits with no countdown inside a subagent. Every other key of the operator's `--settings` object is kept, and a claude line that cannot be merged without dropping a setting is refused at launch.

## Why

On 2026-11-16 a framework seat's worker subagent ran `rm -rf $D/$n` and waited 15 minutes on Claude Code's rm prompt until the operator approved it by hand (Tamdoma/akrogon#139). The watch could not answer it (Tamdoma/akrogon#135). Removing the prompt at its source means no unattended seat waits on it, the watch needs no keys, and an uncertain removal is never approved. Appending a second `--settings` flag is not an option: Claude Code keeps only the last one, which would silently drop the operator's subagent-model env.

## Done-criteria

1. For a claude harness line with one inline JSON object in `--settings <value>` (the machine line's form today), the argv `harnessArgv` builds holds exactly one `--settings`. Its value parses to the original object with `permissions.denyInsteadOfPrompting` set to true and every other key and value unchanged, including `env` and any other `permissions` fields. An explicit `false` comes out `true`.
2. The same holds for the `--settings=<value>` spelling, which stays one equals-form element.
3. For a claude harness line with no `--settings`, the built argv gains exactly one `--settings` element pair, after the template elements and before `--disallowedTools=AskUserQuestion`, whose value parses to `{"permissions":{"denyInsteadOfPrompting":true}}` (A,B).
4. For a claude harness line whose `--settings` value is not a JSON object (a file path, malformed JSON or a JSON array), whose object holds a `permissions` value that is not an object, that holds more than one `--settings`, or that holds a bare `--` token, `harnessArgv` throws an error naming the harness and the offending operand, and builds no argv.
5. For every claude harness line `harnessArgv` accepts, every template argv element other than the `--settings` value stays unchanged and in its original order. This covers the flag itself (`--dangerously-skip-permissions`, `--model`, `--effort` and their values), and `--disallowedTools=AskUserQuestion` is appended once as the final element, as today (A,B). codex, pi and agy argv are unchanged.

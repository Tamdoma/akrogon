# Opening map, slot A (2026-11-16)

## Charting observations (free, Claude Code 2.1.325, hc 0.1.21, stub Anthropic API at 127.0.0.1, scratchpad probe/stub.py and stub2.py, run from the akrogon root)

- O1. Top-level Bash `D=<scratch>; for c in buffalo:city national:area; do n=${c%%:*}; rm -rf $D/$n; done` under `--dangerously-skip-permissions`: prompt "Dangerous rm operation on possibly-empty variable path ... Do you want to proceed?" with "Claude Code will automatically block this request in 1:56". hc status `{state: blocked, kind: permission, msg: "approve Bash: <full command>"}`. After about 2 min the prompt auto-denied; the tool_result told the model "Permission for this command was denied by a built-in Claude Code safety check ... If the text below suggests a safe rewrite, run that instead". The directories stayed.
- O2. With literal assignments only (`D=<scratch>; n=a; rm -rf $D/$n`) no prompt; it ran.
- O3. The same rm issued by a general-purpose subagent (Agent tool, background): the same prompt, labelled "Bash command · from the general-purpose agent", with NO countdown. This matches the #139 seat: worker transcript `.../5524571b-.../subagents/agent-abe61c650bf757420.jsonl` shows the command at 19:33:25Z and its result at 19:48:04Z (15 min, then approved by hand), version 2.1.325.
- O4. `--settings '{"permissions":{"denyInsteadOfPrompting":true}}'`: the subagent's rm was denied at once with the same denial text and rewrite hint, no prompt, no stall.
- O5. Two `--settings` flags: the second replaces the first. With the machine claude line's `--settings '{"env":{"CLAUDE_CODE_SUBAGENT_MODEL":...}}'` plus an appended second `--settings`, the subagent ran on the main model; the control with the env flag alone ran the subagent on the env's model.
- O6. Under bypass, a Write to `<repo>/.claude/skills/probe-x/SKILL.md` ran without a prompt (file removed after).
- Cleanup: every probe terminal killed and removed (`hc ls --all` shows none), stub processes gone, `.claude/skills` removed, `git status` clean apart from this chart.
- Docs (better-than-training, code.claude.com/docs/en/permission-modes.md, settings.md, read 2026-11-16 via a research agent): critical-path rm prompts are not approved by allow rules or PreToolUse allow hooks in any mode; `permissions.denyInsteadOfPrompting` is honored from user settings or `--settings` (2.1.319+); `CLAUDE_CODE_EVEN_MORE_DANGEROUSLY_SKIP_PERMISSIONS=1` (launch env only) lets bypass run such removals; in auto mode allow rules resolve before the classifier, but broad allow rules are suspended on entering auto mode, and whether `Bash(hc keys:*)` survives is not documented.

## Forks

1. How claude seats stop stalling on built-in safety prompts (#139).
   - a (rec) akrogon makes every claude seat deny instead of prompting: `harnessArgv` (src/seat.ts) merges `permissions.denyInsteadOfPrompting: true` into the claude argv's one `--settings` JSON, adding the flag when absent (O4, O5). Removes the whole prompt class (rm guard, network paths, anything else that would prompt) in top-level and subagent tool calls; the seat gets the denial and its rewrite hint. Cost: a seat that truly needs a critical removal cannot get it unattended (it reports instead), which 4a wants anyway.
   - b Machine harness line edit by the operator (N2): same effect, no repo test, per machine.
   - c Guidance in implement-issue worker sub-briefs to write `"${VAR:?}"`: does not stop the class (other checks, other skills, agents ignore guidance).
   - d `CLAUDE_CODE_EVEN_MORE_DANGEROUSLY_SKIP_PERMISSIONS=1`: runs a removal whose target may be empty; dangerous under signpost 4a.
   - e The watch presses 1: an uncertain target is dangerous under 4a, and the watch's classifier blocks it (#135).
   - Sub-question: the harness line's `--settings` may be inline JSON (today), `--settings=<json>`, a file path, or absent. Merge inline JSON; refuse loudly what cannot be merged (a file path) rather than silently dropping either setting.

2. What is left for the watch (#135), and does the watch change.
   - After 1a and the landed `--disallowedTools=AskUserQuestion`, a claude seat has no prompt class left. codex runs `-a never` ("Never ask for user approval", `codex --help`). pi's `-a` only trusts project files; whether pi or its extensions can raise a confirm dialog is not yet observed. agy (`--mode auto`) is a configured harness not used by any slot today; whether it prompts in auto mode is not observed.
   - a (rec) No keys from the watch. The done claim is that no prompt class remains on claude and codex seats (proven), plus pi if a free check shows it has none; any remaining or unknown class keeps the landed one-notice-per-blocked-episode path, and is named a stated limit. The watch's "Answer a seat" stays in Never. Avoids N1 and N2 entirely.
   - b Build watch confirmation for residual prompts: needs an outside classifier rule (N2), a paid proof of the classifier's verdict (N1), and a danger judge; serves only harnesses not in use.
   - Practitioner question: does a denial ever loop (the seat re-issuing variants)? The denial text forbids work-arounds; the watch's existing loop rule (three same-result commands) catches a loop.

3. Where the record lives (signpost hard limit: every confirmation leaves a durable record). Under 2a nothing is confirmed, so nothing to record; a denial is already in the seat's transcript.

## Split

One issue, one leaf if 2a: `claude-seats-deny-prompts` (src/seat.ts harnessArgv merge, tests at the CLI/argv boundary, docs where the claude recipe is described). #135 and #139 both in its `sources`. If 2b, a second leaf in skills/watch-issues blocked by nothing but N1/N2.

## Pitfalls

- Two `--settings` flags silently drop the operator's env (O5): the merge is the fix, and a test proves the env survives.
- A future Claude Code that renames or drops `denyInsteadOfPrompting` would bring the stall back silently: limit stated; the proof records the version.
- Operator-started claude sessions (doors, the watch) are untouched: their prompts stay the operator's (signpost 5a).

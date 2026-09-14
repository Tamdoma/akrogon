---
name: broadcast-issue
description: Compose and send one factual update for a completed issue to its configured Discord targets, run by the merge slot itself after issue completion.
---

Re-read this file and its references only after compaction. A file already read in this thread and not edited since is not read again for a later phase prompt. After compaction, use the completed issue context supplied by the merger if its folder moved.

# Broadcast issue

This is the merge slot's own terminal task after `issue complete`, never delegated, not another leaf phase; one completed issue produces one message delivered to its configured targets.

## Context and message

Read the issue's supplied briefs and completion evidence plus `akrogon config` in the supplied repo worktree, taking target names from `broadcast.discord.webhook_env` without reading YAML.

Ground in docs first.
Challenge fuzzy terms.
Verify with a concrete scenario.
Check the live surface.

Write for every team member, not only developers: a `<repo>: <headline>` summary where the headline is one plain sentence a non-developer understands, then two bullet lists the sender renders as sections. `before` is always present and says what was wrong or, for an addition, what was missing; `now` says what is better about the system, not what code changed. One plain sentence per bullet, no jargon, no internal paths, file names, command names, code identifiers, unexplained acronyms, model names or test statistics.

Detail scales with the work: scale detail to what a broad-audience reader needs, merging parts when that reads better; a small issue gets a few short bullets, and never drop a shipped outcome the reader would care about, always in the same two sections. The sender splits a long message into several Discord posts at section boundaries, so never shorten the truth to fit; benefits are supported by the completed work, and an expected benefit is not a measured saving.

## Send

Install the skill-local dependencies with `bun install --cwd <skill-folder> --frozen-lockfile` before its first use.

Use [scripts/discord-send.ts](scripts/discord-send.ts) when sending, passing the configured target names as repeated `--target NAME` arguments and one JSON payload on stdin, then report its exit status without writing a delivery record.

```bash
bun <skill-folder>/scripts/discord-send.ts --target DISCORD_WEBHOOK_URL <<'JSON'
{"summary":"Project: Completed change","before":["What was wrong or missing."],"now":["What is better about the system, in one plain sentence."]}
JSON
```

The example target is replaced with the actual configured names; an empty list is an error, not an implicit channel choice.

Only the sender reads webhook values from `~/.config/akrogon/env`; missing file or target is a loud error, inherited environment values do not override it, and there is no env file in this skill folder.

Each target gets one delivery attempt and one immediate retry on failure with a warning, then the final failure is exposed with secret values redacted; successful targets are not resent because another target failed, no outcome is recorded, and a broadcast failure does not reopen the issue.

The merge slot does not repeat the sender after its built-in retry or run a phase command because completion already happened.

## Printed footer

```text
Last operation: <issue message delivery result, or concrete failure>
Next: none <issue already merged>
```

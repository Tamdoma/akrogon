---
name: broadcast-issue
description: Compose and send one factual update for a completed issue to its configured Discord targets, invoked by the merge writer after issue completion.
---

After compaction, re-read this file, the slug's brief or plan, and this phase's references, using the completed issue context supplied by the merger if its folder moved.

# Broadcast issue

This is the writer's terminal task after `issue complete`, not another leaf phase; one completed issue produces one message delivered to its configured targets.

## Context and message

Read the issue's supplied briefs and completion evidence plus `akrogon config` in the supplied repo worktree, taking target names from `broadcast.discord.webhook_env` without reading YAML.

Ground in docs first.
Challenge fuzzy terms.
Verify with a concrete scenario.
Check the live surface.

Write a concise `<repo>: <headline>` summary and unlabeled factual bullets explaining what shipped and why it helps an unfamiliar reader, fitting one Discord message by rewriting rather than splitting or truncating.

Internal paths, model names and test statistics rarely help that reader; benefits are supported by the completed work, and an expected benefit is not a measured saving.

For a necessary peer question, wait for idle, ask once through herdr in Question/Option form requesting `<leaf>/questions/<id>.md` at its current location, run `herdr agent wait` without a timeout, read the file and decide by simplicity, clarity, elegance, cost, speed and quality.

## Send

Use [scripts/discord-send.ts](scripts/discord-send.ts) when sending, passing the configured target names as repeated `--target NAME` arguments and one JSON payload on stdin, then report its exit status without writing a delivery record.

```bash
bun <skill-folder>/scripts/discord-send.ts --target DISCORD_WEBHOOK_URL <<'JSON'
{"summary":"Project: Completed change","whats_new":["A concrete shipped improvement and its benefit."]}
JSON
```

The example target is replaced with the actual configured names; an empty list is an error, not an implicit channel choice.

Only the sender reads webhook values from `~/.config/akrogon/env`; missing file or target is a loud error, inherited environment values do not override it, and there is no env file in this skill folder.

Each target gets one delivery attempt and one immediate retry on failure with a warning, then the final failure is exposed with secret values redacted; successful targets are not resent because another target failed, no outcome is recorded, and a broadcast failure does not reopen the issue.

The writer does not repeat the sender after its built-in retry or run a phase command because completion already happened.

## Printed footer

```text
Last operation: <issue message delivery result, or concrete failure>
Next: none <issue already merged>
```

The lines are printed only; for scrambled context, the first 50–100 words of the other pane can confirm what happened but cannot establish slot, phase, readiness, completion or a peer answer, and missing text does not block.

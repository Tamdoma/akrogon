---
name: broadcast-issue
description: Compose and send one factual update for a completed issue to its configured Discord targets, run by the merge slot itself after issue completion.
---

After compaction, re-read this file, the slug's brief or plan, and this phase's references, using the completed issue context supplied by the merger if its folder moved.

# Broadcast issue

This is the merge slot's own terminal task after `issue complete`, never delegated, not another leaf phase; one completed issue produces one message delivered to its configured targets.

## Context and message

Read the issue's supplied briefs and completion evidence plus `akrogon config` in the supplied repo worktree, taking target names from `broadcast.discord.webhook_env` without reading YAML.

Ground in docs first.
Challenge fuzzy terms.
Verify with a concrete scenario.
Check the live surface.

Write for every team member, not only developers: a `<repo>: <headline>` summary in plain words, then three bullet lists the sender renders as sections. `before` says what was wrong or missing, `now` says what changed, `next` says how it helps from here. One plain sentence per bullet, no jargon, no internal paths, model names or test statistics.

Detail scales with the work: a single small leaf gets one or two bullets per section, an issue that settled several leaves gets one bullet per shipped part, and an epic gets more still, always in the same three sections. The sender splits a long message into several Discord posts at section boundaries, so never shorten the truth to fit; benefits are supported by the completed work, and an expected benefit is not a measured saving.

For a necessary peer question, wait for idle, ask once through herdr in Question/Option form requesting `<leaf>/questions/<id>.md` at its current location, run `herdr agent wait` without a timeout, read the file and decide by simplicity, clarity, elegance, cost, speed and quality.

## Send

Install the skill-local dependencies with `bun install --cwd <skill-folder> --frozen-lockfile` before its first use.

Use [scripts/discord-send.ts](scripts/discord-send.ts) when sending, passing the configured target names as repeated `--target NAME` arguments and one JSON payload on stdin, then report its exit status without writing a delivery record.

```bash
bun <skill-folder>/scripts/discord-send.ts --target DISCORD_WEBHOOK_URL <<'JSON'
{"summary":"Project: Completed change","before":["What was wrong or missing."],"now":["What changed, in one plain sentence."],"next":["How this helps from here."]}
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

The lines are printed only; for scrambled context, the first 50–100 words of the other pane can confirm what happened but cannot establish slot, phase, readiness, completion or a peer answer, and missing text does not block.

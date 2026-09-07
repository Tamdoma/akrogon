---
name: broadcast-issue
description: Post issue lifecycle updates to Discord from any repository with issues/config.yaml routing. Use when asked to broadcast merge summaries, issue completions, release notes, framework updates, or session updates as one concise summary plus an unlabeled whats_new bullet list.
---

# Broadcast Issue

Post one Discord update using a short summary and one unlabeled `whats_new` bullet list.

## Inputs

- `summary`: required string under 200 characters.
- `whats_new`: required array with at least 3 items.

Do not accept a payload `webhook_url`. Discord routing comes from the current repository's `issues/config.yaml`; secret values come from environment variables loaded by `scripts/discord-send.js`.

## Process

1. Read or compose the update payload:

```json
{
  "summary": "Issue complete: broadcast-issue is now portable",
  "whats_new": [
    "You can now broadcast from repositories without framework-local hooks",
    "Each project selects its own Discord destination through committed issue config",
    "Webhook secrets stay outside git in the global skill environment store"
  ]
}
```

2. Preview the message first:

```bash
echo '{"summary":"...","whats_new":["...","...","..."]}' | bun <skills-root>/broadcast-issue/scripts/discord-send.js --dry-run
```

3. Send the message only after the preview is correct:

```bash
echo '{"summary":"...","whats_new":["...","...","..."]}' | bun <skills-root>/broadcast-issue/scripts/discord-send.js
```

4. Optionally record a local log in the current issue artifact if the caller asked for one. Do not create framework `.spec/broadcasting` logs.

## Message Rules

- Start with what changed in plain language.
- Keep the summary under 200 characters.
- Use 3 to 6 bullets unless the caller explicitly asks for a longer update.
- Avoid file paths, function names, and implementation details in Discord-facing bullets unless the audience asked for technical detail.
- Do not include section labels inside the Discord message.
- Do not print, quote, or persist webhook values.

## Routing

The sender walks up from the current working directory to find `issues/config.yaml`.

When this block exists, each item is an environment variable name:

```yaml
broadcast:
  discord:
    webhook_env:
      - DISCORD_WEBHOOK_URL
```

When the block or config file is absent, the sender defaults to `DISCORD_WEBHOOK_URL`.

Secret values are loaded from `<skills-root>/broadcast-issue/.env` beside the running deployed skill; existing process environment values win over file values.

## Verification

- Dry-run output shows the message, character count, status, and configured webhook environment names.
- Live mode validates Discord webhook URLs before sending.
- Any missing configured environment variable is a hard error that names the variable.
- If any webhook delivery fails, the script exits with code 1.

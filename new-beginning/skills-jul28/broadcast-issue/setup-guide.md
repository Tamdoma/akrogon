# broadcast-issue Setup Guide

## Secret Store

Create the environment file beside the deployed skill at:

```text
<skills-root>/broadcast-issue/.env
```

Add one line per Discord webhook environment variable:

```text
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/<id>/<token>
```

Use project-specific names when multiple repositories need different Discord destinations:

```text
TAMDOMA_FRAMEWORK_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/<id>/<token>
CLIENT_SITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/<id>/<token>
```

Do not commit webhook values. Do not paste them into issue artifacts, logs, or chat output.

## Load Order

The sender loads:

1. Current process environment.
2. `<skills-root>/broadcast-issue/.env`.

Existing process values win over file values.

## Project Routing

In each repository, add a non-secret routing block to `issues/config.yaml`:

```yaml
broadcast:
  discord:
    webhook_env:
      - TAMDOMA_FRAMEWORK_DISCORD_WEBHOOK_URL
```

Use one item for one Discord destination and multiple items for simultaneous fan-out:

```yaml
broadcast:
  discord:
    webhook_env:
      - CLIENT_UPDATES_DISCORD_WEBHOOK_URL
      - INTERNAL_RELEASES_DISCORD_WEBHOOK_URL
```

If the block or config file is absent, the sender defaults to `DISCORD_WEBHOOK_URL`.

If the block is present but a listed variable is unset, the sender fails and names that variable.

## Dry Run

From the repository root:

```bash
echo '{"summary":"Test broadcast","whats_new":["First visible change","Second visible change","Third visible change"]}' | bun <skills-root>/broadcast-issue/scripts/discord-send.js --dry-run
```

The preview shows the formatted message, character count, and configured webhook environment names without sending anything.

## Live Send

After dry-run succeeds:

```bash
echo '{"summary":"Test broadcast","whats_new":["First visible change","Second visible change","Third visible change"]}' | bun <skills-root>/broadcast-issue/scripts/discord-send.js
```

Live mode validates every configured Discord webhook URL before sending and exits with code 1 if any delivery fails.

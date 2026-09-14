# Env key grep excluded digits

## Case
Chart open for broadcast-two-sections listed env keys with `grep -o '^[A-Z_]*='` and reported `DISCORD_WEBHOOK_URL_2` absent. The operator said broadcasts post to both targets.

## Evidence
`sed` over the file with values redacted showed three keys including `_2` and `_1`. The class `[A-Z_]` does not match `2`, so the line never matched.

## Learning
Before reporting a live failure at chart open, list the surface directly (redacted) rather than through a pattern that can silently exclude names.

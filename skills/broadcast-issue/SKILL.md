---
name: broadcast-issue
description: Post issue lifecycle updates to Discord from any repository with issues/config.yaml routing. Use when asked to broadcast merge summaries, issue completions, release notes, framework updates, or session updates as one concise summary plus an unlabeled whats_new bullet list.
---

# Broadcast Issue

Post a brief Discord update that tells a busy, nontechnical reader what was wrong, what changed, and how it helps. Use a short summary and an unlabeled `whats_new` bullet list, split across two messages when needed.

## Inputs

- `summary`: required string under 200 characters, including the repository name followed by `: ` and the headline. The sender adds the icon.
- `whats_new`: required array with at least one factual item. Use as many bullets as the update needs, without padding.

Do not accept a payload `webhook_url`. Discord routing comes from the current repository's `issues/config.yaml`; secret values come from environment variables loaded by `scripts/discord-send.ts`.

## Process

1. Resolve the typed lifecycle target and run the sender's target-state refusal before composing or sending. Use `issue:<slug>` or `series:<series>:<leaf>`; a target marked `drill: true` is refused at this boundary:

```bash
bun <skills-root>/broadcast-issue/scripts/discord-send.ts --target issue:<slug> --dry-run <<'JSON'
{"summary":"target check","whats_new":["target check","target check","target check"]}
JSON
```

2. Read or compose the update payload:

```json
{
  "summary": "tamdoma-framework: Finished work is easier to keep up with",
  "whats_new": [
    "Updates about completed work were scattered, making it easy to miss what changed.",
    "Each project now shares its updates in the team's chosen channel.",
    "You can see what is ready and what it means for your work without chasing someone for details."
  ]
}
```

3. Preview the message first:

```bash
echo '{"summary":"...","whats_new":["...","...","..."]}' | bun <skills-root>/broadcast-issue/scripts/discord-send.ts --target issue:<slug> --dry-run
```

4. Send the message only after the preview is correct:

```bash
echo '{"summary":"...","whats_new":["...","...","..."]}' | bun <skills-root>/broadcast-issue/scripts/discord-send.ts --target issue:<slug>
```

5. Optionally record a local log in the current issue artifact if the caller asked for one. Do not create framework `.spec/broadcasting` logs.

## Message Rules

- Write one update for a broad, nontechnical audience. Do not split it by department or job title.
- Format the title as `🧪 <repo name>: <headline>`. Put only `<repo name>: <headline>` in `summary`, because the sender adds the icon. Use the target repository's public name, not an issue slug or an internal routing alias. Example: `🧪 tamdoma-framework: Fewer false alarms in framework code checks.`
- Make the headline specific and useful. Lead with the improvement people will notice, not an issue name or "Merged" announcement. Keep the entire summary under 200 characters.
- Explain what was wrong or missing, what shipped, and what people can now do more easily. Use short bullets, one useful point each. Combine these ideas when one sentence is enough. There is no fixed bullet count or word target.
- Three bullets often suit a small fix: what was wrong, what it does now, and what people get. This is a useful pattern, never a limit or a required count. Complex or multi-leaf updates need more bullets when they contain distinct improvements.
- Describe completed behavior, never copy task instructions, acceptance criteria, or an issue slug into the message. Write complete sentences. Shorten by rewriting, never by cutting off text or adding an ellipsis.
- For a large update, split at bullet boundaries into two consecutive messages when needed. Only the first message has the icon, repository name and headline. The second starts directly with the next bullet, without a title, "part two", or any continuation label. Read both as one continuous update. Pass `--continuation` for the second message. Preview both, then send them in order. Keep each below the sender's 2,000-character limit. With `--event`, give each part a stable distinct identity so retrying part two does not repeat part one.
- Use everyday words and concrete situations. Replace internal names, acronyms, code terms, file paths, model names, and test statistics with their meaning for the reader. For example, say "finished work no longer gets sent back for the same checks" instead of "repair-window validation fixed".
- Make it interesting through relevance: less waiting, less repeated work, clearer updates, or fewer mistakes, only where the committed evidence supports that benefit. Do not invent savings, claim everything is fixed, or turn an expected benefit into a measured result.
- Keep the tone conversational and matter-of-fact. Avoid hype, generic claims such as "improved reliability", and repeated problem/change/benefit labels. For a new capability, describe the previous limitation instead of inventing a failure.
- Before previewing, check that someone unfamiliar with the project can understand the change and why it matters at a glance.
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
- Every live delivery that reaches Discord is appended as one JSON line to `issues/run/broadcast/log.jsonl` under the resolved repository. Check that log before re-sending a broadcast you cannot otherwise confirm.

## Resumable completion broadcasts

Machinery callers pass `--event <completion-identity>` alongside the required target. The identity binds the issue or category, its leaf membership, and the merged commits. A reopened issue gets a new identity. The sender reads successful receipts for that event and sends only to channel names without a success record. Dry-run lists skipped channels. A fully delivered event exits successfully without sending.

Serialize sends for an event. Receipts are written after delivery, so a crash or timeout after Discord accepts a message can still produce a duplicate. This is at-least-once delivery, not exactly-once. A malformed receipt refuses the send with its file and line number. Calls without `--event` retain ordinary sender behavior.

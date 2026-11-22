# Brief: agy-skill-link

## What

`akrogon install` and the deploy `links` step link every akrogon skill into agy's global skill folder `~/.gemini/config/skills`, the same way they link the other harness skill roots (`.claude/skills`, `.agents/skills`, `.codex/skills`, `.pi/agent/skills`), with the same stale-link pruning, owned-link repointing and conflict refusal.

## Why

agy reads global skills only from `~/.gemini/config/skills`, where akrogon links nothing today, so agy never finds akrogon's skills (watch-issues, plan-issue and the rest) outside the akrogon checkout. The operator asked for the same symlink pattern as the other three harnesses.

## Done-criteria

1. After install from a release or checkout into an empty home, `<home>/.gemini/config/skills/<skill>` is a link to that source's `skills/<skill>` for every skill folder, created with its parent folders, and a second install changes no link.
2. In `<home>/.gemini/config/skills`, install prunes only dangling owned links and links into old releases, keeps real entries and foreign links (the folder already holds agy's own and other tools' skills), repoints an owned link, and refuses a non-link or foreign-link destination for an akrogon skill name before writing any link, exactly as it does in the other roots.

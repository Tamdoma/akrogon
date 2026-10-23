# Brief: docs-reference-commands

## What

Reference pages docs/reference/commands.md, skills.md, config.md and checks.md, and the shared docs tests moved to the new tree: docs-links over README plus every docs/**/*.md with image references, the command table check reading docs/reference/commands.md, and the retired-word docs scans over README plus every docs/**/*.md.

## Why

Commands, skills, settings and verification each get one lookup home, and the tests that guard docs keep working when pages move into nested folders. Consumes from docs-pictures-concepts the file docs/pictures/config-layers.svg and from docs-pictures-operations docs/pictures/verification.svg.

## Done-criteria

1. docs/reference/commands.md lists every command `src/akrogon.ts` dispatches, one line each, and the command table check fails when a dispatched command's row is removed (deliberate break shown in the report).
2. docs/reference/skills.md covers every skill under skills/ by the result it gives; config.md explains machine config, repo config and ISSUE.md/EPIC.md `slots:` with the per-seat nearest-wins order; checks.md explains leaf versus merge checks, fresh-checkout verify, receipts, known-red, test-change refusals, which log to read and each refusal's remedy, linking agent proof rules instead of copying them.
3. The docs link check covers README and every Markdown file under docs/ at any depth and every image reference form used, and fails on a broken link or missing image in a nested page (deliberate break shown).
4. The retired-word docs scans cover README and every Markdown file under docs/ at any depth and fail on a retired word placed in a nested page (deliberate break shown); their source, skill and AREA scans and the runtime retirement tests are unchanged.
5. The command-reference wording checks on docs/guide/files.md and docs/guide/next.md are removed together with the reads of those files, with the reason in the report.
6. Every statement on the owned pages matches current `src/` and `skills/` (seat B checks each page against its listed sources), contains no mention of a command, setting, file or behavior that no longer exists, and contains no dates.

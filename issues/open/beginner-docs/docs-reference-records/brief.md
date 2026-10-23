# Brief: docs-reference-records

## What

Reference pages docs/reference/files.md, state-and-phases.md, releases-and-updates.md and limits.md.

## Why

The issues/ layout, record files, state fields, phases, release and update behavior and Akrogon's limits each get one lookup home. Consumes project-folders.svg and phases.svg from docs-pictures-concepts and releases.svg from docs-pictures-operations.

## Done-criteria

1. files.md shows the checkout's issues/ layout and the worktree store outside the checkout, and explains each record file and the timing and flaky reports; state-and-phases.md lists every state.yaml field and every phase with who moves it; releases-and-updates.md explains installed release versus source checkout, how registered checkouts follow main, what triggers a deploy and how a failed update is reported; limits.md states what Akrogon does not do and what stays the operator's job.
2. Each page embeds its pictures with alt text.
3. Every statement on the owned pages matches current `src/` and `skills/` (seat B checks each page against its listed sources), contains no mention of a command, setting, file or behavior that no longer exists, and contains no dates.

# Brief: docs-use-finish

## What

How-to pages under docs/use/ for finishing and recovering work: merge-and-announce, when-work-fails, roll-back-a-release, learn-from-work, save-records; and the rollback test pointed at docs/use/roll-back-a-release.md.

## Why

Landing, failures, rollback, lessons and record saving each get one findable page. Consumes failure-recovery.svg, lessons-flow.svg and records-vs-code.svg (docs-pictures-operations), links change-flow.svg, and links docs/reference/ pages from both reference leaves.

## Done-criteria

1. merge-and-announce.md states the normal path (the command lands a green top with no seat) and the exceptions (red, refused or rebase attempts go to B; solo rebase by hand; command-owned landing), then the broadcast; when-work-fails, roll-back-a-release, learn-from-work and save-records cover their map subjects.
2. Each page that introduces a concept embeds its picture with alt text, and every page ends with a link to its next step.
3. docs/use/roll-back-a-release.md contains the supported manual recovery procedure, usable when the current release cannot start, and agrees with the retained real-predecessor recovery proof.
4. Every statement on the owned pages matches current `src/` and `skills/` (seat B checks each page against its listed sources), contains no mention of a command, setting, file or behavior that no longer exists, and contains no dates.

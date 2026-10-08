# Brief: named-targets

## What
`akrogon next <name>` accepts a bare open epic name, open issue name (top-level or nested one level under an epic) or leaf slug, from any folder of the registered repo or its worktrees, and selects that owner's leaves. An input that exists as a folder from the current directory keeps today's path meaning. A name matching more than one candidate is refused before anything starts, listing every match by kind and repo-relative path. The operator guide shows the name forms and the path form for same-name pairs.

## Why
Tamdoma/akrogon#59: `akrogon next client-voice-writing` (an epic) and `akrogon next copy-review` (a nested issue) fail with the missing-leaf error from the repo root. Only a leaf slug or folder path works today, while status, park and unpark show owners by name.

## Done-criteria
1. From the repo root, a subfolder with no same-named folder, and a leaf worktree, `akrogon next <epic>` and `akrogon next <nested-issue>` and `akrogon next <top-level-issue>` select the same repo and leaf set as `akrogon next <that owner's repo-relative folder path>` run from the repo root, and dispatch them.
2. A bare leaf slug keeps today's selection across open and closed leaves.
3. When the input exists as a folder from the current directory, it is selected as a path exactly as today, even if an owner or leaf elsewhere has the same name.
4. A name matching two or more candidates (two same-name issues under different epics, an epic and its same-name issue, an issue and its same-name leaf even when they select the same leaves, an owner and an unrelated leaf) exits non-zero, prints each match with its kind (epic, issue, leaf) and repo-relative path, and makes no herdr call and no state change.
5. A closed epic or issue name does not match as an owner, so an open owner with the same name as a closed owner resolves without ambiguity. A closed owner stays selectable by its folder path.
6. Owners are recognized from the folders above discoverable leaves, with or without ISSUE.md or EPIC.md. A name that matches nothing, including an empty folder's name, gives today's missing-leaf message, including its parked hint. A name whose only leaves fail to read reports the read errors, not a missing-name message.
7. docs/guide/parts.md and the target text in docs/guide/next.md describe epic, issue and leaf names as targets, the ambiguity refusal, and the folder path to use when an issue and its leaf share a name.

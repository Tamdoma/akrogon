# Leaf review: caller-display, slot D

Disagreements only. Tier: T2 = repository or draft-leaf file read 2026-11-25.

## L1. Done-criterion 4's config.md half is already true on the base and binds nothing

- Fact: criterion 4 requires that "docs/reference/config.md's `pass_env` row no longer presents display variables as something a repo must list". The row today does not mention display variables at all, so the criterion passes with config.md untouched. It also does not deliver the brief's own What item 4, which says docs/reference/checks.md *and* docs/reference/config.md describe the new behavior: nothing in criterion 4 requires config.md to say that the display names arrive without a `pass_env` entry.
- Evidence: T2, `docs/reference/config.md` `pass_env` row, read 2026-11-25: "Names of environment variables check commands get from your shell, with no `.env` copy. Default empty." No display name appears in the row or the paragraph after it. T2, draft `caller-display/brief.md` What item 4 and Done-criteria item 4, read 2026-11-25.
- Consequence: the leaf can meet criterion 4 while leaving the one place a repo author decides what to list in `pass_env` silent about the display names being automatic. The criterion has no red state on the base and gives the reviewing seat nothing to check in config.md. It needs a positive observable result for config.md (the row or its paragraph states the four display names are passed without listing), matching What item 4.

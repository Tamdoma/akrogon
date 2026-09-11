# Brief: install-prune-links

## What
`akrogon install` links every folder under the repo's `skills/` into four harness folders: `~/.claude/skills`, `~/.agents/skills`, `~/.codex/skills`, `~/.pi/agent/skills`. Before linking, in each of those four folders it removes any symlink whose target is under the repo's `skills/` folder and no longer resolves. Every other entry (real directories, links elsewhere, resolving links) is untouched.

## Why
A skill folder deleted from the repo leaves its link dangling in every harness folder forever, because install only ever creates links. Codex and pi folders were linked by an earlier install and now miss newer skills.

## Done-criteria
1. After `akrogon install`, each of the four folders contains one resolving symlink per directory in the repo's `skills/`.
2. A dangling symlink in any of the four folders whose target is under the repo's `skills/` is removed by `akrogon install`.
3. A dangling symlink pointing outside the repo's `skills/`, a real directory, and a resolving foreign symlink in those folders are left in place.
4. The existing conflict check still refuses a destination that is not a symlink into the repo, printing the removal commands and exiting non-zero.
5. A new `tests/install.test.ts` covers criteria 1 to 4 against a temporary HOME using the fake herdr fixture.
6. `bun test`, `bun run typecheck` and `bun run format` pass.

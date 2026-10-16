# Brief u7 — zero link mutation on a rejected deploy

## Goal

A deploy rejected by link conflicts must leave every link destination exactly as it was: no repointed links, no new links, no unlinked stale links. Scope: `src/install.ts`, `src/self-update.ts` only.

## Design decision

- `planSkillLinks` currently unlinks stale links inside planning (`unlinkSync(path)` in the sweep). Make planning pure: return `stale: string[]` (destinations to unlink) instead of mutating. New return: `{ links: Link[]; conflicts: Link[]; stale: string[] }`.
- `deployStage`'s `links` step order must be: plan → if `conflicts.length > 0` throw (existing message, no mutation at all) → `applySkillLinks(links)` → unlink each `stale` entry (`unlinkSync`, guard with `existsSync`/`lstatSync` since the destination may be gone).
- `install()` keeps its existing behavior (conflicts throw before apply — it already does); update the destructure to `{ links, conflicts, stale }` and unlink stale entries after `applySkillLinks`, same guard.
- `install()` calls `planSkillLinks(homedir(), currentLink(), ownedRoots)` with `listRoot` defaulting to `sourceRoot`; no change needed there.

## Why

`links` runs before `flip` (see `deployStage`). If it applies/repoints/unlinks before validating conflicts, a rejected deploy leaves the active installation damaged: workspace-pointing commands repointed to a nonexistent `current/*`, active-release skill links removed, dangling `current/skills/*` links for skills the active release lacks.

## Warnings

- Do not edit, create or move tests, docs, or other files.
- The `stale` sweep keeps the `listRoot` probe from u6 (`probe` resolves `sourceRoot/skills` targets against `listRoot/skills`) — only its mutation becomes a returned list.
- Do not change deploy.yaml fields, step names, or the flip/reload/record order.
- The three targeted tests are red at head and encode the new contract; do not weaken them.

## Interfaces

```ts
export function planSkillLinks(
  home: string,
  sourceRoot: string,
  ownedRoots: string[],
  listRoot?: string,
): { links: Link[]; conflicts: Link[]; stale: string[] }
```

## Checks

Run each through `akrogon run-check --name <label> -- <cmd>`; cite the `check <label>: <exit> <path>` lines.

- `bun test tests/install.test.ts -t "conflicting directory"` — red → green.
- `bun test tests/release-deploy.test.ts -t "first-switch conflict"` — red → green.
- `bun test tests/release-deploy.test.ts -t "rejected add or remove"` — red → green.
- `bun test tests/install.test.ts tests/self-update.test.ts tests/release-deploy.test.ts` — all green.
- `bun run format` and `bunx tsc --noEmit` — green.

## Report

Short report: per-file changes, check lines, deviations. Commit conventionally, leave the worktree clean.

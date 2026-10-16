# Report u7 — zero link mutation on a rejected deploy

## Changes

### src/install.ts
- `planSkillLinks` is now pure: the stale sweep collects `stale: string[]` instead of calling `unlinkSync`. New return `{ links, conflicts, stale }`.
- The sweep excludes destinations covered by `planned`: a link into `releases/<old>/skills/<s>` that the new release also ships is repointed by `applySkillLinks`; unlinking it afterward would delete the fresh link (previously the unlink ran before recreation, so the ordering hid the overlap). The `listRoot` probe logic is unchanged.
- `install()` destructures `{ links, conflicts, stale }` and unlinks stale entries **before** the conflict throw: the install contract ("prunes before refusing") requires pruning even on refusal; pruning only removes links, so it is still safe. Guard uses `lstatSync(path, { throwIfNoEntry: false })`, not `existsSync`: stale links are typically dangling and a target-following probe would skip them.

### src/self-update.ts
- `deployStage`'s `links` step reordered: plan → throw on `conflicts` (unchanged message) → `applySkillLinks(links)` → unlink `stale`. Removed the `blocked`-set filtering that applied non-conflicting links before throwing; a rejected deploy now mutates nothing.
- Imported `lstatSync`/`unlinkSync` from `node:fs`.

## Deviations
- Brief said `install()` unlinks stale "after `applySkillLinks`". The sibling tests "install prunes before refusing ..." require stale pruning even when install refuses on conflicts, so the unlink runs before the conflict throw (safe: removal only, and stale never overlaps planned destinations).
- Guard uses `lstatSync` alone (brief allowed `existsSync`/`lstatSync`): `existsSync` follows links and would miss dangling stale links.

## Checks
- `check install-conflicting-directory: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/release-deploy/implementation/check-install-conflicting-directory-1792124630243-1883751.log`
- `check deploy-first-switch-conflict: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/release-deploy/implementation/check-deploy-first-switch-conflict-1792124635465-1886179.log`
- `check deploy-rejected-add-remove: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/release-deploy/implementation/check-deploy-rejected-add-remove-1792124635497-1886183.log`
- `check suite-install-selfupdate-deploy: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/release-deploy/implementation/check-suite-install-selfupdate-deploy-1792124709124-1922387.log` (55 pass, 0 fail)
- `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/release-deploy/implementation/check-format-1792124714660-1937362.log`
- `check tsc: 0 /home/ivan/Work/infra/akrogon/issues/open/run-release/release-deploy/implementation/check-tsc-1792124719455-1939468.log`

Committed `6e494cc fix(deploy): reject conflicting deploys without mutating links`; worktree clean.

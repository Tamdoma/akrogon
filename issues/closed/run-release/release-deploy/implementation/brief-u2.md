# Brief u2: link planning through current

## 1. Goal

Rewire `src/install.ts` for plan decisions D3, D10, D11, D12: every installed link targets `current/*` paths; owned links are repointed or unlinked, never conflicted; `install()` ensures `current` exists.

## 2. Numbered acceptance criteria

1. `planSkillLinks(home, sourceRoot, ownedRoots: string[])` keeps its return type `{ links: Link[]; conflicts: Link[] }`. `sourceRoot` is the literal path the links point at (callers pass `currentLink()`), so sources are `<sourceRoot>/src/akrogon.ts`, `<sourceRoot>/systemd/akrogon.slice`, `<sourceRoot>/skills/<name>` for each directory under `<sourceRoot>/skills`.
2. `ownedRoots` semantics: a symlinked destination is owned when its resolved target (resolve readlink against the destination's dirname) is `within` any entry of `ownedRoots`. Owned roots are literal paths; compare with `within` from `src/config.ts`.
3. An owned link whose resolved target differs from the planned `link.source` is silently repointed — it is not a conflict and not skipped: `applySkillLinks` must replace it (unlink then symlink), where today it only creates absent links. Repointing applies to every owned link at a planned destination, including one already pointing at the planned source (no-op).
4. An owned link in a skills root whose resolved target is missing, or that resolves under `ownedRoots`' `releases/` entry (any specific release dir, never the canonical path), is unlinked — covers removed skills and links into pruned releases. This replaces the current `ownedPrefix`-only dangling check. Links into `current` or `toolRoot`/workspace whose target still exists are left alone even when unplanned.
5. A non-symlink at a planned destination, or a symlink resolving outside every owned root, stays a `conflict` exactly as today.
6. `install()` (exported verb) calls `ensureCurrent()` from `src/release.ts` before planning — creating `current -> toolRoot` when absent — then plans with `sourceRoot = currentLink()` and `ownedRoots = [currentLink(), releasesDir(), toolRoot]` plus the registered `repos['akrogon']` root when `readGlobal().repos` has that key (resolve it with `expandPath` + `realpathSync` when it exists). `applySkillLinks(planned.links)` still skips destinations conflicting; `herdr plugin link` passes `resolve(currentLink(), 'plugin')`; `systemctl --user daemon-reload` unchanged.
7. The scan of each skills root for stale links keeps iterating `readdirSync(directory)` under `home`, skipping missing roots as today.
8. No behavioral change to `install()`'s conflict refusal: it still prints `rm -r -- <quoted>` per conflict and throws.

## 3. Read-first

- `src/install.ts` (whole file, ~70 lines)
- `src/release.ts` (new, wave-1: `currentLink`, `releasesDir`, `ensureCurrent` signatures)
- `src/config.ts` — `toolRoot`, `readGlobal`, `expandPath`, `within`
- `src/self-update.ts` — `installStage` caller (uses `planSkillLinks(home, ownRoot)` today; that call site belongs to a later unit, leave it uncompilable if needed — no, instead keep `planSkillLinks` callers compiling by updating the self-update call site minimally: pass `[currentLink(), releasesDir(), repo.root]` — no wait: do NOT touch `src/self-update.ts`; a later unit rewrites it. Just leave the type error; typecheck errors outside your file are not yours.)
- skill folder `ponytail.md`

## 4. Change list and needed interfaces

Owns `src/install.ts` only. Imports added: `ensureCurrent`, `currentLink`, `releasesDir` from `./release`; `expandPath` from `./config` (already imports `toolRoot`, `readGlobal`, `GlobalConfig` — extend). `Link` type unchanged. `applySkillLinks` gains replace-on-owned behavior via a `repoint` flag on planned links or by always unlink-first for owned destinations — choose the smallest correct shape; `planSkillLinks` marks which links need replacing by adding `Link` extension `Link & { repoint: boolean }` or a second list — your call, keep it typed.

## 5. Do-not, reasons and exceptions

- Do not touch `src/release.ts` — committed by unit u1; interface mismatch returns a mismatch.
- Do not touch `src/self-update.ts` — unit u5 owns it; its `planSkillLinks(home, ownRoot)` call will fail typecheck until u5 lands, that is expected.
- Do not touch any test file — A owns test corrections; a red test returns a mismatch.
- Do not unlink links outside the four skills roots' stale-scan or at planned destinations — scope of the repoint/unlink rule is exactly planned destinations plus the stale scan.
- Do not create `current` inside `planSkillLinks` — pure planning stays side-effect-free (today's prune unlink aside; keep that existing exception).
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A.

## 6. Ordered steps

1. Read `src/install.ts`, `src/release.ts`, `src/config.ts` `within`/`expandPath` (criteria 1-8).
2. Rewrite `planSkillLinks` for ownedRoots semantics (criteria 2-5,7).
3. Update `applySkillLinks` for repointing (criterion 3).
4. Update `install()` for `ensureCurrent` + `currentLink` sources + plugin link (criterion 6,8).
5. `bunx prettier --check src/install.ts`; `bunx tsc --noEmit src/install.ts 2>&1 | grep install` style targeted check — errors naming `self-update.ts` are expected and not yours.

Advisory size: 1 file, under 12 turns.

## 7. Commands

- `bun install --frozen-lockfile` first (worktree has no node_modules).
- `bunx prettier --check src/install.ts` — must exit 0.
- `bun run typecheck` — only errors in `src/install.ts` are yours; `self-update.ts` errors naming the old `planSkillLinks` call are expected (u5 owns it).

## 8. Done-when, evidence and report

`src/install.ts` implements criteria 1-8, prettier-clean, no type errors in your file. Keep command output through `akrogon run-check --name <label> -- <cmd>` and cite its `check <label>: <exit> <path>` line; `akrogon log <path>` reads a cited log. Commit only `src/install.ts`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

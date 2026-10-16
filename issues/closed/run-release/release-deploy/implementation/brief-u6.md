# Brief u6 — deploy resume: links before flip, unfinished-deploy retry, status visibility

## Goal

Repair the deploy stage so a failed deploy never activates the attempted release and an interrupted or failed deploy of the *current* commit is retried instead of silently skipped. Scope: `src/self-update.ts`, `src/install.ts`, `src/release.ts`, `src/status.ts` only.

## Design decision

- `deployStage` (`src/self-update.ts`) currently runs `flip` before `links`. Move the links step before the flip: a `links` failure must leave `current` untouched (criterion 4). Order: `fetch` → `resolve` → done-check → `hold` → `build` → `links` → `flip` → `reload` → `record`.
- `planSkillLinks` (`src/install.ts`) enumerates skills from `resolve(sourceRoot, 'skills')` and links to `sourceRoot/*`. Deploy must enumerate from the *new* release directory while linking to `current/*` (pre-flip, `current` still points at the old release). Add an optional fourth parameter `listRoot?: string` (defaults to `sourceRoot`) used only for the `readdirSync` skill enumeration; deploy passes `resolve(releasesDir(), sha)` as `listRoot` and keeps `currentLink()` as `sourceRoot`. Do not change the install() call shape beyond the new optional parameter.
- `planSkillLinks`'s `same` check can throw `ENOENT` when `current` dangles (first deploy): `realpathSync(link.source)` on a missing path. Guard it: `existsSync(link.destination) && existsSync(link.source) && realpathSync(...) === realpathSync(...)`.
- Resume condition: `previous === sha` is "done" only when `readDeployRecord()` returns `{ ok: true, commit: sha }`. Any other record state (ok:false, ok:true with a different commit, null) means the deploy is unfinished: skip the `hold` check (the commit is already active; a hold does not block completing it), run `links`/`flip`/`reload`/`record` normally. `flip` onto the same sha is already a no-op replace; `buildRelease` reuse is idempotent.
- Previous bookkeeping: the `previous` argument to `writeDeploySuccess` is the last successfully deployed commit. When resuming (`previous === sha`), that is `record?.commit` — which requires failure records to carry `commit` forward.
- `src/release.ts`: add `commit: z.string().optional()` to the `DeployFailure` schema and make `writeDeployFailure` carry `commit: existing?.commit` (present only when the existing record has one — a `DeploySuccess` always does; spread conditionally so the key is absent otherwise).
- `src/status.ts`: drop the `deploy.attempted !== active` clause from the `deploy failed:` overview line so a recorded failure prints whenever `deploy.ok === false` and `attempted` is non-null.
- Keep `writeDeploySuccess`'s `replaced` timestamp stamping (B's F3 repair) unchanged, and keep B's `fetch`/`resolve` step split unchanged.

## Warnings

- Do not edit, create or move tests. The targeted tests below already encode the corrected expectations and are red at the current head; the product code must satisfy them.
- Do not change the deploy.yaml field names already asserted by tests: `commit`, `previous`, `ok`, `at`, `replaced`, `attempted`, `step`, `error`.
- `gitStage` catch and the records/moveCheckout pipeline are already repaired; do not rework them.
- No new helpers unless required; keep the diff minimal.

## Interfaces

```ts
// install.ts
export function planSkillLinks(
  home: string,
  sourceRoot: string,
  ownedRoots: string[],
  listRoot?: string,   // skills enumeration root; defaults to sourceRoot
): { links: Link[]; conflicts: Link[] }

// release.ts — DeployFailure gains an optional carried field
export const DeployFailure = z.object({
  attempted: z.string(),
  commit: z.string().optional(),   // last successfully deployed commit, carried forward
  ok: z.literal(false),
  step: z.string(),
  error: z.string(),
  at: z.iso.datetime(),
  replaced: z.record(z.string(), z.iso.datetime()).default({}),
});
```

## Checks

Run each through `akrogon run-check --name <label> -- <cmd>`; cite the `check <label>: <exit> <path>` lines in the report.

- `bun test tests/install.test.ts -t "conflicting directory"` — was red, must go green.
- `bun test tests/release-deploy.test.ts -t "interrupted deploy"` — was red, must go green.
- `bun test tests/install.test.ts tests/self-update.test.ts tests/release-deploy.test.ts` — all green.
- `bun run format` — green.
- `bunx tsc --noEmit` — green.

## Skills and docs

- `bun` builtins (`Bun.YAML`), node:fs/path — inspect current code; match existing style (strict types, no any).
- Deploy pipeline order is the core invariant; re-read `deployStage` fully before editing.

## Report

Return a short report: what changed per file, the `check <label>: <exit>` lines, any deviations.

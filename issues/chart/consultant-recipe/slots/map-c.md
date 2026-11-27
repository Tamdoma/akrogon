# Territory map, slot C: consultant-recipe

Date: 2026-11-25  
Repo: `/home/ivan/Work/infra/akrogon`  
Binding signposts: `issues/chart/consultant-recipe/forks/signposts.md` `## Taken` (S1a remove the problem class, S2a no fallback / no opt-out, S3a `slots.consultant` only, S4a operator adds live recipe N1, S5b landing waits on N1, S6a fix false docs/skills in same change, S7a free tests only).

---

## 1. Material forks

### Fork 1: Where a missing `slots.consultant` key is refused

- **Option 1A — Make `slots.consultant` required in `globalSchema` (`src/config.ts` `globalSchema`) (Recommended; directly satisfies S1a, S2a, S5b):**
  - Change `consultant: slotConfigSchema.optional()` to `consultant: slotConfigSchema` in `src/config.ts` `globalSchema`.
  - `globalSchema.superRefine` (`src/config.ts`) already checks `consultant`'s harness against `config.harnesses`; it now runs unconditionally.
  - `effectiveConfig` (`src/config.ts`) always emits `slots.consultant` without the conditional spread.
  - Every command calling `readGlobal()` fails immediately on a config missing `slots.consultant`: `akrogon install` (`src/install.ts` `install`), `akrogon init` (`src/init.ts` `initialize`), `akrogon config` (`src/config.ts` `effectiveConfig`), `akrogon status`, `akrogon next`, `akrogon seat` (`src/akrogon.ts` `case 'seat'`), `akrogon notice` (`src/akrogon.ts` `case 'notice'`), `akrogon rollback` (`src/rollback.ts` `rollback`), and every `watch-issues` script via `skills/watch-issues/scripts/repo.ts` (`watchTarget` -> `resolveRepoKey` -> `akrogon config`).
  - *What this could break or invite later:*
    - **Auto-deploy bricking if N1 is skipped:** `self-update` deploys on push to `main` (`src/self-update.ts` `deployStage`, `docs/reference/releases-and-updates.md` "What starts a deploy"). Because `src/rollback.ts` `rollback` calls `readGlobal()` before flipping `current`, deploying 1A while `~/.akrogon/config.yaml` lacks `slots.consultant` breaks every `akrogon` verb on the host **including `akrogon rollback`**. Signpost S5b (hold landing until operator completes N1) is load-bearing.
    - **Test fixtures & minimal configs:** every standalone machine `config.yaml` / `globalSchema.parse` test fixture must carry `slots.consultant` (exact list in §3), and `docs/start/install.md` must include `consultant:` in its minimal example so fresh installs do not fail `akrogon install`.
    - **Future non-watch machines:** any new machine installing akrogon must choose a `slots.consultant` recipe up front even before starting a watch.

- **Option 1B — Keep `globalSchema` optional and refuse at watch startup (`skills/watch-issues/scripts/start.ts` + `repo.ts` `resolveRepoKey`):**
  - `start.ts` checks `slots.consultant` in `akrogon config` output and exits `refused` (code 1) before starting the timer.
  - *What this could break or invite later:*
    - Leaves two holes that violate S1a ("remove the problem class") and the signposts Account ("gives up tolerance of configs without the key"): (1) an already-running watch whose `config.yaml` later loses `slots.consultant` (the exact 11-23 -> 11-24 -> 11-25 sequence in `INTAKE.md`) still stalls mid-consult; (2) `akrogon install`, `init`, `config`, and `status` continue silently accepting an incomplete machine config.

### Fork 2: `src/akrogon.ts` (`case 'seat'` `--watch-consultant`) refusal & error text

- **Option 2A — Remove the now-unreachable `if (recipe === undefined)` branch in `src/akrogon.ts` (`case 'seat'`) and rely on `readGlobal()`'s schema error (Recommended):**
  - With `globalSchema` requiring `slots.consultant`, `global.slots.consultant` is statically `SlotConfig` (non-optional), so `src/akrogon.ts` lines 150-153 become dead code.
  - `readGlobal()` (`src/config.ts`) throws `Invalid <file>: <ZodError>` — uniform with missing `slots.a` and `slots.b` (and matching `tests/config.test.ts` assertions checking `consultant`).
  - *What this could break or invite later:*
    - **Pitfall:** Zod v4 formats the missing-key path as JSON `"path": ["slots", "consultant"]`, **not** the literal dotted substring `"slots.consultant"`. `tests/watch-consult.test.ts` (`seat --watch-consultant without slots.consultant...`) currently asserts `expect(refused.stderr).toContain('slots.consultant')` and relies on `fixture()` lacking `slots.consultant`. Under 2A, that test must explicitly delete `slots.consultant` via `setConsultant(f, undefined)` and assert on `config.yaml` + `slots` + `consultant` (or `readGlobal()`'s error format).

- **Option 2B — Format `ZodError` paths in `readGlobal()` (`src/config.ts`) as dotted paths (like `indexSeats` in `src/config.ts` already does with `issue.path.join('.')`):**
  - Preserves literal `slots.consultant` in stderr and improves human readability of all machine config errors.
  - *What this could break or invite later:* widens scope past `slots.consultant` (S3a) and may break existing `tests/config.test.ts` assertions if any assert on raw `ZodError` formatting.

### Fork 3: `skills/watch-issues/SKILL.md` `## Consult` missing-recipe branch

- **Option 3A — Remove the missing-recipe notify-only sentence in `skills/watch-issues/SKILL.md` `## Consult` (`- Open:`) (Recommended; required by S6a under 1A):**
  - Current text: *"A start failing for a missing `slots.consultant` recipe means the failure keeps its notify-only outcome: no attention notice for it, and one non-attention `akrogon notice` per watch names `slots.consultant` in `~/.akrogon/config.yaml`."*
  - Under Option 1A, that instruction is **impossible to execute**: `akrogon notice` (`src/akrogon.ts` `case 'notice'`) calls `readGlobal()`, which itself throws when `slots.consultant` is missing. Removing that sentence eliminates dead/contradictory skill prose while keeping the general failed-start rule right after it.
- **Option 3B — Keep the sentence as a defensive fallback note:**
  - Directly contradicts S6a (false skill text) and instructs the watcher to run a command (`akrogon notice`) guaranteed to fail in that state.

---

## 2. Lifetime pitfalls and what removes each

1. **Auto-deploy bricks live host + `akrogon rollback` if landed before N1:**
   - *Evidence:* `docs/reference/releases-and-updates.md` ("What starts a deploy"), `src/self-update.ts` (`deployStage`), `src/rollback.ts` (`rollback` calls `readGlobal()` before flipping `current`), `INTAKE.md` (live `~/.akrogon/config.yaml` currently has no `slots.consultant`).
   - *Removal:* Strictly honor S5b — verify `slots.consultant` is present in `~/.akrogon/config.yaml` (N1) **before** pushing/merging to `main`.
2. **`docs/start/install.md` minimal config breaks fresh installs:**
   - *Evidence:* `src/install.ts` (`install`) calls `readGlobal()`; `docs/start/install.md` ("Write the machine config") gives a minimal YAML block containing only `slots.a` and `slots.b`.
   - *Removal:* Add `consultant:` to the minimal config example and bullet list in `docs/start/install.md`.
3. **`tests/config.test.ts` exact-equality assertion on `akrogon config` `slots`:**
   - *Evidence:* `tests/config.test.ts` (`config prints leaf-resolved slots in a managed leaf worktree only`) uses `expect(parsed.slots).toEqual({ a: ..., b: ... })`. Once `tests/helpers.ts` (`fixture()`) includes `slots.consultant`, `effectiveConfig` (`src/config.ts`) emits `consultant` in `slots`, breaking that `toEqual`.
   - *Removal:* Update that expectation to include `consultant` (matching `fixture()`).
4. **`tests/watch-consult.test.ts` missing-recipe test silently stops testing omission or fails on dotted-string check:**
   - *Evidence:* `tests/watch-consult.test.ts` (`seat --watch-consultant without slots.consultant...`) does not call `setConsultant(f, undefined)` (it relied on `fixture()` omitting `consultant`), and asserts literal `'slots.consultant'` in stderr (which raw Zod v4 `ZodError` prints as `["slots", "consultant"]`).
   - *Removal:* Explicitly call `setConsultant(f, undefined)` in that test and align its stderr assertion with `readGlobal()`'s refusal format (or add the missing-`slots.consultant` refusal test in `tests/config.test.ts` alongside the existing malformed-`slots.consultant` tests).
5. **Standalone `config.yaml` / `globalSchema.parse` fixtures outside `tests/helpers.ts`:**
   - *Evidence:* Audit of `tests/` found 8 files constructing machine `slots: { a, b }` without calling `fixture()` (or bypassing `fixture()`).
   - *Removal:* Update every site in §3 so `bun test` and `tests/e2e/kinds.e2e.ts` stay valid.
6. **Watch skill `akrogon notice` impossibility:**
   - *Evidence:* `skills/watch-issues/SKILL.md` `## Consult` (`- Open:`) instructs running `akrogon notice` on a missing `slots.consultant`, but `src/akrogon.ts` (`case 'notice'`) calls `readGlobal()`.
   - *Removal:* Remove that sentence under Option 3A.
7. **`src/state-home.ts` (`migrateStateHome`) and `src/self-update.ts` (`selfUpdate` tests):**
   - *Evidence:* `src/state-home.ts` (`migrateStateHome`) parses `config.yaml` with `z.looseObject({ repos: ... })`, not `globalSchema`, so it preserves `slots.consultant` verbatim without rejecting minimal test configs; `tests/self-update.test.ts` writes `'repos: {}\n'` which `selfUpdate` never passes through `readGlobal()`. Neither needs code changes, only `tests/state-home.test.ts` (`globalConfig`) needs `consultant` because its tests invoke `akrogon config`.

---

## 3. Complete surface list

### Code
- `src/config.ts`:
  - `globalSchema`: `consultant: slotConfigSchema.optional()` -> `consultant: slotConfigSchema`.
  - `globalSchema.superRefine`: `named` map (type narrows cleanly; harness check stays).
  - `effectiveConfig`: simplify `...(global.slots.consultant === undefined ? {} : { consultant: global.slots.consultant })` to `consultant: global.slots.consultant`.
- `src/akrogon.ts`:
  - `case 'seat'` (`values['watch-consultant'] === true`): remove dead `if (recipe === undefined)` guard; use `global.slots.consultant` directly.
- *(Checked, no change needed: `src/init.ts` `initialize` already calls `readGlobal()` and spreads `...global`; `src/state-home.ts` `migrateStateHome` already copies `slots` verbatim; `src/install.ts` `install` already calls `readGlobal()`; `skills/watch-issues/scripts/repo.ts` `resolveRepoKey` already runs `akrogon config`.)*

### Tests (free boundary proof, S7a)
- `tests/helpers.ts` (`fixture()`): add `consultant: { harness: 'fake', model: 'strong-c', effort: 'medium' }` (or matching fake recipe) to `config.yaml`'s `slots`.
- `tests/config.test.ts`:
  - Add boundary test: `globalSchema` / `akrogon config` refuses a machine `config.yaml` without `slots.consultant`, naming `consultant` and `config.yaml` (red on base, green after).
  - Update standalone machine objects missing `consultant`: lines around `slots: { a, b }` in `config.test.ts` (the manual `config.yaml` fixture and the three `globalSchema` `run_root` tests) and the `expect(parsed.slots).toEqual(...)` check.
- `tests/watch-consult.test.ts`:
  - In `seat --watch-consultant without slots.consultant...`: call `setConsultant(f, undefined)` explicitly and update stderr expectation to match `readGlobal()`'s refusal (`config.yaml` + `consultant` / `slots`, exit non-zero, 0 terminals started).
- Other standalone machine `slots: { a, b }` fixtures in tests:
  - `tests/install.test.ts` (standalone `config.yaml` fixture).
  - `tests/leaf-slices.test.ts` (`globalSchema.parse` call).
  - `tests/pull.test.ts` (three `globalSchema.parse` calls).
  - `tests/readiness.test.ts` (standalone `config.yaml` fixture).
  - `tests/state-home.test.ts` (`globalConfig`).
  - `tests/e2e/kinds.e2e.ts` (standalone `config.yaml` fixture, so typecheck/e2e stay consistent).

### Docs & skill text (S6a)
- `docs/reference/config.md`:
  - Machine `config.yaml` table (`slots` row): state `a`, `b`, and `consultant` are all required (no longer "`consultant` is an optional recipe").
  - YAML example: remove `# Optional:` comment above `consultant:`.
- `docs/start/install.md`:
  - "Write the machine config": add `consultant:` to the minimal `config.yaml` example and update the `slots` bullet from "sets seat A and seat B" to include `consultant`.
- `docs/reference/commands.md`:
  - `akrogon seat` row: remove "or when the recipe is missing" (or clarify that `slots.consultant` is required in machine `config.yaml`).
- `skills/watch-issues/SKILL.md`:
  - `## Consult` (`- Open:`): remove the missing-`slots.consultant` notify-only sentence.
- *(Note: `tests/command-reference.test.ts` and `tests/docs-links.test.ts` check `docs/reference/commands.md` and Markdown links — keep verb table shape and anchors intact.)*

---

## 4. Practitioner questions

1. **Pre-landing N1 check:** Before landing on `main` (direct route, S5b), what exact check confirms N1 is done — e.g., verifying `slots.consultant` is present in `~/.akrogon/config.yaml` and passes `bun src/akrogon.ts config` from the direct worktree before push?
2. **Error format on missing `slots.consultant`:** Is `readGlobal()`'s existing `Invalid <file>: <ZodError>` (consistent with missing `slots.a`/`slots.b`, Option 2A) acceptable, or does anything rely on the literal dotted string `slots.consultant` in stderr?
3. **`tests/e2e/kinds.e2e.ts`:** Confirm updating its standalone `config.yaml` fixture alongside unit tests so `bun run typecheck` and future e2e runs stay clean (no paid run needed, S7a).

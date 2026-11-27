# Territory map, slot D: consultant-recipe

Small fix, one real fork. Everything below cites the live checkout, 2026-11-25.

## F1. How the gap works today

- `globalSchema` in `src/config.ts` makes `slots.consultant` a `slotConfigSchema.optional()` beside required `a` and `b`. Its `superRefine` already validates a present consultant's harness against `harnesses`, so validity of a supplied recipe is solved; only absence is unhandled.
- The only consumer is `case 'seat'` in `src/akrogon.ts`: `readGlobal()`, then it throws an actionable one-liner when `global.slots.consultant` is undefined. The throw happens only at consult time, inside a watch turn.
- Nothing writes the key. `init` in `src/init.ts` calls `readGlobal()` first and later rewrites the machine config by spreading the parsed global, so it preserves but never seeds. `migrateStateHome` in `src/state-home.ts` copies the old config minus retired `paid_budget`. No code or skill I found creates a first machine config at all (`src/install.ts` also starts from `readGlobal()`); the file is operator-written from `docs/reference/config.md`.
- The prior optional shape was an A autopilot pick (`issues/chart/watch-consultants/forks/fix-and-config.md` items 6, 7, 7'), not an operator answer, so reversing it breaks no lock. Item 7 deliberately chose exit-nonzero plus watch notify-only, which is exactly the silent stall #159 reports.
- The watch consumer is `## Consult` in `skills/watch-issues/SKILL.md`: a missing-recipe start failure keeps the notify-only outcome, one non-attention notice per watch. `consults.ts` in `skills/watch-issues/scripts/` runs `akrogon seat --watch-consultant` in its `start` path and calls `akrogon config` earlier, in `repoConfig`, for the signature gate.

## D1. Where the missing key is refused (the material fork)

- O1. Schema: make `consultant` a required `slotConfigSchema` in `globalSchema` (`src/config.ts`). Every command that calls `readGlobal()` then refuses a config without it, which is nearly all of them (`next`, `phase`, `land`, `park`, `pause`, `flaky`, `install`, the config printer itself, all via `readGlobal` in their modules). Removes the whole class, including key removal after watch start, and matches the Taken account ("gives up tolerance of configs without the key"). Breaks: a machine that never uses watch loses every akrogon command until it invents a recipe for a feature it does not run, and `akrogon config` can no longer be used to inspect the broken config it refuses. Invites: any future machine-level slot kind added the same way is another breaking config change for every install.
- O2. Watch-side preflight: keep the key optional, refuse (or notify) when watch starts or on each tick, e.g. in `skills/watch-issues/scripts/start.ts` or via the `akrogon config` call `consults.ts repoConfig` already makes. Blast radius stays inside watch. Breaks/invites: watch has no single product entry point, it is a skill-driven session, so the check lives in skill code that must duplicate schema knowledge and can be bypassed by any other caller of `akrogon seat --watch-consultant`; a key removed mid-watch is only caught if the check runs per tick, and the config still calls itself valid everywhere else. This is two mechanisms where O1 is one.
- O3. Provisioning only: seed or prompt at install/init, schema unchanged. There is no machine-config creator to seed into (F1), `init` in `src/init.ts` refuses to run before a valid global config exists, and existing machines like this one get nothing. Does not remove the class.
- O4. Warning only, e.g. `akrogon config` notes the absence. Nobody reads warnings unattended, which is the failing situation. Rejected by S1a/S2a.

My lean is O1, with eyes open about the blast radius: it is the only option where "config parses" and "watch can always consult" become the same statement, and this product has one operator class, not a fleet of non-watch installs to protect.

## D2. How the refusal reads (only live under O1)

- O1. Plain required field. `readGlobal()` in `src/config.ts` rethrows the zod failure prefixed `Invalid <file>:`, with the zod issue naming the `slots.consultant` path. Meets tests that assert the stderr contains `consultant`, which is the current assertion style in `tests/config.test.ts` ("config refuses a machine slots.consultant...") and `tests/watch-consult.test.ts` ("without slots.consultant exits non-zero naming the key").
- O2. Keep the field optional in the schema and throw a curated error in `readGlobal()` with the exact YAML to add. Same enforcement, better message, worse honesty: the `GlobalConfig` type keeps saying optional, so every consumer keeps an undefined branch for a state that cannot occur, against the make-illegal-states-unrepresentable rule.
- O3. Required field plus a `superRefine`-style curated message for an absent key. Only worth it if the raw zod message for a missing required property turns out not to name the path clearly in this zod version; a test asserting the message contains `slots.consultant` settles that for free.

## Pitfalls over the change's lifetime, and what removes each

- P1. Landing order. Deploys are automatic on merge (`docs/reference/releases-and-updates.md`, "What starts a deploy"). Under O1, if the leaf lands before N1 puts the key in the live config, the installed command breaks on every verb while leaves and a watch are running, including the `akrogon notice` a watch would use to report it. S5b already takes the cure: landing waits on N1, and the merge seat should verify N1's done-check (`akrogon config` prints `consultant:`) immediately before landing, not trust an earlier check.
- P2. Dead branches left behind. Under O1, the undefined check in `case 'seat'` (`src/akrogon.ts`), the conditional spread in the config printer (`src/config.ts`), and the `slot !== undefined` guard for the consultant in `globalSchema`'s `superRefine` all become unreachable. Leaving them teaches the next reader the key is still optional. Remove them in the same change; the `GlobalConfig` type flows from the schema, so typecheck finds stragglers.
- P3. Test fixtures are the hidden blast radius. `fixture()` in `tests/helpers.ts` writes a machine config with only `slots.a` and `slots.b`; under O1 most of the suite fails until that one place grows a fake consultant recipe. Direct `globalSchema` uses (`tests/config.test.ts` run_root `machine` objects, `tests/leaf-slices.test.ts`, `tests/pull.test.ts`) need the same addition where they build a config from parts. One central fixture change plus a grep for `globalSchema` removes this; expect a long red list if it is done test by test.
- P4. The missing-recipe test changes nature. "seat --watch-consultant without slots.consultant..." in `tests/watch-consult.test.ts` uses a real hc core and a helper that deletes the recipe from the fixture config. Under O1 that config no longer parses, the seat command fails in `readGlobal()` before any hc work, and the cheap home for the proof is `tests/config.test.ts` beside the existing consultant refusal tests. Keep one hc-core test only for a behavior that still needs a terminal; the refusal no longer does.
- P5. Skill text that becomes unreachable, not just wrong. The missing-recipe notify-only sentence in `## Consult` (`skills/watch-issues/SKILL.md`) describes a state O1 deletes. S6a says fix it in the same change; remove the sentence rather than reword it, or future watchers will plan around a path that cannot occur. Long-lived watchers already running keep their loaded prompt, which is harmless: their next consult either works (N1 done) or fails on an invalid config, a different and louder error.
- P6. First-install onboarding is undocumented territory. Since nothing creates the machine config (F1), a required key makes `docs/reference/config.md` the provisioning step. Its `slots` table row and the `# Optional:` example comment must stop saying optional in the same change, or the docs will keep producing invalid configs by hand.

## Surfaces the change must touch (under O1)

- `src/config.ts`: `globalSchema` slots shape, `superRefine` named-slot guard, config printer conditional spread.
- `src/akrogon.ts`: the now-dead recipe-undefined throw in `case 'seat'`.
- `tests/helpers.ts`: `fixture()` machine config gains a fake consultant recipe.
- `tests/config.test.ts`: new refusal proof for a config with no `slots.consultant` (red first: it parses today), `machine` objects in the run_root schema tests; existing "loads and prints" and bad-harness consultant tests should pass unchanged.
- `tests/watch-consult.test.ts`: the missing-recipe test removed or reduced per P4; the recipe helper's remove path may become unused.
- `tests/leaf-slices.test.ts`, `tests/pull.test.ts`: only if their `globalSchema` inputs omit the key.
- `docs/reference/config.md`: `slots` row and example comment. `docs/reference/commands.md`: the `seat` row's "refused ... when the recipe is missing" wording.
- `skills/watch-issues/SKILL.md`: `## Consult` missing-recipe sentence (P5).
- Not touched: `src/init.ts` and `src/state-home.ts` writers (both spread the parsed global, so a required key round-trips), `seats()` in `src/config.ts` (a/b resolution only), repo and ISSUE.md slot schemas (consultant already refused there, with tests).

## Q. Practitioner questions

- Q1. Under O1, is it acceptable that `akrogon config` itself refuses the broken config, so the operator edits `~/.akrogon/config.yaml` blind and re-runs to check? If not, the alternative is a config command that prints the diagnosis instead of the config, which is a second behavior to design.
- Q2. Who verifies N1 at the landing gate, given the leaf's own checks run against fixture configs and cannot see the live file (P1)?
- Q3. Must the stalled real case (`footer-claude-format-1`, opens fine on the next tick once N1 lands, even on today's code) actually resume before #159 is treated as closed, or do the free tests plus N1 close it? S7a says free tests; the case resuming is free corroboration either way.

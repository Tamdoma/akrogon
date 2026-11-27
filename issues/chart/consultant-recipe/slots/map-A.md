# Map A: consultant-recipe

## Forks

F1 Where a missing `slots.consultant` is refused.
- a: `globalSchema.slots.consultant` required like `a` and `b` (`src/config.ts` globalSchema). Every `readGlobal()` throws `Invalid <home>/config.yaml: ... slots.consultant ...` (readGlobal prefixes the path). Removes the class: no valid config lacks the key. Deletes the dead `recipe === undefined` throw (`src/akrogon.ts` case 'seat'), the conditional spread in the config printer (`src/config.ts` printer `global.slots.consultant === undefined`), the `named` optional handling stays harmless. Breaks: every akrogon command on any machine without the key, until edited (S5 b sequences landing after N1). Invites: nothing new.
- b: preflight in `skills/watch-issues/scripts/start.ts` refusing watch start without the recipe, schema stays optional. Adds code; the schema/seat contradiction stays; a hand-edit after watch start still stalls at the first case. Does not remove the class.
- c: init/install seeds a recipe. A default recipe = fallback (S2 a refuses); existing configs untouched.
Pick: a (S1, S2, removing over adding).

F2 What happens to the watch skill's missing-recipe notify-only path (`skills/watch-issues/SKILL.md` `## Consult`, Open bullet). Under F1a the start can never fail for a missing recipe (readGlobal fails first, for the watch's own commands too). The sentence becomes false: remove it. Any other failed start keeps today's rule.

## Surfaces

- `src/config.ts`: drop `.optional()`; printer always prints consultant (simplify the conditional spread).
- `src/akrogon.ts`: `recipe: SlotConfig = global.slots.consultant`, delete the throw.
- `tests/helpers.ts` fixture config: add a consultant recipe (fake harness) so every fixture stays valid; other tests writing their own machine config (tests/init.test.ts, state-home.test.ts, install.test.ts, config.test.ts, readiness/status/next, e2e files) need the key where they write `slots:` from scratch.
- `tests/watch-consult.test.ts`: the "without slots.consultant exits non-zero" test changes to the refusal now coming from config load (still names `slots.consultant` and `config.yaml`, starts nothing); `setConsultant(f, undefined)` callers adjust.
- `tests/config.test.ts`: a config without the key is refused naming `slots.consultant`.
- `docs/reference/config.md` slots row and example ("Optional"), `docs/reference/commands.md` seat row ("or when the recipe is missing").
- `src/state-home.ts`: migration copies the old config verbatim; an old keyless config is then refused at first load, loud, naming the key. No change.
- `src/init.ts`: writes `{...global}` from the parsed config, so the required key is preserved. No change.

## Pitfalls

- P1 Auto-deploy breaks the installed command while leaves run: removed by landing only after N1 is supplied (S5 b).
- P2 Fixture sprawl: one `tests/helpers.ts` fixture covers most; tests writing a config from scratch fail loudly in `bun test`, so the checks find each one.
- P3 e2e configs (tests/e2e/*.e2e.ts) are not in `checks`; grep them for `slots:` written from scratch and add the key, or they break the next live run.
- P4 The `named` superRefine harness check still covers consultant; keep.

## Practitioner questions

- Does any code path build a GlobalConfig without parsing (type change ripples)? `GlobalConfig` is inferred from the schema; typecheck finds every place.

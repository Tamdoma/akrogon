# Merged notes: refusal-boundary (from map-A/B/C/D, each written blind)

## Q1 Where is a config without slots.consultant refused?
- O1 schema-required in `globalSchema` (`src/config.ts`): every `readGlobal()` refuses, including watch scripts via `akrogon config`, `notice`, `rollback`, `install`, `init`. Removes the class, incl. a key lost after watch start. Cost: wide fixture edits; every keyless machine loses every command until edited. (A,B,C,D)
- O2 watch-start preflight (`skills/watch-issues/scripts/start.ts`): smaller blast radius; class survives mid-watch, second mechanism beside the schema. Rejected. (A,B,C,D)
- O3 provisioning/seeding at install/init: fallback (S2a), no machine-config creator exists (`src/install.ts`, `src/init.ts` start from `readGlobal`), existing machines untouched. Rejected. (A,B,D)
- O4 warning or louder notice only: stall stays. Rejected. (B,D)

## Q2 How does the refusal read, and what happens to the seat-level throw?
- Plain required field; `readGlobal` already prefixes `Invalid <file>:`; same form as a missing `slots.a`/`slots.b`. Delete the unreachable `recipe === undefined` throw in `src/akrogon.ts` case 'seat'. (A,C,D; B on the throw)
- Curated message or dotted-path formatting in `readGlobal`: widens scope (S3a) or adds a second statement of requiredness. Rejected. (C 2B rejected by C; D O2/O3 only if the plain message fails to name the path)
- Evidence, A probe 2026-11-25 (zod in repo, `bun -e`): a missing required key prints `"path": ["slots","consultant"]` and `expected object, received undefined`. It names both parts but never the literal `slots.consultant` (C pitfall confirmed). Tests assert `config.yaml` and `consultant`, not the dotted literal.

## Q3 Watch skill missing-recipe notify-only sentence (`skills/watch-issues/SKILL.md` `## Consult`, Open)
- Delete it; it becomes unreachable and its `akrogon notice` would itself fail at `readGlobal`. Generic failed-start rule stays. (A,B,C,D)

## Surfaces (union)
- `src/config.ts`: schema `.optional()` dropped; `superRefine` `named` consultant guard simplifies (D); config printer conditional spread becomes plain (A,B,C,D).
- `src/akrogon.ts` case 'seat': dead throw removed (A,B,C,D).
- Tests: `tests/helpers.ts` `fixture()` gains a fake consultant (A,B,C,D); `tests/config.test.ts` new refusal test red on base, run_root `machine` objects, the `toEqual` on printed slots (C); `tests/watch-consult.test.ts` missing-recipe test; standalone configs in `install`, `leaf-slices`, `pull`, `readiness`, `state-home`, `init`, `next`, `status` tests and e2e files incl. `tests/e2e/kinds.e2e.ts` (B,C,D); typecheck finds type stragglers (A,D).
- Docs: `docs/reference/config.md` slots row and example (A,B,C,D); `docs/reference/commands.md` seat row (A,B,C,D); `docs/start/install.md` minimal config and slots bullet (B,C).
- Skill: `skills/watch-issues/SKILL.md` sentence (A,B,C,D).
- No change: `src/init.ts`, `src/state-home.ts` (round-trip the key), repo/index slot schemas (A,B,C,D).

## Pitfalls
- P1 Landing before N1 breaks every installed verb incl. `akrogon rollback` (C) and `notice` (C,D): land only after N1, re-checked by `akrogon config` immediately before push (D). (A,B,C,D)
- P2 Fixture sprawl: central fixture first, then `bun test` + typecheck list the rest. (A,B,C,D)
- P3 Fresh installs from `docs/start/install.md` would fail: add the key there. (B,C)
- P4 `akrogon config` cannot print a config it refuses; the error names file and path, operator edits and reruns. Accepted. (D Q1)
- P5 Rollback past 2026-11-21 meets a strict schema without the key; an older binary's rewrite could strip it, the only mechanical disappearance hypothesis. Pre-existing, Off route note. (B)

## Points where slots differ
- `tests/watch-consult.test.ts` missing-recipe test: remove and prove refusal in `tests/config.test.ts` (D); keep it with `setConsultant(f, undefined)` asserting the load refusal (B,C). A leans D: the refusal no longer needs an hc core.
- `superRefine` consultant guard simplification: D only.

# Refusal boundary for a missing slots.consultant

## Question

- Q1 Where is a machine config without `slots.consultant` refused: global schema (a), watch-start preflight (b), provisioning seed (c), warning only (d)?
- Q2 How does the refusal read, and what happens to the seat-level missing-recipe throw?
- Q3 What happens to the watch skill's missing-recipe notify-only path?

### Carries

- Signposts: forks/signposts.md (S1a, S2a, S3a, S4a, S5b, S6a, S7a).
- Earlier A autopilot pick, not an operator answer: issues/chart/watch-consultants/forks/fix-and-config.md items 6, 7, 7' (optional key, notify-only on absence). Superseded here.

## Findings

Merged notes: slots/refusal-boundary-merged.md (maps slots/map-A.md, map-b.md, map-c.md, map-d.md, each blind). Rebuttals: B none, D none, C one (pre-push check, adopted below).

Research: better-than-training · inspected code 2026-11-25: `src/config.ts` `globalSchema`, `readGlobal`, `effectiveConfig`; `src/akrogon.ts` case 'seat'; `skills/watch-issues/SKILL.md` `## Consult`; `docs/reference/releases-and-updates.md` "What starts a deploy" · the key has one consumer and auto-deploy follows landing · decided the boundary and the landing gate. No outside source applies: the question is this repo's own config contract.

## Charting proofs

- 2026-11-25, free, A: `bun -e` in /home/ivan/Work/infra/akrogon with the repo's zod, parsing `{slots:{a:'x'}}` against a strict schema requiring `slots.consultant`. Identity: local user, no outside system. Result: throws with `"path": ["slots","consultant"]` and `expected object, received undefined`. Cleanup: none needed, no files. Limits: proves zod's message names the path parts in this version; does not prove the full `readGlobal` output, which the leaf's own test shows.

## Taken

A's pick under full autopilot, 2026-11-25T14:10Z (not operator words). Decided by S1a (remove the class), S2a (no fallback), S5b (land after N1), S6a (docs in the same change), S7a (free tests).

1. Q1 a: `globalSchema` in `src/config.ts` requires `slots.consultant` exactly like `a` and `b`. Every `readGlobal()` refuses a config without it. (A,B,C,D)
2. Q2: the refusal is the plain schema error `readGlobal` already prints, `Invalid <home>/config.yaml: ...` with the path `slots`, `consultant`; no curated message. The unreachable `recipe === undefined` throw in `src/akrogon.ts` case 'seat' is deleted; the `effectiveConfig` conditional spread and any `superRefine` undefined guard for the consultant become plain. (A,B,C,D)
3. Q3: the missing-recipe notify-only sentence in `skills/watch-issues/SKILL.md` `## Consult` Open bullet is deleted; the generic failed-start rule stays. (A,B,C,D)
4. Tests: `tests/helpers.ts` `fixture()` and every machine config a test builds from scratch carry a fake consultant recipe; a new `tests/config.test.ts` case shows a config without the key is refused naming `config.yaml` and `consultant` (red on base); the hc-core missing-recipe test in `tests/watch-consult.test.ts` is removed because the refusal no longer needs a terminal (D, A; B agrees it is cleaner; C kept it).
5. Docs: `docs/reference/config.md` slots row and example, `docs/reference/commands.md` seat row, `docs/start/install.md` minimal config and slots bullet say the key is required. (A,B,C,D; install.md B,C)
6. Landing gate (C rebuttal, adopted): immediately before push, `bun src/akrogon.ts config` run from the implementation worktree against the real `~/.akrogon` (no `AKROGON_HOME` override) exits 0 and prints `consultant:` under `slots:`. The installed `akrogon config` does not count: it still runs the old optional schema and passes a keyless config.

Rejected: b watch preflight (class survives a key lost mid-watch, second mechanism), c seeding (a fallback recipe the operator did not pick, no config creator exists), d warning (nobody reads it unattended), curated or dotted error text (widens scope, second statement of requiredness).

Standing dissent: none.

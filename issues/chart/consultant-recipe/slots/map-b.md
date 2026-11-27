# Map B: consultant-recipe

Blind consultant map, slot B, 2026-11-25. The defect is a schema/usage mismatch: `slots.consultant` is `.optional()` in `globalSchema` (`src/config.ts:26`) while `akrogon seat --watch-consultant` hard-requires it (`src/akrogon.ts` case 'seat', the `recipe === undefined` throw). Nothing seeds the key: not install docs, not `init.ts`, not `migrateStateHome`. The watch skill converts the first missing-recipe failure into one non-attention notice per watch and a permanently jammed leaf (`skills/watch-issues/SKILL.md` `## Consult`, the "start failing for a missing `slots.consultant` recipe" sentence). Signposts are taken: fail loudly (S2a), no fallback, scope only this key (S3a), operator picks the recipe (S4a), heal-then-enforce ordering (S5b), docs in the same change (S6a), free tests (S7a).

## F1. Enforcement boundary — the chart's core fork

### O1. Schema-required: drop `.optional()` on `slots.consultant` (recommended)

Mechanism: `src/config.ts:26` `slotConfigSchema.optional()` → required. The existing `superRefine` already validates the harness reference, so no other schema code changes. `src/akrogon.ts`'s missing-recipe throw becomes unreachable; remove it and keep the HC_TERMINAL_ID guards.

Why it removes the class rather than guarding it: the class is "a config that satisfies the schema but cannot serve a feature that assumes it." Only the schema can express "this key is part of a valid machine config." Every load (`readGlobal`, `src/config.ts`) then validates it, for every present and future consumer, with one rule in one place. Detection time becomes first-command-after-the-break, which also covers the keys-can-disappear reality the intake documents: whoever or whatever removes the key, the very next akrogon command says so, instead of the damage surfacing weeks later inside an unattended watch.

What it breaks or invites later:
- Every keyless machine breaks every akroven command at once, not just watch use. On this host that is exactly why N1 gates landing (S5b). For any future machine, the install flow must produce the key from day one (docs surface below) or the very first command fails — meaning the install docs edit is not cosmetic but load-bearing for the enforcement choice.
- `tests/helpers.ts` `fixture()` writes machine configs without the key; roughly 46 `slots:` blocks across the test corpus (`config.test.ts` 32, `next.test.ts` 5, `init.test.ts` 4, others), plus fixture-writing helpers, must gain a consultant entry or large parts of the suite refuse at parse. This is the dominant cost of O1, mechanical but wide. Mitigation: add the key once in `fixture()`'s yaml and in the few hand-rolled machine configs; the intentional missing-key test fixtures shrink to the one negative test.
- The missing-recipe negative tests (`tests/config.test.ts` schema-refusal family, `tests/watch-consult.test.ts` the `setConsultant(f, undefined)` removal path) need reshaping: the seat-level missing-recipe case can no longer exist, so those tests move up to the schema layer (config load refusal naming `slots.consultant`).
- Invites later: any future optional-and-consumed config key invites the same class; the fix sets the precedent "consumed means required," which is the right invariant but worth stating in docs so the next key does not reintroduce the gap.

### O2. Validate at watch start (refuse `watch-issues` start without the key)

`skills/watch-issues/scripts/start.ts` checks the recipe before starting the timer; the seat command stays the loud backstop. Blast radius confined to the feature. Cheaper: no schema change, most fixtures untouched.
Why weaker: the class survives outside watch start. A mid-watch key deletion (the documented disappearance pattern!) is discovered only at the next consult trigger — exactly today's failure shape, one level up. And every future consumer of the key needs its own validator. It is a guard beside the mechanism, not a fix of it; S1a and the operator's removing-over-adding value cut against it. Rejected.

### O3. Upgrade the notify-only outcome to attention-level noise, nothing else

Makes the stall visible but leaves the stall. The destination is not "the operator learns about the stall faster," it is "a config without the key can no longer pass silently" — visibility-only does not reach it. Rejected.

### O4. Seed a default recipe (install or init writes one)

Signpost S2a (no fallback) plus S4a (only the operator picks the model that acts unattended with cost) kill this. Rejected; noted because the intake's "reasonable shapes" listed it.

## F2. Who must produce the key for a fresh machine (the provisioning half)

Enforcement without provisioning recreates the defect at install time: the first command on a new machine fails with "missing slots.consultant" and the user learns the requirement only from the error. This is acceptable *if and only if* the onboarding path already walks the user through writing the key. Surfaces:
- `docs/start/install.md:43-56` shows the initial `config.yaml` example with only slots a/b — under O1 this example produces a broken install. Must gain the consultant line and one sentence (S6a makes this in-scope).
- `docs/reference/config.md` machine config section: the `slots` row and the YAML example both call it "Optional" — must flip (S6a).
- `skills/init-akrogon/SKILL.md` never mentions the consultant key. Under O1 an operator initializing on a fresh machine hits the wall regardless; the skill's proposal flow does not need to scaffold it (it writes repo config, not machine config), but the gap is worth one line if it references machine config at all. Check at build time; small.
- `src/init.ts` and `src/state-home.ts` write machine config. Neither can invent the recipe (S4a), so neither seeds it — correct under the signposts. Their preserving behavior is fine: `init.ts` spreads the parsed object, so schema-known keys survive rewrites; only genuinely unknown keys are stripped, which is intended strictness.

## F3. Landing order and the live machine (S5b already answers; the mechanics)

- N1 (operator adds the key) must be verified done before merge, because landing auto-deploys (`docs/reference/releases-and-updates.md` "What starts a deploy"). `akrogon config` printing a `consultant:` entry is the done test — already in the signposts' needs row, correctly.
- Sequencing subtlety a practitioner hits: the leaf's own verify runs the suite in a checkout where fixtures carry the key, so the suite is green regardless of the live machine config. Nothing in the leaf gates on N1 — the gate is the merge-turn ordering, owned by the door/merge, not by done-criteria. Worth one line in the brief so the implementer does not try to encode it in tests.
- The stalled pi-extensions consult case (`footer-claude-format-1`) resumes as soon as the live config carries the key — no code dependency. N1 heals it even before the leaf lands; the leaf then prevents recurrence. This means the operator gets immediate value from the manual step, a good property to state in the handoff.

## Surfaces the change touches (O1)

1. `src/config.ts` — `globalSchema` `slots.consultant` required (one-word change). Nothing else: the harness cross-check in `superRefine` already iterates `config.slots.consultant` conditionally and needs no edit beyond the type becoming non-optional.
2. `src/akrogon.ts` case 'seat' — remove the now-unreachable missing-recipe throw; keep the flag-conflict and terminal guards. Alternative acceptable shape: keep the throw as defense-in-depth — but unreachable code is precisely the kind of dead guard removing-over-adding cuts; remove.
3. `tests/helpers.ts` `fixture()` — add consultant to the machine config yaml (one line, covers most of the suite).
4. `tests/config.test.ts` — the consultant schema tests (lines around the existing recipe-refusal family at 334-405) flip from optional-shape to required-shape; the missing-key case becomes a load-refusal test; plus each hand-written machine config gains the key (~32 slots blocks, most through shared helpers).
5. `tests/watch-consult.test.ts` — the missing-recipe removal path (`setConsultant(f, undefined)`) can no longer produce a keyless config that parses; the test using it reshapes to assert the config load refusal instead of the seat-level failure. `setConsultant` itself stays useful for recipe variation.
6. Other fixture-owning test files (`next.test.ts`, `init.test.ts`, `install.test.ts`, `readiness.test.ts`, `state-home.test.ts`, `status.test.ts`, `hc-fixture.ts`) — same one-line additions where they write machine config.
7. `docs/reference/config.md` — `slots` row and example: optional → required; the "Optional" comment line in the YAML example.
8. `docs/reference/commands.md` `seat` row — "refused … when the recipe is missing" becomes a config-load refusal phrasing, since the seat command can no longer be the place it is missing.
9. `docs/start/install.md` — the initial config example and the bullet explaining slots; add the consultant line and the why (it acts unattended at machine cost).
10. `skills/watch-issues/SKILL.md` `## Consult` Open sentence — the notify-only missing-recipe path ("a start failing for a missing slots.consultant recipe means …") becomes unreachable under O1; delete it and let the generic "any other failed start" path govern. This deletion is the behavioral heart of the destination — the permanent-dead-end state stops existing. Note: the deletion is text only; no script changes — `consults.ts` never special-cases the missing key (checked: `startConsultant` just runs the seat command and propagates its exit).
11. `tests/watch-issues-scripts.test.ts` / skill script tests — grep for anything asserting the notify-only missing-recipe wording (checked: the notify-only path is skill-text behavior, not script logic; the scripts have no missing-recipe branch).
12. Chart Off route: the key-disappearance cause (unknown), per-key writer audit, other optional keys — recorded, not built (S3a).

## Pitfalls over the change's lifetime, and what removes each

- P1. A missing-key config makes even recovery commands fail: under O1, on a machine whose config loses the key, `akrogon` cannot even print the error-free `config` output to inspect itself. Mitigation: the parse error names the missing key and the file path (zod issue path `slots.consultant` surfaces in `readGlobal`'s rethrown message) — verify in the negative test that the message names both, since it is now the primary repair instructions. This is a done-criterion candidate.
- P2. Old installed releases pruned: `~/.akrogon/releases/` currently holds only post-2026-11-21 builds (all have the consultant schema). A rollback across the key-introduction boundary would run a binary that does not know the key — harmless backward (old schema accepts extra key? No: strict schema refuses unknown keys — a pre-consultant binary refuses a config carrying `slots.consultant`!). Checked: `globalSchema` is `z.strictObject`, so a config with the key is *invalid* for any release predating de177ce1 (2026-11-21). This is a pre-existing rollback hazard the change does not worsen but the operator should know: rollback past 11-21 requires editing the key out. Belongs in the chart's notes, not in scope. Also the live strip mechanism: an old binary's `init` rewrite would drop the key silently — same boundary, same note. This is also the only mechanically supported disappearance hypothesis anyone has produced: `init`/migration rewrite by a binary whose schema lacks the key drops it without a word. On this machine the releases directory cannot confirm it (pruned), but the mechanism is real and the chart's Off route should carry it as the leading suspect rather than "unknown."
- P3. `harnesses` reference: a required consultant whose harness entry is missing fails at load too — already covered by the existing `superRefine` (tested at `tests/config.test.ts:361`); no new work, but the example configs in docs must keep the harness entry beside the recipe or the docs produce a broken config. S6a covers it.
- P4. The repo-level `slots` override (`repoSchema` `.optional()` a/b only, `tests/config.test.ts:405` refuses consultant in repo config) stays a/b only — correct: the recipe is a machine-level cost decision. No change; do not "fix" it in passing.
- P5. zod `.strictObject` on slots: the slots object itself is strict (a/b/consultant only). Making consultant required does not affect unknown-key rejection. No work.
- P6. `--watch-consultant` conflicts validation ordering: the flag-conflict throws run before `readGlobal` today; after O1 the ordering barely matters, but the negative tests should still exercise the conflict path with a valid config, not a keyless one, or they will test the wrong error.

## Practitioner questions

- Q1. Does the destination consider the key required *for machines that never run a watch*? Yes under O1: the schema cannot express conditional requirement, and the cost is one YAML stanza. This is the one place a narrower machine (dev box, CI) pays for a feature it may not use — acceptable, one line, and the uniform rule is the point.
- Q2. Should `akrogon config` output shape change? No: it already prints consultant when present (`tests/config.test.ts:334` proves); required-key only means it is always present.
- Q3. Any consumer other than the watch? Door consultants use per-launch `--harness/--model/--effort` flags (`skills/chart-issues/SKILL.md`), never `slots.consultant`; the key has exactly one consumer. Confirmed by grep across `src/` and `skills/`.
- Q4. Does anything else read `slots` loosely (index front matter)? `indexSchema` in `src/config.ts` allows a/b only — unaffected.
- Q5. Should the error suggest the fix? Yes — P1 makes the parse error the repair path; it should name the key, the file, and ideally point at `docs/reference/config.md`. Check whether `readGlobal`'s rethrow already includes the file path: it does (`Invalid ${file}: ...`), and zod includes `slots.consultant` in the issue path. The negative test should pin both.

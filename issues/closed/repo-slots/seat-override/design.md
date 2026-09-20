# Design: seat-override

## Binding decisions, verbatim
Q1 "1a" (2026-09-20). Whole seat: a repo seat is a complete {harness, model, effort}. Reason: reuses the existing triple schema and one lookup, avoids a harness swap inheriting a foreign model. Foreclosed: field-level merge.
Q2 "2a" (2026-09-20). Selection only: a repo picks harness, model and effort from the global `harnesses` registry. Reason: nothing new in the launch path. Foreclosed: per-repo launch templates or flags.
Locks: repos without the field behave exactly as today; no new phase, command, watcher or file; harness templates, Herdr integration install, max_active and toolkits stay global; override applies at next agent start, running seats untouched.

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: no auth, secrets or browser flow here. Negative tests are mandatory (criterion 7). The user-visible flow is `akrogon config` and dispatch launch; the verification commands are the test files named in the criteria, which leave test output as the artifact. Leaf work is agent-owned; no human prerequisite.

## Leaf architecture
Owned: `src/config.ts` (schema field, resolver, effectiveConfig printing merged seats), `src/next.ts` (launch via resolver, pre-allocation refusal), `src/init.ts` (resolver call before checkGrounding/write), `tests/config.test.ts`, `tests/init.test.ts`, `tests/next.test.ts`, `skills/init-issues/SKILL.md`, `README.md`, `docs/guide/setup.md`, `docs/guide/cheat.md`, `src/AREA.md`, `docs/reference-index.md` if a pointer changes.

Interfaces:
- `repoSchema.slots: z.strictObject({ a: slotConfigSchema.optional(), b: slotConfigSchema.optional() }).optional()`.
- `export function seats(global: GlobalConfig, repo: Repo): { a: SlotConfig; b: SlotConfig }`: `repo.config.slots?.a ?? global.slots.a`, same for b; throws `Error` with message naming `repo.name`, the seat letter and the missing harness key when the chosen harness is not in `global.harnesses`.
- `launch(global, repo, slot)` reads `seats(global, repo)[slot === 'A' ? 'a' : 'b']` (B: `Slot` is uppercase at src/routing.ts:14, the resolver keys are lowercase) and keeps the template fill, quoting and first-token check unchanged.
- `effectiveConfig` prints `slots` as the resolver result when inside a repo; outside a repo it prints global seats.
- `initialize` calls `seats(global, { name, root, config })` before `checkGrounding` so a bad harness fails before any write.
- `akrogon next` calls the resolver when it reads the repo, before allocation.

Exclusions: no change to `src/install.ts`, `globalSchema`, harness templates, routing, or any file under `issues/`. No provider or model validation. No restart of running seats. No field-level merge.

Dependencies: none.

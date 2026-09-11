# Plan: dead-fields

Remove the unused top-level state fields `priority` and `slot`. Existing YAML remains readable, and its next normal save removes those fields.

## Read first

Paths below are relative to `/home/ivan/Work/infra/akrogon/issues/worktrees/dead-fields`, except the authoritative leaf files.

- `/home/ivan/Work/infra/akrogon/issues/open/loop-hardening/lifecycle-records/dead-fields/brief.md`
- `/home/ivan/Work/infra/akrogon/issues/open/loop-hardening/lifecycle-records/dead-fields/design.md`
- `REFERENCE.md` and `learnings/LESSONS.md`
- `src/state.ts`, `src/next.ts` (`dispatchSlot`), `src/status.ts`
- `tests/helpers.ts`, `tests/status.test.ts`, `tests/next.test.ts`
- `skills/chart-issues/assets/shapes.md` and `skills/chart-issues/SKILL.md`
- `src/akrogon.ts` and `package.json` for invocation and checks.

The leaf has `debate: no`. This is direct synthesis, with no positions or rebuttals expected. The live checkout already contains failure notification and busy-seat fields. Preserve them.

## Decisions

- **D1 — Canonical state.** Delete `priority` and top-level `slot` from `stateSchema`. Keep its strict unknown-key rejection and existing refinements. Keep the inferred `State` type and existing `readState(path): State` / `saveState(path, state): void` interfaces.
- **D2 — Read-time migration.** In `readState`, omit exactly the two legacy top-level keys from parsed YAML before `stateSchema.parse`. Use a small boundary operation that preserves every other key for strict validation and leaves invalid non-object input invalid. Do not use a permissive schema that silently drops all unknown keys, add a generic migration framework, or change nested slot-indexed data. Legacy values themselves are ignored regardless of their former validity. Reading never writes. Existing `saveState` writes the canonical `State` returned by the reader without additional migration logic.
- **D3 — Writers and consumers.** Remove the shorthand `slot` property from the attempt object in `dispatchSlot`, currently near line 371. Preserve its attempt counter, session guard and dispatch behavior. Remove `priority` from the shared fixture writer. Status detail already serializes `readState` output, so removal follows from D2 without a separate output filter. Retain CLI `--slot`, prompt slot arguments, lifecycle `Slot`, configuration seat iteration, per-seat maps, warnings, verdicts and history log records.
- **D4 — Creation guidance.** Remove the priority template entry, the “Priority is h/n/l” explanation and priority in the handoff batch sentence. Remove top-level `slot` from the list of command-authored state fields in shapes.md. Keep unrelated guidance unchanged.
- **D5 — Migration scope and contract notes.** The design's specific Leaf architecture and the brief require lazy migration and prohibit bulk edits under `issues/`. Follow that explicit architecture over the older copied resolution demanding a bulk rewrite. The brief's literal zero-hit `priority` criterion contradicts the required reader migration and regression test. Interpret it as no active field declaration, writer, output field or creation guidance, with readable literal references allowed in migration code and migration tests. Do not obscure strings to satisfy grep. Likewise, “slot survives only” describes removal of the top-level state field, not deletion of working slot-based dispatch. These conflicts remain visible here for review.

## Acceptance criteria

- **C1 — Canonical format.** A valid new state with neither field parses and saves. Direct `stateSchema` validation rejects either removed field. All currently supported fields and defaults still work.
- **C2 — Legacy round trip.** A state containing both legacy keys reads with neither key in the returned object, leaves its file unchanged on read, and loses both keys after `saveState(path, readState(path))`. Test either legacy key alone as well as both. Valid per-seat data survives, and a second read/save yields the same canonical content. The same reader works on fixture paths under open, closed and parked without scanning or rewriting real records.
- **C3 — Strictness.** A legacy state with an additional unknown key still throws a Zod validation error identifying that key. Missing required data, an invalid known field and non-mapping YAML remain rejected. Removing retired fields must not weaken validation of the rest of the document.
- **C4 — Dispatch and creation.** Normal fixture creation and a successful real CLI `next` invocation against the existing fake-Herdr fixture leave raw state YAML without either removed field. Attempt and prompt bookkeeping retain their existing expectations. Chart creation guidance contains neither retired field as state metadata.
- **C5 — Status.** Real CLI overview and detail invocations against legacy fixtures succeed without modifying files. The detail state section omits both keys, while history retains its legitimate log `slot`. Overview still reports valid leaves. The worktree CLI also reads the registered repository's existing states successfully.
- **C6 — Gates and scope.** `bun run format`, `bun run typecheck` and `bun test` pass. Implementation diffs contain only owned source, chart guidance and tests. No bulk `issues/` edits or unrelated sibling changes occur.

## Ordered implementation checklist

1. **A1 — State boundary and fixtures, C1–C3.** Update `src/state.ts` and `tests/helpers.ts`. Add focused `tests/state.test.ts` using existing fixture/YAML helpers for canonical input, lazy migration, exact unknown-key rejection and invalid YAML shapes. Keep boundary parsing local to the reader and inspect installed Zod source if its API is needed.
2. **A2 — Dispatch and status evidence, C4–C5.** Change only the retired property write in `src/next.ts`. Extend an existing successful dispatch scenario in `tests/next.test.ts` to inspect saved YAML directly, since re-reading through the migration would hide a writer regression. Extend `tests/status.test.ts` with legacy fixtures, raw file preservation checks and assertions on the state section separately from History. Inspect `src/status.ts` but change it only if a remaining top-level field consumer is found.
3. **A3 — Door guidance, C4.** Edit `skills/chart-issues/assets/shapes.md` and `skills/chart-issues/SKILL.md` as D4 specifies.
4. **A4 — Verification, C1–C6.** Run the commands below, inspect outputs and record exit codes and evidence paths in the implementation report. Review the final diff for unwanted edits from the repository-wide formatter.

No new dependency, external interface or cross-leaf ordering is required. All steps are agent-owned.

## Concrete verification

From the worktree, first run `bun test tests/state.test.ts tests/status.test.ts tests/next.test.ts`, then the configured gates: `bun run format`, `bun run typecheck`, `bun test`.

Use the edited CLI, rather than assuming the installed binary points at this checkout, for end-to-end evidence against real registered state:

```bash
mkdir -p /tmp/akrogon-dead-fields-evidence
bun src/akrogon.ts status > /tmp/akrogon-dead-fields-evidence/status.txt 2>&1
bun src/akrogon.ts status dead-fields > /tmp/akrogon-dead-fields-evidence/detail.txt 2>&1
```

Require each invocation to exit zero and inspect both artifacts. These are read-only invocations. For fixture end-to-end evidence, retain test output from `bun test tests/status.test.ts tests/next.test.ts` at `/tmp/akrogon-dead-fields-evidence/fixture-cli.txt` with its exit code recorded. Do not replace fixture subprocess coverage with direct calls to rendering helpers.

Run `rg -n -i 'priority' src skills/chart-issues tests` and `rg -n '\bslot\b' src skills/chart-issues tests`. Review remaining matches by role using D3 and D5, not a zero-match gate. Confirm retired keys are absent from raw saved YAML, not just the migrated reader result. Use `git --no-pager diff --check`, `git --no-pager diff` and `git status --short` to verify saved files and ownership.

## Known limitations

- **R1 — Deferred disk cleanup.** Untouched legacy files retain the keys indefinitely until a normal write. Do not bulk migrate them or change lifecycle traversal to force writes.
- **R2 — Documentation outside ownership.** `docs/state.html` and `docs/create.html` still show priority in example YAML, and `docs/next.html` describes it as operator metadata. `docs/state.html` also shows top-level slot. These pages are outside the locked owned surfaces and remain unchanged in this leaf. Report these stale references at handoff.

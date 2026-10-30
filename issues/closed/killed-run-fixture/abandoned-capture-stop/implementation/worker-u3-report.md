# Worker u3 report: docs for abandoned capture pair gate

Commit: 09f2e0ec `docs: abandoned capture pair gate and cleared-<run>.md`

## Changed files and reasons

- `docs/reference/checks.md` — capture section: pair live while the wrapper or a descendant
  holding capture-out's stdout fd lives (one shared flock on the opened capture-out); abandoned
  pair blocks `akrogon phase` non-failed moves without a non-blank `cleared-<run>.md`, naming
  each pair and the clear step; `failed` move and operator recovery stay open. Error table: one
  row for the abandoned-pair refusal in existing style.
- `docs/reference/commands.md` — `akrogon phase` row: one line noting the refusal.
- `docs/reference/files.md` — new `implementation/cleared-<run>.md` row (written by the seat or
  operator after cleanup; a non-blank file releases the refusal); capture row gained the
  blocking note.
- `src/AREA.md` — run-check bullet gained the fd/shared-flock liveness clause and
  `abandonedCaptures`; the `src/phase.ts` bullet gained the `moveGuards` refusal. Line count
  unchanged (41 lines, additions inside existing lines).
- `tests/AREA.md` — the `durable-capture.test.ts` line now names
  `tests/abandoned-capture.test.ts` and its refusal/clear checks. Line count unchanged.

## Tests run

- `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts --timeout=30000`
  → `check docs-links: 0 /home/ivan/Work/infra/akrogon/issues/open/killed-run-fixture/abandoned-capture-stop/implementation/check-docs-links-1793194431453-2239912.log` (8 pass, 0 fail)
- `bun install --frozen-lockfile --backend=copyfile` → 9 packages installed (worktree lacked
  node_modules).

## Known limitations

The refusal's exact stderr prefix is not yet fixed in code (U1/U2 not landed; the test asserts
only that stderr contains each out path, err path and the `cleared-<run>.md` path). The
checks.md error-table row therefore describes the refusal by its named parts rather than quoting
a literal first words. If review needs a literal, fix it after U2 lands.

## Unverified criteria

- Criterion 1–4 (prose content): docs prose was judged against plan D8/design Q1–Q3, not executed;
  the underlying behavior lands with the other units.
- Criterion 5 verified: docs-links green, evidence above.

# Design: foreign-leaf-summary

## Binding decisions, verbatim
From `issues/chart/foreign-leaf-diagnostics/forks/mismatch-reporting.md`, operator 2026-09-19, "1a | 2a | 3a | question where is the git update on this issue where we add the second branch and ignore issues on main?":
- Q1: A. One structured line per repo per invocation naming registered key, count and each offending path with its stored key; per-leaf lines stay for other unreadable causes; exit status stays nonzero. Foreclosed: per-leaf lines for mismatches; one line per stored key.
- Q2: A. Valid leaves keep dispatching; a parsed foreign-key leaf is classified apart from unreadable state so it is reported, skipped, and does not count toward max_active; foreign leaves stay out of dispatch, cleanup and dependency lookup. Foreclosed: blocking the repo.
- Q3: A. Walk-time detection only; init unchanged. Foreclosed: registration refusal.
- Carried from CHART.md Off route: no remembered "already reported" state across passes; no deletion or relabeling of foreign files; the import mechanism belongs to the framework repo's `admin-factory-update` leaf.

Standing design: /home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: no browser or auth; the user-visible flow is a real `akrogon next --all` in the dispatch fixture (`tests/next.test.ts` `dispatchFixture`, fake harness recording prompts). Negative tests are criteria 5 and 6; edge cases are two stored keys in one repo (2) and capacity overflow (4). Foreign files are never written.

## Leaf architecture
Owned: `src/next.ts` (`Inventory` type, `discover()`, `report()` or a sibling for the repo-level line, `activeCount()`, `lookup()` if it needs to ignore foreign leaves, `selectLeaves()` quiet return when only foreign leaves matched), `tests/next.test.ts`, `src/AREA.md`, `docs/guide/` prose about the mismatch error.
Interfaces: `RepoMismatchError` in `src/state.ts` stays for `allLeaves()` and `status`; `next` stops throwing it per leaf inside `discover()`. Diagnostic line shape: JSON object with at least `repo`, `error`, `count`, and a `paths` list of `{path, stored}`; `path` may remain as the first path so existing parsers keep working. `Invocation` gains whatever dedup set the per-repo line needs, scoped to one invocation.
Excluded: `src/status.ts`, `src/state.ts`, `src/init.ts`, `src/phase.ts`, any persistent state, any file deletion or rewrite under the consumer's `issues/`.
Dependencies: none. Independent of `authoritative-leaf-artifacts` leaves; both may touch `src/next.ts` (prompt line vs discovery), which is not a dependency.

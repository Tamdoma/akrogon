# Review A: learn-issues

Base: `76ec78494a77dca27a7b25a2128cf1d3bcda1045`
Reviewed head: `a1abf5a885eb57e511bcdcdb4a00f88484e94ab2` (3 commits, 8 files, no `Test-Change:` trailers — none required, no test files changed)

## Per-criterion evidence

1. `skills/learn-issues/SKILL.md` exists; `name: learn-issues` and `Operator-invoked only.` in description (line 2-3); three outcomes with tests and actions (26-28); evidence step reads the linked history file then traces the mechanism against code plus `checks`/`merge_checks` (22); scope limit (30); registered-root resolution via `akrogon config` `repo`→`repos.<name>` with `repo: none` stop (14); writes no chart, map, pull or handoff (10); sorted list shown grouped before removal, uncommitted diff as review (34-35).
2. `grep -c 'lesson prune' skills/chart-issues/SKILL.md` → 0; `learnings/LESSONS.md` resource read intact at line 29.
3. `git show a1abf5a -- learnings/LESSONS.md` → header line 5 only, names `/learn-issues`; no lesson line changed.
4. `docs/reference-index.md` → ten agent workflows; README row at :191 linked form; cheat.md row :127 plain form, sentence :129 includes lesson triage; learn.md :18 prune-or-seed sentence; AREA.md :15 Key files bullet; skill folders = 10; `bun test tests/docs-links.test.ts` → 3 pass 0 fail (README link resolves).
5. `implementation/report.md` dry walk covers all 15 active lines with file:line evidence: :10 already guarded (`src/phase.ts:225-226`, `268-272`, `311-314`, invocation traced to the `phase` command path), :9 already guarded (`src/shell.ts:107-115`), :17 checkable (`src/config.ts:9` still reachable), 4 more checkable with seeds, 8 stays. Guard coverage was traced before each already-guarded verdict.
6. `bun run format` exit 0 (all unchanged), `bun run typecheck` exit 0, `bun test --timeout=30000` 415 pass 0 fail, `test_changed` 0 affected test files.

## AREA.md check

`skills/AREA.md` is in the diff. All 14 paths it names verified present from repo root (list above run live): no missing path. One line added, sections and 40-line limit intact (32 lines).

## Doc behavior check

Changed docs describe the new skill. README/cheat/learn rows verified against `skills/learn-issues/SKILL.md` content — purposes match (sort lessons into guarded/checkable/stays; prunes when a running guard covers, seeds when a check could). No dead pointers; the one cross-file link (README → SKILL.md) resolves in the merged diff.

## Consistency notes

- SKILL.md scope line "audits no other instructions, tooling or docs" reads consistent with the brief's own (B) tag; no contradiction.
- `src/next.ts:641` `git worktree prune` is unrelated to the lesson-prune wording.
- Dry-walk checkable classifications are report records, not filed seeds; the skill's no-filing rule is stated at line 27.

## Findings

No Fixes. No Nits.

## Verdict

ready

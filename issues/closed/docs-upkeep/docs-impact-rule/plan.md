# Plan: docs-impact-rule

## Decisions

- D1: In `src/config.ts` remove `.default('none')` from `grounding` in `repoSchema`. The union keeps `z.literal('none')` and the object keeps `index` optional. A persisted `issues/config.yaml` without a `grounding` key now fails to parse; explicit `grounding: none` still parses.
- D2: In `effectiveConfig` (src/config.ts:123) parse `{ grounding: 'none' }` instead of `{}` when no registered repo matches, so `akrogon config` outside a repo still prints with `grounding: none`.
- D3: In `initialize` (src/init.ts), the no-proposal/no-existing-config branch parses `{ grounding: 'none' }` instead of `{}`. Bare `akrogon init` is an explicit operator act, and `writeRepoConfig` persists the parsed value, so the written config always carries an explicit `grounding` key. This keeps the existing repeat-init test (tests/init.test.ts:37-42) green.
- D4: In `src/init.ts` add one small function `checkGrounding(root: string, config: RepoConfig): void`, called after `repoSchema.parse` and before `writeRepoConfig`. When `config.grounding !== 'none' && config.grounding.index !== undefined`, it runs `readFileSync(resolve(root, config.grounding.index), 'utf8')`. A filesystem error (ENOENT, EISDIR, EACCES) is caught and rethrown as `Error('Grounding index is not a readable non-empty file: <resolved path>. Complete setup with the init-issues skill.', { cause })`; contents that are empty after `trim()` throw the same message without a cause (whitespace-only is empty, per learnings/history/2026-09-19-min1-not-nonblank.md). This is the leaf's only catch-and-rethrow. No unreadable-file test: readability is proven by the read, and chmod tests depend on runner privileges.
- D5: Skill prose edits, one to three sentences each, no new sections or files:
  - `skills/plan-issue/SKILL.md`: extend the grounding paragraph (line 25) so the plan's checklist carries one line per affected doc, agent and human, found from the index, linked AREA files and README, with a one-line "no docs affected" statement when none; extend the synthesis paragraph (line 55) so `plan.md` carries that checklist.
  - `skills/implement-issue/SKILL.md`: extend line 27 so implement updates every doc the plan names plus any doc the diff makes stale, before review; the AREA.md shape rule stays.
  - `skills/check-issue/SKILL.md`: revise lines 33-35 so the reviewer starts from the changed behavior, opens the doc page describing it even when unchanged, files a Fix for a wrong claim or dead path, or writes one line that no documented behavior changed. Delete the sentence "Open no area file outside that diff". Keep the AREA.md path check as one shell command.
  - `skills/init-issues/SKILL.md`: extend lines 56-60 and the Initialize-and-verify section so setup is not reported complete until a top index exists whose rows link real paths, AREA files exist where one row is not enough, and the proposal's `grounding.index` names that index; `grounding: none` appears only when the operator chose it.
- D6: Test fixtures and cases. Add `grounding: 'none'` to every repo-config or proposal write that must keep parsing: tests/helpers.ts:22; tests/config.test.ts:10,19,50,52; tests/next.test.ts:667,1367; tests/phase.test.ts:83,230,241,886,895,1040; tests/pull.test.ts:171; tests/sync.test.ts:42; and the positive proposals in tests/init.test.ts (`{checks, implement}`, `{worktree_root}` cases). Deliberate negatives stay grounding-less: the `{scripts_dir: 'retired'}` proposal, the malformed writes in tests/status.test.ts:247, and new omission tests.
- D7: Human docs. README "Initialize a repository", docs/guide/setup.md and docs/guide/cheat.md each state that init refuses a declared index that is not a readable non-empty file, and that a fresh repo needs an index or an explicit `grounding: none`. Fix the now-stale claim at docs/guide/setup.md:94 ("Its default grounding setting can be none").
- D8: Agent docs. `src/AREA.md` gains `src/init.ts` under Key files and one Non-obvious-pattern line for the refusal. `docs/reference-index.md`, `skills/AREA.md` and `tests/AREA.md` need no row changes; the plan records them checked.

## Read-first

- `src/init.ts`, `src/config.ts`
- `tests/helpers.ts`, `tests/init.test.ts`, `tests/config.test.ts`
- `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/init-issues/SKILL.md`
- `README.md`, `docs/guide/setup.md`, `docs/guide/cheat.md`
- `src/AREA.md`, `docs/reference-index.md`, `learnings/LESSONS.md`

## Interfaces

- `initialize(cwd, proposal, toolkit)` in `src/init.ts`: unchanged signature; new `checkGrounding` call between parse and `writeRepoConfig`.
- `repoSchema` in `src/config.ts`: `grounding` union without `.default`; `effectiveConfig` fallback object `{ grounding: 'none' }`.

## Checklist (file -> criterion)

1. `src/config.ts` — D1, D2 -> criterion 6.
2. `src/init.ts` — D3, D4 -> criterion 5.
3. `tests/helpers.ts` + grounding lines in config/next/phase/pull/sync tests — D6 -> criterion 7.
4. `tests/init.test.ts` — new refusal/success cases + grounding in proposals -> criterion 7.
5. `tests/config.test.ts` — omission fails, explicit `none` parses, unregistered prints `grounding: none` -> criteria 6, 7.
6. `skills/plan-issue/SKILL.md` — D5 -> criterion 1.
7. `skills/implement-issue/SKILL.md` — D5 -> criterion 2.
8. `skills/check-issue/SKILL.md` — D5 -> criterion 3.
9. `skills/init-issues/SKILL.md` — D5 -> criterion 4.
10. `README.md`, `docs/guide/setup.md`, `docs/guide/cheat.md` — D7 -> criterion 8.
11. `src/AREA.md` — D8 -> criterion 8.

## Acceptance criteria

- Init refuses a declared index that is missing, a directory, unreadable or empty, before any write, with one error naming the resolved path and pointing to init-issues; after each refusal `issues/config.yaml`, `issues/open`, `learnings`, `.gitignore` and the global registration are byte-identical to before.
- Init succeeds with a non-empty index, on repeat init with a valid declared index, and on repeat init with explicit `none`.
- A persisted config without `grounding` fails to parse; explicit `none` parses; `akrogon config` outside a repo prints `grounding: none`.
- The four skills carry the new doc rules; "Open no area file outside that diff" is gone from check-issue.
- The three human docs describe the refusal and the index-or-explicit-none requirement.
- `bun test`, `bun run typecheck` and `bun run format` pass.

## Verification

- `bun test tests/init.test.ts` and `bun test tests/config.test.ts` for the new behavior, then the full `bun test`, `bun run typecheck`, `bun run format`.
- Report lists each doc opened under criterion 3's rule with the claim checked (criterion 9).

## Open limitation

Boulevard and any repo with a persisted grounding-less config fail to parse until the operator reruns init-issues there; re-grounding boulevard is operator work outside this leaf (design Q4).

## Dependencies

None.

# Implementation report: docs-impact-rule

Base: f537143aeb0b126fb5d71a89120cb7c52eade382
Head: f11f6ae

## Changed files and reasons

- `src/config.ts`: removed `.default('none')` from `grounding` so a persisted config without the key fails to parse; `effectiveConfig` parses `{ grounding: 'none' }` for unregistered directories so `akrogon config` still prints.
- `src/init.ts`: added `checkGrounding`, called after `repoSchema.parse` and before `writeRepoConfig`; it `readFileSync`s the declared index and throws `Grounding index is not a readable non-empty file: <path>. Complete setup with the init-issues skill.` with `cause` on filesystem errors and without on empty/whitespace contents. Bare init (no proposal, no config) parses `{ grounding: 'none' }` so the persisted config always carries an explicit key.
- `tests/helpers.ts`, `tests/config.test.ts`, `tests/next.test.ts`, `tests/phase.test.ts`, `tests/pull.test.ts`, `tests/state.test.ts`, `tests/sync.test.ts`, `tests/init.test.ts` proposals: `grounding: 'none'` added to every repo-config/proposal write that must keep parsing; deliberate negatives untouched.
- `tests/init.test.ts`: new tests for missing, directory, empty and whitespace-only index refusal with byte-identical file snapshots; success with a non-empty index and repeat; explicit `none` and repeat; bare init.
- `tests/config.test.ts`: new test that a persisted config without `grounding` fails to parse and explicit `none` parses; unregistered-directory assertion extended with `grounding: 'none'`.
- `skills/plan-issue/SKILL.md`: candidate docs come from the index, linked AREA files and README; the synthesis checklist names every affected doc one line each or states none in one line.
- `skills/implement-issue/SKILL.md`: implement updates every doc the plan names plus any doc the diff makes stale before review; AREA.md shape rule kept.
- `skills/check-issue/SKILL.md`: reviewer starts from changed behavior and opens the doc page describing it even when unchanged; wrong claim or dead path is a Fix, else one line that no documented behavior changed; "Open no area file outside that diff" deleted; AREA.md path check kept as one command. B moved the doc-review rule out of the A-specific paragraph into its own seat-neutral paragraph after worker 2 placed it under "As A".
- `skills/init-issues/SKILL.md`: `grounding: none` proposed only when the operator chose it; setup is not reported complete until a top index exists with real rows, needed AREA files, and `grounding.index` naming it.
- `README.md`, `docs/guide/setup.md`, `docs/guide/cheat.md`: describe the refusal and that a fresh repo needs an index or an explicit `grounding: none`; stale "Its default grounding setting can be none" replaced.
- `src/AREA.md`: `src/init.ts` added to Key files and one refusal line to Non-obvious patterns.

## Commands run

- `AKROGON_BASE=f537143aeb0b126fb5d71a89120cb7c52eade382 bun test --changed="$AKROGON_BASE"` after test edits: 4 expected reds (config requires explicit grounding; init refuses missing/directory/empty index). After src edits: 272 pass, 0 fail across 11 files.
- `bun test tests/docs-links.test.ts tests/command-reference.test.ts`: 7 pass, 0 fail.
- `bun test` (full suite): 279 pass, 0 fail, 3317 expect() calls, 13 files.
- `bun run typecheck` (`tsc --noEmit`): clean.
- `bun run format`: reformatted `tests/sync.test.ts` only; suite green after.

## Docs opened under criterion 3's rule, with the claim checked

- `README.md` "Initialize a repository": now describes the refusal and the index-or-explicit-none requirement.
- `docs/guide/setup.md`: same description; stale default-none claim corrected.
- `docs/guide/cheat.md`: same description added.
- `docs/reference-index.md`: rows still match; unchanged.
- `src/AREA.md`: updated for the new init refusal.
- `skills/AREA.md`, `tests/AREA.md`: rows still match; unchanged.
- `docs/guide/phases.md`, `files.md`, `idea.md`, `learn.md`, `limits.md`, `merge.md`, `install.md`, `in-practice.md`, `gacp.md`: swept for grounding/AREA/review prose; no claim made stale by this diff.
- `learnings/LESSONS.md`: consulted for the whitespace-only lesson applied to the empty-index check.

## Known limitations

- Repos with a persisted grounding-less `issues/config.yaml` (for example boulevard) fail to parse until the operator reruns init-issues there; re-grounding boulevard is operator work outside this leaf.

## Unverified criteria

None.

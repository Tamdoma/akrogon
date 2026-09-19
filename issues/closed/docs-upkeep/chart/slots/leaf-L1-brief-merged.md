# Brief: docs-impact-rule

## What
Every leaf leaves the agent docs (AREA.md files, the grounding index) and the human docs (README, docs/guide) describing the code as it now is, because the plan names the affected docs, implement updates them and check verifies them from the changed behavior. `akrogon init` refuses a declared grounding index that is not a readable non-empty regular file, before it writes or registers anything, and omitted grounding no longer becomes `none`.

## Why
Across six registered repos roughly one merge in ten touches an AREA file and fewer touch the index; three repos carry dead index rows. The rule in implement-issue fires only when the implementer remembers, and check-issue verifies only AREA files already in the diff. Boulevard is ungrounded because the schema defaulted an omitted grounding to `none` and init never looked.

## Done-criteria
1. `skills/plan-issue/SKILL.md`: the plan's checklist names every affected doc, agent and human, one line each, found from the grounding index, its linked AREA files and README; an unaffected-docs plan says so in one line.
2. `skills/implement-issue/SKILL.md`: implement updates every doc named by the plan plus any doc the diff makes stale, before review; the existing AREA.md shape rule stays.
3. `skills/check-issue/SKILL.md`: the reviewer starts from the changed behavior, opens the doc page describing it even when unchanged, files a Fix for a wrong claim or a path that does not exist, or writes one line that no documented behavior changed; the sentence "Open no area file outside that diff" is gone; the AREA.md path check keeps its single-command form.
4. `skills/init-issues/SKILL.md`: setup is not reported complete until a top index exists whose rows link to real paths, AREA files exist where one row is not enough, and the proposal's `grounding.index` names that index; `grounding: none` appears only when the operator chose it.
5. `src/init.ts`: when the parsed config declares `grounding.index`, initialization resolves it against the repo root and reads it; a missing path, a directory, an unreadable file or empty contents each end in one error naming the path and saying to complete setup with init-issues, thrown before `writeRepoConfig`, any mkdir, `.gitignore` edit or global registration. (B) Reading, not `stat`, is the check, so readability is proven by construction.
6. `src/config.ts`: `.default('none')` is removed from `grounding`; `grounding: none` written explicitly still parses; a persisted repo config with no grounding key fails to parse. (B) `effectiveConfig` for an unregistered directory still prints, with `grounding: none`, so `akrogon config` keeps working before setup (tests/config.test.ts:35).
7. Tests: init with a missing index, an empty index and a directory at the index path each refuse, and afterwards `issues/config.yaml`, `issues/open`, `learnings`, `.gitignore` and the global registration are exactly as before; init with a non-empty index succeeds; (B) repeat init on a repo whose config already declares a valid index, and on one with explicit `none`, succeeds and preserves choices; a persisted config without grounding fails to parse; explicit `none` parses. (B) Fixtures that write a grounding-less repo config (tests/helpers.ts:22 and the sync, pull, phase, next and state tests that do the same) get the minimal explicit grounding so the full suite passes; omission stays as a deliberate negative test only.
8. Human docs: README "Initialize a repository", docs/guide/setup.md and docs/guide/cheat.md describe the refusal and that a fresh repo needs an index or an explicit `none`; docs/reference-index.md, src/AREA.md and skills/AREA.md rows still match; `bun test` and `bun run tsc --noEmit` (or the configured checks) pass.
9. The implementation report lists each doc opened under criterion 3's own rule for this leaf, with the claim checked.

Env values needed: none.

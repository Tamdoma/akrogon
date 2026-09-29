# Review A: init-lessons-union

Base: `53508e807128de2a77b22cf4874e266224cf4f0e`
Reviewed head: `b0b858d5f1bc3f0fc0fd250c0ff821c20e12dc65` (`init-lessons-union`, commits 7e1a268 + 5b7b5e1 + b0b858d). Worktree clean.

Debate: no. No `positions-A.md`/`rebuttal-A.md` exist, as expected.

## Criteria check

- C1 (new `.gitattributes` exact bytes + `check-attr`): covered. `src/init.ts:61-66` writes `learnings/LESSONS.md merge=union\n` to empty/absent file; test asserts exact bytes and the literal `check-attr` output `learnings/LESSONS.md: merge: union`. Passes on live run.
- C2 (unterminated prior + byte-identical repeat): covered. Separator logic `priorAttributes !== '' && !priorAttributes.endsWith('\n')` matches D3/D6 verbatim; test asserts `* text=auto eol=lf\nlearnings/LESSONS.md merge=union\n` then re-init byte-identity.
- C3 (no `.git/info/attributes` rule): covered. Init code touches only `<root>/.gitattributes`; test resolves the path via `git rev-parse --git-path info/attributes` and asserts no `learnings/LESSONS.md` content.
- C4 (real two-clone rebase, positive + negative legs): covered and verified live. Fixture's bare `remote.git`, second clone, divergent appends to `learnings/LESSONS.md`, clean `git pull --rebase origin main` exits 0 and merged file contains both lines. Negative leg replaces the same line of tracked `file` on both sides, pull exits non-zero, `diff --name-only --diff-filter=U` names `file`. All setup commands run through throwing `command`, fixture removed in `finally` including the mid-rebase state.
- C5 (docs): `skills/init-akrogon/SKILL.md:76` and `docs/guide/setup.md:31` both name the `learnings/LESSONS.md merge=union` attribute among init's writes; claims match the code exactly.
- C6 (checks): report records `format`/`typecheck`/`bun test` runs and the artifact path `/tmp/init-lessons-union-init-test.log`, which exists and shows 20 pass / 0 fail.

## Verification rerun

`bun test tests/init.test.ts` on `b0b858d` (seat run, not just the report): 20 pass, 0 fail, 105 expects, ~1s. Full suite, format and typecheck already evidenced by report and artifact; diff since is format-only.

## AREA.md / docs surface

No `AREA.md` files in the reviewed diff. `src/AREA.md`, `tests/AREA.md`, `docs/reference-index.md` remain accurate: no new commands, files or patterns were added, matching the plan's no-AREA-change note. `skills/AREA.md` unaffected.

## Findings

N1 (nit): `README.md:99` summarizes init writes as "repository configuration, issue and lesson scaffolds, ignore entries and registers the repository" without the merge attribute. The line does not claim exhaustiveness and the plan's owned-file list covers only SKILL.md and setup.md, so this is a consistency nit, not a defect.

No Fix findings. Every done criterion is met by evidence, tests exercise the real CLI and real git, no mocks of the unit under test, and no lesson claims beyond recorded evidence.

## Verdict

`nits` — ready for merge; README line may optionally name the attribute later.

## Merge pass (A)

- Rebase target `origin/main` = `53508e807128de2a77b22cf4874e266224cf4f0e`; rebase reported up to date, head stays `b0b858d5f1bc3f0fc0fd250c0ff821c20e12dc65`. No conflict, no resolution needed.
- Post-rebase `AKROGON_BASE` refreshed from `akrogon config`: `53508e807128de2a77b22cf4874e266224cf4f0e` (unchanged).
- Checks on `b0b858d`: `bun run format` all files unchanged; `bun run typecheck` clean; `bun test --changed=$AKROGON_BASE` 20 pass / 0 fail; `bun test` 330 pass / 0 fail / 3878 expects / 15 files / 71.6s.
- Nit N1 (README init-writes summary omits attribute): not a reusable mechanism, no LESSONS.md entry.

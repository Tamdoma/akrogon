# Plan: command-reference

Direct slot B synthesis. `debate: no`, so no position or rebuttal artifacts apply.

## Read first

- This leaf's `brief.md` and `design.md`.
- `REFERENCE.md`, `README.md`, and `learnings/LESSONS.md`.
- `src/akrogon.ts` for dispatch, positional validation and options.
- `src/sync.ts` and `tests/sync.test.ts` for the delivered sync contract.
- `src/park.ts` and `tests/park.test.ts` for whole-issue moves and refusal behavior.
- `src/pull.ts`, `tests/pull.test.ts`, and `skills/seed-issue/SKILL.md` for origin intake and outbound routing.
- `tests/helpers.ts` and `package.json` for CLI fixtures and checks.

Paths above are relative to the worktree except this leaf's records. No required grounding resource is missing. Lessons support executing real CLI scenarios and checking scope without adding unrelated repairs.

## Decisions

- D1: Change only the README command table, one adjacent configuration paragraph, and a new `tests/command-reference.test.ts`. No production code, dependency, website, skill, or repo-identity paragraph changes.
- D2: Retain the seven existing invocations and add `akrogon sync`, `akrogon park <issue>... | --all`, and `akrogon unpark <issue>... | --all`. Escape table pipes in Markdown. Names mean top-level issue folders, not leaf slugs. Effects describe syncing issue records, moving eligible whole issues to `issues/parked/`, and restoring them to `issues/open/`. The alternatives require either one or more names or `--all`, never both. Do not imply `park --all` moves running issues or prerequisites still needed by open work.
- D3: The single paragraph states that `issues/parked/` is committed issue data. Sync requires the registered repository's checked-out `default_branch`, refuses detached HEAD and other branches, and refuses already-staged paths outside eligible records. Its new commit includes only changes under `issues/`, excluding `issues/seeds/`, files named `.lock`, and the configured `worktree_root`. It holds global then repository locks, fetches/rebases and pushes through configured `remote`, preserving unrelated local edits on success. Mention refusal for coordination-lock hazards and ignored-path collisions, and that restoration conflicts stop the push. Keep this concise without claiming sync restricts all previously existing commits to issue records.
- D4: In that same paragraph, distinguish GitHub intake from integration: `pull` reads this repository's GitHub `origin`, `remote` selects where code integrates, and consumers use root `akrogon.yaml` with `issues_repo: owner/repo` to route reports through `seed-issue`. This setting does not redirect `pull`.
- D5: The coverage test reads the actual README command table and actual CLI dispatch cases, asserting equal verb sets, no duplicate command rows, and a nonempty invocation/effect for each row. Read invocation code spans without splitting on escaped pipes. Parse dispatch case labels within `switch (verb)`, including the shared park/unpark body. Assert the documented argument semantics for all ten verbs using a small typed contract in this test, checking required/optional arguments and exclusive alternatives rather than exact prose or row order. Do not add a general Markdown parser or change the CLI to export documentation metadata. Source-derived verb coverage must detect a newly added verb independently of that contract.
- D6: Reuse existing real CLI scenario tests for behavioral evidence. New test-local negative/edge cases exercise the coverage checker with a missing command, an extra or duplicate command, a missing argument/option, and valid escaped alternatives. Keep these in the one owned test file. Do not assert paragraph wording mechanically.

## Dependency and interfaces

`scoped-branch-sync` must be integrated before documenting sync. Its authoritative state is `merged`, and this worktree contains the delivered branch, index and lock checks. The dependency is satisfied. There are no new runtime interfaces. Tests consume the README command table, CLI source, and existing Bun test tools.

## Acceptance criteria

- C1: All ten dispatched verbs have exactly one README command row with correct argument shape and a meaningful effect. A future missing verb fails the coverage test.
- C2: Park/unpark syntax communicates plural issue names versus exclusive `--all`; Markdown escaped alternatives remain valid input to the test. Existing optional `next`, `pull`, `status`, and phase/init options remain documented correctly.
- C3: The paragraph reflects D3 and D4, including committed parked records, sync exclusions and refusal conditions, origin intake, configured integration remote, and consumer report routing. Review against live code, not exact text matching.
- C4: Negative mutations fail the coverage checker, while the real README and valid escaped alternatives pass. CLI scenario tests verify real sync and park/unpark behavior without touching the operator's repository or GitHub.
- C5: Required format, typecheck and full tests pass. The implementation diff contains only the two owned files, with an evidence artifact recorded outside the tracked code diff.

## Ordered implementation checklist

1. A1: Update `README.md` table and add its single paragraph. Review C1–C3 against the read-first source files. Leave the existing repository identity paragraph untouched.
2. A2: Add `tests/command-reference.test.ts` following repository style, with test-local typed parsing/validation helpers and the C1/C2/C4 regression cases. Verify a removed row and lost park/unpark alternative produce failures without modifying repository files on disk.
3. A3: Run `bun test tests/command-reference.test.ts`. Then exercise the documented commands through existing real invocations with `set -o pipefail; bun test tests/sync.test.ts tests/park.test.ts 2>&1 | tee /tmp/command-reference-cli-evidence.log`. This is the non-browser end-to-end verification command and artifact. These suites use isolated Git repositories and cover successful mutation, wrong/detached branch, excluded staged paths, unrelated edits, and invalid park targets/alternatives.
4. A4: Run `bun run format`, `bun run typecheck`, and `bun test`. Inspect `git --no-pager diff --check`, the final diff, and status. Record actual check outcomes and `/tmp/command-reference-cli-evidence.log` in the implementation handoff. Remove iteration-created helpers and accidental out-of-scope formatting changes without reverting pre-existing user edits.

## Known limitations and review notes

The coverage test protects command inventory and argument contracts, but cannot establish the truth of natural-language effects or sync/routing prose. Review those against the implementation and scenario evidence. Its source extraction is intentionally coupled to the current switch-based dispatcher; a dispatcher rewrite must update this test. There is no brief/design conflict requiring scope changes.

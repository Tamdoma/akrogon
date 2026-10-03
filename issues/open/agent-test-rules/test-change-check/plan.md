# Plan: test-change-check

`debate: no`: synthesis from brief and design only.

## Decisions

- D1. Path rule lives once in a new `src/test-files.ts` exporting `testFile(path: string): boolean`. Case-sensitive match: any path segment in `test`, `tests`, `__tests__`, `fixture`, `fixtures`, `__fixtures__`, `__snapshots__`, `e2e`, `spec`, `specs`, `testdata`, `golden`, `goldens`, or basename containing `.test.`, `.spec.`, `.e2e.`, `_test.`, or ending in `.snap`. All prose (skills, guide) points to this file instead of copying the list (standing design: writer and checker share one rule definition).
- D2. Old test files come from `git diff --no-renames --name-status <target>...HEAD` run in `state.worktree`, where `<target>` is `target(repo)` (`src/config.ts:144`). Only status `M`, `D`, `T` count; `A` and any other status are ignored. `--no-renames` makes a rename surface as `D` old path + `A` new path, so the old path needs a citation.
- D3. Citations come from `git log --format='%(trailers:key=Test-Change,valueonly,unfold)' <target>..HEAD` run in `state.worktree`. Each non-empty output line is one trailer value; the first whitespace-separated token is its path. A file is cited only when some value's first token equals its exact path AND the remainder of the value is non-empty after trimming. A bare `Test-Change: <path>` with no text does not cite.
- D4. New guard `requireTestChangeCitations(repo, worktree)` in `src/phase.ts`, called from `transition` immediately after `requireNoIssueFiles` (`src/phase.ts:220`) under the same `state.worktree !== undefined` condition. This placement runs it on every non-`failed` move, including operator recovery out of `failed`, and never on a move to `failed`. On uncited files it throws one error that names each uncited path, the exact line to add `Test-Change: <path> <source and reason>`, that the line goes in the commit message's final trailer block, and that a later empty commit may carry it.
- D5. `--check` is a `boolean` option on `akrogon phase` in `src/akrogon.ts` (`check: { type: 'boolean' }`), passed into `phaseCommand` and on to `transition` as `checkOnly`. In `phaseCommand`, `--check` skips the `completeOwner` recovery for a merged leaf (`src/phase.ts:292-293`), so a check-only call never closes sources or moves folders. In `transition`, `--check` with destination `failed` is refused; all existing validations run in the same order, then the function prints `ok` and returns before `saveState`/`commitMove`, i.e. before the `recorded` const at `src/phase.ts:243`. No second copy of the guards.
- D6. Contract string and README row both become `phase <slug> <phase> --slot <A|B> [--verdict <verdict>] [--reason <text>] [--check]`; `tests/command-reference.test.ts:15` and `README.md` are updated to the identical text.
- D7. Tests live in `tests/phase.test.ts` reusing the existing fixture + worktree pattern (the `handoff to review refuses a dirty worktree` test at :197 is the model): write the test file on `main` in the fixture root, commit, `git push origin HEAD:main` so `origin/main` sees it as old, then `git worktree add -b <branch>` and commit the leaf change there. Refusal assertions check exit code, the named file, and unchanged `state.yaml` bytes; acceptance asserts `moved <phase>` or the new `phase` in state — no prose-wording assertions (lesson 2026-10-01).
- D8. Prose states the trailer format once per location and points to `src/test-files.ts` for the path rule, written as inline code (no markdown links, so `tests/docs-links.test.ts` is unaffected). `README.md` effect text and `docs/guide/merge.md` name the guard, the `--check` run before the push, and the refusal.
- D9. This leaf's own commits that touch `tests/phase.test.ts` or `tests/command-reference.test.ts` carry `Test-Change: <path> <source and reason>` trailers per the new rule; new test-file commits need none.

## Read-first

- `src/phase.ts` — `transition` (:181), `requireNoIssueFiles` (:264), `phaseCommand` (:280), `completeOwner` (:132).
- `src/akrogon.ts` — `phase` options (:14) and dispatch (:51).
- `src/config.ts:144` — `target(repo)`.
- `src/routing.ts`, `src/state.ts` (failureSchema :11, `worktree` field :52) — for the recovery fixture.
- `tests/phase.test.ts` — the dirty-worktree test (:197) and `snapshot` (:270) as patterns; `tests/helpers.ts` — `fixture`, `cli`, `leaf`.
- `tests/command-reference.test.ts` — `contracts` map (:11).
- `README.md` command table (:136), `docs/guide/merge.md` (:1-13).
- `skills/implement-issue/SKILL.md` (implement commit rule :63, `## check.fix`), `skills/implement-issue/brief-template.md` (sections 2, 6, 8), `skills/check-issue/SKILL.md` (`## check.review` :35+, `## check.repair` :69+), `skills/merge-issue/SKILL.md` (push sequence :39-49).
- `skills/chart-issues/assets/standing-design.md`, `learnings/LESSONS.md`.

## Needed interfaces

- `testFile(path: string): boolean` — `src/test-files.ts` (new).
- `requireTestChangeCitations(repo: Repo, worktree: string): Promise<void>` — `src/phase.ts`.
- `transition(repo, leaf, requested, explicitSlot, verdict, reason, checkOnly)` — extended signature.
- `phaseCommand(slug, rawPhase, rawSlot, rawVerdict, rawReason, rawCheck)` — extended signature; `rawCheck` parsed as optional boolean.
- CLI: `akrogon phase <slug> <phase> --slot <A|B> [--verdict <verdict>] [--reason <text>] [--check]`; success prints `ok`.
- Merge call: `akrogon phase <slug> merged --slot B --check`.

## Units and waves

### Wave 1 — up to 3 units, disjoint paths, no shared test resource, no inter-unit ordering

- U1 code+tests. Owns: `src/test-files.ts` (new), `src/phase.ts`, `src/akrogon.ts`, `tests/phase.test.ts`, `tests/command-reference.test.ts`. Shared test resource: temporary git fixtures it creates and removes itself. Covers D1-D7, D9.
- U2 skills prose. Owns: `skills/implement-issue/SKILL.md`, `skills/implement-issue/brief-template.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`. Covers D8: trailer sentence at the implement commit rule and `## check.fix` plus the trailer-only-empty-commit exception to the no-empty-commit rule at :63; trailer rule in brief-template section 6/8 for delegated worker commits (trailers survive cherry-pick); check.review line making B list `Test-Change:` trailers in `<target>..HEAD` in `review-B.md`; check.repair trailer rule for B's own test commits; merge-issue instruction to run `akrogon phase <slug> merged --slot B --check` after green checks and right before the push, and on refusal to add a commit carrying the missing trailer (a trailer-only empty commit when the change sits inside a rebased commit) or revert the change, then rerun checks and `--check` before pushing.
- U3 operator docs. Owns: `README.md` (command row), `docs/guide/merge.md` (guard, `--check` before the push, refusal). Covers D6 (README half) and D8.

The plan fixes the shared literals (D5 flag, D6 contract string, module name `src/test-files.ts`, trailer key `Test-Change`), so U2/U3 need nothing U1 produces at runtime.

## Verification

| Done-criterion | Proof | Failure caught | Size | Rerun trigger |
| --- | --- | --- | --- | --- |
| 1. Refuse M/D/T old test file without trailer, name it, state.yaml unchanged; moves with trailer | `bun test tests/phase.test.ts -t '<citation guard test names>'` | Guard missing, wrong statuses, refusal mutating state, silent pass | seconds | `src/phase.ts`, `src/test-files.ts`, `tests/phase.test.ts` |
| 2. Adds-only and non-test moves pass; wrong-path and text-less trailers, rename old path, empty-commit trailer, recovery out of `failed` | same file's scenario tests | Over/under-matching paths, trailer parse accepting bare path or wrong path, recovery skipping the guard | seconds | same |
| 3. `--check` prints `ok`/exit 0 on acceptance, fails with the move's error otherwise, leaves state.yaml/git/folders unchanged incl. merged leaf; `--check`+`failed` refused | same file's `--check` scenario tests + `git rev-parse HEAD` and state-bytes assertions inside them | `--check` recording/moving, `completeOwner` running under `--check`, accepted moves misreported | seconds | `src/akrogon.ts`, `src/phase.ts` |
| 4. merge-issue runs `--check` before push; trailer rule in implement-issue, brief-template, check.repair, merge-issue; trailer listing in check.review; README + merge.md show `--check` and refusal | `bun test tests/command-reference.test.ts tests/docs-links.test.ts`; `grep -l 'Test-Change' skills/implement-issue/SKILL.md skills/implement-issue/brief-template.md skills/check-issue/SKILL.md skills/merge-issue/SKILL.md` returns all four; prose placement judged at review (no wording tests) | Contract drift between README and dispatcher, dead guide links, a skill missing the rule entirely | seconds | the named prose files |
| `checks` config | `bun run format`, `bun test --timeout=30000`, `bun run typecheck`, `AKROGON_BASE` + `bun test --changed="$AKROGON_BASE" --timeout=30000` | Format/type regressions, suite breakage | minutes | any owned path |

Not a slow-run leaf; no restart boundaries. No `merge_checks` configured and the brief adds none.

## Affected docs

- `skills/implement-issue/SKILL.md`, `skills/implement-issue/brief-template.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md` — trailer rule / `--check` call (U2).
- `README.md`, `docs/guide/merge.md` — `--check` flag and refusal (U3).
- `src/AREA.md`/`tests/AREA.md` unchanged: `src/test-files.ts` is an implementation detail of the `phase.ts` guard and adds no command.
- `docs/guide/phases.md` is excluded — owned by the `test-rules` leaf.

## Notes for review

- Design wins over brief where they could diverge: none found; the design restates the brief's contract.
- Accepted limitation (design): the check is path-level; it cannot tell an added case from a changed assertion inside one file, and misses test data outside the rule's paths. Both are caught only by B's review.
- The `test-rules` leaf adds the rule-2 sentence (when a change is allowed and what it cites) to the same skill paragraphs in parallel; a rebase conflict keeps both sentences.
- No credentials, grants, or human prerequisites.

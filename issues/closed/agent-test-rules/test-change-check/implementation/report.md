# Report: test-change-check

## Changed files and reasons

- `src/test-files.ts` (new): `testFile(path)` — case-sensitive segment list (`test`, `tests`, `__tests__`, `fixture`, `fixtures`, `__fixtures__`, `__snapshots__`, `e2e`, `spec`, `specs`, `testdata`, `golden`, `goldens`) plus basename patterns `*.test.*`, `*.spec.*`, `*.e2e.*`, `*_test.*`, `*.snap`. Single owner of the path rule that skills and docs point to (D1).
- `src/phase.ts`: `requireTestChangeCitations(repo, worktree)` — old files from `git diff --no-renames --name-status <target>...HEAD` with status `M`/`D`/`T`, citations from `git log --format='%(trailers:key=Test-Change,valueonly,unfold)' <target>..HEAD`; refusal names each file with the exact trailer line, the final-trailer-block rule and the later-empty-commit option. Called after `requireNoIssueFiles` on every non-`failed` move, including blocked recovery. `transition`/`phaseCommand` gained `checkOnly`/`rawCheck`: `--check` refuses `-> failed`, runs all existing guards in order, prints `ok` before `saveState`/`commitMove`, and skips `completeOwner` recovery for merged leaves (D2-D5).
- `src/akrogon.ts`: `check: { type: 'boolean' }` on `phase`, passed to `phaseCommand`.
- `tests/phase.test.ts`: 5 new tests covering criteria 1-3 scenarios (M/D/T, add-only, non-test, wrong-path trailer, bare trailer, rename old path, trailer on empty commit, recovery out of `failed`, `--check` ok/refusal/unchanged-state/dirty/`failed`/merged-leaf cases).
- `tests/command-reference.test.ts`: `contracts.phase` gains `[--check]` (D6).
- `skills/implement-issue/SKILL.md`, `skills/implement-issue/brief-template.md`: trailer rule at the commit instructions, trailer-only-empty-commit exception, added-case line, cherry-pick note (D8).
- `skills/check-issue/SKILL.md`: check.review — B lists `Test-Change:` trailers in `review-B.md` and judges each cited source; check.repair — B's test-file commits carry the trailer.
- `skills/merge-issue/SKILL.md`: `akrogon phase <slug> merged --slot B --check` after green checks, right before the push, with refusal handling (trailer commit / trailer-only empty commit / revert, then rerun checks and `--check`).
- `README.md`: phase row gains `[--check]` and its effect names check-only mode (D6).
- `docs/guide/merge.md`: trailer guard, `--check` before the push, refusal text (D8).

## Criterion → evidence

1. Refusal/acceptance with and without trailer → `modified old test files need a Test-Change trailer on every guarded move` and `deleted and typechanged old test files need one trailer each naming the file`.
2. Move/refuse matrix → `added-only test files and non-test diffs move without a trailer, and recovery re-runs the guard`, `a trailer naming a different path does not cite and the old path of a rename is the citation`; empty-commit trailer covered inside the first two tests.
3. `--check` contract → `phase --check runs the move guards without recording, moving or closing the owner`; live run on this leaf printed `ok` with `state.yaml` unchanged.
4. Prose → `grep -l 'Test-Change' skills/implement-issue/SKILL.md skills/implement-issue/brief-template.md skills/check-issue/SKILL.md skills/merge-issue/SKILL.md` returns all four; README row verified by command-reference contract; merge.md paragraph added; `tests/docs-links.test.ts` green. Wording judged at review (no prose tests).

## Commands run

- `bun test tests/phase.test.ts tests/command-reference.test.ts` — 57 pass / 0 fail (post-U3: 60 pass across +docs-links).
- `bun test --timeout=30000` — 413 pass / 0 fail, 19 files, ~17s.
- `bun test --changed=a97d4a11eae4bbc4f1d460eb5fa6a343ef895552 --timeout=30000` — 57 pass / 0 fail (phase + command-reference only, as expected).
- `bun run format` — clean (no rewrites).
- `bun run typecheck` (`tsc --noEmit`) — clean.
- Live: `bun src/akrogon.ts phase test-change-check check.review --slot A --check` → `ok`, exit 0, state.yaml untouched.

## Base and head

- Base (AKROGON_BASE): `a97d4a11eae4bbc4f1d460eb5fa6a343ef895552`
- Committed head: `1477fae` — commits `1454e15` feat (code), `6a7ae14` test (carries both `Test-Change:` trailers), `6b77dee` fix (trailer value trim), `64d9320` skills, `1477fae` README+merge.md.

## Known limitations and unverified criteria

- Path-level check: cannot distinguish an added case from a changed assertion inside one file; test data outside the rule's paths is unseen — both B-review only (accepted in design).
- `testFile` glob semantics treat leading `*` as non-empty: `.test.ts` (basename) does not match `*.test.*`; matches brief's stated semantics.
- `--check` to `failed` refuses before other validations — criterion names only the refusal, not order.
- Unverified criteria: none.

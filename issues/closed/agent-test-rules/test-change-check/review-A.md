# Review A: test-change-check

Base: `a97d4a11eae4bbc4f1d460eb5fa6a343ef895552` · Reviewed head: `1477fae`

Verification: read the full `git diff $AKROGON_BASE...HEAD` (11 files, +304/-9); probed `testFile` directly on 10 representative paths (all arms correct, case-sensitive, `x.test`/`.test` non-matches confirmed); reran `bun test tests/phase.test.ts tests/command-reference.test.ts tests/docs-links.test.ts` → 60 pass / 0 fail; branch `Test-Change:` trailers cite both modified old test files; worktree clean.

Doc check: `README.md` phase row matches the `contracts.phase` literal (verified by contract test). `docs/guide/merge.md` documents the guard, `--check` before the push and the refusal. `src/AREA.md`/`tests/AREA.md` deliberately unchanged per plan; `src/test-files.ts` exists at the pointer every skill/doc references. No AREA.md in the diff.

## Fixes

- F1. Path rule has no enumerating test. `tests/phase.test.ts` exercises the guard end-to-end but reaches only three arms of the locked list (`x.test.ts`, `src/x.spec.ts`, plus non-matching `file`/`src/new.ts`). The other ~24 arms (`tests`, `__tests__`, `fixture(s)`, `__fixtures__`, `__snapshots__`, `e2e` on real dirs, `spec`, `specs`, `testdata`, `golden(s)`, `*.e2e.*`, `*_test.*`, `*.snap`, plus the case-sensitivity and `*.test` non-match edges) are untested. Realistic source: a future single-line edit dropping `fixture` or `testdata` from `segments`, or breaking one glob, makes the guard silently skip those files — the enforcement this leaf exists to provide stops applying with no test failure. Consequence today: uncited test-file edits merge. Criterion: done-criterion 1/2 name the full rule; the brief's exact list is a fixed literal that runs as written, so a test enumerating it is in scope. Cheapest sufficient fix per standing design: a small `testFile` unit test enumerating the list and the named non-matches.
- F2. `docs/guide/merge.md` says "Every phase move also checks that the branch's changed old test files each carry a `Test-Change:` trailer". False: a move to `failed` skips the guard by design (so a seat can always stop). Realistic source: an operator (or a seat reading the guide) infers `phase <slug> failed` demands citations. Consequence today: wrong claim in the operator guide. Criterion: done-criterion 4 requires the docs describe the check truthfully. Fix: qualify the sentence (e.g. "Every phase move except a move to `failed`…").

## Nits

- Commit `1477fae` is authored `worker <worker@local>` (U3's worktree lacked git identity). Cosmetic; the content is correct.
- `checkOnly` refusal for `-> failed` fires before slot/reason validation; order is unspecified and untested either way.
- `--check` on a partially-recorded two-slot move prints `ok` (the move would be accepted); correct per criterion, noted for clarity.

## Verdict

fix — F1 and F2 are concrete defects; everything else verified clean.

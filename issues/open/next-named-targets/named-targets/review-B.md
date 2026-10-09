# Review B: named-targets

Date: 2026-10-09
Phase: check.review (initial blind review)
Base: 4534a569205c3903bcfd56145e74ec8caa4197d5
Reviewed head: f91a268c2b259e6bc0d804deca8bef8a9474949c
Verdict: fix

## Fixes

### F1: Guide commands fail for the guide's same-name issue and leaf

Source: the operator follows `docs/guide/next.md:11-16` to start the leaf, or `:65-70` to start it after unpark, using the widgets layout documented in `docs/guide/parts.md:23-35`: `issues/open/export-csv/export-csv/state.yaml`.

Trace: both examples run `akrogon next export-csv` from the repository root. Discovery produces the `export-csv` issue candidate and the `export-csv` leaf candidate. The new `resolveName` branch at `src/next.ts:1181-1200` refuses both, correctly implementing the collision contract. An isolated registered CLI fixture using the exact documented folder names returned code 1 and these matches:

```text
Ambiguous target "export-csv":
issue issues/open/export-csv
leaf issues/open/export-csv/export-csv
```

Consequence today: the guide's start and restore/start instructions do not start the documented work. The new path example at `next.md:34` explains the resolution but leaves the executable examples contradictory.

Criterion/gap: A7 / brief done-criterion 7, correct operator guidance for same-name targets. This behavior change breaks previously valid examples in the affected target documentation.

Repair: use the documented folder path in the same-name start examples, or clearly ground a distinct slug example in the larger layout where it is unique. Keep parking commands unchanged. No prose-assertion test is needed. Before/after command evidence is sufficient for this documentation Fix.

## Verification

Read the brief, locked design, plan and implementation report before the diff, plus the check-issue ponytail reference. Debate is disabled and there are no positions-B/rebuttal-B artifacts. Did not read the peer review.

Reviewed all four changed files and the complete commit range. Followed `docs/reference-index.md`, the changed behavior's `docs/guide/next.md` and `docs/guide/parts.md`, discovery, repository resolution, path precedence, missing-name handling and selection-before-lock wiring. No AREA.md file is changed, so no changed-area path listing is required.

Code and tests meet A1-A6: open owners derive from valid discovered leaf ancestors, closed leaf slugs remain eligible, folders retain precedence, owner/leaf collisions refuse before locking or allocation, worktrees retain registered-root resolution, and empty/unreadable inputs retain existing handling. Tests cover all four required collision shapes, state preservation and absent allocation side effects. Existing expectations were not changed or deleted.

Accepted implementation/report.md evidence for the unchanged reviewed head: whole configured test command 550 pass / 0 fail, changed test gate 246 pass / 0 fail, typecheck clean, format completed with unrelated base status.ts drift restored, and docs-links 3 pass / 0 fail. Report records deliberate-break red/green proof for owner equivalence, collision refusal, closed-owner exclusion and index-independent owners. Regression guards appropriately remain green on base. No code change or missing check evidence required a full rerun.

Specific documentation concern independently checked:

- Ran the actual `next export-csv` CLI against an isolated registered repository populated with the exact guide layout. Code 1 and both candidate paths confirmed F1. Fixture and temporary script were removed.
- `bun test tests/next.test.ts -t 'ambiguous name refuses an issue and its same-name leaf' --timeout=30000`: 1 pass, 0 fail, 8 assertions. This verifies that the refusal is intentional and the repair belongs in the guide.
- Worktree remained clean and HEAD stayed f91a268c2b259e6bc0d804deca8bef8a9474949c.

## Test-Change trailers

The `src/test-files.ts` rule matches `tests/next.test.ts`. Both test-touching commits carry trailers:

- 6dd031634c43fb322f023c59479a53db2c75b670: `Test-Change: tests/next.test.ts added T1-T6 named-target cases; no existing expectation changed`. Valid: additions implement brief criteria 1-6 and plan T1-T6, with no old assertion/fixture deletion or change.
- f91a268c2b259e6bc0d804deca8bef8a9474949c: `Test-Change: tests/next.test.ts prettier reflow of added helpers; no expectation changed`. Valid: reflows only newly added helpers, with no semantic or existing-expectation change.

## Nits and operator actions

None.

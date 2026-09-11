# Implementation brief: seed-slug-cut

## 1. Goal

Implement plan D1–D3: cap pull seed slugs at 40 characters on word boundaries, preserving number-first identity and the hard-cut exception.

## 2. Numbered acceptance criteria

1. C1–C2. Slugs have at most 40 characters, no trailing hyphen, unchanged normalization and `issue` fallback. The existing 150-X title yields 40 x characters.
2. C3. The multiword title `alpha bravo charlie delta echo foxtrot golf hotel` yields `alpha-bravo-charlie-delta-echo-foxtrot`.
3. C4. A 41-X word, alone or before another word, yields 40 x characters.
4. C5. Preserve normalized values of exactly 40 characters. Preserve `alpha-` plus 34 x characters when followed by a hyphen and another word. A 39-X word followed by another word yields 39 x characters without a hyphen.
5. C6. Existing safe-filename regex, fallback, reconciliation, body and failure scenarios stay green.
6. C7. Demonstrate red then green with the resolved changed-test command. B runs blocking checks and retains the plan's CLI artifact afterward.

## 3. Read-first list

Read the authoritative leaf's `plan.md`, `brief.md`, and `design.md` at `/home/ivan/Work/infra/akrogon/issues/open/seed-filename-length/seed-slug-cut/`.
Read `/home/ivan/.codex/skills/implement-issue/ponytail.md`.
In the worktree read `docs/create.html`'s pull workflow, `src/pull.ts`, `tests/pull.test.ts`, `tests/helpers.ts`, `tests/fake-gh.ts`, and `package.json`. Copy existing temporary repo / fakeGh / cli test patterns. No lessons input is required in implementation.

## 4. Change list and needed interfaces

Only edit `slug(title: string): string` in `src/pull.ts` and `tests/pull.test.ts`. Normalize as today. If longer than 40, take the first 40 characters, backtrack to its last hyphen only when the next character is not a hyphen and the slice contains a hyphen, then remove a trailing hyphen. Preserve the fallback. Reuse `fixture`, `fakeGh`, `cli`, `issue`, `script`, and `snapshot` with existing interfaces.

## 5. Do-not, reasons and exceptions

Do not change helpers, exports, dependencies, docs, reconciliation or migration behavior because the locked scope is the slug and pull tests only. Do not invoke real GitHub or Herdr, because tests use isolated process boundaries. Do not commit or advance phases because B owns verification and handoff. Return a mismatch with evidence instead of changing scope or interfaces. Only a revised brief from B permits an exception. These exclusions keep the change isolated and avoid external state changes, with revised B instructions as the only exception.

## 6. Ordered steps

1. Update and add tests in `tests/pull.test.ts` for C1–C6, then run the changed-test command and save failing evidence under the authoritative leaf's `implementation/`.
2. Implement D2 only in `src/pull.ts`'s slug function, then rerun the changed tests and save passing evidence.
3. Inspect the diff and complete this brief's report with results and limitations.

One verifiable unit, about two files and under ten turns. Return evidence of any material scope mismatch rather than treating this estimate as a hard cutoff.

## 7. Commands

```bash
export AKROGON_BASE=d40b08a40c2991d216e51ba48c9003727a04221d
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"
```

Run only this test command. B owns the full suite, formatter, typecheck and the plan's retained CLI artifact invocation.

## 8. Done-when, evidence and report

C1–C6 pass with red/green evidence from the real CLI against fixture gh. Record logs in this authoritative implementation directory. B completed C7 and retained `/home/ivan/Work/infra/akrogon/issues/open/seed-filename-length/seed-slug-cut/evidence/104-alpha-bravo-charlie-delta-echo-foxtrot.md` using the plan command.

Changed files and reasons: `src/pull.ts` changes only `slug()` to apply the 40-character word boundary rule and hard-cut exception, preserving normalization and fallback. `tests/pull.test.ts` changes the 150-X expectation to 40 and adds CLI coverage for multiword truncation, oversized first words, exact 40-character values, the hyphen immediately after a complete 40-character prefix, and trailing-hyphen removal. Inspected the diff and confirmed only these two code/test surfaces changed.
Tests run: Ran `bun test --changed="$AKROGON_BASE"` with base `d40b08a40c2991d216e51ba48c9003727a04221d` before and after the source change. `red.log`: exit 1, 5 pass, 2 fail, 57 assertions. `green.log`: exit 0, 7 pass, 0 fail, 77 assertions. The failures demonstrated the old long filenames. The passing run covers C1–C6 through the real CLI against fixture gh, including the unchanged reconciliation and failure scenarios.
Known limitations: Live GitHub is not exercised. Old names change on the next successful pull.
Unverified criteria: None. B verified C7: `bun test` passed 45 tests with 508 assertions, `bun run typecheck` and `bun run format` exited 0, and the plan CLI invocation exited 0 and retained the expected seed artifact. Evidence: `test.log`, `typecheck.log`, `format.log`, `cli-artifact.log`, and the seed artifact path above. `git diff --check` passed and the final diff contains only the two owned files.

B handoff: committed as `6ca2468` (`fix: shorten seed slugs at word boundaries`). Worktree clean after commit. Only `src/pull.ts` and `tests/pull.test.ts` changed on the leaf branch.

# Brief 2: trailer rule in the four skills

## 1. Goal

Make the skills state the `Test-Change:` trailer rule and the merge-time `--check` call, plan decision D8. Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/test-change-check-u2`.

## 2. Numbered acceptance criteria

1. `skills/implement-issue/SKILL.md`: at the implement commit rule (the paragraph ending "...because every issue artifact is written only in the registered checkout", :63) and once in `## check.fix`, state: any commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <path> <source and reason>` trailer in the final trailer block, one per changed old test file; a later trailer-only empty commit is an allowed exception to the no-empty-commit rule; the move is refused without it. Adding a case to an existing test file needs the line too; its text says what was added and that no existing expectation changed, citing no source.
2. `skills/implement-issue/brief-template.md`: the same trailer rule where worker commits are specified (section 8 area), noting delegated commits survive cherry-pick so the trailer lands on the lane.
3. `skills/check-issue/SKILL.md`: in `## check.review`, B lists the `Test-Change:` trailers in `<target>..HEAD` in `review-B.md` and judges each cited source (leave the judgment wording to the test-rules leaf — just the listing plus "judges each against its cited source"). In `## check.repair`, B's own commits that change old test files carry the same trailer.
4. `skills/merge-issue/SKILL.md`: after green checks and right before the push, B runs `akrogon phase <slug> merged --slot B --check`; on a refusal B adds a commit carrying the missing trailer when the change has a real source (a trailer-only empty commit when the change sits inside a rebased commit), or reverts the change, then reruns the checks and `--check` before pushing. Also the trailer sentence itself where B commits scoped outstanding changes.
5. Every location points to `src/test-files.ts` for the path rule (inline code, no markdown link); the trailer format line is stated once per file, not duplicated inside a file.

## 3. Read-first list

- `skills/implement-issue/SKILL.md` :55-90 (commit rule paragraph, `## check.fix`).
- `skills/implement-issue/brief-template.md` :1-50 (eight-section template, §6/§8).
- `skills/check-issue/SKILL.md` :35-58 (`## check.review`), :69-95 (`## check.repair`).
- `skills/merge-issue/SKILL.md` :35-60 (push sequence).
- Ponytail: `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owned paths: the four skill files above. Prose only — no code, no tests. Shared literal interfaces (fixed by the plan, already decided): trailer `Test-Change: <exact path> <source and reason>` read from the final trailer block; path-rule module `src/test-files.ts`; merge call `akrogon phase <slug> merged --slot B --check`. Sentences must fit the files' existing terse single-sentence style; append clauses or one new sentence, never restructure paragraphs.

## 5. Do-not, reasons and exceptions

- Do not copy the path-rule segment/pattern list into prose; point to `src/test-files.ts` (one shared definition).
- Do not edit code, tests, `README.md`, `docs/`, `issues/` or other skills.
- Do not add markdown links to `src/test-files.ts` (docs-links tests check relative links; inline code only).
- Do not write the rule-2 judgment sentence (when a change is allowed / what counts as a source) — the `test-rules` leaf owns it and lands in parallel; leave room for it.
- Exceptions: none; a conflicting requirement returns a mismatch.

Restating: exclusions keep one rule definition and avoid colliding with the parallel test-rules leaf; the exception is a mismatch return.

## 6. Ordered steps

1. Edit `skills/implement-issue/SKILL.md` (criterion 1): trailer sentence in the implement commit paragraph including the empty-commit exception; one sentence in `## check.fix`.
2. Edit `skills/implement-issue/brief-template.md` (criterion 2).
3. Edit `skills/check-issue/SKILL.md` (criterion 3): review-listing line and repair trailer line.
4. Edit `skills/merge-issue/SKILL.md` (criterion 4): `--check` step before the push with refusal handling, plus the trailer sentence at the scoped-commit instruction.
5. Commit with a normal message (no trailer needed — these files are not test files).

## 7. Commands

`bun test --changed=a97d4a11eae4bbc4f1d460eb5fa6a343ef895552 --timeout=30000` — expect it to run no tests for this prose-only diff; paste the actual output.

## 8. Done-when, evidence and report

All five criteria met; `grep -n 'Test-Change'` on each of the four files shows the additions.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

# Plan: trailer-rule-refusal

Seat: A, phase plan.synthesis. Leaf: issues/open/trailer-rule-refusal/trailer-rule-refusal. Worktree: /home/ivan/.akrogon/worktrees/akrogon/trailer-rule-refusal on branch `trailer-rule-refusal` at 39e203a7 (AKROGON_BASE).

## Decisions

- D1 — Shared builder: add `function citationRefusal(missing: string[]): string` in `src/phase.ts` between `requireTestChangeCitations` and `requireFrozenCitations` (module scope, beside its two callers). It takes the missing-path list only; both callers throw `new Error(citationRefusal(missing))`. No other difference between the two sites exists today, so the builder carries the whole message. (Answers "Open for the plan: the shared builder's name and whether it takes the missing-path list only" — name `citationRefusal`, takes `missing` only.)
- D2 — New shared text, replacing the current two-line body verbatim in both call sites:

  ```
  Changed test files need a citation:
  Test-Change: <path> <source and reason>   (one per missing path, from missing.map)
  Add each citation as one line to the final trailer block, the commit message's last paragraph holding only trailer lines; a later empty commit may carry it.
  ```

  Locks: keeps `final trailer block` and `a later empty commit may carry it` (existing assertions); adds `one line` (the asserted writer form); explains the block as the last paragraph holding only trailer lines without the words `indent`, `fold`, or `wrap` and with no claim that a wrap happened.
- D3 — New test case in `tests/phase.test.ts`, placed after `modified old test files need a Test-Change trailer on every guarded move` (line ~1771), reusing `fixture`, `oldFileBranch`, `commitAll`, `leaf`, `verified`, `cli`, `bytes`, `readState`. Asserts refusal code, `x.test.ts` path, phrase `one line` only, state still `implement` via `bytes(path)` unchanged; then a later `--allow-empty` commit carrying the same path and reason on one line and the move passes. No whole-sentence or negative-text assertion (design: reviewing seat reads the full text; B's standing dissent noted).
- D4 — Run shape: serial-solo. One unit owns every owned path, so implement-issue's rule applies: A implements the plan itself, no workers.

## Read-first paths

- `src/phase.ts` — `requireTestChangeCitations` (561), `requireFrozenCitations` (603), `citedPaths`, `emptyCommitTrailerValues`, `trailerValues` (unchanged; git stays the only reader via `%(trailers:key=Test-Change,valueonly,unfold)`).
- `tests/phase.test.ts` — citation fixtures: `oldFileBranch` (1725), `commitAll` (1739), the citation tests at 1744, 1773, 1811; frozen-citation tests at 2282+ asserting `final trailer block` (2310).
- `tests/helpers.ts` — `cli` (101), `leaf` (140), `verified` (294).
- `src/test-files.ts` — `testFile` path rule (unchanged).
- `docs/reference/checks.md` and `skills/*/SKILL.md` trailer lines — checked: they describe the writer rule and stay accurate under the new text; no doc edit.

## Needed interfaces

Existing only. `citationRefusal(missing: string[]): string` is the single addition.

## Checklist (waves)

Run shape: serial-solo (every wave holds one unit).

### Wave 1

- U1 — owns `src/phase.ts` (`citationRefusal` builder + both throw sites) and the already-committed `tests/phase.test.ts` case. Prove: criterion-1 test green; configured `test` check green at implement end.

### Docs

No agent or human doc affected: writer guidance in `docs/reference/checks.md` and the five skill trailer lines already state the final-trailer-block rule; the refusal text is not quoted anywhere outside `src/phase.ts`.

## Done-criteria proofs

### Criterion 1 — wrapped citation refused, one-line form named, one-line repair passes

- Observation: the real `akrogon phase <slug> check.review` move on a leaf worktree whose only citation for the edited `x.test.ts` is a flush-left wrapped trailer; before = refusal naming the path without the writer form, after = refusal naming the path and the one-line form, and a later empty one-line commit moves the leaf to `check.review`. Catches the reported failure (writer told "final trailer block" while their wrap silently voided the block).
- Test: `tests/phase.test.ts`, new test `a flush-left wrapped Test-Change trailer is refused and the refusal states the one-line writer form` (D3).
- Proof command: `akrogon run-check --name 'criterion-1' -- bun test tests/phase.test.ts -t 'wrapped'` (test-filter form of the configured `bun test` runner; runner exists at AKROGON_BASE).
- Size: minutes (fixture builds a scratch repo). Rerun trigger: any change to `citationRefusal`, the throw sites, or the test.
- Condition checks against the criterion:
  - refusal must happen (wrapped trailer not accepted): covered by the test's `code !== 0` + `x.test.ts` assertions; git's trailer reading is the invariant — verified by probe 2026-11-17: a `-m` message `Test-Change: x.test.ts src change edited\n\nthe test` yields empty `%(trailers:key=Test-Change,valueonly,unfold)`. No case needed beyond the test's red run.
  - refusal must name the missing path: temp edit dropping `${missing.map(...)}` from the message → expect fail on `toContain('x.test.ts')`. Recorded below.
  - refusal must state the one-line writer form: current head violates it, so the criterion-1 red run is the violation evidence; a kept-state temp edit = current text, same output.
  - repair on a later empty commit passes: asserted by the test's second half; violating it requires breaking `emptyCommitTrailerValues`/`citedPaths` — outside the diff, no case.
  - keeps `final trailer block` + `empty commit`: guarded by existing assertions at tests/phase.test.ts:1757-1758 and 2310 running under the configured `test` check.
  - no `indent`/`fold` advertisement, no wrap claim: no case — the design assigns the full text to the reviewing seat; negative text-matching is the prose-assertion pattern lessons warn against.

### Criterion 2 — frozen-citation refusal prints the same shared text; no existing test edited

- Observation: `requireFrozenCitations`' throw at src/phase.ts:639 is `new Error(citationRefusal(missing))` — one builder means identical text by construction, read by the reviewing seat in the diff; the configured `test` check stays green, proving the two existing `final trailer block` assertions (and all citation tests) still pass unedited.
- Proof: shared builder in the diff (review seat reads `src/phase.ts`); `test` check command: `akrogon run-check --name 'test' -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile --backend=copyfile'\'' && akrogon guard own-modules && sh -c '\''bun test --timeout=30000 --parallel=4 --no-isolate'\'''` at implement end.
- Size: minutes. Rerun trigger: any diff touching either throw site or the builder.
- Conditions: identical text across both sites — enforced by the single-builder decision; a decision duplicating the message would fail the criterion on review read, not on a test (no second case: a string-equality test across two call sites is prose-assertion machinery the design rejects). No existing test edited — `git diff` on tests/ shows only the added case; `test` green is the observation.

### Criterion 3 — report statements

- Observation: `implementation/report.md` contains all three statements — the refusal now gives the writer form; whether framework lesson `history/2026-10-24-test-change-trailer-single-line.md` retires is the framework's call; its added-path half is untouched. Read by the reviewing seat; no mechanical check exists or is added.
- Size: seconds. Rerun trigger: report edit.

## Credentials

None. `akrogon status trailer-rule-refusal` shows no `Missing:` lines; `env_names` is empty; the design names no credential.

## Grants

No paid or live operations in this leaf; no `grants[]` entries consumed.

## Commit order

1. `tests/phase.test.ts` — the new case, committed alone with trailer `Test-Change: tests/phase.test.ts added wrapped-trailer refusal test for this leaf; no existing expectation changed`.
2. `src/phase.ts` — `citationRefusal` + both throw sites (implementation pass).

## Implementation notes

2026-11-18 (check.fix, B's F1 handoff): criterion 1's "states the one-line writer form" is recorded under plan-issue's model-choice reading: the design's phrase assertion was A's autopilot pick without an independent one-right-answer source, so it reads as judging the writer's explanation by a count/match with no named source — a model-choice reading, not a weakening of the criterion. The criterion's locked observable results stay: the move is refused, the refusal names the missing path, and the same path and reason on one line on a later empty commit passes. The writer-form sufficiency of the full refusal text is judged by the reviewing seat on the text itself (B's review already judged it sufficient; no product change). Corrected rule for D3: the case asserts refusal, missing path, unchanged state and the one-line empty-commit repair; the `toContain('one line')` assertion is removed and the test renamed to `a flush-left wrapped Test-Change trailer is refused and a later empty commit carrying the citation repairs it`. Executable check for the corrected rule: `akrogon run-check --name 'criterion-1' -- bun test tests/phase.test.ts -t 'wrapped'`, run on the repair head.

## Red-run records

- criterion-1 natural red, current head 39e203a7 + test: `check criterion-1: 1` (`check-criterion-1-1794955930801-1552458.log`). Refused `code !== 0` and stderr contained `x.test.ts` (wrapped trailer produced no git citation); failed only at `expect(refused.stderr).toContain('one line')` — received text ends `...a later empty commit may carry it.` with no one-line form. First run (`36969a96`, `Cannot find package 'zod'`) was before `bun install`; rerun with the configured install step.
- path-condition temp edit (`missing.map` dropped from the message): `check cond-path: 1` (`check-cond-path-1794955936759-1554178.log`). Failed at `expect(refused.stderr).toContain('x.test.ts')` — a distinguishable failure proving the path assertion. Edit reverted; `src/phase.ts` clean.
- Test committed: `53659165` `tests: wrapped Test-Change trailer refusal states the one-line writer form`, trailer `Test-Change: tests/phase.test.ts ...`.

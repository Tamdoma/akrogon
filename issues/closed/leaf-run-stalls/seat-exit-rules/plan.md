# Plan: seat-exit-rules

Direct synthesis. `debate: no` in state.yaml, no positions or rebuttals. Brief and design agree, no conflict to record.

## Decisions

- D1: Rule 1 is one new paragraph in `skills/implement-issue/SKILL.md` Shared context, directly after the failed-exit paragraph (lines 31-32). It names both implement and check.fix, reuses that failed exit, and gives the reason format `"<criterion> red: <cause>"`. The check.fix section gets one cross-ref sentence only, no second copy of the rule.
- D2: Rule 2 replaces the sentence at `skills/implement-issue/worker-protocol.md:17` with a two-branch paragraph. Provider-failure branch: A recognizes it by the error text in the failed result, relaunches only after the old worker ended, spawn cwd is the retained worktree, brief is the original plus the added line verbatim, one relaunch, second failure of the same unit ends the leaf pass `failed` naming provider, error text and both transcript paths, standalone reports the same contents instead. Budget/limit branch: turn-budget and output-limit stops keep the current remainder rule, and `never the original brief again` stays only there.
- D3: These strings are byte-exact, no rewording: `akrogon phase <slug> failed --reason "<criterion> red: <cause>" --slot A`; added worker line `A previous worker died here. Check what is already done (criteria, commits, changed files and external effects such as uploads) before repeating work. Keep what is correct. Finish the brief.`
- D4: No code, no new tests, no new files. Cheapest sufficient proof is reading the changed sentences against C1-C2 plus blocking checks. A grep or wording test would be a vanity test under the standing design.
- D5: One unit U1 owns both files, one worker wave of 1. Two-sentence prose edit in one skill, no independent verification to parallelize. Satisfies config `implement: subagents` with a single worker.
- D6: Doc sweep is grep-only over `docs/`, `skills/`, `src/` for stale copies of the changed rules. Out-of-scope hits are reported as limitations, not edited. Nothing under `issues/` is touched.

## Read-first list

- `skills/implement-issue/SKILL.md` (Shared context lines 29-34, check.fix section)
- `skills/implement-issue/worker-protocol.md` (line 17 and Failure ownership)
- `skills/implement-issue/ponytail.md` (required before editing)
- `skills/implement-issue/brief-template.md` (eight-section brief shape)
- `skills/chart-issues/assets/standing-design.md` (prose-only proof, no vanity tests)
- `docs/reference-index.md` and `skills/AREA.md` (index and area, area stays unchanged)

## Needed interfaces

- `akrogon phase <slug> failed --reason "<criterion> red: <cause>" --slot A`
- Added worker line, verbatim (see D3).
- Second-failure reason contents: provider name, error text, both transcript paths.
- Resolved changed-tests command: `AKROGON_BASE=2ad0acf70a85dacefa3a89c53a53233e2aae11ca bun test --changed="$AKROGON_BASE"`

## Acceptance criteria

- C1 (brief 1): SKILL.md states rule 1 for implement and check.fix, reuses the existing failed exit, names reason format `"<criterion> red: <cause>"`. Never hands off as pre-existing, base red, or modulo anything.
- C2 (brief 2): worker-protocol.md states rule 2 with all parts from D2. `never the original brief again` applies only to turn-budget and output-limit stops.
- C3 (brief 3): Every blocking `checks` command passes, including the resolved changed-tests command.

Derived test set: none. C1-C2 are prose, proved by reading the diff. C3 is the existing checks. No new test file.

## Ordered checklist

- S1 (U1, C1): Edit `skills/implement-issue/SKILL.md` per D1 plus the check.fix cross-ref. Verify by reading the new paragraph and `git diff`.
- S2 (U1, C2): Edit `skills/implement-issue/worker-protocol.md` per D2-D3. Verify by reading the replaced paragraph and `git diff`.
- S3 (A, C3): Grep sweep for stale rule copies, then run all blocking checks and record results in the report. Verify by pasted command output.

No ordering dependency beyond S1-S2 before S3. Single unit, no prerequisites.

## Docs affected

- Agent doc `skills/implement-issue/SKILL.md`: gains the rule-1 failed-exit paragraph plus check.fix cross-ref.
- Agent doc `skills/implement-issue/worker-protocol.md`: line 17 becomes the two-branch relaunch rule.
- Human docs: none affected; live grep found no copy of these rules under `docs/`.

## Verification map

- C1: proof `git diff -- skills/implement-issue/SKILL.md` plus read of the new paragraph; catches missing phase, wrong reason format, or modulo handoff wording; size seconds; rerun on any edit to SKILL.md.
- C2: proof `git diff -- skills/implement-issue/worker-protocol.md` plus read of the replaced paragraph; catches missing relaunch part, altered verbatim line, or `never the original brief again` leaking onto provider deaths; size seconds; rerun on any edit to worker-protocol.md.
- C3a: proof `bun run format`; catches formatting drift in src/tests; size seconds; rerun on any src/tests edit.
- C3b: proof `bun test`; catches broken command behavior; size seconds (full suite green at plan time, under 60s); rerun on any src/tests edit and once after the last unit lands.
- C3c: proof `bun run typecheck`; catches type errors; size seconds (about 1s at plan time); rerun on any src/tests edit.
- C3d: proof `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=2ad0acf70a85dacefa3a89c53a53233e2aae11ca`; catches regressions in changed files (expects 0 tests for prose-only diff); size seconds; rerun as work lands and after each cherry-pick.

Not a slow-run leaf, so no restart boundaries.

## Credentials

Design names no variable by name, so no `bun --env-file` presence check applies and there is no human-only credential blocker.

## Open limitation

Nothing enforces that a future A reads the error text correctly; a quota, billing, or context-overflow error misread as a provider death would get a wasted relaunch. The text states the distinction but no command guards it.

## Notes

- Fuzzy terms fixed: `cannot pass within owned surfaces` means after the permitted repairs (a red full-suite sub-brief and a slow-run leaf in-branch fix) the failure sits in files no unit of this leaf owns; `provider error` means the error text pi returns after its own retries are spent (overloaded, 429/500/502/503/504, rate limit, unavailable, network and stream drops), read from the failed result, never quota, billing, or context overflow.
- Concrete scenario: full suite stays red on a base-owned file after the permitted repairs, so A ends `failed` with reason `C1 red: <cause>` instead of writing `modulo pre-existing`. Worker U11 dies on a 503, so A relaunches the same worktree with the original brief plus the added line; a second 503 on U11 ends the pass `failed` naming provider, error, and both transcripts.
- Live surface checked at plan time: SKILL.md:31-32 holds the failed exit, worker-protocol.md:17 holds the old single sentence, grep over `docs/`, `skills/`, `src/` found no other copy, `bun test` and `bun run typecheck` green, `bun run format` clean.

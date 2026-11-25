# brief-2: repair review-B round-2 F2/F4 in scanBunOutput

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/verify-test-facts-u1` (create it yourself first: `cd /home/ivan/.akrogon/worktrees/akrogon/verify-test-facts && git worktree add --detach /home/ivan/.akrogon/worktrees/akrogon/verify-test-facts-u1 HEAD` — HEAD is leaf commit `36985021`; remove the worktree if one already exists there after checking it holds no uncommitted work). Install dependencies there before tests.

## 1. Goal

Repair the two round-2 defects review-B handed to A, both inside `scanBunOutput` in `src/flaky.ts` (expected: no other product file changes). This is the same function your predecessor repaired in round 1 (`a90a1b76`); read its current form, not the round-1 diff.

## 2. Numbered acceptance criteria

1. Both committed round-2 reproduction tests pass: `repro F2 round 2` and `repro F4 round 2` in `tests/verify.test.ts`. You write and edit no test: if a reproduction expectation is wrong, return a mismatch with evidence instead of editing it.
2. Every other test passes unchanged — the round-1 repros (`repro F1`..`repro F4` without "round 2"), `tests/flaky.test.ts`, `tests/flaky-merge.test.ts`, and the planned criterion proofs (`20 slowest`, `stream-attached timeouts`, `per-leg durations`, `leaf rows carry no durations`, `stamps the attempt`, `legacy verify-runs`, `pins timeouts and durations`). Byte-identity of `names` against the pre-change implementation remains the leaf's core contract.
3. `bun run typecheck` green.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `src/flaky.ts` — the current `scanBunOutput` (round-1 form).
- `review-B.md` in `/home/ivan/Work/infra/akrogon/issues/open/merge-test-facts/verify-test-facts/` — the round-2 sections, plus the evidence log `implementation/check-recheck-b-bun-streams-1795581072649-3786828.log` (read with `akrogon log <path>`) — note exactly what real Bun prints: a blank line between the assertion failure's `(fail)` line and the diagnostic caret line, and wrapper chains of the shape `wrap | sh run-tests.sh | (pass) <title> [<n>ms]`.
- The round-2 reproduction tests at the end of `tests/verify.test.ts` (read-only for you).

## 4. Change list and needed interfaces

Owned paths: `src/flaky.ts` only. Wave: one wave, one unit; nothing else in flight. Creation commit: `36985021`.

- **F2 blank-line expiry.** Empty segments currently `continue` at the segment loop. Distinguish a real blank line from CRLF pairing: split the text so `\r\n` is one line ending (e.g. `split(/\r\n|[\n\r\u2028\u2029]/)`). A genuinely empty segment — a blank line — is then output of the bare stream and must expire the bare chain's timeout candidate exactly as other bare output does. A `\r\n` ending must NOT expire anything: the round-1 F1 CRLF regression stays green with `timeouts: ['assertion']`. Chained blank shapes (`wrap | sh x | ` with empty payload) are ordinary chained output and already expire through the existing owner mechanism — do not special-case them. A lone `\r` is a line terminator like before; `\r\r` produces a blank line.
- **F4 leading result marker after the wrapper chain.** In the chained reading used for durations and candidate tracking, the pass/fail marker is the FIRST `| (pass) ` or `| (fail) ` occurrence scanning left-to-right, whichever comes first — the marker that follows the wrapper chain, not the first `| (fail) ` anywhere. `wrap | sh run-tests.sh | (pass) keeps text | (fail) in a title [10.12ms]` is a pass of chain `wrap | sh run-tests.sh` with title `keeps text | (fail) in a title` and duration 10. The round-1 unwrapped anchored reading is unchanged. Legacy-extraction semantics that no longer apply (chained fail-first / pass-second alternatives) must be replaced by this single leftmost-marker reading consistently everywhere the chained shape is consumed for facts: duration titles, `(unnamed)` normalization, and candidate set/expire (a chained line read as a pass must expire the candidate, one read as a fail must set it). Do NOT touch the `names` extraction — it stays the verbatim legacy whole-text regexes.

## 5. Do-not, reasons and exceptions

- Do not edit any test file: reproductions and planned tests are A's; a wrong or red-after-correct-repair test is a mismatch return, with evidence. Exception: none.
- Do not change `names` output in any way: the whole-text legacy `matchAll` extraction is the leaf's byte-identity contract and is why the chained ambiguity must be resolved in the fact pass only. Exception: none.
- Do not weaken or remove existing assertions anywhere. Exception: none.
- Do not run `git stash` in any form: worktrees share one stash. Use `git show` or a second worktree to compare; to set work aside before returning: commit as WIP, then `git reset --soft 36985021` and make the unit's single returned commit.
- Do not stop processes by command-line pattern; use `akrogon stop-run <run-id>`.
- Do not touch `src/verify.ts`, docs or AREA files — return a mismatch instead. Exception: none.

These exclusions exist because every regression and proof from rounds 1 and the original leaf must stay green; this is a narrow repair inside one function.

## 6. Ordered steps

1. Read the files in section 3. Run the round-2 repros red to confirm starting state: `akrogon run-check --name w2-repro-before -- bun test --timeout=120000 tests/verify.test.ts -t "round 2"`.
2. Apply the repair in `scanBunOutput` per section 4.
3. Byte-identity fuzz check as a throwaway script (delete after): compare `scanBunOutput(text).names` against the original implementation copied from `git show 085f2f88:src/flaky.ts` over at least 2000 random compositions like round 1 (chained/unchained lines, terminators, caret lines). Report the count identical; any divergence is a defect to fix, not a test edit.
4. Run: `akrogon run-check --name w2-repro-after -- bun test --timeout=120000 tests/verify.test.ts -t "round 2"` — both green.
5. Run: `akrogon run-check --name w2-repro-round1 -- bun test --timeout=120000 tests/verify.test.ts -t "repro F"` — all six green (round-1 and round-2 repros).
6. Run: `akrogon run-check --name w2-scan-suite -- bun test --timeout=120000 tests/flaky.test.ts tests/flaky-merge.test.ts` — all green.
7. Run: `akrogon run-check --name w2-criteria -- bun test --timeout=120000 tests/verify.test.ts -t "(20 slowest|stream-attached timeouts|per-leg durations|leaf rows carry no durations|stamps the attempt|legacy verify-runs|pins timeouts and durations)"` — all green.
8. Run `bun run typecheck` and `bunx prettier --check src/flaky.ts` — both clean (prettier --write on `src/flaky.ts` only if needed; re-verify repros after formatting).
9. One commit containing the repair. Advisory size: 1 file, under 20 turns.

## 7. Commands

Exactly the run-check commands in section 6. No other test command; never `akrogon verify` (that is A's).

## 8. Done-when, evidence and report

Done when steps 3-8 are green with cited `check <label>:` lines, the fuzz result is reported, and one commit holds the diff. Fill in:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

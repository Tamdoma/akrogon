# brief-1: repair review-B F1-F4 in scanBunOutput

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/verify-test-facts-u1` (created at leaf commit `2959a001`; install dependencies there before tests).

## 1. Goal

Repair the four proven scan defects F1-F4 handed to A in `review-B.md`, in the single function `scanBunOutput` in `src/flaky.ts` (plus only what that requires in `src/verify.ts`, expected: nothing). Plan decisions D1-D3, D8 apply.

## 2. Numbered acceptance criteria

1. The four committed reproduction tests pass: `repro F1`, `repro F2`, `repro F3`, `repro F4` in `tests/verify.test.ts`. You write and edit no test: if a reproduction expectation is wrong, return a mismatch with evidence instead of editing it.
2. Every pre-existing test passes unchanged — in particular `tests/flaky.test.ts` and `tests/flaky-merge.test.ts` green, and the leaf's planned criterion proofs (`20 slowest`, `stream-attached timeouts`, `per-leg durations`, `leaf rows carry no durations`, `stamps the attempt`, `legacy verify-runs`, `pins timeouts and durations`) green. Byte-identity of `names` against the pre-change implementation is the leaf's core contract.
3. `bun run typecheck` green.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `src/flaky.ts` — `scanBunOutput` (the repair target) and the pre-change `failureNames` semantics it must preserve. The original implementation is in git at `085f2f88` — read it with `git show 085f2f88:src/flaky.ts | sed -n '1,60p'`; its copy is the authoritative byte-identity target.
- `src/verify.ts` — `durationsFor`, `timeoutsFor`, `commandRow` (consumers; expected unchanged).
- `review-B.md` in `/home/ivan/Work/infra/akrogon/issues/open/merge-test-facts/verify-test-facts/` — F1-F4 findings with evidence log paths; the two evidence logs themselves: `implementation/check-review-b-bun-streams-1795578777102-2337248.log` and `implementation/check-review-b-timeout-adjacency-1795578823379-2362062.log` (read with `akrogon log <path>`).
- The reproduction tests at the end of `tests/verify.test.ts` (read-only for you).

## 4. Change list and needed interfaces

Owned paths: `src/flaky.ts` only. Wave: one wave, one unit; nothing else in flight. Creation commit: `2959a001`.

Repairs, each independently testable:

- **F1 byte-identity.** `names` must be exactly what the pre-change multiline-regex scan produces for every input. Simplest correct approach: keep the legacy extraction verbatim — compute titles, failedStreams, exited lines, leaf streams, scripts and the final dedupe with the original `matchAll` regexes applied to the whole text (copy the original code from `git show 085f2f88:src/flaky.ts`), and use the per-line pass only for what genuinely needs ordering: timeout attachment and durations. JavaScript's multiline `^`/`$` treat `\r`, U+2028 and U+2029 as line boundaries; the line-iteration segmenter must match that or be bypassed for names. Verify with the reproduction test and the fuzz logic in section 6.
- **F2 caret adjacency.** A caret line attaches only when the immediately preceding line of its own chain was that chain's `(fail)` line. Any other line of the same chain — a pass, a second `(fail)` (which becomes the new candidate), or ordinary output like `example timeout diagnostic:` — expires the candidate. Interleaved lines of *other* chains do not affect it (the existing T2 interleaving test must stay green). A caret line itself is consumed and does not extend the window. Lines that are zero-length after segmentation neither attach nor expire (CRLF pairing produces empty segments).
- **F3 numeric gate.** A duration is recorded only when the bracket matches Bun's real format `\d+(\.\d+)?ms` (reject `...`, `.5`, `5.`, non-numeric). The legacy name grammar is untouched: `(pass) understands the output form [...ms]` must still contribute nothing to durations while a real `[10.50ms]` rounds to 11. The ledger row must serialize and re-parse — `NaN` must be impossible by construction, not by a post-check.
- **F4 anchored durations.** Duration titles come from the anchored Bun result: a line starting `(pass) ` or `(fail) ` has its whole remainder as the title even when the title itself contains `| (fail) ` — `(pass) keeps text | (fail) in a title [10.09ms]` records `keeps text | (fail) in a title`. Chained lines keep the legacy chain extraction with `(unnamed)` normalization. Timeout attachment and failure names follow the legacy parse exactly as today (byte-identity); only duration titles take the anchored reading.

## 5. Do-not, reasons and exceptions

- Do not edit any test file: reproductions and planned tests are A's; a wrong or red-after-correct-repair test is a mismatch return, with evidence. Exception: none without a revised brief.
- Do not change `failures` semantics in any way, including `(script)` inference, dedupe order or `(no test name)` fallback — byte-identity is the leaf's locked contract. Exception: none.
- Do not weaken or remove existing assertions anywhere. Exception: none.
- Do not run `git stash` in any form: worktrees share one stash and a pop can lift a sibling's edit. To compare base behavior use `git show` or a second worktree. To set work aside before returning: commit as WIP, then `git reset --soft 2959a001` and make the unit's single returned commit.
- Do not stop processes by command-line pattern; use `akrogon stop-run <run-id>`.
- Do not touch `src/verify.ts`, docs or AREA files unless the repair physically requires it — return a mismatch instead. Exception: none.

These exclusions exist because the leaf's contract is byte-identical legacy names plus exactly the new behaviors the brief proofs pin; scope creep in either direction fails review.

## 6. Ordered steps

1. Read the files in section 3. Run the reproduction tests red to confirm your starting state: `akrogon run-check --name w1-repro-before -- bun test --timeout=120000 tests/verify.test.ts -t "repro F"`.
2. Rewrite `scanBunOutput` per section 4. One coherent rewrite is fine; it is one function. Keep `failureNames` as the thin wrapper.
3. Byte-identity fuzz check as a throwaway script (delete it after): compare `scanBunOutput(text).names` against the original implementation copied from `git show 085f2f88:src/flaky.ts` over at least 2000 random compositions including `\r`, `\r\n`, U+2028, U+2029, chained and unchained `(fail)`/`(pass)` lines, `(unnamed)`, `Exited with code` lines and caret lines. Report the count identical; any divergence is a defect to fix before proceeding, not a test edit.
4. Run: `akrogon run-check --name w1-repro-after -- bun test --timeout=120000 tests/verify.test.ts -t "repro F"` — all four green.
5. Run: `akrogon run-check --name w1-scan-suite -- bun test --timeout=120000 tests/flaky.test.ts tests/flaky-merge.test.ts` — all green.
6. Run: `akrogon run-check --name w1-criteria -- bun test --timeout=120000 tests/verify.test.ts -t "(20 slowest|stream-attached timeouts|per-leg durations|leaf rows carry no durations|stamps the attempt|legacy verify-runs|pins timeouts and durations)"` — all green.
7. Run `bun run typecheck` and `bunx prettier --check src/flaky.ts` — both clean (run prettier --write on `src/flaky.ts` only if needed).
8. One commit containing the repair. Advisory size: 1 file, under 20 turns.

## 7. Commands

Exactly the run-check commands in section 6 steps 1 and 4-7. No other test command; never `akrogon verify` (that is A's).

## 8. Done-when, evidence and report

Done when steps 3-7 are green with cited `check <label>:` lines, the fuzz result is reported, and one commit holds the diff. Fill in:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

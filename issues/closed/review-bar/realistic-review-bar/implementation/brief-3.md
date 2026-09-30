# Brief 3: guides and old-rule sweep

Repair revision 2026-09-30 (check.fix round 1, review-B F1): the wave-2 edits already landed and must not be touched again except the F1 line. This revision covers only the `docs/guide/phases.md:101` example repair below; acceptance criteria AC1-AC4 keep their full strength.

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/realistic-review-bar-u3` (detached at the lane HEAD after wave 1 lands, so the final skill wording is visible; commit here, A cherry-picks).

## 1. Goal

Implement plan decision D8 (proves C6): rewrite the review and test lines in `docs/guide/phases.md` and `docs/guide/learn.md` to match the landed skill wording, then sweep `skills/`, `docs/` and `README.md` by meaning and fix any contradicting line.

Binding facts: a Fix names a realistic source (real build, real user action or content, real integration, or attacker-sendable untrusted input), a consequence today, and the criterion, check or gap it hits. Handcrafted reproduction alone is a Nit. Failed checks and named-criterion scenarios always block. A missing or bad test blocks only when a criterion has no catching test, a realistic Fix has no test, or a test mocks the unit under test. Nits stay in the review record with the reproduction or concern, why deferred, and promotion evidence. Repair works Fixes only.

## 2. Numbered acceptance criteria

- **AC1.** `docs/guide/phases.md` replaces the test-evidence paragraph (line 89) and the blocking-finding paragraph (line 99) with the new fix-bar and test-bar in the existing voice. Verified by reading both paragraphs.
- **AC2.** `docs/guide/learn.md` replaces the Fix, Nit and lesson paragraphs with the new rules and states that Nits stay in the review record while repair works Fixes only. Verified by reading the paragraphs.
- **AC3.** A sweep by meaning over `skills/`, `docs/` and `README.md` finds no contradicting line. Every grep candidate was read as a reviewer would. Contradicting lines were edited. Out of scope hits are listed with one line of reason each in the report. Verbatim standing lines the design keeps (no vanity tests, Playwright, chain-trigger) are not flagged. Verified by the sweep log plus the report list.
- **AC4.** The section 7 command passes. Verified by pasted output.

## 3. Read-first list

- `docs/guide/phases.md` lines 85 through 105.
- `docs/guide/learn.md` lines 1 through 15.
- The landed `skills/check-issue/SKILL.md` fix-bar and test-bar blocks (final wording from wave 1, visible in this worktree).
- The landed `skills/implement-issue/SKILL.md` test and repair lines (final wording from wave 1).
- Sweep candidates `docs/guide/files.md` line 25 and `docs/guide/idea.md` line 86.
- Pattern to copy: the guides' plain example voice. Replace lines in place.
- `skills/implement-issue/ponytail.md` (read-only).
- Open the grounding index only for a gap in this list.

## 4. Change list and needed interfaces

- `docs/guide/phases.md`: rewrite the two paragraphs in place.
- `docs/guide/learn.md`: rewrite the Fix, Nit and lesson paragraphs in place.
- Any other `docs/` page or `README.md` line that states the old rule by meaning: edit in place. `skills/` is read-only for this unit.
- No code interfaces. No literals change.
- Chunks that must land first: units 1 and 2. This unit is wave 2 because the guides must describe the final skill wording.
- Paths owned: `docs/guide/phases.md`, `docs/guide/learn.md`, plus contradicting `docs/` or `README.md` lines found by the sweep.
- Shared test resource: none. Consumes the landed wave 1 skill wording.

## 5. Do-not, reasons and exceptions

- Do not touch `skills/`; wave 1 owns it and this unit reads it only. Exception: none.
- Do not reword lines that use the same words for a different meaning; list them as out of scope instead. Exception: none.
- Do not invent new rules beyond the binding facts; the guides describe the landed skills. Exception: none.
- Do not add tests; D9 forbids prose-wording tests for this leaf. Exception: none.
- Do not write under `issues/`; lifecycle artifacts live only in the registered checkout. Exception: none.
- Do not change scope or an interface; return a mismatch with evidence naming the conflict and smallest brief fix. Exception: a revised brief from A authorizing that change.

Reasons restated: wave ownership, minimal diffs, no invented rules, the no-wording-tests rule, and artifact placement keep this leaf reviewable. Exceptions restated: none, except a revised brief from A for scope or interface changes.

## 6. Ordered steps

1. Read the guide sections and the landed skill blocks in section 3 (covers AC1-AC3).
2. Rewrite the `phases.md` and `learn.md` paragraphs in place (AC1, AC2). Keep untouched lines byte-identical.
3. Sweep: `grep -rniE "mandatory negative|concrete defect|broken contract|must carry at least one|preference alone|vanity tests|edge-case tests" skills/ docs/ README.md 2>&1 | tee /tmp/akrogon-realistic-review-bar-sweep.log`. Read every candidate by meaning, edit contradicting `docs/` or `README.md` lines, keep verbatim standing lines, and record out of scope hits with reasons (AC3).
4. Run `bun install --frozen-lockfile` once, then the section 7 command. Repair failures inside this brief (AC4).
5. Commit only the owned files and record the commit ID.

Advisory size: 2 files plus sweep hits, under 12 turns. Work clearly beyond it returns a mismatch with evidence.

## 7. Commands

Run in the worktree, this command only:

```sh
AKROGON_BASE=14e045cf44daf5edf3413ba681fd5b66410b62ba bun test --changed="14e045cf44daf5edf3413ba681fd5b66410b62ba"
```

A runs the full suite separately.

## 8. Done-when, evidence and report

Done when AC1-AC4 hold, the sweep log shows every candidate was judged, out of scope hits carry reasons, the section 7 command passes, and only owned files are committed. No test derivation applies: this is a prose-only edit and D9 writes no new tests.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

## Repair task (check.fix round 1, F1 only)

Finding: `docs/guide/phases.md:101` says "Suppose a CSV field containing a newline creates an extra row. If that violates the contract, the reviewer records the case and requests a fix." The example names no realistic source and no explicitly named criterion scenario, so it still directs repair on a contract violation alone under a broad promise. That contradicts the new fix-bar in the paragraph above it.

Change that example in place so it satisfies the bar, keeping the guide voice and the surrounding lines byte-identical. Use one of the finding's allowed forms: give the newline real user content as its source, cite an explicitly named newline criterion, or condition the repair request on the bar. One sentence of change is enough.

Then re-run the sweep command from section 6 step 3 and re-read every candidate by meaning, confirming no other guide example directs repair, tests or blocking on the old rule. Run `bun install --frozen-lockfile` once and the section 7 command. Commit only `docs/guide/phases.md` and record the commit ID. Report in the section 8 form, adding the F1 before and after lines.

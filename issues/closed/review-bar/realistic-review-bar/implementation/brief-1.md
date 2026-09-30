# Brief 1: check-issue fix-bar, test-bar and Nit format

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/realistic-review-bar-u1` (detached at lane HEAD; commit here, A cherry-picks).

## 1. Goal

Implement plan decisions D1, D2, D3, D4 (proves C1, C2, C3): rewrite the Fix, test and re-check rules in `skills/check-issue/SKILL.md` in place, keeping the file's structure and voice.

Binding facts: every Fix names its realistic source, its consequence today, and the criterion, check or gap it hits. Realistic source means a real build, a real user action or content, a real integration, or untrusted input an attacker can send. A code trace or representative real output is enough. No production incident is needed. A handcrafted reproduction alone is a Nit with the missing evidence stated. Failed `checks` commands and scenarios a done-criterion names always block by citing that check or criterion. A maintainability Fix needs a concrete consequence today. Rarity never downgrades a reachable security, data-loss or concurrency defect. A missing or bad test blocks only when a done-criterion has no test that would catch its failure, a realistic Fix has no test, or a test mocks the unit under test. Assertion style, wording coupling that does not fail today, extra cases and coverage gaps are Nits. Each Nit states the reproduction or concern, why it is deferred, and what evidence would promote it to a Fix. Re-check applies the same bar and blocks only on a defect introduced by the repair.

## 2. Numbered acceptance criteria

- **AC1.** The area-path rule (line 35), doc-behavior rule (line 37), findings record (line 41), Fix definition (line 43) and test-gap triggers (line 47) each apply the fix-bar. Doc-pointer Fixes cite the live listing as the trace, the dead-pointer consequence today and the criterion or gap. Verified by reading the changed block.
- **AC2.** The failed-`checks` block (line 49) stays as the always-block anchor and failed checks plus named-criterion scenarios cite that check or criterion instead of a realistic source. Verified by reading the block.
- **AC3.** One test-bar block states the three blocking cases from section 1 and lists style, non-failing wording coupling, extra cases and coverage gaps as Nits. Verified by reading the block.
- **AC4.** The Nit format rule requires all three parts: reproduction or concern, why deferred, promotion evidence. Verified by reading the lines.
- **AC5.** The re-check rule (line 53) confirms earlier findings, applies the same fix-bar, and adds a blocking finding only for a repair-introduced defect. Verified by reading the rule.
- **AC6.** No old blanket Fix trigger remains. File structure, verdict names `ready`, `nits`, `fix`, and review file names `review-A.md`, `review-B.md` are unchanged. Verified by the section 7 command passing plus `git status` showing only `skills/check-issue/SKILL.md` modified.

## 3. Read-first list

- `skills/check-issue/SKILL.md` lines 29 through 57 (the whole `check.review` section).
- Pattern to copy: the file's own terse rule voice. Replace rules in place. Do not stack exceptions on old sentences.
- `skills/implement-issue/ponytail.md` (this skill folder's ponytail; read-only).
- Open the grounding index only for a gap in this list.

## 4. Change list and needed interfaces

- `skills/check-issue/SKILL.md`: rewrite the rules listed in AC1 through AC5 in place. No other file changes.
- No code interfaces. Literals kept exact: `ready`, `nits`, `fix`, `review-A.md`, `review-B.md`.
- Chunks that must land first: none. This unit is wave 1.
- Paths owned: `skills/check-issue/SKILL.md` only.
- Shared test resource: none. Consumes no other worker output.

## 5. Do-not, reasons and exceptions

- Do not touch any other file; units 2 and 3 own the rest and D11 keeps waves independent. Exception: none.
- Do not touch `skills/check-issue/ponytail.md`; it must stay a symlink. Exception: none.
- Do not add tests; D9 forbids prose-wording tests for this leaf. Exception: none.
- Do not write under `issues/`; lifecycle artifacts live only in the registered checkout. Exception: none.
- Do not change scope or an interface; return a mismatch with evidence naming the conflict and smallest brief fix. Exception: a revised brief from A authorizing that change.

Reasons restated: unit ownership, symlink preservation, the no-wording-tests rule, and artifact placement keep this leaf reviewable. Exceptions restated: none, except a revised brief from A for scope or interface changes.

## 6. Ordered steps

1. Read the file section in section 3 (covers AC1-AC5).
2. Rewrite the rules in place in `skills/check-issue/SKILL.md` (AC1-AC5). Keep every untouched line byte-identical.
3. Grep to confirm the bar is present and the old blanket triggers are gone: `grep -n "realistic source\|consequence today\|handcrafted\|always block\|rarity\|mocks the unit under test\|why it is deferred\|would promote it" skills/check-issue/SKILL.md` (AC1-AC5).
4. Run `bun install --frozen-lockfile` once, then the section 7 command. Repair failures inside this brief (AC6).
5. Commit only `skills/check-issue/SKILL.md` and record the commit ID.

Advisory size: 1 file, under 6 turns. Work clearly beyond it returns a mismatch with evidence.

## 7. Commands

Run in the worktree, this command only:

```sh
AKROGON_BASE=14e045cf44daf5edf3413ba681fd5b66410b62ba bun test --changed="14e045cf44daf5edf3413ba681fd5b66410b62ba"
```

A runs the full suite separately.

## 8. Done-when, evidence and report

Done when AC1-AC6 hold, the grep in step 3 shows the new bar on every trigger, the section 7 command passes, and only `skills/check-issue/SKILL.md` is committed. No test derivation applies: this is a prose-only edit and D9 writes no new tests.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

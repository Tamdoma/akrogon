# Brief 3: check-issue re-check gate plus exception sentences in check-issue and plan-issue

## 1. Goal

Plan decisions D3 (check-issue and plan-issue sites) and D4 of leaf `bounce-repair-proof`: `check-issue` re-review after a merge bounce treats missing replay evidence as a Fix, and both files' "merge_checks only at merge" statements gain the single bounce exception. One unit owning two files: `skills/check-issue/SKILL.md` and `skills/plan-issue/SKILL.md`.

## 2. Numbered acceptance criteria

1. `skills/check-issue/SKILL.md` re-check paragraph (currently :63, "On re-check after `check.fix` ...") gains: when the `check.fix` pass came from a red merge ending, the re-check confirms `implementation/report.md` carries the replay evidence — each command and its arguments, the rejected run's base and head, the rerun's base and head, and the result — and missing evidence is a Fix.
2. `skills/check-issue/SKILL.md` :85 ("After repairs, B runs proof for every done-criterion in `plan.md` and every `checks` command, and does not run `merge_checks`, because merge runs them.") gains the exception, scoped so `check.repair` (B) still never runs `merge_checks`: the only other runner of a `merge_checks` command is A's `check.fix` pass after a red merge ending, which replays the exact rejected command.
3. `skills/plan-issue/SKILL.md` :63 ("A plan proves the brief's done-criteria with the leaf's own tests and `checks` commands and adds no `merge_checks` or whole-suite requirement the brief does not name; a whole run the brief names stays.") gains the same exception so the sentence cannot be read as forbidding the repair-seat replay.
4. No other sentence in either file changes; the :61 base-run rule in check-issue and every other check-issue section stay unchanged.

Proof is read/grep over the diff; no test asserts skill text.

## 3. Read-first list

- `skills/check-issue/SKILL.md` (whole file; :49-63 review and re-check, :85 repair proof, :61 base-run rule to leave alone)
- `skills/plan-issue/SKILL.md` (:59-67 synthesis and proof mapping)
- `skills/implement-issue/ponytail.md`
- For the replay's shape that this gate checks, `skills/implement-issue/SKILL.md` :72-84 (check.fix); sibling unit brief-2 is adding the replay rule there in parallel — this file only needs to reference it, not redefine it.

## 4. Change list and needed interfaces

Owns: `skills/check-issue/SKILL.md`, `skills/plan-issue/SKILL.md`.

- check-issue :63: append to the re-check sentence a clause such as "; after a merge bounce the re-check also confirms `implementation/report.md` records the replay — command, arguments, the rejected run's base and head, the rerun's base and head, and the result — and treats missing evidence as a Fix" (judge the wording).
- check-issue :85: append the exception scoped to A's repair pass, e.g. "; the one exception is A's `check.fix` pass after a red merge ending, which reruns the exact rejected command".
- plan-issue :63: append the same exception, e.g. "; the one exception is the `check.fix` repair after a red merge ending, which reruns the exact rejected command".

Lands first: none. Shared test resource: none.

## 5. Do-not, reasons and exceptions

- Do not touch the check-issue:61 base-run paragraph: the design holds it unchanged.
- Do not let the check-issue:85 edit license B to run `merge_checks` in `check.repair`: the exception names A's `check.fix` pass only.
- Do not re-define the replay mechanics in these files: implement-issue owns them; here they are only named.
- Do not edit any other file.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A authorizing the change.

Restated: only the three listed sentences change, in the two owned files; any needed extra change is returned as a mismatch, not made.

## 6. Ordered steps

1. Read both owned files and the implement-issue context (criteria 4 and the gate's target).
2. Make the three edits per section 4 (criteria 1-3).
3. `git --no-pager diff` both files and confirm only the named sentences changed (criterion 4).
4. Run the changed-test command in section 7.

Advisory size: 2 files, under 8 turns.

## 7. Commands

```bash
cd /home/ivan/Work/infra/akrogon/issues/worktrees/bounce-repair-proof-u3
bun install
export AKROGON_BASE=2e78945849eed87c42abd56f224909f4d2050b36
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

If `bun test --changed` reports no changed tests to run, that is a valid green result for a doc-only diff; record it as such.

## 8. Done-when, evidence and report

Done when all four criteria hold in the diff, both files are committed in this worktree, and the changed-test command has run green or vacuous.

Commit with a short message like `check-issue, plan-issue: bounce rerun exception and re-check evidence gate`. No `Test-Change:` trailer is needed.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

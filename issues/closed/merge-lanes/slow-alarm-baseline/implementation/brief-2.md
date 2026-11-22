# Brief U2: docs (wave 1)

## 1. Goal

Rewrite the slow-alarm documentation to state the new rule. Plan decisions D1-D8; the binding text is forks/extras.md Taken 2 as locked in the design. Criteria: brief criterion 6 — the slow section of `docs/reference/checks.md` and the verify line of `src/AREA.md` state the new rule.

## 2. Acceptance criteria

1. `docs/reference/checks.md` slow paragraph states every element of the new rule: the merge-scope wall-time comparison and eligibility (unchanged), the carried normal (latest stored `slow.normal_ms`) lowered to the rolling last-20-eligible median whenever that is lower and rising only at an `accepted` close, the episode's pinned normal while open, `recovered` on an eligible run when the median of the episode's own last 20 eligible runs (at least 5, run under test included) is back under the 1.5x-plus-2-minutes threshold, `accepted` only when the episode is at least 14 days old from its first flagged run's `end` to this run's `end` and its last 20 eligible runs all lie inside it, the accepted notice under its own notice id naming old and new normal retried by the next checked run when the send failed, the run after an accepted close taking the window's median as its normal, and the cold start (median once 5 eligible runs exist) unchanged.
2. `src/AREA.md` verify line's slow clause states the same rule in the same style as the rest of the line (dense, semicolon-chained clauses), including the strict-key consequence: `slow` gains `accepted_notice`, and a ledger holding it does not parse under an older akrogon, as already stated there for `failures`.
3. No other doc touched: `docs/reference/files.md` verify-runs entry stays as is (it describes `slow` presence, not keys); `tests/AREA.md` stays.

## 3. Read-first

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` (required)
- `docs/reference/checks.md` slow paragraph (line ~81, one paragraph starting "A completed merge-scope run also compares its wall time").
- `src/AREA.md` verify line (line ~17, one long bullet; find the `a completed merge-scope run also compares its wall time` clause).
- `docs/reference/files.md` verify-runs entry (line ~71) to see how the `failures` strict-key consequence is phrased — mirror it.

## 4. Change list and needed interfaces

Worktree commit: `a75e77ba`. Owned paths: `docs/reference/checks.md`, `src/AREA.md`. No shared test resource. No prerequisite units (wave 1).

The new rule, verbatim from the locked design (condense to each file's style, change no fact):

- With no open episode the normal is the carried normal — the latest stored `slow.normal_ms` — lowered to the rolling 20-run eligible median whenever that is lower; it rises only at an `accepted` close. Ledgers with no stored value start as today (rolling median once 5 eligible runs exist). The run after an `accepted` close takes that window's median; the closing row stores the old normal.
- An open episode pins its normal and closes `recovered` only on an eligible run when the median of the episode's own last 20 eligible runs (at least 5, the run under test included) is back under the threshold (1.5x and 2 minutes unchanged). Runs from before the episode never enter that median.
- It closes `accepted` only when it is at least 14 days old — measured from its first flagged run's `end` to this run's `end` — and its last 20 eligible runs all lie inside it. An `accepted` close sends a notice naming the old and new normal under its own notice id (`<repo>.merge-slow-accepted.<run>`), retried by the next checked run when the send failed; the send state lives on the closing row as `slow.accepted_notice`.
- `slow` is a strict object, so a ledger holding `accepted_notice` does not parse under an older akrogon, as already stated for `failures`.

Keep the unchanged facts (1.5x + 2 minutes threshold, eligibility definition, never-checked leaf/compares runs, the `verify slow:` print and `; accepted as new normal` suffix, the `<repo> merge slow` episode notice and its in-episode retry, `akrogon status` slow line, verdict/exit never changing) intact where the current text states them — reword only what the rule changed.

## 5. Do-not, reasons and exceptions

- Do not edit `docs/reference/files.md`, `tests/AREA.md` or any other file: out of this unit's scope, and `files.md` correctly stays on presence-level.
- Do not change any code: this unit is docs only; `src/verify.ts` belongs to U1.
- Keep the AREA line a single bullet in the existing dense style: the file's 40-line cap and format are locked; adding sections is out of scope.
- Do not drop the `; accepted as new normal` print detail or the status-line description: they are still true.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A.
- No `git stash` anywhere: every worktree of a repo shares one stash. To set work aside commit a WIP commit, and before returning `git reset --soft <creation commit a75e77ba>` then make the unit's single returned commit.

Restated: docs only, the two named files, one commit, mismatch over scope change, never stash.

## 6. Ordered steps

1. Read the listed docs and the current `src/verify.ts` text they describe for tone.
2. Rewrite the `checks.md` slow paragraph (acceptance 1).
3. Rewrite the slow clause inside the `src/AREA.md` verify line (acceptance 2).
4. `bunx prettier --check docs/reference/checks.md src/AREA.md` if prettier covers them; fix with `--write` only if it fails.
5. Commit everything as ONE commit, e.g. `docs: slow alarm carried normal and accepted rule`.

Advisory size: 2 files, under 12 turns.

## 7. Commands

- `akrogon run-check --name u2-format -- bunx prettier --check docs/reference/checks.md src/AREA.md` (if this fails on pre-existing drift in files you did not touch, report it, do not reformat them).

No test commands apply to docs.

## 8. Done-when, evidence and report

Both files state the new rule completely and consistently with each other, and the commit carries only these two files.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

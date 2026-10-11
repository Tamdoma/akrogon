# Sub-brief 2: skill texts — plan-correction handoff and cap language removal

## 1. Goal

Plan decisions D3, D4, D5, D8. Skill text changes only, no code. The repair cap is gone, so every "cap", "final/last allowed repair round" clause in the seat skills is removed, and the two new plan-correction rules (B names it, A corrects plan.md) are added.

## 2. Acceptance criteria

1. `skills/check-issue/SKILL.md` tells B to hand a Fix that repeats an earlier round's problem, contradicts a plan decision, or needs a step the plan lacks to A through check.fix as a named plan correction.
2. `skills/implement-issue/SKILL.md` tells A to correct `plan.md` for each named plan correction before changing code, and to add an executable check A runs for the corrected rule.
3. `grep -rn "repair cap\|final allowed\|last allowed" skills/` returns nothing.
4. `skills/chart-issues/SKILL.md` line ~117 Repair bound is unchanged (criterion 2 of the brief).

## 3. Read-first

- `skills/check-issue/SKILL.md` — the `## check.repair` section, especially the `Handed to A` paragraph and the final move paragraph (~line 93).
- `skills/implement-issue/SKILL.md` — line ~27 (`and the repair cap`), line ~42 (overlap rule), the `## check.fix` section (~line 76).
- `skills/implement-issue/worker-protocol.md` — final paragraph (~line 31).
- `skills/init-akrogon/SKILL.md` — the proposal template `fix_rounds: 3` line (~line 26).
- `skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns `skills/check-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/implement-issue/worker-protocol.md`, `skills/init-akrogon/SKILL.md`. No units must land first. No shared test resource.

Edits:

1. `skills/check-issue/SKILL.md` ~line 93: replace `; the command counts that handoff and answers \`moved failed\` at the repair cap.` with `; the command counts that handoff.` Keep the rest of the sentence and the file's voice. In the `## check.repair` section, at the paragraph defining `Handed to A` content (it begins `B repairs every Fix except...`), extend the handoff rule: a Fix that repeats an earlier round's problem, contradicts a plan decision, or needs a step the plan lacks is handed to A as a plan correction whose `Handed to A` line names the repeated problem, the contradicted decision or the missing step.
2. `skills/implement-issue/SKILL.md`:
   - ~line 27: delete ` and the repair cap` from the effective-settings sentence (the rest: `implement`, `checks`, optional `advisory` and `setup`, `AKROGON_BASE` stays).
   - ~line 42: the overlap rule — delete ` and never on the final allowed repair round` from the heading and rewrite `Inline mode and the final allowed repair round wait for the run.` to `Inline mode waits for the run.`
   - `## check.fix` ~line 76: `use worker waves before the last allowed repair round` becomes wave grouping unconditional (e.g. `use worker waves in delegated mode`); `or repair yourself in inline mode and on the final allowed round` becomes `and repair yourself in inline mode`; remove any remaining round-conditioned phrase in that paragraph.
   - In `## check.fix`, where it reads the `Handed to A` list (`A \`Handed to A\` list from B's check.repair means A repairs only those items.`), add the plan-correction rule: for each named plan correction A first corrects `plan.md` before changing code — resolving a repeated problem as a corrected rule or added step, a contradicted plan decision as a corrected decision within the plan's own scope (the brief and the locked design are never weakened), a missing step as that step — and A adds an executable check A runs for the corrected rule. The brief, the locked design and the test-change protections stay as they are.
3. `skills/implement-issue/worker-protocol.md` final paragraph ~line 31: `On the last allowed leaf repair round A repairs itself without a worker, while standalone self-repair is A's responsibility without lifecycle counters.` — remove the last-allowed-round clause (e.g. `Leaf repair rounds delegate by the same wave rule; standalone self-repair is A's responsibility without lifecycle counters.`), keeping the standalone half.
4. `skills/init-akrogon/SKILL.md` ~line 26: keep `fix_rounds: 3` and annotate the line, e.g. `fix_rounds: 3 # bounds the chart door's direct-route repair rounds`.

Keep each file's existing voice: dense single sentences, no new sections, no headings added.

## 5. Do-not, reasons and exceptions

- Do not touch `skills/chart-issues/SKILL.md` — its direct-route Repair bound keeps `fix_rounds` (brief criterion 2).
- Do not touch `docs/` (unit 4's job), `src/` (unit 1's job) or any test.
- Do not add prose asserting a failure at a round count — that is the behavior being removed.
- Do not reformat or rewrap untouched paragraphs — minimal diffs only.
- A skill rule that looks contradictory beyond these edits returns a mismatch with evidence; the exception is a revised brief from A.

## 6. Ordered steps

1. Read the four files at the cited regions.
2. Apply the edits in section 4.
3. Run `grep -rn "repair cap\|final allowed\|last allowed" skills/` — expect no output; run `grep -n "fix_rounds" skills/check-issue/SKILL.md skills/implement-issue/SKILL.md skills/init-akrogon/SKILL.md` and eyeball remaining hits describe the count or the direct-route bound only.
4. Commit the four files in one commit.

Advisory size: 4 files, under 16 turns.

## 7. Commands

The grep checks above; `bun install --frozen-lockfile` is not needed (markdown only, no changed tests).

## 8. Done-when, evidence and report

All four edits land, the negative greps are empty, chart-issues untouched, one commit. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

# Review B: merge-conflict-route

Base: `ef698c2d6ad50a9466f125419dbe0e4adaf2ae14`. Reviewed head: `edda614ea1d03697bee7b6437b10d8a29d7b3465` (ancestor check passed, worktree clean).

## Verification evidence

- `bun test tests/phase.test.ts` — 18 pass, 0 fail (rerun by reviewer).
- `git diff --stat base..HEAD` — only the 9 listed files; `src/state.ts`, `src/status.ts`, `src/log.ts`, `src/routing.ts` unchanged.
- `grep -rn merge_rounds src/ tests/` — empty.
- `grep -n "check.fix" skills/merge-issue/SKILL.md` — only the red-check line (35) and the repair-move footer line (58).
- `grep -n -i conflict skills/merge-issue/SKILL.md` — line 33 names the four recorded items in order (rebase target, prior reviewed head, resolved head, range-diff); line 37 is the same-line index rule. No line preserves an unfinished rebase for B.
- Guide conflict grep — only A-resolving lines plus excluded problems.html:68; phases.html:63 says review → fix loops raise `fix_rounds`.
- `grep -rn "merge-conflict findings\|rebase/conflict baseline\|unfinished rebase" skills/ docs/guide/` — empty.
- Code read: both new conditions require source phase `check.review`; the failed → implement reset branch is intact. `requiredSlots` unchanged gives A+B re-review at `fix_rounds` 0, A alone otherwise — matches locked 16a with no routing change.
- Stale-prose sweep of `docs/guide/` for the old conflict route — clean; remaining hits are excluded lines or still-true statements.

## Findings

Nit: `docs/guide/phases.html:63` still says "but only A reviews this time" for check.fix → check.review. After this leaf, a merge-origin repair with `fix_rounds` 0 is re-reviewed by A and B (locked 16a), so the sentence is imprecise for that path. The design dictated the line's content verbatim, so this is a design-level imprecision, not an implementation defect.

## Verdict

nits

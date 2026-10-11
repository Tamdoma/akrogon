# Sibling breaks: merged notes (A, B, C)

Sources: A (own reading), slots/sibling-breaks-B.md, slots/sibling-breaks-C.md, operator-forwarded chart-framework notes (INTAKE.md, "operator-forwarded chart-framework notes").

## Measured
- Framework attempts 2026-10-11: root-influence merged 07:25:36 (attempt 0fd25f81); check-scratch ejected 07:37:50 (56737d2e); formspark-build-wiring ejected 07:44:43 (662d9a76) (`framework/issues/merge-attempts.jsonl:16-18`) (A,B,C).
- Cause split: check-scratch is sibling-caused, with its own scratch-root design partly involved (B sibling-only; C LC partly own, `check-scratch/review-B.md:585,589`). formspark-build-wiring is mixed: F15 is main's new `dispose`, F16/F17 are its own lint errors (`review-B.md:481-485`). root-influence and copyfile-install are own defects. akrogon leaf-env-file was a wrong rebase resolution plus an inherited base defect (B,C).
- Return cycle, merge out to merge back: 15.8, 17.2 and 32.6 min completed. B's re-check is about 1 min of that and A's repair pass is 9–15 min, mostly the fetch, rebase, replay and proof that `implement-issue/SKILL.md:78` already requires (C; B agrees on the range).
- The leaf meets current main only at merge: worktrees branch from the tracking ref at creation (`src/next.ts:334`) and the rebase happens in the merge stack (`src/batch.ts:89-133`) (A,B,C; chart-framework F1).
- Queue wait is what gave siblings time to land. check-scratch sat in merge 5h39m and formspark-build-wiring 2h13m behind recording-consumers' 8h57m base-red hold (`framework/issues/log.jsonl:2384,2404,2413`). S1 removes that wait (C).
- `dispose` entered main in `ecdc13a6d`, a check.fix repair commit in recording-consumers, named in no brief, plan or design. The root-state rule was in `root-influence/brief.md:7`. Neither consumer had blocked-by (C; B E8 agrees on the producer).

## Q1 Find it early, keep the way back short
- **Rebase at A's boundaries (A,B,C).** A fetches and rebases onto `<remote>/<default_branch>` and refreshes `AKROGON_BASE` before its final proof and handoff, then runs proof and `checks` once on that tree.
  - C: also at the start of `implement` and every `check.fix`. This generalizes the existing `implement-issue/SKILL.md:78` sentence, skill text only, nothing in `src/`.
  - B: only immediately before final validation and handoff, recording fetched base and handed-off head.
  - A: start and end. Starting on current main means a review fix is made against current code. The end rebase is what catches the sibling.
  - chart-framework O1 ("rebase before joining a merge and re-run the check in its own lane") is the same idea at a moment no seat owns. The end-of-pass rebase is its owned form (A).
- **Short way back.**
  - B: route a leaf-caused merge red to `check.repair` so B repairs and returns straight to merge. This changes `src/phase.ts:1025` (hardcoded check.fix), `src/routing.ts`, `check-issue/SKILL.md:89`, `merge-issue/SKILL.md:73` and `docs/guide/phases.md:13`.
  - C rejects this. It puts the reviewer in the author's seat, check-scratch needed a plan correction rather than a fit edit, and the measured saving is the ~1 min re-check.
  - A agrees with C: the cycle cost is the repair work, not the hop.
- **Pitfalls and what removes them.**
  - A rebase during delegated waves: rebase only where `implement-issue/SKILL.md:63` already requires every worker worktree removed (C R1).
  - Rewritten history before review: A records old base, new base, prior head and `git range-diff`, and B's diff-only re-check compares ranges (C R3, B R1).
  - A conflict both sides cannot satisfy: it is S2's plan-correction case, never `failed` (C R4, B R3).
  - A fetch failure at a boundary: proceed on the last fetched tip and record it (C R5).
  - The window between A's last rebase and the restack never fully closes: the existing check.fix path covers it, and with S1/S2 it costs one cycle, no stop (A,B,C).
- **Dropped.**
  - Rebasing every running worktree when a sibling lands: it touches worktrees under running seats and needs an unowned trigger (A,B,C).
  - Serializing by blocked-by or weakening guards: conflicts with the Drain rule and merge-flow Off route (A,B,C).
  - chart-framework O2 and the screenshot's separate counter: S2 removes the cap ending (A,B,C).
  - C Q1a, returning a green, no-commit replay straight to merge: it saves about 1 min and adds a routing exception (A).

## Q2 Charting names affected siblings
- **B: yes.** The producer's design names the affected leaves, the interface or rule, ownership and the compatibility obligation. The producer adapts existing main callers, each consumer owns its new callers and fixtures, and blocked-by applies only when a consumer cannot finish without the producer.
- **C: no new rule.** Half of tonight's cases were unforeseeable: `dispose` was invented in a repair round. Q1 makes landing order irrelevant, and the brief already may state a repo-wide rule in citable form. Taken should say "no naming, no ordering" so a later door does not re-add it.
- **A: with C.** The producer already must keep existing main callers green, because its own merge runs them (root-influence's own 22:04 bounce was exactly that). Q1 covers both the foreseeable and the unforeseeable cases with one mechanism.

## Off route candidates
- Whether check-scratch's scratch-root design should be a plan correction instead of fixture edits belongs to framework merge-flow (C Q2a).
- C notes the framework `fix_rounds` 8 stopgap is moot after S2. It is uncommitted because the door's sync was refused.

## Differences to rebut
- D1: rebase at start and end (A,C) versus only before handoff (B).
- D2: merge reds to B's check.repair (B) versus to A's check.fix as today (A,C).
- D3: sibling naming in contracts (B) versus no new rule (A,C).

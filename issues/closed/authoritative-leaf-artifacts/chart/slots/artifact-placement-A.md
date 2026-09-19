# Round A: artifact placement (blind draft, 2026-09-18)

### Q1 · Should `akrogon phase` refuse `issues/` files on the leaf branch at every move that has a worktree, not only at check.review?
Today `transition()` (src/phase.ts:117-118) runs `requireClean` on every move but `requireCodeOnly` only when the destination is check.review. A seat that commits positions-B.md on the branch has a clean worktree and moves on. `requireCodeOnly` (src/phase.ts:150-157) also refuses an empty branch, which is correct at review and wrong at plan moves.
Research: primary code · src/phase.ts:117-157, src/routing.ts:26-36, tests/phase.test.ts:127-155 read 2026-09-18 · the empty-branch condition is fused with the issues-diff condition · shaped option A as a split, not a reuse.
- A (recommended) Split the guard: refuse `issues/` diffs against the target at every move with a worktree, keep the empty-branch refusal at check.review. Message names `<repo.root>/issues/open/<leaf>/`. Wins because the wrong state is caught at the first move after it happens, before a slot is recorded.
- B Keep today's review-only gate. Cost: three planning moves pass with misplaced files and the seat only learns at review, after implement has run.
Pitfalls: the check must run before the slot is recorded (src/phase.ts:121-128). Moves from `failed` have no required slot (src/phase.ts:114) and leaves before first allocate have no worktree; the check applies only when `state.worktree` is set. A net diff check cannot catch a commit that added and later removed an issues file, which is fine.

### Q2 · Should the dispatch prompt carry the absolute authoritative leaf folder?
The prompt is `<skill> <slug> slot=<S> phase=<P>` (src/next.ts:411) and the pane cwd is the worktree (src/next.ts:298-299). The plan-issue skill names the authoritative read location (:14) but its write lines (:33,41,49) give filenames only. The seats had that text and still wrote relative to cwd.
Research: primary code and skill text · src/next.ts:411, skills/plan-issue/SKILL.md:14,33,41,49 · no outside source; repo-internal mechanism.
- A (recommended) Append `leaf=<absolute authoritative folder>` to the prompt and make each skill's write lines say "write to the leaf folder from the prompt". Wins because the seat gets the path from the command, with no `akrogon config` lookup to get wrong.
- B Skill text only. Cost: it already failed once with the read location stated.
Pitfalls: all five skills receive this prompt (routing.ts:27-33), so the prompt contract line in each skill changes together. The path is the registered root's folder, never the worktree's.

### Q3 · Should transitions also require the phase's pass artifact to exist in the authoritative folder?
Today only the debate gate at dispatch checks for positions files (src/next.ts:482-487). A clean branch can still lack an artifact.
Research: primary code · src/next.ts:482-487, src/routing.ts · rebuttal can be off (`rebuttal: true` in config) and debate can be off, so the required file set varies by phase and config.
- A (recommended) No. Q1 plus Q2 remove the cause; artifact existence is a separate behavior with per-phase rules and is not in this report.
- B Yes, check `<artifact>-<slot>.md` exists and is non-empty before recording the slot. Cost: a new table of phase to artifact, variants for rebuttal off and debate off, and a second thing for the seat to fail on.
Pitfalls: adding B here would quietly widen the leaf beyond the reported defect.

Challenge check: a practitioner could argue Q1 alone suffices and Q2 is prompt bloat. I keep both because the gate reports the mistake and the path prevents it, and one prompt token is cheap. B's rebuttal pending.

# Design: slug-witness

## Binding decisions, verbatim

### close-witness (chart issues/chart/owner-completion/forks/close-witness.md)

Operator 2026-10-19: "1a |" (answered the plain-language rewrite of round 2 after "elid").

- 1a: closeSources closes each source with `delivered by <slug>`, the text closeCommand already uses; the worktree guard and the `git rev-parse HEAD` read are deleted.

Binding avoidance mechanisms: the slug is the leaf whose completion closed the source, also for an epic's shared sources, and the leaf contract says so; the comment is not presented as commit proof (A,B,C); source closure stays before pack and rename so a retry after a partial failure redoes only what is left (B,C); the test pinning "sourced completion without worktree context fails" flips (B); a search for the old `merged <sha>` text in src, tests and skills runs in the same leaf (C).

Reason: the worktree was needed only to read a hash that nothing parses; removing it fixes every stuck leaf with no backfill. Foreclosed: saving a landed commit in state at merge (new field, writes on every landing path, no value for already-merged leaves), reading a commit at close time from main, branch or `log.jsonl` (moves on, removed, or not durable), keeping worktrees until sources close, a SHA-with-slug fallback (two comment forms). This departs from #103's "close with the merge commit" on purpose.

Exclusions: owner-reuse 1a (twin refusal at dispatch) belongs to leaf `twin-guard`. stuck-repair was done by the door on 2026-10-19.

### Standing design

Installed path: /home/ivan/.claude/skills/chart-issues/assets/standing-design.md.

Interpretation for this leaf: the proof is the existing CLI fixture with the repo's fake `gh` (the GitHub boundary is an outside call; the real call was proven at charting, recorded in readiness.yaml `proofs`). Criterion 1 is a bug fix shown red first. The test pinning "sourced completion without worktree context fails before rename without a fabricated commit" (`tests/phase.test.ts`) is a false expectation under the locked decision and is deleted or rewritten with that reason. Tests asserting the old `merged <sha>` comment are updated to the new text, not duplicated. No machinery is built.

## Leaf architecture

Owned surfaces: `src/pull.ts` (`closeSources`), its two callers in `src/phase.ts` (`completeOwner`) only if the signature changes, `tests/phase.test.ts`, `tests/next.test.ts` (the `next` merged-leaf retry and the two tests asserting `--comment merged ${head}`) (C), and any test or skill text matching criterion 3.

Interface: `closeSources` posts `delivered by ${slug}` through the existing `closeSource`; with no sources it still returns without a call. `closeCommand` is unchanged.

Consumers of the changed behavior:
- `completeOwner` calls `closeSources` for private sources and, at epic completion, for the remaining shared sources, both before `packFolder` and `renameSync`; that order stays.
- `closeSource` returns early on an already CLOSED issue and, on its retry attempt, compares existing comment bodies to the exact comment text; a deterministic slug comment keeps that check working.
- Callers reaching completion without a worktree: `transition` on `merged`, `phaseCommand` on a merged leaf, and `next`'s merged-leaf branch. All now succeed where they threw.
- `src/reconcile.ts` `ownerCompletes` and its worktree and tab keep rules: unchanged and excluded; whether they become removable is not part of this leaf.
- Broadcast and merge-issue skill text: covered by criterion 3's search.

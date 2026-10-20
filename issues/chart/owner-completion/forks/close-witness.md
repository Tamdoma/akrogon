# close-witness

## Question

What does the source-closing comment cite once the worktree is gone: the leaf slug, or a landed commit saved at merge?

### Carries

- Operator 2026-10-18: "most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code."
- Opening map: issues/chart/paid-proof-bounds/slots/map-merged.md

## Findings

Full notes: [slots/notes-merged.md](../slots/notes-merged.md) (A,B,C blind notes and rebuttals, 2026-10-19).

- better-than-training · src/pull.ts:184-206 (A,B,C) · closeSources throws without a worktree, then reads `git rev-parse HEAD` there; closeCommand (:208-212) already posts `delivered by <text>` through the same closeSource.
- better-than-training · src/pull.ts closeSource (A,C) · returns on CLOSED; the comment text is only compared to itself in the retry duplicate check.
- better-than-training · src/state.ts (B,C) · no landed-commit field; only `merge_stamp`.
- better-than-training · src/phase.ts:216-221 (A,B,C) · today's hash is the triggering leaf's HEAD, also for an epic's shared sources.
- better-than-training · tests/phase.test.ts:566 (B) pins "sourced completion without worktree context fails"; tests/close.test.ts expects `delivered by` for closeCommand (C).
- better-than-training · framework live 2026-10-19 (A,B,C) · 4 sourced satellite-plan-fit leaves have no worktree, so #103 follows the #108 repair.
- model-knowledge · no outside search: the comment format is akrogon's own.
- Operation proof, 2026-10-19: `akrogon close Tamdoma/tamdoma-framework#282 --by pool-parity` and `#285` run from the framework root with installed release e522c186 under the operator's `gh` login (github.com, `GH_HOST=github.com` set by closeSource). Both printed `closed ... with delivered by pool-parity`; `gh issue view --json state,comments` read back CLOSED with last comment `delivered by pool-parity`. This is the same `closeSource` view/close/comment path the leaf will call with `delivered by <slug>`. Cleanup: none, both closes were the intended repair (stuck-repair 2a). Limits: does not prove the retry branch where the comment already exists, which the leaf's own tests cover with the fake gh.
- Changed the question: a saved SHA cannot help leaves already stuck (B,C), and the shared-source witness is folded into the option (B,C rebuttals hold the triggering-leaf slug over A's owner-name lean).

## Taken

Operator 2026-10-19: "1a |" (answered the plain-language rewrite of round 2 after "elid").

- 1a: closeSources closes each source with `delivered by <slug>`, the text closeCommand already uses; the worktree guard and the `git rev-parse HEAD` read are deleted.

Binding avoidance mechanisms: the slug is the leaf whose completion closed the source, also for an epic's shared sources, and the leaf contract says so; the comment is not presented as commit proof (A,B,C); source closure stays before pack and rename so a retry after a partial failure redoes only what is left (B,C); the test pinning "sourced completion without worktree context fails" flips (B); a search for the old `merged <sha>` text in src, tests and skills runs in the same leaf (C).

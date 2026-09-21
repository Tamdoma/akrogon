# Close path for a source with no leaf

## Question

### Q1 · Where does the close of a delivered or duplicate source run: a new `akrogon close` verb, the door calling `gh` directly, or `pull` doing it from chart records?

### Q2 · What does the command take and post: `--by <text>` posted as `delivered by <text>`, or a fixed reference shape?

### Carries
- Operator lock: no automated program runs things without the operator pushing the command.
- Operator lock: skills never open, print or write the env file; credentials are anticipated, never discovered.
- Lesson 2026-09-19: a non-blank string contract needs `.trim().min(1)`, not `z.string().min(1)`.
- Related fork: forks/pull-warning.md (disappears if Q1 picks pull).
- Seed suggestion (operator tier): `akrogon close <owner/repo#n> --by <slug|commit>` reusing `closeSource`, comment like `delivered by leaf fixture-isolation (commit ...)`.

## Findings
- better-than-training · `src/pull.ts:107-182`, read 2026-09-21 · `closeSource` already does view, idempotent close, retry and comment dedup, keyed on the literal comment text · a new verb reuses it by passing the comment instead of a commit; the door running `gh` would duplicate this logic in prose.
- better-than-training · `src/pull.ts:184-206`, `src/phase.ts:138-176`, read 2026-09-21 · `closeSources` needs a leaf worktree for `git rev-parse HEAD`; a no-leaf close has no worktree · the new path calls `closeSource` directly, not `closeSources`.
- better-than-training · `src/akrogon.ts:9-18,74`, read 2026-09-21 · verbs and their options are one literal table; adding `close` with `{ by: string }` is one entry plus one case · small command surface.
- better-than-training · `src/pull.ts:64-75`, read 2026-09-21 · pull is a pure mirror of the open listing with no knowledge of charts · making it close things needs prose parsing of INTAKE.md and breaks the operator lock.
- operator · door pane on 2026-09-21 · `gh issue close` from the chart pane was denied by the permission classifier · a door that closes directly stalls on permissions every time; a command verb is one allow rule.
- better-than-training · `tests/fake-gh.ts:38-60`, read 2026-09-21 · the stateful fake already models view/close/comments · the verb's tests fit the existing harness.

## Taken
1-A, 2-A (operator 2026-09-21). New verb `akrogon close <owner/repo#n> --by <text>` calling `closeSource` with comment `delivered by <text>`; `--by` required and non-blank (`.trim().min(1)`), content unvalidated. The chart door runs it when it records an identity as delivered or duplicate. Reason: reuses the existing idempotent close, operator-pushed, one allow rule instead of a denial per pass. Foreclosed: the door running `gh` itself (B); pull closing from chart records (C); fixed `--leaf` / `--duplicate-of` forms (Q2 B).

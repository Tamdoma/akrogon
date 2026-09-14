# skills area

## Commands

- `bun src/akrogon.ts install` links workflows into configured harnesses.
- `bun test tests/install.test.ts` checks installation and conflicting paths.
- `bun test tests/phase.test.ts` checks the phase command used for handoffs.

## Key files

- `skills/init-issues/SKILL.md` proposes checks, grounding and repository setup.
- `skills/implement-issue/SKILL.md` runs implementation and repair passes.
- `skills/implement-issue/worker-protocol.md` defines worker scope and returns.
- `skills/check-issue/SKILL.md` defines review evidence and Fix/Nit verdicts.

## Non-obvious patterns

- Skills guide agents; the command owns phase changes, counters and dispatch.
- Leaf artifacts go to the registered checkout, code to the leaf worktree.
- Implementation mode selects inline work or sequential bounded workers.
- Worker returns include changed-test evidence; B runs the final full suite.

## See also

- `skills/implement-issue/brief-template.md` gives the eight-section worker sub-brief.
- `src/routing.ts` defines legal phases, required slots and next destinations.
- `docs/reference-index.md` links the other repository areas.

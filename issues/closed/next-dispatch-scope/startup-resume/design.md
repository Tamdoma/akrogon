# Design: startup-resume

## Binding decisions, verbatim
### dispatch-scope Q2: What should the Herdr startup pass do?
Operator, 2026-09-26: "2a"
A. Herdr startup resumes only leaves that already have a tab or worktree, plus merged leaves still in `issues/open/`, and starts no new leaf. Reason: closes the same global-start hole at restart. Foreclosed: B (global startup sweep).

### dispatch-scope Q1: After a leaf completes, which leaves may that pass start?
Operator, 2026-09-26: "1a". Owned by completion-dependents. Consequence here: under `--resume`, a completion must not start unallocated dependents, because Q2 forbids new allocations at startup.

## Standing design
/home/ivan/.claude/skills/chart-issues/assets/standing-design.md
- Real invocation: tests run the real CLI through the existing `tests/helpers.ts` and `tests/fake-herdr.ts` fixtures. No new mocks.
- Negative and edge cases are required: an unallocated ready leaf in each repo, the unallocated dependent of a merged leaf, and `--resume` combined with a target or `--all` rejected.
- No auth, secrets or browser flow apply. The artifact is the `bun test` output recorded in the implementation report.

## Leaf architecture
Owned: `src/akrogon.ts` `next` option parsing and usage, the `--resume` branch in `src/next.ts` `nextCommand`, `plugin/herdr-plugin.toml`, `tests/next.test.ts` resume tests, `tests/command-reference.test.ts`, `README.md` command reference, the startup line in `docs/guide/next.md`.
Interface: `nextCommand` receives `'--resume'` like it receives `'--all'`. The resume branch filters each registered repo's `discover(...).leaves` to `phase === 'merged' || state.tab !== undefined || state.worktree !== undefined`, dispatches them with `explicit: false`, ignores `'completed'` outcomes, then calls `cleanupRepos` for all registered repos.
Excluded: completion-site behavior outside `--resume` (completion-dependents), `--all` semantics, `pull.sh --all` at startup.
Dependencies: none. Both leaves touch `nextCommand`. The second to merge rebases.

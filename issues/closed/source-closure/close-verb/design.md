# Design: close-verb

## Binding decisions, verbatim

### close-path (issues/chart/source-closure/forks/close-path.md)
Q1 Where does the close of a delivered or duplicate source run. Q2 What does the command take and post.
1-A, 2-A (operator 2026-09-21). New verb `akrogon close <owner/repo#n> --by <text>` calling `closeSource` with comment `delivered by <text>`; `--by` required and non-blank (`.trim().min(1)`), content unvalidated. The chart door runs it when it records an identity as delivered or duplicate. Reason: reuses the existing idempotent close, operator-pushed, one allow rule instead of a denial per pass. Foreclosed: the door running `gh` itself (B); pull closing from chart records (C); fixed `--leaf` / `--duplicate-of` forms (Q2 B).

### pull-warning (issues/chart/source-closure/forks/pull-warning.md)
Q1 Who reports a mirrored identity that is already in a chart intake but still open on GitHub.
1-A (operator 2026-09-21). The chart door, at open, names each skipped identity that is still open on GitHub and offers `akrogon close` for it. Skill prose only; pull stays a pure mirror. Reason: the door already holds the dedup list and the verdict; a pull warning would need the command to parse INTAKE.md prose and would fire for in-progress charts. Foreclosed: a warning in `akrogon pull` (B).

### Locks
- No automated program runs things without the operator pushing the command: the close happens only inside an attended door pass or by the operator typing the verb.
- Skills never open, print or write the env file with a tool.

Standing design: /home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: no auth to mock, `gh` uses the operator's existing login; the state change is a real GitHub close exercised in tests through `tests/fake-gh.ts` stateful steps, which is the existing pattern for this path; negative tests (blank `--by`, invalid identity, gh failure) are mandatory; no user-visible browser flow, the verification is `bun test`; no secrets.

## Leaf architecture

Owned surfaces: `src/akrogon.ts` (options table, `close` case, usage string), `src/pull.ts` (exported close entry reusing `closeSource`), `src/AREA.md`, `tests/pull.test.ts` or a new sibling, `tests/command-reference.test.ts` `contracts`, `README.md` command table row, `skills/chart-issues/SKILL.md` Open section, `docs/guide/chart.md` one sentence.

Literal interfaces:
- Invocation: `akrogon close <owner/repo#n> --by <text>`.
- Identity validation: `sourcePattern` from `src/state.ts`, the same regex leaf `sources` use.
- `--by`: `z.string().trim().min(1)`; the posted comment is `delivered by <text>` with `<text>` verbatim after trim.
- Existing `closeSource(repo, source, commit)` builds the comment `merged <commit>`; refactor it so the comment is the parameter (or add a sibling that shares the view/close/retry body), keeping `closeSources` output byte-identical (`merged <commit>`). The comment-existence retry check compares the full comment text, so both callers keep working.
- Output on success: one line naming the identity and the comment, on stdout, like other commands.

Skill prose target (the Open section, after the dedup rule): the door names every skipped identity that is still open on GitHub, offers `akrogon close <owner/repo#n> --by <text>` for each, and runs it during the pass for any identity the chart records as delivered or duplicate, with `<text>` naming the delivering leaf and commit or the other identity. The installed skill copy under `~/.claude/skills` is not a surface; `akrogon install` links it.

Exclusions: no change to `pullRepo`, `closeSources`, `completeOwner` or `phase`; no warning in pull; no chart or intake parsing by the command; no seed deletion (the next pull drops the seed once GitHub reports it closed); no `--leaf` or `--duplicate-of` options; no bulk or `--all` form; nothing under `issues/`.

Dependencies: none.

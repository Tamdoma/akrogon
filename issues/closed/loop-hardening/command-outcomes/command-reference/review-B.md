# Review B: command-reference

Verdict: ready

Base: `f3b25f55c302cc00aeee4896d5e595b0cd35a807`
Reviewed head: `3ffce4dd8e950f8927e4bbd60fb670deee072e49`

The reviewed head is one commit ahead of the configured base. `git status --porcelain` is empty. The complete branch diff changes only `README.md` and `tests/command-reference.test.ts`, as required by D1/C5. No Fixes or Nits found.

The command table covers the ten live dispatcher cases, including shared park/unpark handling. Their new argument shapes reflect one or more top-level issue names versus exclusive `--all`. README effects agree with `src/park.ts`, including running/dependency exclusions. The sync paragraph matches `src/sync.ts` branch and staged-path refusals, record exclusions, global/repository lock order, integration and restoration-conflict behavior. `src/pull.ts` and `skills/seed-issue/SKILL.md` confirm the origin/remote/issues_repo distinction. Existing repository-identity prose and index pointers remain unchanged.

The new test reads the real README and dispatcher, detects missing/extra/duplicate command rows and newly introduced verbs, checks literal argument contracts, and includes invalid and valid escaped-alternative cases. It does not mock the unit under test or assert natural-language prose. The reported red run establishes that the original missing rows failed coverage. C1–C4 are satisfied by inspection and recorded execution evidence.

Verification evidence applies to this unchanged head, so blocking checks were not repeated:

- `bun run format`: exit 0, with only the owned test formatted.
- `bun run typecheck`: exit 0.
- Configured changed-test command with the base above: exit 0, 4 pass / 0 fail, 789 assertions after formatting.
- `bun test`: exit 0, 170 pass / 0 fail, 2361 assertions. Reopened `/tmp/command-reference-full-tests.log` and confirmed the summary.
- Real CLI scenarios via `bun test tests/sync.test.ts tests/park.test.ts`: exit 0, 37 pass / 0 fail, 306 assertions. Reopened `/tmp/command-reference-cli-evidence.log`. The scenarios exercise isolated real Git repositories and CLI processes, including successful sync, wrong/detached branches, excluded staged paths, preserved edits, and park/unpark constraints.
- Implementation recorded a passing `git diff --check`; review confirmed the committed two-file diff and clean worktree.

Known limitation remains explicit: argument expectations are a test-local contract, dispatcher extraction follows the current switch layout, and prose accuracy requires review against live behavior. These are bounded limitations of this documentation check, not defects in the delivered scope.

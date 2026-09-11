# Review A: command-reference

Base: f3b25f55c302cc00aeee4896d5e595b0cd35a807
Reviewed head: 3ffce4dd8e950f8927e4bbd60fb670deee072e49
Diff: README.md (+5), tests/command-reference.test.ts (+114). No other files. `debate: no`, so no positions or rebuttal apply.

## Verdict: ready

## Criteria

- C1: Ten dispatcher cases in `src/akrogon.ts` (`config init phase next pull sync park unpark status install`) each have exactly one README row. The test derives verbs from `switch (verb)` case labels and compares the set to table rows, so a new verb without a row fails independently of the test-local contract map.
- C2: Park/unpark rows read `<issue>... \| --all`; test unescapes `\|`, splits alternatives, and rejects `<issue> | --all`, `[<issue>... | --all]`, `<issue>... --all`, and single-alternative forms. Existing rows for `init`, `phase`, `next`, `pull`, `status` are unchanged and validated as required/optional groups.
- C3: Paragraph checked line by line against `src/sync.ts`: default-branch/detached refusal (symbolic-ref check), staged-path exclusion (issues/ minus seeds, `.lock`, worktree_root), global then repo lock (`withLock` then `withRepoLock`), fetch/rebase --autostash/push through `remote`, tracked/incoming/replayed lock refusals, ignored-path collision refusal, unmerged-after-autostash stops push. Intake: `src/pull.ts:44` reads `origin`; `skills/seed-issue/SKILL.md` reads root `akrogon.yaml` `issues_repo`. Park/unpark effects match `src/park.ts` (`--all` filters busy issues and `settle` drops needed prerequisites; `stranded` refuses dangling dependencies). Dispatcher enforces names-or-`--all`, never both.
- C4: Negative mutations are exercised in memory in the test. Independently confirmed on disk: removing the sync row from the real README gives 3 pass / 1 fail; restoring gives 4 pass / 0 fail, 789 assertions.
- C5: Diff contains only the two owned files. Worktree clean at head.

## Checks (rerun by A)

- `bun run format`: exit 0, no file changed.
- `bun run typecheck`: exit 0.
- `bun test`: exit 0, 170 pass / 0 fail, 2361 assertions, 12 files.

## Nits

None blocking. Observations, not defects: the dispatcher regex captures everything after `switch (verb) {`, so a second `case` block later in `src/akrogon.ts` would be counted as a verb. Plan D5 accepts this coupling explicitly. Helper functions use `expect` as the throw mechanism for negative tests, which is functional under bun:test.

## Lessons

None new.

## Merge (A)

Rebased 3ffce4d onto origin/main 7be71885565323b89f666098748dcb127fdd84bf without conflict; new head ad2fd66c700233abc91f5cc33d57cfe966c5d6e1. AKROGON_BASE refreshed to 7be7188. Checks after rebase: `bun run format` exit 0 (no changes), `bun run typecheck` exit 0, `bun test` exit 0 (180 pass / 0 fail, 2424 assertions), `test_changed` exit 0 (4 pass / 0 fail). No advisory commands configured.

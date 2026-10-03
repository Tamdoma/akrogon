# Review B: peer-turn-wait

Date: 2026-10-03
Phase: check.review, initial blind review
Base: `69038ef023a8434104bb9c6335f79daa1a6c2377`
Reviewed head: `745413fac3cbf672bdd398bbf1fec271864054fd`
Verdict: **fix**

Read the brief, plan, design, implementation report, readiness proofs, reference index, affected skill instructions, tests/skills area pointers and standing design. Debate is no, so positions-B/rebuttal-B are absent as expected. No peer review was read. No AREA.md changed.

## Fixes

### F1: The instructed script path fails in other registered repositories

Location: `skills/chart-issues/assets/questions.md:44`.

Realistic source: an operator invokes the installed chart-issues skill from the registered framework repository. Chart-issues Open resolves the selected repository root, and creates peer panes with that root as cwd. `src/install.ts` installs skills as home-directory links to the akrogon skill folder, not as `skills/` directories in each consumer repository. The new literal invocation resolves relative to the consumer cwd.

Live trace: `/home/ivan/.codex/skills/chart-issues` is a symlink to `/home/ivan/Work/infra/akrogon/skills/chart-issues`. Listing `/home/ivan/Work/infra/tamdoma/framework/skills/chart-issues/scripts/peer-wait.ts` returns No such file or directory. From `/home/ivan/Work/infra/tamdoma/framework`, the documented `bun skills/chart-issues/scripts/peer-wait.ts w8:pGE /nonexistent-peer-return 1` exits 1 with `error: Module not found "skills/chart-issues/scripts/peer-wait.ts"`. No Herdr wait starts.

Consequence today: a normal chart exchange outside akrogon immediately stops for an operator error instead of waiting for its prompted peer. This breaks the installed skill's multi-repository contract and criterion 3's foreground wait rule. The new prose introduces the broken invocation, even though it follows the plan's literal spelling. Resolve the script from the installed skill folder, following the existing watch-issues `<skill-folder>/scripts/...` convention, without changing the chart working directory or relative return-path meaning. This concerns invocation guidance, not the script's repository-owned source location.

### F2: The pass-through test cannot catch changed stderr bytes

Locations: `tests/peer-wait.test.ts:53,68-72`, `tests/fake-herdr.ts:87-91`.

Blocking criterion: criterion 2 explicitly requires unchanged stderr proven by a subprocess test. The fixture emits `raw failure text` through console.error, adding a newline, but setup.run strips trailing whitespace from both streams before comparison. Thus the assertion never checks the actual trailing bytes. It also obscures extra blank stdout lines despite criterion 1's exactly-one-line requirement.

Evidence: `bun test tests/peer-wait.test.ts --timeout=30000` passes 9/9. In a temporary isolated copy, replacing the script's `process.stderr.write(result.stderr)` calls with `process.stderr.write(result.stderr.trimEnd())` still passes all 9 tests and 33 assertions. That mutation violates unchanged pass-through by deleting the fixture's newline. Temporary copies and their node_modules link were removed after the command.

Real integration source: Herdr error output is newline-terminated JSON, also produced by this fixture's error paths. The test gap permits loss of those bytes without failing the required proof. The current implementation does preserve them, so this is a missing criterion test, not a claimed current output defect.

Keep captured streams raw. Assert the actual expected stderr including its trailing newline, and check result-line count without discarding blank lines. The required byte equality is an executable interface contract, not a prose wording check.

## Nits

### N1: Broad catches erase operational errors

`peer-wait.ts:38-60` treats every stat failure as an absent file and every spawn/stream failure as no Herdr result. Concern: non-ENOENT filesystem errors or a spawn exception can become a successful budget/done result without diagnostic context. Deferred because this review establishes no realistic occurrence of those exceptional inputs in the current installed chart flow. Promote to a Fix with a real launch/filesystem condition traced to this branch and its consequence. Remove these silent fallbacks when addressing such a demonstrated defect rather than adding more fallback behavior.

## Verification

- Focused original suite: `bun test tests/peer-wait.test.ts --timeout=30000`, exit 0, 9 pass, 0 fail, 33 assertions.
- Focused stderr mutation in an isolated temporary copy: same scope/timeout, exit 0, 9 pass, 0 fail, proving F2's missing check.
- Consumer-cwd invocation and live path listing prove F1.
- Reported existing head evidence: format and typecheck pass, full suite 404 pass/0 fail, changed suite 9 pass/0 fail. These were not rerun because no code changed and the specific concerns are resolved by narrower probes.
- Prose review: the guarded prompt and Pane text sentences are unchanged. Fresh return paths, foreground waits, immediate budget reruns, stay-in-turn rule and footer/pointers are present. F1 prevents the documented command from applying across the installed skill's actual repositories.
- Outcome precedence and last-status handling match the plan in the reviewed diff. No human-facing documentation behavior changed. The only affected behavior documentation is the chart skill, reviewed above.
- Worktree remained clean. No code was edited. No fixtures or temporary review copies remain. No operator action is required.

## Phase result

`akrogon phase peer-turn-wait check.repair --slot B --verdict fix` returned `moved check.repair`. B's verdict is submitted and the actual phase is check.repair.


## 2026-10-03 check.repair

Repaired head: `64db915` (from reviewed head `745413fac3cbf672bdd398bbf1fec271864054fd`). Read both initial reviews. A recorded no Fixes. All B Fixes are repaired. No Handed to A items or operator actions remain. Recorded Nits remain deferred, with no adjacent code changes.

### F1 repaired: installed skill invocation

Commit: `466ebc8` — resolve peer wait from the loaded skill folder.

Before: `bun skills/chart-issues/scripts/peer-wait.ts <pane> <return-file> <budget-seconds>` resolved against the consumer repository; the framework invocation exited 1 with `error: Module not found "skills/chart-issues/scripts/peer-wait.ts"`.

After: `bun <skill-folder>/scripts/peer-wait.ts <pane> <return-file> <budget-seconds>`, explicitly resolving `<skill-folder>` to the loaded chart-issues directory without changing the chart cwd. This follows watch-issues' existing skill-folder convention. No plan/design change was needed: the script's owned path and argv contract remain unchanged.

Proof: invoked the worktree skill's resolved script from `/home/ivan/Work/infra/tamdoma/framework` against a temporary fake-herdr fixture, not a live peer. Exit 0, stderr empty, stdout one JSON line with `outcome: done`, `pane: review-pane`, the fixture return path, and `status: done`. Temporary directory, fake executable link, db/call log and return file were removed.

### F2 repaired: raw stream assertions

Fail-first test commit: `802ea10` — require unchanged stderr and one result line.
Fix commit: `64db915` — keep raw subprocess output in tests.

The test now expects `raw failure text\n`, exactly what the fixture emits, and result assertions require one newline-terminated line without depending on JSON key order. The runner returns stdout/stderr unchanged.

Failing evidence at the test commit: `bun test tests/peer-wait.test.ts --timeout=30000`, exit 1, 1 pass/8 fail. Stderr expected `raw failure text\n` but received `raw failure text`. Outcome line checks expected two split entries (one line and its terminator), received one because the runner stripped the terminator.

Passing evidence after the fix: same command, exit 0, 9 pass/0 fail, 40 assertions.

Regression sensitivity: isolated temporary mutations now fail. Trimming forwarded stderr yields exit 1, 8 pass/1 fail. Adding an extra stdout blank line yields exit 1, 2 pass/7 fail. Both temporary source/test copies and dependency links were removed. Production peer-wait code did not need a change.

### Final done-criterion and checks proof

1. Loop/deadline/one-line contract: focused and changed suites pass, including timeout bounds, last-status preservation and the raw one-line assertions. Extra-blank-line mutation fails.
2. Outcome precedence: all focused branch tests pass, including blocked-before-file, done-on-timeout, working-with-file, idle/done without content, and budget. Stderr mutation now fails, proving unchanged output is checked.
3. questions.md: inspected the repair diff. Only script-path resolution guidance changed. The protected guarded-prompt/non-zero-exit and Pane text sentences remain unchanged. Foreground waits, fresh return paths, immediate budget reruns, stay-in-turn rule and operator-facing stop outcomes remain present.
4. SKILL.md: inspected the existing footer rule and Drain/Take pointers. No repair changed them.
5. Script remains covered by tsconfig and the format command. Every configured check completed successfully at `64db915`:
   - `bun run format`: exit 0, all files unchanged.
   - `bun run typecheck`: exit 0.
   - `bun test --timeout=30000`: exit 0, 404 pass/0 fail, 4400 assertions, 19 files, 12.16 s.
   - `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, 9 pass/0 fail, 40 assertions.

Final worktree is clean. Repair changes only questions.md and peer-wait.test.ts, 5 insertions/4 deletions across three dedicated commits. No merge_checks were run.

Phase result: `akrogon phase peer-turn-wait merge --slot B` returned `moved merge`.


## 2026-10-03 merge

Rebase target and refreshed AKROGON_BASE: `9651ae7b927680358e0fa03ef38a459662433325`. Prior reviewed/repaired head: `64db915`. Resolved head: `6f86d24991c659433038ac5fc312eda22ecd6b11`.

One conflict in tests/fake-herdr.ts databaseSchema: retained both main renameScript and leaf waitScript, preserving their respective handlers. No other conflict or scope change.

Range comparison before checks:

```text
1:  40cfc6d = 1:  8b0c0ae add peer-wait foreground wait script
2:  86cb981 ! 2:  de0ef14 fake-herdr: agent wait with waitScript
    @@ tests/fake-herdr.ts: const scriptEntrySchema = z.object({
        panes: z.array(paneSchema),
        tabs: z.array(tabSchema),
     @@ tests/fake-herdr.ts: const databaseSchema = z.object({
    -   starts: z.array(z.array(z.string())).default([]),
        startScript: z.array(scriptEntrySchema).default([]),
        promptScript: z.array(scriptEntrySchema).default([]),
    +   renameScript: z.array(scriptEntrySchema).default([]),
     +  waitScript: z.array(waitEntrySchema).default([]),
      });
      export type Database = z.infer<typeof databaseSchema>;
3:  037c2ef = 3:  ddd43fc route peer waits through peer-wait script
4:  e6876d2 = 4:  67d255b typecheck and format peer-wait script
5:  745413f = 5:  e288044 test peer-wait outcomes
6:  466ebc8 = 6:  415fd09 fix(chart-issues): resolve peer wait from the loaded skill folder
7:  802ea10 = 7:  0bd0930 test(peer-wait): require unchanged stderr and one result line
8:  64db915 = 8:  6f86d24 fix(peer-wait): keep raw subprocess output in tests
```

Merge checks at `6f86d24991c659433038ac5fc312eda22ecd6b11`: format exit 0, all unchanged; typecheck exit 0; full suite exit 0, 408 pass/0 fail, 4430 assertions, 12.24 s; changed suite with refreshed base exit 0, 9 pass/0 fail, 40 assertions. No configured merge_checks or advisory commands. Worktree clean. No unresolved Fix or operator action. Nits remain speculative and provide no new evidenced reusable lesson. Completion owner brief gathered before phase completion.

Push: `git push origin HEAD:main` exit 0, fast-forward `9651ae7..6f86d24` to origin/main.

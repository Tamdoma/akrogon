# Review B: guard-retires-lesson

Date: 2026-10-10
Base: `2d9becac4365ec4a1079853364d561d90e356b5e`
Reviewed head: `e8be1870f19969c703b8ae4fc9362ad13fd32e25`
Verdict: **fix**

## Fixes

### F1 — Solo cleanup imports akrogon code from the consumer repository

Location: `skills/merge-issue/SKILL.md:60`.

Realistic source: the installed shared merge-issue workflow runs in any registered repository's leaf worktree (skill opening paragraph), including `repos.framework` from `akrogon config`. A solo attempt, or the `rerun rebase` route that inherits the solo instructions, executes the new one-liner there. `./src/lessons.ts` resolves relative to that consumer repository, not the installed akrogon checkout. Framework has no such module.

Read-only reproduction in `/home/ivan/Work/infra/tamdoma/framework`, with the configured/default branch substituted:

```sh
bun -e "import {mergeBase, removeRetiredLessons} from './src/lessons.ts'; const b=await mergeBase(process.cwd(),'origin/main','HEAD'); const r=await removeRetiredLessons(process.cwd(),b,'HEAD'); console.log(r.length?r.join('\n'):'none')"
```

Exit 1, before any mutation:

```text
error: Cannot find module './src/lessons.ts' from '/home/ivan/Work/infra/tamdoma/framework/[eval]'
Bun v1.4.2 (Linux x64)
```

Consequence today: every consumer-repository solo merge following this unconditional instruction fails, including merges with no retired lessons. A union-resurrected line cannot be cleaned up by the prescribed step. The check guard can refuse the line but cannot make this command run.

Contract hit: brief criterion 2 (solo retirement survives integration), plan D5, and the shared workflow's existing contract to operate in the registered target worktree. Resolve the helper from the installed akrogon checkout while retaining the consumer worktree as the operation's cwd. Verify the shipped command in a consumer repository, including an actual solo union-resurrection fixture. Existing solo tests manually overwrite LESSONS.md before retrying --check; they do not execute the command and cannot catch this defect. The report's successful one-liner run in the akrogon worktree does not establish the consumer path.

## Verification

- Read brief, complete plan, design, implementation report, ponytail guidance and changed behavior's guides (`docs/guide/learn.md`, `docs/guide/merge.md`), then the full diff and merge callers in batch/next/phase. Debate is off, so no positions/rebuttal artifacts are expected. No peer review read and no code changes or commits made.
- `bun test tests/batch.test.ts tests/phase.test.ts tests/docs-links.test.ts --timeout=30000`: exit 0, **76 pass / 0 fail**, 691 expectations, 6.45s. Rerun justified by the specific merge-path concern and missing consumer-command evidence. Stack test exercises actual union resurrection and top-only fixup. Both push-check refusals pass. Solo cleanup proof is missing as described in F1.
- Reused unchanged-head implementation evidence for full suite (651 pass), changed tests (155 pass), typecheck and formatting. No failed configured check. The failing F1 probe is the new workflow command, directly caused by this diff, not an unrelated base failure.
- Fresh-agent artifacts read: guard brief names retirement history path, touching brief preserves the line, and uncalled-guard review returns fix. Report identifies the independent agent and transcript. Criteria 1, 3 and 5 have their requested live evidence.
- Shared retirement rule, implement clause, review bar, learn guide and unchanged learn-issues guarded removal agree on full mechanical coverage. No closure/duplicate/rejection removal path added (criterion 4). Edited guide/skill links pass (criterion 6).
- Direct chart route remains the explicit D10 exclusion. No additional acceptance criterion imposed.
- Worktree clean at reviewed head after verification. No credentials or live mutation needed. No operator actions.

## AREA path listings

Separate repository-root listing commands extracted named paths from each changed AREA page and tested existence.

`src/AREA.md`: `src/akrogon.ts`, `tests/phase.test.ts`, `src/preflight.ts`, `src/config.ts`, `src/init.ts`, `src/phase.ts`, `src/shell.ts`, `src/readiness.ts`, `issues/`, `docs/reference-index.md`, `tests/helpers.ts` all exist.

`skills/AREA.md`: `src/akrogon.ts`, `tests/install.test.ts`, `tests/phase.test.ts`, all eight named skill/supporting files, `src/routing.ts`, `docs/reference-index.md` exist. Root-relative `scripts/observe.ts` and `scripts/log-tail.ts` are absent. Both references are unchanged from base; the live watch skill correctly runs `<skill-folder>/scripts/...`, and both files exist under `skills/watch-issues/scripts/`. No changed dead-pointer consequence established, so no Fix for those existing abbreviated index references.

## Test-Change trailers

Path rule read from `src/test-files.ts`. Trailers in `2d9becac4365ec4a1079853364d561d90e356b5e..HEAD`:

- `d195e0e`: `Test-Change: tests/batch.test.ts added buildStack re-removal and no-fixup cases; no existing expectation changed`
- `e659ae1`: `Test-Change: tests/phase.test.ts added stack and solo refusal cases; no existing expectation changed`
- `e8be187`: `Test-Change: tests/batch.test.ts prettier formatting only; no expectation changed`
- `e8be187`: `Test-Change: tests/phase.test.ts prettier formatting only; no expectation changed`

All four agree with their diffs. Added tests and import changes leave previous assertions/fixtures intact. Formatting changes have no behavior change, so no external contradictory-expectation source is required.

## Nits

None.


## 2026-10-10 check.repair

Start head: `e8be1870f19969c703b8ae4fc9362ad13fd32e25`
Repair head: `14aa6a2`

### Repaired: B-F1 / A-F2 — consumer solo command

- Test commit `31db229` adds `tests/lessons.test.ts`, a real git consumer fixture with the union attribute, independent adjacent lesson addition on main, retirement on the leaf, rebase, execution of the literal shipped command, cleanup commit and fast-forward push. A PATH symlink represents the installed akrogon entry point and resolves to this version's code. The consumer has no `src/lessons.ts`. The test also confirms the push-check helper finds no retired line after cleanup and the pushed file keeps the new lesson.
- Before: `bun test tests/lessons.test.ts --timeout=30000` exited 1, 0 pass / 1 fail. Command result was `{code: 1, stdout: "", stderr: "error: Cannot find module './src/lessons.ts' from '<fixture>/repo/[eval]' ..."}`.
- Fix commit `14aa6a2` resolves `lessons.ts` beside `readlink -f "$(command -v akrogon)"`, passes that absolute path as a Bun evaluation argument, and dynamically imports it. `process.cwd()` remains the target worktree. The instruction explicitly treats `none` as no removal.
- After: same test command exited 0, 1 pass / 0 fail, 6 expectations. Literal cleanup command returned `{code: 0, stdout: "history/alpha", stderr: ""}`. Committed and pushed file contains gamma and beta, with alpha absent.
- Only new test file added, so neither commit changes an old test path or requires a Test-Change trailer.

### Handed to A

- **A-F1 — over-removal, including a newly added line sharing the retired history path**: requires revising the plan's history-stem identity and original-retirement inputs, not an isolated substring guard. D2/D4 currently mandate stem-based removal/refusal and helpers accept only the rebased `base..head`. Those inputs do not identify which text the original leaf deleted. The suggested `git log -p base..head -- learnings/LESSONS.md` approach loses that information on the actual union rebase. Preserve the original retirement evidence through build, restack and solo paths before switching to exact deleted-line matching. Prefix-only matching is part of this same Fix and remains with A so it is repaired with the complete identity change, rather than adding a temporary guard. No plan/design file edited by B.

Concrete proof, real git scratch fixture under TMPDIR, automatically deleted afterward:

```text
Original retirement head: cc041c21b4a97e87593c77e71603d780dd145872
Replayed LESSONS patch: ''
After union rebase: '- original case. 2026-10-09. history/alpha.md\n- new recurrence. 2026-10-10. history/alpha.md\n'
Current helper output: [ "history/alpha" ]
After cleanup: ''
```

The original leaf deleted the first line and appended Applied. Main then added the second line with the same history path. After rebase, `git log --format= -p main..HEAD -- learnings/LESSONS.md` is empty, so collecting replayed deleted lines would also stop cleaning up the original resurrected line. Current helper deletes both. This is the unresolved A-F1 proof, not a failing configured check.

The check-issue repair rule is: “B repairs every Fix except plan or design changes, missing planned units, required live runs, and work B judges too large for its pass.” This finding needs a plan change to carry the missing original identity, so it is handed to A under that rule. No operator actions.

### Criterion proof and checks

- C1/C3/C5: shipped chart, shapes, lesson rule and check-issue text unchanged during this repair. Existing recorded independent-agent guard brief, touching brief and fix verdict remain applicable; no live-run trigger met.
- C2: new real solo rebase-and-push proof passes; full and changed suites include stack resurrection and both push-check refusal tests. A-F1 remains unresolved, so this criterion is not claimed fully satisfied.
- C4: reran `git grep -n LESSONS -- skills/learn-issues/SKILL.md skills/lesson-rule.md src/` and inspected the removal call sites. No closure/duplicate/rejection removal introduced.
- C6: `bun test tests/docs-links.test.ts --timeout=30000`: exit 0, 4 pass. Meaning sweep `git grep -n 'learn-issues' -- docs/ skills/` still names retirement and backlog triage. One-off prose-link check resolves both links in `skills/lesson-rule.md`; shapes has no prose relative links. Initial naive matcher incorrectly included a fenced example placeholder `forks/<fork-slug>.md`; excluding code examples gives the correct link result.
- `bun run format`: exit 0. Only unrelated existing src/status.ts formatting drift was produced; restored that tool-created drift before committing. New test already formatted.
- `bun run typecheck`: exit 0.
- `bun test --timeout=30000`: exit 0, **652 pass / 0 fail**, 7074 expectations, 61.11s.
- `AKROGON_BASE=2d9becac4365ec4a1079853364d561d90e356b5e bun test --changed=2d9becac4365ec4a1079853364d561d90e356b5e --timeout=30000`: exit 0, **156 pass / 0 fail**, 1671 expectations, 27.58s.
- No merge_checks run. No retained fixtures, temporary scripts, code changes outside the two committed files, or held B Nits.

Disposition: request `check.fix` for A-F1 after completing the consumer-command repair.


## 2026-10-10 check.review after A's check.fix

Repair diff: `14aa6a2..90ceddd`
Reviewed head: `90ceddd` (full SHA recorded by the phase log)
Verdict: **fix**

### Earlier findings

- B-F1 / A-F2 consumer import remains repaired. Literal shipped-command consumer test still passes after the original-range argument was added.
- A-F1 same-path/prefix data loss: exact deleted-line matching now preserves the tested new main lines. New real-git same-history-path and superstring tests pass. The repair introduces the blocking restack failure below.

### F2 — A restack can push the resurrected retired line because another member exempts it

Locations: `src/batch.ts:75-78`, `src/lessons.ts:58-70`, wired through `src/phase.ts:429-437` and the unchanged `restack` member-tip input at `src/phase.ts:532-537`.

Source: the real non-fast-forward push/restack flow, exercised through `akrogon phase holder merged --slot B --attempt proof` and `--check`, with real git rebases, a local bare remote and the repository's union attribute. This is brief criterion 2's stack integration scenario, with the ordinary possibility that carried leaves started at different main revisions.

Reproduction:

1. Start an unrelated member `older` before main introduces the alpha lesson. Its original fork remains saved in the batch record.
2. Main adds alpha and beta. Another member `guard` forks here, removes alpha and appends Applied to alpha history. The holder adds an unrelated file.
3. Main adds gamma adjacent to alpha. Build and check the stack with members ordered older, guard, then holder. The initial top correctly removes alpha. The recorded guard member tip still contains the union-resurrected alpha, since removal is a separate top fixup.
4. Before pushing, main adds delta adjacent to gamma. The actual push is rejected non-fast-forward and command restacks the batch from the recorded member tips.
5. Rebased guard tip has no alpha deletion in its new input range, so cleanup leaves alpha. `retiredLessonsPresent` exempts every line added on main since **any** member fork. Alpha was added after older's fork, so it is exempt despite guard explicitly retiring it. `merged --check` prints ok and the final push lands alpha.

Terminal evidence from the completed run (all steps exited 0, final remote read-back authenticated locally through git):

```text
Initial top: "- gamma. 2026-10-10. history/gamma.md\n- beta. 2026-10-09. history/beta.md"
Initial --check: code=0 stdout=ok stderr=""
Push/restack: code=0
reuse tested=4a8c35ade67596a62767fdfcd6055b7900cba79b pushed=c67cdc3fd8261b6bf9b2796d758196296b6fee28
Restacked lessons: "- alpha. 2026-10-09. history/alpha.md\n- gamma. 2026-10-10. history/gamma.md\n- delta. 2026-10-10. history/delta.md\n- beta. 2026-10-09. history/beta.md"
Restacked --check: code=0 stdout=ok stderr=""
Final push: code=0
moved merged
moved merged
moved merged
issue complete issue
Pushed lessons: "- alpha. 2026-10-09. history/alpha.md\n- gamma. 2026-10-10. history/gamma.md\n- delta. 2026-10-10. history/delta.md\n- beta. 2026-10-09. history/beta.md"
```

Consequence: the pushed active list contains the lesson the guard member retired, so the automatic retirement is undone. This violates brief criterion 2 and the before-push retirement contract. The report's claim that the backstop always refuses a line missed during restack is false for this reachable integration.

This failure is introduced by the repair: the new removal reads already-rebased member tips on retry, and the new guard's union of main-added lines masks the resulting resurrection. Preserve the original retirement/deleted-line evidence across restacks, and avoid exempting a retirement because an unrelated member has an older fork. Add a real CLI non-fast-forward regression covering those different fork points. Existing new tests exercise initial stacking and direct helper calls, not this retry.

### Verification

- Scoped review to A's two repair commits and the needed original callers. Read the plan's appended line-identity refinement and updated implementation report.
- `bun test tests/lessons.test.ts tests/batch.test.ts tests/phase.test.ts --timeout=30000`: exit 0, **77 pass / 0 fail**, 703 expectations, 1.92s. Reused A's current-head report evidence for full suite (656 pass), changed suite (160 pass), typecheck and formatting.
- Completed real CLI restack scenario above independently verifies F2. Early fixture attempts first hit untracked coordination files because the scratch repo lacked its normal issues exclusion; corrected fixture ignore rules, then completed the entire push and remote read-back. Those setup failures are not product findings. All scripts, bare remotes, git fixtures and disposable stack worktrees were under TMPDIR and removed.
- No code commits or edits during this review. Worktree clean at reviewed head. No new AREA changes in repair diff. No changed documented behavior beyond the solo command's original-head argument; reviewed that command and its consumer test.
- New `Test-Change:` trailers in `14aa6a2..90ceddd`, both on `90ceddd`: `tests/lessons.test.ts added same-stem recurrence, superstring-stem and half-retired cases; existing calls updated for the leafRanges signature only, no existing expectation changed`; `tests/batch.test.ts added a buildStack case where main adds a same-stem lesson; no existing expectation changed`. Both match the repair diff. No deleted/changed previous outcome assertion.
- No operator actions or held B Nits. No failed configured check and no unrelated-base failure. F2 is a criterion failure attributable to the repair, so no base-red stop applies.

Disposition: request `check.repair` for F2.


## 2026-10-10 check.repair — F2

Reviewed start: `90ceddd0599ce6b3d42e1fbd5bc17e0102cb9676`
Repair head: `bf8bb6e`
Repaired: **F2**, restack retirement lost and masked by an unrelated older member.

### Commits and proof

- Test commit `50cd200`: adds a real CLI regression to `tests/batch-merge.test.ts`. The older unrelated member forks before alpha exists; the guard member removes alpha; main adds gamma and a same-history-path recurrence before the initial stack, then delta before the push. The actual non-fast-forward push restacks the batch. The test requires alpha absent and gamma/delta/recurrence/beta present. It then deliberately resurrects alpha in the checked top and requires --check to refuse it, restores the top, checks, pushes and reads back the remote file.
- Fail-before: `bun test tests/batch-merge.test.ts --test-name-pattern='restack preserves a retirement' --timeout=30000` exited 1, 0 pass / 1 fail. The restacked file unexpectedly began `- alpha. 2026-10-09. history/alpha.md`, followed by the expected gamma/delta/recurrence/beta lines.
- Fix commit `bf8bb6e`: `buildStack` accepts retirement source heads separately from the replay inputs. Initial builds default to their original heads; `restack` explicitly passes the saved original member/holder heads. Removal still uses exact deleted text, with its fork derived from the original head. The push guard associates each stem with the original ranges that gained Applied for that stem, so unrelated old forks cannot exempt a retired line.
- Pass-after: the identical test command exited 0, 1 pass / 0 fail, 8 expectations. It proves both automatic cleanup and the independent refusing backstop, then the correct remote file after the real push.
- Both commits carry Test-Change trailers for `tests/batch-merge.test.ts`: the first names the added F2 regression and unchanged existing expectations, the second formatting of that added test only. Existing tests/outcome assertions were not changed.
- No plan/design change or additional owned behavior required. The prior report's restack limitation is resolved by these original-head inputs. No Handed to A items or operator actions remain.

### Checks and criteria

- `bun run format`: exit 0. It formatted the added regression and the new phase call. Reverted only its generated pre-existing `src/status.ts` drift. An earlier direct `./node_modules/.bin/prettier` invocation found no local binary; the configured `bun run format` successfully resolved the repository's installed formatter.
- `bun run typecheck`: exit 0.
- `bun test --timeout=30000`: exit 0, **657 pass / 0 fail**, 7097 expectations, 56.85s.
- `AKROGON_BASE=2d9becac4365ec4a1079853364d561d90e356b5e bun test --changed=2d9becac4365ec4a1079853364d561d90e356b5e --timeout=30000`: exit 0, **161 pass / 0 fail**, 1694 expectations, 26.94s.
- C1/C3/C5: chart/shapes/shared-rule/check-issue text unchanged. Recorded independent-agent guard brief, touching brief and uncalled-guard verdict remain applicable; no live-run rerun trigger met.
- C2: full/changed suites cover initial stack cleanup, same-history-path and prefix preservation, consumer solo rebase/push, both push-check modes, and now the actual refused-push restack and its backstop. F2 is fixed.
- C4: reran LESSONS grep over shared rule, learn-issues and src, and inspected changed call sites. Removal remains tied to Applied retirements; no report closure/duplicate/rejection removal added.
- C6: docs link tests rerun, 4 pass. Meaning sweep over docs/skills still names guard-leaf retirement and backlog triage. Prose links in shared rule both resolve; shapes has no prose relative links. No changed docs claims or AREA paths from this repair.
- No merge_checks run. Worktree clean after the commits and checks. Fixtures and their local remotes are cleaned by the test finally block; no iteration-created scripts or files retained. No held B Nits.

Disposition: request `merge`, all current Fixes repaired.


## 2026-10-10 merge — main-red comparison

Attempt: `4e7890c8-243c-4a28-bdc2-5b12041d34d7`
Applied/tested candidate top: `5d3d1a8fd9604d20d8edf77e40f36a45ea5e55fd`
Fetched base: `f3199df89b25b4f215df04f8703ef6d71880cd6a`
Members: none. Source leaf reviewed repair head: `bf8bb6e54d86b4604f70d74e4783e0eb020d4d52`.

### Commands and outcomes

- `bun run format`: exit 0. Restored only the formatter's generated baseline drift in `src/status.ts` and `skills/chart-issues/scripts/peer-wait.ts`; no top commit made.
- `bun run typecheck`: exit 0.
- Refreshed-base configured changed check, `AKROGON_BASE=f3199df89b25b4f215df04f8703ef6d71880cd6a` with `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, **176 pass / 0 fail**, 1786 expectations, 39.84s.
- An initial changed-check invocation accidentally inherited the old harness base, selected 19 files/320 changed paths and exited 1 (546 pass / 1 fail, the dependents-first test). It was not used as refreshed-base evidence. The explicit refreshed-base run above selected 8 files/18 changed paths and passed.
- Required full check `bun test --timeout=30000` on top: completed exit 1, **664 pass / 9 fail**, 7166 expectations, 66.91s. Terminal excerpt preserved in `merge-top-test.log` (tool-returned terminal output, not a complete redirected run log).
- Same full command, same args and whole-suite scope, in a detached worktree at the fetched base, after `bun install --frozen-lockfile` using the repository lockfile: completed exit 1, **654 pass / 9 fail**, 7110 expectations, 53.24s. Complete redirected output retained in `merge-base-test.log`. Exit captured before tail/reporting. Base scratch worktree allocated by mktemp, removed before disposition; its temporary log copied here and removed.

### Comparison and cause judgment

Both completed runs fail the same nine names: all eight behavioral cases in `tests/peer-wait.test.ts`, plus `next --all dispatches a leaf with unmerged dependents before an earlier leaf with none` in `tests/dependents-first.test.ts`.

Base's peer-wait trace shows `Unexpected fixture invocation: ["agent","list"]` from `tests/fake-herdr.ts:259`. Its dependent-priority trace expects exit 1 but receives exit 0 at `tests/dependents-first.test.ts:103`. Those tests, the fake-herdr fixture, the peer-wait implementation and `src/next.ts` are unchanged by `f3199df..HEAD`; the new lesson helpers do not run in peer-wait and return without changes on lesson-free batch fixtures. The identical failures on the completed base run establish the existing main-red concern, rather than a leaf-attributed defect.

Terminal tails:

```text
Top: 664 pass / 9 fail / 7166 expect() calls; 673 tests across 34 files; exit 1.
Base: 654 pass / 9 fail / 7110 expect() calls; 663 tests across 33 files; exit 1.
```

All nine failing names and individual timings are retained in the two evidence logs. The extra passing tests on top include this leaf's retirement tests. No incomplete/terminated base run or base-code claim based on a killed process.

### Disposition

The merge-issue skill's main-red rule applies: route `check.fix --red-on-base f3199df89b25b4f215df04f8703ef6d71880cd6a --command "bun test --timeout=30000"` under this attempt. This clears the attempt and holds the repository while the leaf stays in merge; no leaf repair or push claimed. Completion owner's three briefs and ISSUE.md were gathered before any landing, but no completion occurred, so no broadcast is sent.

No credentials inspected, no live fixture mutations, no commits by this top seat. Workspace clean after restoring formatter-only changes. No advisory or merge_checks configured.

Actual phase result: exit 0, `held akrogon on f3199df89b25b4f215df04f8703ef6d71880cd6a: bun test --timeout=30000`. State remains merge and the batch record is cleared. No push.

## Merge attempt 4074531b-403e-41e8-9344-456981670151

Tested stack top `537c12327b60674e93e1cfee8c364f7b155451f2` on configured base `82b79cce6d201376b28eeedab6cad73678b7d880`. All required checks passed:
- `bun run format`: exit 0. Restored its unrelated baseline formatting changes in `src/status.ts` and `skills/chart-issues/scripts/peer-wait.ts`; no stack commits or code edits.
- `bun test --timeout=30000`: exit 0, 673 pass, 0 fail. Output: `merge-test-4074531b.log`.
- `bun run typecheck`: exit 0.
- With `AKROGON_BASE=82b79cce6d201376b28eeedab6cad73678b7d880`, `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, 176 pass, 0 fail. Output: `merge-changed-4074531b.log`.

Worktree clean after checks. The current base fixes the previously recorded peer-wait fixture and dependents-first test failures. No outstanding merge findings.

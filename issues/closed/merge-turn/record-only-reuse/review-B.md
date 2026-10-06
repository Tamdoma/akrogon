# Review B

Date: 2026-10-06
Phase: check.review
Base: `43729a61d82935f52739ac727bd7bfcfd100e945`
Reviewed head: `c439883fe6817b7df65fc460f2d2b8b6963d1965`
Verdict: `fix`

Read brief, plan, design, implementation briefs/report, affected merge/setup/state docs, reference index and source/test areas. Debate is disabled, so no positions-B or rebuttal-B artifacts are expected. No peer review was read. No AREA.md changes require a path listing.

## Fixes

### F1. Early dirty-holder exit omits the recorded rerun decision

Location: `src/phase.ts:567-583`.

Real source: an operator edits the holder worktree while its green batch is waiting to publish, and commits issue records to main. The ensuing `akrogon phase hold merged --slot B --attempt a1` push is refused and restacks. `batchPush` clears `decision`; the early `worktreeDirty` branch spreads that cleared record and returns `dirty-holder` without writing `decision: 'rerun'`.

Consequence today: the command prints `rerun rebase hold onto <main>`, but the persisted batch has no decision. Its recorded result therefore disagrees with its printed result and the report's claim that dirty endings retain the decision. This violates plan D5, which explicitly requires dirty-holder endings to record `rerun`, and the brief's decision-record contract (criterion 6).

Verification: a temporary CLI probe reused the existing batchFixture and advanceRemote helpers, checked a hold/mem-a batch, advanced main with `issues/open/x/state.yaml`, wrote an uncommitted `operator-edit` in the holder worktree, then invoked merged. Exit 0, observed:

```json
{"stdout":"rerun rebase hold onto 40d9cbc9994245219968db26abcd5d542bd73cb2","decision":"absent","tested_top":"absent","tested_main":"absent","solo":true}
```

Probe: 1 pass, 0 fail, 4 assertions, confirming the missing field and preserving operator edits. The temporary probe was deleted. Existing late-dirt tests exercise the later applyStack exit and do not assert the early dirty-holder decision. Repair this early state write and add a CLI regression for the recorded decision after this operator action.

## Verification

- Reran `bun test tests/batch-merge.test.ts tests/batch-dispatch.test.ts --timeout=30000` for the specific concern about exceptional restack exits: 48 pass, 0 fail, 499 assertions, exit 0.
- Inspected the CLI tests for criteria 1–5, 7 and 8, the at-push record snapshot for criterion 6, and the skill's review-B copy instruction. Normal reuse preserves the original tested pair, leaves candidate unset until push, and checks main, top and config equality. Conflict attempts cannot reuse.
- Setup documents the fixed record-folder rule beside check configuration. Merge/state docs describe the new decision and tested_main fields. No `fresh checks required` matches remain in src/tests/docs/skills/README.md.
- Implementation report records format/typecheck/full-suite/changed-suite success at this reviewed head and a deliberate removal of the config comparison turning criterion 4 red. No code changes or missing evidence required repeating those checks.
- Worktree is clean. Review made no code edits or commits. No operator action is required.

## Test-Change trailers

Range: `origin/main..HEAD`. Source file rule: `src/test-files.ts`.

Commit `efee828c5c1373e267aa552e516253660d091c36`:

```text
Test-Change: tests/batch-merge.test.ts brief-1.md section 4: added advanceRemote helper and seven serial tests for criteria 1-5,7,8; updated the refused-push and member-conflict assertions to the rerun tested=/pushed= contract (no existing expectation weakened, tested_main and decision assertions added)
Test-Change: tests/batch-dispatch.test.ts brief-1.md section 4: updated the restack stdout assertion to 'rerun rebase cc onto <sha>' matching the D6 printed contract
```

Both changed old test files match the path rule. Both citations resolve to implementation/brief-1.md section 4, which explicitly changes the printed contract and names these updates. Existing behavior assertions remain, and literal decision/SHA checks validate the command contract. No uncited test changes found.

## Nits and operator actions

None.

## 2026-10-06 check.repair

Read both initial reviews at c439883. F1 is the only Fix. A's N1/N2 remain deferred as recorded, with no new promotion evidence. No items handed to A and no open operator actions.

F1 repaired:

- Test commit: `379f0494e414343b23e15044e19a2e4f568cb3ec`. Adds the CLI regression `a dirty holder during restack records rerun and preserves the operator edit`, with a Test-Change trailer citing this review's F1. No existing assertions changed.
- Fix commit: `b279fe202138b83a3b0478954b6db693b8053772`. The early dirty-holder state write clears tested_top/tested_main and records decision=rerun, matching the other rerun exits.
- Before fix: `bun test tests/batch-merge.test.ts --test-name-pattern='a dirty holder during restack records rerun' --timeout=30000` exited 1, 0 pass/1 fail. `expect(batch.decision).toBe('rerun')` received undefined after the command successfully printed the expected rerun rebase line.
- After fix: same command exited 0, 1 pass/0 fail, 9 assertions. The record has rerun, no tested pair, solo=true, the operator edit survives, and remote main stays unchanged by the refused publication.

Required checks at repaired head b279fe2:

- `bun run format`: exit 0, all files unchanged.
- `bun run typecheck`: exit 0.
- `bun test --timeout=30000`: exit 0, 501 pass/0 fail, 5421 assertions across 23 files.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, 353 pass/0 fail, 3214 assertions across 7 files. Base remains 43729a61d82935f52739ac727bd7bfcfd100e945.

Done-criteria proof: full and changed suites pass the CLI scenarios for record-only reuse with one run and push (1), code advance with two runs (2), matching member change (3), config change (4), learnings conflict with publication withheld until recheck (5), printed SHA/decision plus at-push record snapshot (6), second refusal retaining original pair (7), and subdirectory invocation (8). Inspected skills/merge-issue/SKILL.md:47 for criterion 6's review-B copy instruction and docs/guide/setup.md:62 for criterion 9's record-folder restriction. The repair's failing-before/passing-after regression proves F1 independently. No merge_checks run in this phase.

Final repair diff: three state fields and one new CLI test, two files, 33 insertions. Worktree clean. Every Fix is repaired.

## 2026-10-06 merge

Prior repaired head and tested head: `b279fe202138b83a3b0478954b6db693b8053772`.
Fetched origin and rebased onto `origin/main` at `43729a61d82935f52739ac727bd7bfcfd100e945`: already up to date, no conflicts or changed commits. Refreshed config confirms the same AKROGON_BASE. No outstanding changes, held reusable B Nits, operator-only inputs, merge_checks or advisory commands.

The installed akrogon executable points to the registered checkout's src/akrogon.ts, whose phase implementation predates batch records and command-owned pushes. This leaf's state has no batch/attempt. Used the installed merge skill's direct fetch/rebase/check/push workflow and its check-only command, rather than invoking the worktree's newer batch command without a command-created attempt.

Checks at b279fe2:

- `bun run format`: exit 0, unchanged files.
- `bun test --timeout=30000`: exit 0, 501 pass, 0 fail, 5421 assertions, 23 files.
- `bun run typecheck`: exit 0.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, 353 pass, 0 fail, 3214 assertions, 7 files.
- `akrogon phase record-only-reuse merged --slot B --check`: exit 0, `ok`.

Read merge-turn/ISSUE.md and all five leaf briefs before publication for completion context. Publication and phase result follow below.

`git push origin HEAD:main` exited 0, advancing main from 43729a6 to b279fe2. Authenticated `git ls-remote origin refs/heads/main` confirmed `b279fe202138b83a3b0478954b6db693b8053772`. `akrogon phase record-only-reuse merged --slot B` exited 0 and printed `moved merged` and `issue complete merge-turn`. The completed owner moved to issues/closed/merge-turn. No competing-push retry or reuse decision was needed in this merge.

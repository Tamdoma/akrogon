# Review B: merge-bounce-rounds

Date: 2026-10-10. Phase: check.review. Verdict: ready.

Base and target (`origin/main`): `3fde73f7197f35ea17ba2ff06c0705c535f9f75e`.
Reviewed head: `2595d71097880793bb369c26248b657663a45aa0`.

## Findings

No Fixes or Nits. Reviewed all five changed files against the brief, plan D1–D4, design exclusions and implementation report. Debate is disabled, so positions/rebuttal artifacts are absent as expected. Worktree is clean. No AREA.md changed.

## Verification

- Counting and cap: `transition` applies the existing cap to both repair and merge origins before `commitMove`; successful merge bounces increment the stored counter once. Capped moves preserve the count and record the actual origin with slot B. `failureSchema` accepts the merge phase.
- Live CLI flow: solo batch rejection and ordinary merge rejection both reach `transition`. A batch split and a red-on-base hold retain phase merge without `commitMove`, so neither consumes a round. Failed recovery remains excluded. Unchanged `requiredSlots` makes review B-only after a counted bounce.
- Real-boundary tests: tests/phase.test.ts drives the CLI against temporary repositories, proving increment, capped failure and unchanged repair behavior. tests/hold.test.ts proves a batch hold preserves the existing count alongside restoration and hold assertions. Existing recovery and B-only review tests remain intact. No tested unit is mocked.
- Reused implementation evidence at the unchanged reviewed head: focused tests 69 pass/0 fail, changed tests 91 pass/0 fail, full blocking suite 631 pass/0 fail across 32 files, typecheck passed, format completed with unrelated pre-existing src/status.ts reflow reverted. The reported deliberate break before the code change produced 68 pass/1 fail because the merge counter remained zero. No missing evidence or specific concern warrants a rerun.
- Documentation: opened docs/guide/phases.md and docs/guide/setup.md and followed docs/reference-index.md to the command and test areas. Both edited pages now describe merge bounces as consuming fix_rounds. The introductory statement that only a handoff to A counts remains accurate because merge check.fix is an A handoff.

## Test-Change trailers in origin/main..HEAD

Commit `2595d71097880793bb369c26248b657663a45aa0`:

```text
Test-Change: tests/phase.test.ts updated merge->check.fix expectations for brief criteria 1-2 (count and cap now apply to merge origin)
Test-Change: tests/hold.test.ts added fix_rounds-set and unchanged-after-hold assertions; no existing expectation changed
```

Both paths match src/test-files.ts. The phase expectation changes are authorized by brief outcomes 1–2. The hold fixture and added assertion prove outcome 3 without removing an existing assertion. Both trailers have valid sources and reasons.

## Outcome

Verdict ready. No operator actions or reusable Nits. Request merge through the lifecycle command; its aggregate result determines the actual next phase.

## Merge verification: 2026-10-10

Attempt: `7bdf3be7-5f93-4a0e-bbf5-0b5c0329838b`. Applied memberless stack, HEAD/top `2595d71097880793bb369c26248b657663a45aa0`, refreshed AKROGON_BASE `3fde73f7197f35ea17ba2ff06c0705c535f9f75e`. No fetch, rebase or commits performed by the seat.

All configured checks ran on the recorded top:

- `bun run format`: exit 0. Only unrelated pre-existing src/status.ts formatting changed; inspected and restored that generated change before other checks. Scoped files were unchanged.
- `bun test --timeout=30000`: exit 0, 631 pass, 0 fail, 6699 assertions across 32 files (47.52s).
- `bun run typecheck`: exit 0.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, 91 pass, 0 fail, 911 assertions across 3 files (8.61s), with base exported explicitly.

No merge_covers, merge_checks or advisory commands configured. Worktree is clean and HEAD remains the recorded top. No completion owner closes in this batch: merge-throughput still has red-batch-culprit, hold-fix-leaf and batch-limit-repo unmerged. No completion broadcast is expected.

Merge guard returned `ok`. The matching `merged --slot B --attempt` call exited 0 and printed `moved merged`, confirming the command pushed the tested top and completed the leaf. No issue/epic completion line was printed, so no broadcast was triggered.

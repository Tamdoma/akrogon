# Review B: leaf-stop

Date: 2026-10-13. Phase: check.review. Verdict: fix.
Base: `e5776ade920e619e923a7825140f823c2e89123e`.
Reviewed head: `6fe00fa69d9ac75c5b6793018894a9b2a37929b4`.

## Findings

F1 Fix: criterion 1 lacks the required live saved-session preservation proof.
- Source and criterion: brief.md done-criterion 1 explicitly requires saved harness sessions to remain after stopping a dispatched leaf in a real herdr server. Plan P4 requires the seat session files to exist after stop.
- Evidence: implementation/report.md, Live run and Known limitations, says seats used `pi --model none/none`, agent starts failed, and no saved session existed. It explicitly calls saved-session preservation unverified. `implementation/live-before.txt` records bash, Chrome and sleep processes, but does not establish any saved session before or after stop. The command test checks only worktree existence and unchanged phase, not saved sessions.
- Consequence today: the handoff declares criterion 1 complete without exercising its session-preservation outcome. A real seat session, its saved file and the surrounding herdr shutdown behavior were never verified together. Reading the record-write/systemctl code proves no explicit deletion there, but does not replace the live outcome required by this criterion.
- Required correction: use the existing isolated-live-run grant to dispatch a seat that creates a real saved harness session. Record the session reference and saved file before stop, then show that the same saved file remains after stop while the processes and leaf panes are gone and the worktree remains. Record cleanup and absence checks. This is required live proof for A, not missing evidence machinery or an operator-only action.

No additional concrete behavior defect found. No Nits or operator actions.

## Verification

Read brief.md, plan.md, design.md, implementation/report.md and the check-issue ponytail reference before reviewing the whole base-to-head diff. Debate is disabled, so positions-B.md and rebuttal-B.md are absent as expected. Did not read the peer review.

Traced stop/start through CLI validation, the global lock, stopped.yaml, the shared leafSlice name and systemctl. The stopped record is written before slice stop, failure preserves it, --all catches CommandError per leaf, and start clears the record then selects the exact leaf folder. Traced dispatchLeaf and all mergeQueue callers through next, phase and status. The filter excludes stopped holders and carried members from new stacks, and dispatchLeaf blocks merge-seat prompts for stopped holders. Status marks and unchanged pause semantics match the plan. Read docs/guide/next.md and README command rows against this behavior and followed docs/reference-index.md pointers.

Existing current evidence was sufficient for automated checks, so no duplicate run was made:
- `implementation/check-format-1791891777621-282343.log`: format passes on c1dde6b, per report.
- `implementation/check-typecheck-1791891779563-283582.log`: tsc --noEmit passes on c1dde6b, per report.
- `implementation/check-test-1791891888816-284787.log`: 887 pass, 0 fail, 49 files, 109.11 s. All eight leaf-stop cases pass, including the last-added same-name start reproduction.
- `implementation/check-test_changed-1791891914966-640600.log`: 144 pass, 0 fail, eight files, 26.02 s, --changed against the planned base.
- Report records P1 on c1dde6b: eight pass. It records `bun test tests/command-reference.test.ts tests/docs-links.test.ts --timeout=30000` on reviewed head: nine pass. The only subsequent commit changes README.md and docs/guide/next.md, and that documentation run follows the change. No planned test or runner was skipped, filtered out or disabled by the diff.
- Planned new behavior was red on the base per plan's recorded reds. The added same-name start case was red before c1dde6b and green afterward per report, corroborated by its pass in the current full-suite log.
- Live kill evidence establishes the Chrome/sleep/pane shutdown and retained worktree portions of criterion 1. Saved sessions remain the F1 gap. No live mutation performed in this review.
- Working tree clean and HEAD unchanged at review completion.

## AREA path listing

Ran a single repository-root shell listing for each reviewed AREA.md via one Python invocation extracting backticked src/tests/docs/plugin/issues paths and checking existence. All named source, test and documentation paths exist, including src/stop.ts and tests/leaf-stop.test.ts.

Absent paths were `issues/timings.jsonl`, `issues/base-runs.jsonl`, `issues/red-records.jsonl`, `issues/merge-attempts.jsonl` and `issues/config.yaml`. The first four are runtime records, not missing source links. The last is the registered-checkout configuration, not copied into the worktree. None is introduced by this diff or causes a present dead-pointer failure. No AREA Fix.

## Test-Change trailers

Checked against src/test-files.ts and each cited source:
- b61bab596ebb53950b15008ce77b150206190f20: `tests/command-reference.test.ts adds stop and start argument contracts and a case that docs/guide/next.md names akrogon stop and start; no existing expectation changed`. Accepted: brief criterion 7 and new CLI contracts require these additions. Existing test expectations were not deleted or weakened. Exact command strings run literally and are permitted assertions.
- 90a8bd6f3596838ceea7a06fd3306caf368458fc: `tests/AREA.md adds the tests/leaf-stop.test.ts key-file line; no test expectation changed`. Accepted: test-file path rule covers this existing file, and this is an index addition only.
- 7efa9c414b6fb04fb071b5734a70a15566bf989f: `tests/leaf-stop.test.ts adds a start case for a leaf whose issue shares its name; real output from the live criterion 1 run: akrogon next live failed with Ambiguous target live: issue issues/open/live / leaf issues/open/live/live, and start passes the bare slug to that pass; no existing expectation changed` (trailer preserves the exact original quoted output). Accepted: real next target-resolution output traces directly to the original start call. New reproduction only, existing cases unchanged.

No lessons removed. No reusable Nit held.

## check.repair: 2026-10-13

Read both initial reviews for head `6fe00fa69d9ac75c5b6793018894a9b2a37929b4`. Reviewed every Fix. No operator actions are open.

### Handed to A

- A-F1: stopped applied-batch holder splits the single merge turn. Plan correction required: D6 explicitly drops every stopped leaf from mergeQueue and claims that this filter covers every caller. The reported applied-batch scenario contradicts that claim. A must revise D6, retain the stopped batch holder's turn, gate restoration/build for a stopped holder, and provide the reproduction and repair proof.
- A-F2: stop --all includes merged and closed leaves with stale tab records. Plan correction required: D3 explicitly selects allLeaves(repo) with state.tab !== undefined, including exactly the stale records traced in A's review. A must correct that selection decision to open, unmerged allocated leaves and provide the reproduction and repair proof.
- B-F1: missing live saved-session preservation outcome for criterion 1. Required live runs belong to A. Existing live machinery and approved isolation grant are present, so this is a missing required run, not missing evidence machinery. A must record the real saved-session before/after evidence and cleanup.

No code or test changes, no commits, and no repairs performed in B's pass because every Fix falls under the skill's A-only handoff rules. Existing automated evidence remains unchanged. No duplicate checks run. Worktree clean, HEAD remains `6fe00fa69d9ac75c5b6793018894a9b2a37929b4`. Earlier review evidence remains valid for unchanged code, while the three Fixes remain open.

Requested move: check.fix, slot A owns the remaining work.

## check.review re-check: 2026-10-13

Verdict: ready.
Prior reviewed base: `e5776ade920e619e923a7825140f823c2e89123e`.
Prior reviewed head: `6fe00fa69d9ac75c5b6793018894a9b2a37929b4`.
Handed-off base: `e5776ade920e619e923a7825140f823c2e89123e`.
Reviewed repair head: `af4ead76ce989f969cca5fc4f4e58f60d8072431`.

Computed `git range-diff e5776ade920e619e923a7825140f823c2e89123e..6fe00fa69d9ac75c5b6793018894a9b2a37929b4 e5776ade920e619e923a7825140f823c2e89123e..af4ead76ce989f969cca5fc4f4e58f60d8072431`. All eight original commits are unchanged, followed by five added repair commits. No refresh/rebase changes or main commits to review. Reviewed only that repair diff plus the updated plan decisions and repair evidence.

### Earlier Fixes

- A-F1 resolved by cc545ada36a8cf3266c18796dde8d6bbf35abba1. mergeQueue retains stopped batch holders, and its existing batch-first sort preserves their ownership. mergeTurn returns for the stopped holder before dispatch, restoration or new stack construction. The reproduction added in 128150a7e7edf1de297c6f351935304985905678 exercises an applied batch carrying bb; after stopping aa and running next, bb has no second batch and neither merge seat is prompted. Report records fail-before/pass-after. Corrected plan D6 and the guide describe the resulting wait.
- A-F2 resolved by 43b1ab16527182970a1a8b7baa3909919d8342e9. --all scans only issues/open and selects tab-bearing leaves whose phase is not merged. The reproduction added in 766137728b8fadd583d74d649fd09878a7c45096 includes an open merged leaf and a closed merged leaf with retained tabs. Only the live leaf gets a record and slice-stop call. Report records fail-before/pass-after. Corrected plan D3 matches the selection.
- B-F1 resolved by the required live run on af4ead7. Read implementation/live-session-before.txt and implementation/live-session-after.txt: a running pi seat's saved session exists before stop (80330 bytes) and remains at the identical path afterward (107427 bytes, 24 JSON records). The before list shows pi and Chrome inside the leaf scopes. The after record shows the slice inactive, zero units/PIDs/Chrome/pi, only the isolated workspace's pane/tab remaining, and the retained worktree. The report records valid session JSON and cleanup/read-back absence of the isolated server, fixture units, temp paths and fixture session folder. This supersedes the earlier saved-session verification gap. No live mutation performed by B.

### Current verification

All repair tests and their helpers precede the recorded current runs. No planned tests or runner configuration were removed, skipped or disabled. The current report records P1 (10 pass) after both behavior fixes, and P2 (9 pass) after the guide edit. Checked these current configured-check logs:
- implementation/check-format-1791892384362-1234486.log: format, rc 0 per report, source/test files unchanged by formatter.
- implementation/check-typecheck-1791892386185-1235473.log: tsc --noEmit, rc 0 per report.
- implementation/check-test-1791892496832-1236635.log: 889 pass, 0 fail, 49 files, 110.52 s; both new reproductions pass.
- implementation/check-test_changed-1791892523316-1596261.log: 146 pass, 0 fail, eight files, 26.35 s; both new reproductions pass.

No evidence gap or new concern required a duplicate run. No rejected merge run occurred, so merge replay evidence does not apply. No AREA file changed in the repair. The changed guide sentence matches the stopped-holder behavior.

Repair Test-Change trailers: 128150a cites review-A F1's real operator stop during merge checks and observed overlapping batch ownership; 7661377 cites review-A F2's real stale tab records in this repository. Both add reproduction cases and needed imports without changing any existing expectation. Accepted against src/test-files.ts and the cited sources.

No new blocking defect introduced by the repair. No Nit held by B and no operator action open. No lessons removed. Working tree clean and reviewed HEAD unchanged. All three earlier Fixes closed. Requested move: merge.

## Merge checks: 2026-10-13

Attempt: `8e164bae-02ff-4ef2-84b3-039f6df2a754`. Base: `e5776ade920e619e923a7825140f823c2e89123e`. Tested top: `af4ead76ce989f969cca5fc4f4e58f60d8072431`. Applied stack, no members. No fetch, rebase or commit.

- format: exit 0. Command: `akrogon run-check --name 'format' -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\''bun run format'\'''`. Log: `implementation/check-format-1791893198833-2093846.log`.
- test: exit 0. Command: `akrogon run-check --name 'test' -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\''bun test --timeout=30000'\'''`. Log: `implementation/check-test-1791893321621-2094928.log`.
- typecheck: exit 0. Command: `akrogon run-check --name 'typecheck' -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\''bun run typecheck'\'''`. Log: `implementation/check-typecheck-1791893323373-2456083.log`.
- test_changed: exit 0. Command: `akrogon run-check --name 'test_changed' -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\'': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'\'''`. Log: `implementation/check-test_changed-1791893352127-2457150.log`.

Full suite: 889 pass, 0 fail (122.69 s). Changed suite: 146 pass, 0 fail (28.67 s). No merge_checks or advisory configured, merge_covers empty. All checks ran on the prompted top. Completion owner host-test-load has three leaves; read all three briefs before completion. Working tree clean.

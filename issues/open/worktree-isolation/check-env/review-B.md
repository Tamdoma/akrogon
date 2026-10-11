# Review B: check-env

Date: 2026-10-10
Base: `354c80e14aca6483c430312c61ae5c1397bb548e`
Reviewed head: `d24a8d62c825322abd57cdef9e658be403d1f714`
Verdict: **fix**

Initial blind review. Debate is disabled, so no positions/rebuttal artifacts were expected. No peer review read. No code modified or commits created.

## Fixes

### F1. FFmpeg version resolution silently records unknown

Location: `src/attempts.ts:53-55`.

Realistic source: the binding chart's `forks/outside-inputs.md:12` names FFmpeg as a current outside PATH tool. The added config acceptance test also declares `tools: ['ffmpeg']`. Merge dispatch passes this list to `resolveTools` and persists its result in `Batch.tools`; `appendAttempt` copies it into every resulting attempt line.

Live trace on the installed binary:

- `resolveTools` with `tools: ['ffmpeg']` returned `[{"name":"ffmpeg","path":"/usr/bin/ffmpeg","version":"unknown"}]`.
- `ffmpeg --version` exited 8 with `Unrecognized option '-version'.` and `Error splitting the argument list: Option not found`.
- `ffmpeg -version` exited 0 and printed `ffmpeg version n9.0.2 Copyright (c) 2000-2026 the FFmpeg developers` as its first stdout line.

Consequence today: a real declared tool loses its version in merge evidence while dispatch succeeds. A failed version probe is replaced with a success-shaped `unknown` value and its debugging context is discarded.

Hits brief DC5 (each declared tool's resolved path and version string), plan D8, and the no-fallback error-handling rule. Obtain the actual version for the named tools and propagate unsuccessful probes with command/response context. Add regression proof for this real tool protocol, showing fail-before/pass-after.

### F2. No test executes the printed check through the new boundary

Locations: `tests/config.test.ts:20,435,469,493,524,548`, `tests/batch-merge.test.ts:22,851,864,871`, `tests/run-check.test.ts:150-154`.

Criterion scenario: brief DC2 requires a **printed command** to refuse forbidden inputs before **setup** executes. DC1 requires the printed command, including setup, to receive the constructed environment. The standing design explicitly calls for executing the real printed command through sh without a stubbed spawn.

All existing printed-command execution tests now call `runCheckInner`, which removes `akrogon run-check --name ... --` before execution. The new run-check tests invoke the verb directly and do not configure setup. The nested shim test exercises a direct nested invocation, not the `config` → printed command → setup/check integration.

Consequence today: the suite can remain green if `withSetup` runs setup outside the boundary or omits the run-check boundary, because execution tests discard that boundary and separate tests compare command strings. No committed functional test catches the named before-setup outcome. This is a missing criterion test, not a demand for extra optional coverage.

A review-only probe ran the unmodified printed command in a registered fixture leaf with setup creating a marker:

- Forbidden `NODE_PATH`: exit 1, error named `NODE_PATH`, setup marker absent, no output log created.
- Normal caller: exit 0, child reported declared token present and undeclared extra absent, setup marker present, one leaf log, run root absent after exit.

The current implementation passes that scenario, but the required guard is absent from the tests. Add a functional test running the actual printed command through the source shim, asserting setup cannot run on refusal and receives the constructed environment on success. Supply the required deliberate-break/red evidence for the new behavior. Existing execution tests should exercise the actual wrapper when they claim to test printed-command execution rather than strip it away.

## Verification

- Read brief, plan including implementation notes, design, report, affected source, docs/reference-index.md, README command row, docs/guide/setup.md, docs/guide/files.md, src/AREA.md, and changed tests.
- `bun test tests/run-check.test.ts tests/config.test.ts tests/merge-attempts.test.ts tests/next.test.ts tests/command-reference.test.ts --timeout=30000`: exit 0, **290 pass, 0 fail**, 37.45s. Log: `implementation/check-review-B-focused.log`. Rerun justified by the specific boundary/tool concerns and missing integration proof.
- `git diff --check 354c80e14aca6483c430312c61ae5c1397bb548e...HEAD`: exit 0.
- Worktree remained clean. Implementation report records successful full test/typecheck/format/test_changed runs. No code changed during review, so these were not repeated.
- Live FFmpeg version probes and printed-command integration probe are recorded above. Fixture was removed in finally.
- Acceptance mapping: DC1/DC2/DC6/DC7 have direct run-check tests plus the review integration probe, with the permanent integration gap F2. DC3 has concurrent distinct-root proof. DC4 has default home-root and seat dispatch tests. DC5 has successful fake-tool dispatch/attempt-copy and missing-tool tests, but fails for the real FFmpeg source in F1.

## Documentation and pointers

Behavior docs describe the constructed wrapper, refusals, env/tools settings and attempt tool records. No separate undocumented behavior change found. One repository-root listing for every path named in changed `src/AREA.md` confirmed these exist: src/akrogon.ts, src/preflight.ts, src/config.ts, src/init.ts, src/phase.ts, src/shell.ts, src/readiness.ts, issues/, docs/reference-index.md, tests/helpers.ts. No AREA deletions or lesson removals in the diff.

## Test-Change trailers

Range: `origin/main..HEAD` with target `b8826604744a37152eba9769f065beab42cba4ad`. This lists the same four leaf commits as the reviewed base range; merge base remains `354c80e14aca6483c430312c61ae5c1397bb548e`.

- `e85d49a`: `tests/config.test.ts` — wrapper expectations, stripping wrapper, env/tools and home-root cases. Wrapper/schema/root expectation updates follow brief DC1/DC4/DC6 and D4/D5/D9. Stripping the executed wrapper has the criterion gap F2.
- `e85d49a`: `tests/next.test.ts` — home-root assertion and removal of uid mock. Brief DC4/D5 contradicts the old /tmp root expectation. Accepted.
- `e85d49a`: `tests/batch-merge.test.ts` — strips printed wrapper during execution. Integration bypass tracked in F2.
- `cb5c689`: `tests/helpers.ts` — adds source shim. New helper, accepted under D10.
- `cb5c689`: `tests/command-reference.test.ts` — adds run-check contract. Literal command contract under D1, accepted.
- `ddc0931`: `tests/merge-attempts.test.ts` — adds tool dispatch, absent-tool failure and attempt-copy cases. New tests under DC5/D8, accepted but do not catch F1.
- `d24a8d6`: `tests/next.test.ts` — adds nested missing-parent/recreation dispatch proof. New tests under DC4/D5, accepted.

All changed existing paths matched by src/test-files.ts have trailers. New tests/run-check.test.ts needs no existing-test trailer. No old assertion/fixture deletion beyond the cited home-root change.

## Nits and operator actions

None.


## check.repair — 2026-10-10

Prior reviewed head: `d24a8d62c825322abd57cdef9e658be403d1f714`.
Repair head: `91967bb`.

### B-F1 repaired: tool version evidence

- Test commit `970300e`; fix commit `8a62931`.
- New merge-dispatch tests reproduce the live FFmpeg `-version` protocol and unsuccessful/empty version responses. Before fix: 0 pass, 2 fail. After fix: 2 pass, 0 fail, including both failed and empty probe scenarios.
- Command: `bun test tests/merge-attempts.test.ts --test-name-pattern 'FFmpeg version|failed or empty version' --timeout=30000`.
- Logs: `implementation/repair-B-F1-red.log`, `implementation/repair-B-F1-green.log`.
- Resolution probes the resolved executable, chooses FFmpeg's supported `-version` flag directly, and throws CommandError with argv/cwd/status/stdout/stderr for unsuccessful or empty probes. There is no unknown-version fallback.
- Live repaired probe on the real registered repo with `tools: ['ffmpeg']`: `/usr/bin/ffmpeg`, `ffmpeg version n9.0.2 Copyright (c) 2000-2026 the FFmpeg developers`.

### A-F1 repaired: check names

- Test commit `9bc8759`; fix commit `67381d2`; test-boundary typing follow-up `4f93c21`.
- Reproduction runs the actual printed command for schema-valid `two words` and `lint/type` names. Before fix: 0 pass, 1 fail with the spaced name producing spawn ENOENT. After fix: the name regression and config suite give 24 pass, 0 fail.
- Commands: `bun test tests/check-names.test.ts`; `bun test tests/check-names.test.ts tests/config.test.ts --timeout=30000`.
- Logs: `implementation/repair-A-F1-red.log`, `implementation/repair-A-F1-green.log`.
- `withSetup` quotes the name argument. `runCheck` URI-encodes the name only in the log basename, eliminating path separators while preserving the schema's accepted names. This addresses the finding's behavior without narrowing valid configuration to the suggested ASCII-name guard. Simple names retain their existing log filenames.

### B-F2 repaired: functional printed boundary proof

- Test repair commit `91967bb`.
- Added shared source-shim shell runner. Existing printed-command execution tests in config and batch-merge now execute the complete wrapper. Their original assertions remain. Detached config fixtures are registered as fixture leaves so the real log target resolution executes too.
- Added functional printed-command test asserting refusal before setup, declared/undeclared variables in both setup and check, the same run root in both, root removal and retained leaf log.
- Deliberate break: temporarily replaced `withSetup`'s run-check wrapper expression with `inner(cmd)`. `bun test tests/run-check.test.ts --test-name-pattern 'printed checks refuse before setup'` failed (0 pass, 1 fail), because the forbidden caller reached setup and the printed command exited 0. The original source was restored in finally, and the same command passed (1 pass, 0 fail). No mutation was committed.
- `bun test tests/run-check.test.ts tests/config.test.ts tests/batch-merge.test.ts --timeout=30000`: 65 pass, 0 fail.
- Logs: `implementation/repair-B-F2-red.log`, `implementation/repair-B-F2-restored.log`, `implementation/repair-B-F2-green.log`.
- This finding was a missing functional guard, not broken implementation behavior, so its repair is the test commit with deliberate-break/red and restored/green evidence.

No Fixes handed to A. No operator actions or retained Nits.


### Final checks and acceptance proof

All configured checks ran using the repaired source's actual `effectiveConfig` printed commands through `sh -c`, with a temporary PATH shim pointing at this worktree's source entry. Setup is absent for this repo. The shim was removed in finally. Each command executed within run-check's constructed environment and produced a retained leaf log.

- `format`: exit 0 (`bun run format`). Only known pre-existing drift in src/status.ts and skills/chart-issues/scripts/peer-wait.ts was reverted, preserving the review scope. Log: `implementation/repair-B-check-format.log`.
- `typecheck`: exit 0 (`bun run typecheck`). Log: `implementation/repair-B-check-typecheck.log`.
- `test`: exit 0 (`bun test --timeout=30000`), **714 pass, 0 fail**, 36 files, 90.56s. Log: `implementation/repair-B-check-test.log`.
- `test_changed`: exit 0 (`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`), **686 pass, 0 fail**, 31 files, 64.51s. Computed AKROGON_BASE remains `354c80e14aca6483c430312c61ae5c1397bb548e`. Log: `implementation/repair-B-check-test_changed.log`.
- `git diff --check`: exit 0. Worktree clean at repaired head `91967bb`.

The full suite reran every acceptance proof: DC1 env allowlist and success/failure root lifecycle; DC2 all named variable and both global-bunfig refusals, plus permanent printed-command-before-setup proof; DC3 concurrent distinct run roots; DC4 home scratch default and seat dispatch/recreation; DC5 tool dispatch and attempt-copy, repaired FFmpeg protocol and failure handling; DC6 no-setup wrapping/refusals; DC7 leaf logs on failure, cleanup, explicit leaf override and registered-checkout holder. The live real FFmpeg probe is recorded above. Final scratch listing found no run-* directories under the check-env leaf scratch.

All three Fixes are closed. No merge_checks configured or run. Ready to move to merge.


## merge — 2026-10-11

Attempt: `7e11a65f-2d37-49f2-b177-020c9d57e247`.
Applied top: `309d742605a0516067840863ffdf3be29b03fc0c`.
Refreshed AKROGON_BASE / built_on: `b8826604744a37152eba9769f065beab42cba4ad`.
Prior repaired head: `91967bb52c1c9a6704a9ff17d6824b7bd769c1f5`.
Carried members: none.

Verified HEAD equals the prompt and recorded batch top, batch attempt matches, and the worktree starts clean. No fetch, rebase, or commits performed in this applied-top pass. The difference from the prior repaired head consists only of the new base's eleven workflow documentation files.

All checks not covered by merge_covers (empty) run using this top's source effectiveConfig through sh, under run-check. A temporary PATH shim resolves akrogon to this worktree's source until installation gains the verb. Exact printed commands, base and top are saved in `implementation/merge-7e11a65f-commands.json`; per-command logs are `implementation/merge-7e11a65f-<name>.log`. No merge_checks or advisory commands are configured.

Owner read: `worktree-isolation/ISSUE.md`. The four sibling leaves worktree-store, leaf-env-file, base-run and worktree-reconciler remain in plan.synthesis. This single-leaf batch cannot close an issue or epic, so no completion-owner broadcast is expected.


Merge check results on base `b8826604744a37152eba9769f065beab42cba4ad`, top `309d742605a0516067840863ffdf3be29b03fc0c`:

- `format`: exit 0. Formatter touched the same two pre-existing drift files (src/status.ts, skills/chart-issues/scripts/peer-wait.ts); both restored to recorded top before tests. No commits.
- `test`: exit 0, **714 pass / 0 fail**, 36 files, 130.48s.
- `typecheck`: exit 0.
- `test_changed`: exit 0, **686 pass / 0 fail**, 31 files, 66.34s, using refreshed AKROGON_BASE.

All required checks passed. The PATH shim was removed in finally. HEAD still equals recorded top. `git diff --check` passed and the worktree is clean. No advisory Nits or operator actions.


`akrogon phase check-env merged --slot B --check --attempt 7e11a65f-2d37-49f2-b177-020c9d57e247` returned `ok`, accepting trailers and recording tested top.

`akrogon phase check-env merged --slot B --attempt 7e11a65f-2d37-49f2-b177-020c9d57e247` exited 0 and returned `moved merged`. No issue/epic complete lines were emitted, so no broadcast was run.

The command also reported `self-update skipped: diverged from origin/main; 15 behind origin/main; run akrogon sync`. Merge is complete; the registered checkout's self-update was skipped and remains an operator follow-up. No sync or other adjacent change was attempted.

# Slot B review

Base `646819159203d8ba256d0990f85fd17b44c1bd78`. Head `8015eeff0f2ced10f6b58e00a20c686b3eade3ac`. Verdict `fix`.

## Findings

- **F1. Cgroup removal failures are silent.** Criterion 4 and plan D9 require a structured warning and an error count while the move stays committed. `src/tool-cgroup.ts:171` discards every removal error, and the deferred helper at line 363 silently gives up at its retry deadline. A real user-scope move with a nested cgroup returned 0 and committed, while removal returned `EBUSY` and the sweep reported zero errors. The existing failure test covers kill writes and helper spawn, leaving removal unchecked. [Real scope probe](implementation/check-review-b-rmdir-1795607469598-248869.log)
- **F2. Backpressure changes the run-check exit code and drops output.** A Bun caller can keep its stderr pipe open while delaying reads. The early capture announcement uses Bun's stream, then `src/run-check.ts:325` uses synchronous writes and throws `EAGAIN` when that pipe fills. A holder run with an open reader and 1 MiB on each output stream saved its log but exited 1 for a command that exited 7. It echoed only 219,264 of 1,048,576 stderr bytes and skipped the final summary. The closed-reader behavior in criterion 2 must preserve normal pipe delivery and the documented summary. [Slow reader probe](implementation/check-review-b-pipe-1795607483124-249393.log)
- **F3. Criterion 1 lacks checks for required outcomes.** The real-move test in `tests/tool-kill.test.ts:202` reads state after both phase calls return. An early sweep before `saveState` would pass that check. A failed state save on a move with real tools can distinguish the ordering. Every scope in the moved slice has `tools/`, including s4, so the test would also pass if a scope missing that directory produced a warning. The timing assertions at lines 363–373 never check `populated`, so dropping the required populated names would pass. Add coverage at the existing phase and cgroup boundary and show it detects each violation. The s4 assertion should stay for the separate empty-directory case.
- **F4. Rolling back hides all timing history for a repo.** A normal move writes the new kinds to the shared ledger at `src/timing.ts:87` and `src/tool-cgroup.ts:298`. The documented `akrogon rollback` keeps that ledger when switching to the previous release. The base reader at `src/timing.ts:114` catches a discriminator error around the whole file, so its `timing` and `status` readers receive an empty history after the first new row. The probe applied the actual base reader to a ledger before and after one `tool_kill` row and observed `["visit_start"]` become `[]`. The plan's D10 calls the failure soft, but it drops valid older rows on a supported rollback path. [Base and head reader probe](implementation/check-review-b-timing-rollback-1795607624490-261947.log)
- **F5. Bash tracing exposes the entry's own output.** Pi and Codex export the sourced `BASH_ENV` entry. A tool command invoking Bash with `-x` inherits it. `src/tool-cgroup.ts:44–46` writes entry traces to stderr before or outside the function redirection. With placement blocked in a real user scope, `bash -ex` still ran and exited 7 but emitted three extra trace lines for entry internals. Criterion 3 requires unchanged output even when placement fails. [Bash trace probe](implementation/check-review-b-entry-trace-1795607676176-266067.log)

## Verification

- Verified receipt `4bea44ae-a259-4c20-b920-90c1e75fbf99` on tree `138966fcf8c5f71df10baf00a7e4ddd253ee020f`. Format, typecheck and test exited 0. The test log shows 1,473 passes in the full run and 105 passes in the changed-file repeats. [Format](implementation/check-format-1795607075826-4067486.log) [Typecheck](implementation/check-typecheck-1795607078410-4067486.log) [Tests](implementation/check-test-1795607223942-4067486.log)
- The three reported proof commands ran the planned Bun files with the planned arguments. The labels vary for log names. Each proof is current for its inputs, including the agy assertion edited at HEAD. The existing red logs show the base failures. The green proofs miss the cases above. [Kill](implementation/check-head-tool-kill-1795607241843-230176.log) [Entry](implementation/check-final4-tool-entry-1795607069535-4066544.log) [Recovery](implementation/check-head-recovered-1795607243255-230676.log)
- The review probes used disposable fixtures and scopes. The first Bash probe checked for scope disappearance before systemd had finished removing it. The corrected probe checked after stop, and the first scope was also confirmed gone. No paid or covered operation ran.
- Reviewed the affected command descriptions, timing record reference and release rollback docs. Every concrete source path in `src/AREA.md` exists. Runtime ledger and directory examples belong to the registered checkout. The documented warning behavior and rollback contract are covered by F1 and F4.

## Test-Change trailers

All 11 trailers in the reviewed range were checked against their cited sources under `src/test-files.ts`.

| Commit | Cited source and judgment |
|---|---|
| `edb47dde` | Design Q6 requires a row for the fourth scope because its `tools/` exists, even when empty. The corrected row count is valid. F3 covers the separate missing-directory proof. |
| `fbfc2db9` | The reference case reads kernel-relative `/proc/self/cgroup` paths, supporting removal of the filesystem prefix from the regex. |
| `7c505a87` | The old quoting and unexported `CMD` prevented the tested command from running. Script-file invocation restores the stdout, stderr and exit assertions. |
| `2e6c31d6` | The base hc-less phase wake already warns with the slug. Checking the sweep warning's discriminator preserves the intended assertion. |
| `3ef78af4` | Routing starts A alone for `implement` and both slots for `check.review`. The fixture now isolates the intended replacement. |
| `751cb9ef` | The existing silent-turn-end path can reset the replacement's loss count. The unchanged address and single `seat_lost` row still prove the second pass leaves that seat alone. |
| `6318b00e` | The default cap of three from `src/config.ts` refused the fourth case. Raising the fixture cap keeps all five launch cases. |
| `ad88f440` | TS2554 confirms two assertion labels went to the one-argument predicate. Moving them to `expect` preserves the assertion values. |
| `63243bc8` | TS2345 confirms subprocess stream narrowing was needed for this pipe-only caller. Runtime coverage is unchanged. |
| `b12ebf1b` | The brief adds a timing row for the real fixture scope, so the unwritable ledger produces a fourth warning. |
| `8015eeff` | The inherited-PATH fix in `a656fd66` and the D5 intent support checking the shell-unquoted entry directory as the first PATH element. |

## 2026-11-25 check.repair

Reviewed both initial reviews on `8015eeff`. Slot A's F1 duplicates B's F1. Slot A's N1 concerns the same output path as B's reproduced F2. N2 remains a Nit.

Slot B owns F3. It adds criterion 1 cases through the current CLI and real cgroup runner with the product unchanged. The 2026-11-25 implementation note in `plan.md` records the proof steps required by the brief.

**F3 repaired in `958e0a53a56cf590a266d60382a6a74152642ea0`.** The existing phase CLI and real cgroup fixtures now exercise a refused state save followed by a successful move. The failed save leaves the original phase and the populated tool intact and emits no sweep row. The successful move emits no warning or row for the scope without `tools/`. Its eligible scope row names the populated tool and counts both the populated and empty tools. Existing test expectations are intact.

The same `bun test tests/tool-kill.test.ts --timeout=120000` command ran all four cases in each proof. Each temporary break failed the added test while the three existing tests passed.

- Moving the sweep before `saveState` produced a sweep row despite the failed save. [Ordering red](implementation/check-b-pre-save-sweep-1795608255964-328651.log)
- Dropping the `tools/` filter produced a structured warning for the bare scope. [Scope red](implementation/check-b-sweep-bare-scope-1795608257341-329253.log)
- Replacing the populated names with an empty list failed the timing assertion. [Timing red](implementation/check-b-drop-populated-names-1795608258708-329969.log)

All three temporary edits were restored. The planned tool-kill command passed all four tests on the committed head and the case verified its user slice disappeared in cleanup. The entry and recovery proofs have unchanged inputs and keep their earlier results. [Committed green](implementation/check-tool-kill-1795608283992-332502.log)

### Handed to A

- **F1** needs the removal-failure behavior and a new regression proof. No unchanged test observes a removal failure warning.
- **F2** needs the writer's pipe behavior and a new open-but-slow reader proof. The unchanged writer case closes stdout and misses backpressure.
- **F4** needs a rollback-compatible timing representation and a new mixed-version regression proof. The unchanged timing tests use one schema version per run.
- **F5** needs the entry's trace handling and a new Bash tracing regression proof. The unchanged entry test runs without tracing.

## 2026-11-25 check.review after repair 1

Base `646819159203d8ba256d0990f85fd17b44c1bd78`. Previous reviewed head `8015eeff0f2ced10f6b58e00a20c686b3eade3ac`. B's proof commit `958e0a53` and A's subsequent repair commits were reviewed through `ce4bfb5025b99c475ca6200a359971552bd53549`. The repair kept the same merge base. Verdict `fix`.

### Fixes

- **F2. Pipe backpressure now holds the capture owner's lock after publication.** The repair preserves the bytes and exit code for a slow reader. It retries `EAGAIN` synchronously in `src/run-check.ts:339`, while `checkedRun` still owns the shared owner lock until line 535. A caller using a Python stderr pipe can observe the complete check log and disappearance of both capture files, then call the documented `akrogon pack` command for that chart. The installed writer allowed packing before the caller read stderr. The repaired writer blocked pack until stderr was drained. A caller that waits for pack before reading never reaches the drain. This violates the capture lock contract in `docs/reference/checks.md` and `docs/reference/files.md`. The retained test uses Bun's child stream and checks the writer's result only. Keep the slow-reader proof and add the pack or owner-lock observable after publication. [Installed and repaired writer comparison](implementation/check-review-b-echo-pack-1795618343943-1498727.log)
- **F5. Inherited Bash tracing changes which arguments the wrapper accepts.** The new wrapper puts `-x` before the caller's arguments at `src/tool-cgroup.ts:85`. A traced script that exports `SHELLOPTS` and launches Bash with `--noprofile --norc` reaches the wrapper through agy's PATH. Bash requires long options before short options. Plain Bash ran the command and returned 7. The repaired wrapper rejected the arguments with exit 2 and produced no command output. Criterion 3 requires unchanged output and exit status. The wrapper test traces the caller's own exec and does not export `SHELLOPTS`, so it misses this branch. The same probe also found that the original trace leak persists when Bash sends tracing to a separate open `BASH_XTRACEFD`. [Bash options and trace descriptor probe](implementation/check-review-b-trace-options-1795618309908-1493286.log)

### Closed findings

- **F1.** The original real nested-cgroup scenario now commits with exit 0, emits one structured `EBUSY` warning and reports one error. The detached helper records removal failures in its own diagnostic row. The deliberate transient cleanup handling in A's plan does not change this persistent-failure outcome. [Real cgroup recheck](implementation/check-review-b-rmdir-recheck-1795618387357-1504033.log)
- **F3.** B's three required checks still run in the six-case tool-kill proof. The test helper follows the moved ledger with the same scope, population, and ordering assertions. [Tool-kill proof](implementation/check-fix-tool-kill-1795618002668-1084169.log)
- **F4.** Both new kinds write to a sibling ledger so the shared file retains its older schema. The repair proof checks both stored rows and the shared visit row. [Timing proof](implementation/check-fix-timing-1795618016943-1086978.log)

### Verification and trailers

Receipt `b5e2d92f-60d8-4a87-8ff5-e2531b52cce2` on tree `46eca58c39792d09d6cfb4e7561b82a841e1b802` is green for format, typecheck, and test, with 1,477 full-suite passes and 125 changed-file repeats. The repair's tool-kill and tool-entry proofs ran after their latest test and product edits. The full test run also exercised recovered seats. Review probes used temporary local fixtures. No paid sessions or covered operations ran. All concrete source paths in the changed `src/AREA.md` exist. Reviewed the checks, records, and rollback references. [Verify test log](implementation/check-test-1795618184769-1095744.log) [Entry proof](implementation/check-fix-tool-entry-1795618006992-1085730.log)

- `958e0a53` cites criterion 1 for the three added checks. Existing expectations remained.
- `a08e388d` cites the four original probes for the added tests in `tests/tool-kill.test.ts`, `tests/tool-entry.test.ts`, and `tests/kill-timings.test.ts`. The source matches each reproduced defect.
- `d68b053e` cites the PID-dependent original trace command, the full ISO requirement of the live timing schema, and the separate ledger's effect on the warning count in the unwritable shared-ledger case. Each test now observes its intended condition.
- `f6db973d` cites Bash's caller trace of the differing exec paths. Excluding that first line preserves the byte comparison for the wrapper's output. F5 covers the separate inherited-option path.
- `80210ebe` cites `28fd9756` for the tool-kill ledger path. The assertions still check the same row content.

## 2026-11-25 check.repair after review 2

Both open findings repeat the earlier round's output contract, so B owns their root repairs. The existing tool-kill and tool-entry proofs remain available and unchanged. Separate red-first regressions will exercise the repeated failures at the same product boundaries.

- **F2.** The first repair made a full pipe retry instead of fail, but left both success and refusal echoes inside capture publication. Searched `checkedRun` callers, owner-lock acquisitions and every `writeSwallowingEpipe` call. Success and refusal are the two locked echo paths. The CLI summary already runs after `checkedRun`.
- **F5.** The first repair restored inherited tracing by adding an argument, and only silenced standard output/error descriptors. Searched both entry forms and all `SHELLOPTS`, `BASH_XTRACEFD` and placement-template references. There is one shared placement template. Only the executable wrapper changes argv, while both entry forms need to account for a separate trace descriptor.


**F2 repaired in `76a9af64`, regression `86489615`.** Both publication paths release the owner lock and capture descriptors before echoing. A slow non-blocking pipe yields while it waits for space. The FIFO reproduction held stderr unread after capture publication. The exclusive pack lock failed with exit 1 on the reviewed code and succeeded on the repair, before the test drained stderr. The writer then delivered the full echo and exited 7. [Red](implementation/check-b-f2-red-1795618701048-1887734.log) [Green](implementation/check-b-f2-green-1795618751798-1909274.log)

**F5 repaired in `42bd2c4a`, regression `98e6c523`.** The shared entry silences tracing before its first command, including on a custom descriptor, and restores the caller's trace stream. The executable restores trace options through the environment and passes Bash the original arguments. The same command with `--noprofile --norc` went from exit 2 with entry traces to exit 7 with byte-identical stdout, stderr and caller trace for both forms. An additional probe verified the default and explicit descriptors 1, 2, 3 and 9. [Red](implementation/check-b-f5-red-1795618698011-1887736.log) [Green](implementation/check-b-f5-green-1795618809275-1927368.log) [Descriptor probe](implementation/check-b-trace-descriptors-1795618869836-1987062.log)

All three planned criterion commands passed on `42bd2c4a`. The unchanged writer and entry tests still pass along with the two new regressions. The branch retains the prior shared base `64681915`. No paid or covered operations ran. [Tool kill](implementation/check-tool-kill-1795618839511-1934062.log) [Tool entry](implementation/check-tool-entry-1795618840224-1934059.log) [Recovered seat](implementation/check-recovered-seat-1795618839345-1934061.log) [Both regressions on final head](implementation/check-b-repeat-regressions-1795618838261-1934060.log)

`akrogon verify` passed on `42bd2c4a10e4b1e6f6849ffc6b1457d5e590fd83`. Leaf receipt `d3289b13-26c7-4a38-9df0-4abc12744127` records format, typecheck and test exit 0. The full suite ran 1,479 passing tests and the changed-file repeat ran another 135. [Format](implementation/check-format-1795618851261-1936896.log) [Typecheck](implementation/check-typecheck-1795618854058-1936896.log) [Tests](implementation/check-test-1795619008541-1936896.log)

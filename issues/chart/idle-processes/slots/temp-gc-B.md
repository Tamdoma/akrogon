# Temp lifecycle, slot B

Read-only investigation, 2026-10-14. `FW` below is `/home/ivan/Work/infra/tamdoma/framework`; `RU` is `/home/ivan/.akrogon/worktrees/akrogon/run-units`. No other slot's temp-gc answer was read.

## Findings

**F1. The history supports multiple failures, not a proven “disk makes Chrome hang” rule.** `git show 5b2f4d0 --format=fuller` dates the RAM move to October 2, 16:56 local. Its message asserts random Chromium hangs on `/var/tmp` and separately reports a 657k-file compile cache. The October 1 chart chose disk plus a seven-day sweep (`issues/chart/test-time-and-temp/forks/leaf-temp.md`, Taken). `git log -1 --format='%h %aI %s' 3ae682f` dates home scratch to October 10, 23:29; `git show 2c3a0af` explicitly attributes the October 11 move to Chrome's socket path length.

Searching framework issue Markdown/logs and learnings for `657k`, `657,000`, and `/var/tmp` near `hang` found no corroborating comparison. That search is not proof none exists. The hang claim is **unverified causation**, not disproven. There is independent evidence of earlier temp exhaustion: `FW/learnings/history/2026-09-30-git-fixture-temp-parent.md:5–12` records `/tmp` with only 77 free inodes and passing checks after moving scratch outside Git repositories. It does not establish that disk exhaustion caused the October 2 reversal.

**F2. The current collector cannot provide the requested lifecycle.** `~/.local/bin/tmp-sweep:7–10` skips an entire tree containing any socket and otherwise uses newest mtime. Lines 15 and 22 exclude `/tmp/akr-<uid>` and cover only `/var/tmp/akrogon-<uid>`, respectively, not A's `/var/tmp/akr-<uid>`. The timer is active (`systemctl --user is-active tmp-sweep.timer` → `active`) and configured hourly at minute 15. A forgotten socket can protect dead files indefinitely; an old quiet tree without sockets can still be live. Faster age scans do not fix that distinction.

## Design choices

| Ref | Option | Present/future risk | Decision |
|---|---|---|---|
| O1 | tmpfs plus aggressive expiry | Large live builds still occupy RAM; expiry can delete active files. | Reject for bulk test scratch. |
| O2 | Disk plus faster age sweep | Moves pressure to disk and guesses lifetime from timestamps. | Reject as the primary lifecycle. |
| O3 | Short disk directories owned by runs, immediate cleanup plus orphan collection | Requires complete ownership of output capture and child processes; a missed producer escapes collection. | Recommend. |
| O4 | A private `/tmp` namespace per systemd service | Can contain hard-coded paths, but changes cross-process sharing and launch architecture; ordinary PrivateTmp does not itself move `/tmp` off tmpfs. | Do not add this as the first fix. |

**D1. Keep a short disk root outside Git, with a unique directory per run.** `/var/tmp/akr-<uid>` is on root btrfs here (`findmnt -T /var/tmp` → `/dev/mapper/root[/@]`), not tmpfs. Retain private-directory validation. Do not restore long home/worktree paths or make a fresh deep temp hierarchy at every nesting level. Chromium's actual limit applies to the final socket path, not just leafTemp. The [Chromium implementation](https://chromium.googlesource.com/chromium/src/+/HEAD/chrome/browser/process_singleton_posix.cc), checked October 14, rejects a path that cannot fit `sun_path`; it does not establish disk-backed temp as unsupported.

**D2. Ownership is the normal cleanup mechanism; a frequent collector covers crashes.** Every test command owns a run directory. Put the wrapper's `akrogon-io-*` capture inside that ownership boundary too: today `src/shell.ts:34` uses the wrapper's TMPDIR, while `src/run-check.ts:51` changes only the child's TMPDIR. Preserve logs in the issue before removing scratch. Test teardown releases case directories during long suites; run teardown removes anything left after all descendants stop. Seat scratch has its own longer lifetime and must not be swept when an unrelated check ends.

Use the run-unit identity already being added, including boot ID and process start identity. A root remains live through launch, execution, descendant teardown and evidence capture. A dead wrapper alone is insufficient: stop its recorded unit and confirm no descendants before reclaiming. `RU/src/run-check.ts:197–229` supplies normal stop-before-root-removal ordering, but `RU/src/admission.ts:99–112` currently removes stale records before stopping units and does not remove scratch. Extend this lifecycle rather than inventing an unrelated process scanner. Keep the ownership record until cleanup succeeds so failure remains retryable.

**D3. Run the same orphan cleanup on completion, startup and a one-minute user timer.** This is an orphan-recovery interval, not a runtime limit. It should inspect owned roots/records, not recursively sort every file's timestamp. Coordinate creation, retirement and collection so a collector cannot delete a newly starting run. Hold a directory lock for the whole protected lifetime, including evidence capture, and require the collector to acquire it before claiming a dead root. Coordinate with existing external sweepers rather than leaving two conflicting deletion policies. Unknown legacy roots are reported for one-time owner resolution, not deleted because they lack the new metadata. Never infer death from CPU idleness, age or a missing tab.

The [systemd temporary-directory guidance](https://systemd.io/TEMPORARY_DIRECTORIES/), checked October 14, recommends `/var/tmp` for large temporary data and describes directory flock protection from tmpfiles aging. It also documents PrivateTmp's service-lifetime cleanup and changed sharing semantics. A wrapper-only lock is insufficient if its children survive it: the run supervisor must retain protection through teardown, or the collector must establish unit quiescence before deletion. No cap or pattern kill is required.

## Framework producers

**D4. Fix allocation and cleanup at each source, preserving fixture isolation.**

| Ref | Producer | Required correction |
|---|---|---|
| P1 | `csp-spine-*`, copied repositories and build trees | Allocate under run TMPDIR and remove each case's tree after its child exits. Several finally blocks already exist (`FW/.claude/hooks/tests/csp-spine.test.ts:595–647`; `capture-failure-mode.test.ts:170,276,308`), so trace killed/partial-setup paths instead of assuming teardown is absent. Reduce copied inputs only where the test does not exercise them. Do not share mutable Git/build fixtures across cases. |
| P2 | Repeated bunx/workerd installations | Reuse the pinned locally installed tool through project setup instead of resolving/installing it in every disposable tree. `FW/.claude/hooks/tests/fixtures/csp-spine/scripts/live-worker-proof.ts:42,234–235` invokes pinned Wrangler via bunx. [Bun's bunx docs](https://bun.sh/docs/pm/bunx), checked October 14, say local packages are preferred and downloads cached. Per-run duplication therefore needs tracing through isolated HOME/cache/TMPDIR, not a claim that bunx inherently downloads every time. Preserve intentional private-HOME tests (`capture-failure-mode.test.ts:166–188`). |
| P3 | `/tmp/swi`, page-measure fallback and loose logs | Replace fixed parents with the owned run root and solve the socket-length budget there (`FW/.claude/hooks/tests/scratch-writer-isolation.test.ts:71–78`; `page-measure.mjs:359–395`). Persist wanted logs as evidence. `/tmp/ftf-logs` is supplied by the brief; its producer was not located in the inspected `.claude` sources, so ownership there remains unverified. |

## A's patch and proof

**D5. Keep removal of the dispatch wipe. Treat the disk move as one part of the lifecycle fix.** The reviewed deletion prevents lost captured output; reintroducing a wipe would restore F1 (`slots/fix-temp-review-B.md`). Before releasing the disk default, replay the previously hanging real capture path on short disk and tmpfs roots with the same browser, fixtures, concurrency and fresh/warm cache conditions. Record timeouts, stderr, elapsed time and I/O. Include the longest supported socket path. No controlled proof of disk causation was found, so neither indefinite rejection of disk nor an assertion that hangs are solved is justified. Drain old seats/runs before removing legacy scratch; changing the default does not rewrite their environment.

**P4. Done means demonstrated reclamation and preservation.** Normal success and failure, setup failure, timeout, wrapper SIGTERM/SIGKILL and reboot recovery must remove owned descendants and scratch after evidence handling. Concurrent sibling runs, an old quiet live run, redispatch, and collection racing startup must preserve live files. Repeated representative framework runs must return scratch bytes and inode counts to baseline after cleanup, including fixed-path producers. Inject cleanup failure: report it and retry without losing the owner record. Do not promise “never piles up” for unlimited live writers; prove prompt reclamation of completed work and elimination of repeated unnecessary allocation.

**Single recommendation:** short disk-backed, per-run scratch with complete process-and-file ownership, immediate cleanup after descendants stop, and a one-minute ownership-aware orphan sweep using that same lifecycle. Fix escaping framework producers. Do not use age, RAM placement or admission caps as substitutes for ownership.

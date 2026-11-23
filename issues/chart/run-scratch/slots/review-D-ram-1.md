# Slot D review of run-ram

**Verdict `fix`**

Base `c689573b23b0adfd543783719673ab32c5c11424`  
Head `20dd30b3251b9e646b0ee0ef8a4082c3b40b442d`

## Findings

- **F4 · `src/config.ts:54`.** A symlinked ancestor still bypasses the retired-root exclusion. I configured `<alias>/ram` with `<alias>` pointing to a private retired temp root, then paused a real check after it wrote and closed a scratch file. Host reconcile kept it during the 60-second owner-record grace period. After that, reconcile deleted the live scratch tree and the resumed check exited `1`. The disk record survived. Check canonical containment under both excluded roots before creating or changing the mode of `run_root`, including when the final component is missing.
- **F6 · `src/scope.ts:82`.** The guard can leave scratch behind after a successful check. A real check created `$TMPDIR/ro/x`, changed `ro` to `0600`, and exited `0`. The CLI returned `0` and the tree remained. The cleanup grants write permission but leaves `ro` without search permission. The same recursive chmod also changes file modes outside scratch when files have hard links there. I confirmed that an owned `0444` file on the same filesystem became `0644` after its scratch link was cleaned up. Restore read, write and search permission on directories only before removal.
- **F7 · `src/run-check.ts:438`.** Reconstructing the entire environment for RAM scratch can overwrite capture ancestry. With the accepted `pass_env: [AKROGON_CAPTURES]` and an inherited value of `[]`, a real check saw one capture entry with disk scratch and zero with RAM scratch. `packFolder` uses this entry to refuse a same-owner pack before waiting on the lock already held by the check. Update only `TMPDIR` and `BUN_RUNTIME_TRANSPILER_CACHE_PATH` when selecting RAM scratch.

## Re-check and verification

- F1 is closed by keeping the live `.owner` and evidence below leaf temp. F2 and F3 are closed because the flat-root reader and sweep are gone. For F5, I removed `run_root` while a check was running and sent `SIGKILL` to its wrapper. The registered guard still removed the original folder. A failure before guard registration can strand the known empty folder.
- All 228 tests passed across `run-units`, `config`, `reconcile`, `run-check` and `verify` with `--timeout=120000 --max-concurrency=5`. Typecheck and `git diff --check` passed. Additional real-unit probes showed that cancelling a waiting full check allocated no RAM folder, stopping an isolated leaf slice removed its scratch, and a command that hit `ENOSPC` on `/dev/full` returned red and left the RAM root empty.
- The allowed path characters and generated suffix are safe in the systemd command properties. systemd accounts for `ExecStopPost` in the scope's stop ordering. An orderly stop runs the hook, and `daemon-reexec` preserves manager state. I reviewed those lifecycle paths from the docs. A manager crash can strand scratch because cleanup depends on the transient unit. The shared user manager was left running. [systemd.service](https://www.freedesktop.org/software/systemd/man/262/systemd.service.html#ExecStopPost=) · [systemctl](https://www.freedesktop.org/software/systemd/man/262/systemctl.html#daemon-reexec)
- A tmpfs-backed root uses memory and can use swap. The `/dev/full` probe exercised error propagation and cleanup without filling the shared mount. Evidence stays on disk. [Kernel tmpfs documentation](https://www.kernel.org/doc/html/latest/filesystems/tmpfs.html)
- I reproduced the existing disk-only `0555` cleanup error. Fix it separately. It occurs in the wrapper's existing disk removal path, while F6 affects the new RAM guard.

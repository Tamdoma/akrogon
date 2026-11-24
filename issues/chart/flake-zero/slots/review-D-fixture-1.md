# Slot D fixture-zombie review, round 1

Verdict **fix** for `ef259761` on `abdb3cee`.

- **F1. The abandoned sweep can still delete a runtime while a daemon thread lives.** If the leader becomes a zombie before discovery records it, `daemons()` skips it and `stopDaemon()` returns without reaching the new thread check. The sweep then removes the runtime. Normal killed-core tests use `discard()`, but a worker that dies during teardown can leave this state for the startup sweep. I reproduced both orderings with a private abandoned runtime and a threaded Unix socket stand-in. When the leader became a zombie after discovery, the sweep timed out and preserved the runtime. When the leader was already a zombie at discovery, the sweep returned successfully, removed the runtime, and left the worker thread alive. Cover the dying-before-discovery case before removing abandoned state. See `tests/hc-fixture.ts:45–54,119–164`.

The per-thread check worked on this host. I verified that `/proc/<pid>/task` still listed a sleeping worker alongside its zombie leader while that worker replied on the socket. The Linux manual documents limits on this directory after leader exit. [Linux proc_pid_task(5)](https://www.man7.org/linux/man-pages/man5/proc_pid_task.5.html)

All 14 session-routing tests passed with SIGKILL delayed 1.5 seconds. All 41 focused tests, typecheck, and diff check passed without injection. I relied on the supplied full verify, stress, and guard results.

# Slot D reconcile-914 review, round 1

**Verdict: ready** for `cb8659fa` on `bdc34423`.

Linux 7.2.15 returns `ESRCH` when procfs path traversal can no longer find the task behind the PID inode. Permission denials have separate return paths. I held a directory handle to a child’s `/proc/<pid>` and read `fd`, `fd/0`, and `cwd` through it. All three worked before the child exited and returned `ESRCH` after it was reaped. The earlier `pidAlive` check cannot keep a task alive through those reads. [Linux 7.2.15 procfs permission code](https://github.com/gregkh/linux/blob/v7.2.15/fs/proc/base.c#L702-L727)

`readProc` is confined to per-PID reads. The change skips the failed read and continues scanning, while unrelated I/O errors still propagate. Four focused reconcile tests passed, including the fd churn case and the checks that keep scratch with a live owner. The kernel probe reproduced the errno. The rare CLI failure did not occur in this run, and I did not rerun full verify or the guards.

# Slot D status-flake round 2

Verdict **ready** for `3574ca33` on `1f563e7d`. Reviewed `git diff 99a9fb87 3574ca33` and `git show 3574ca33`.

**F1 closed.** I replayed the linked-worktree fetch through `run-check` and from a real hc fixture seat. Both had `GIT_TEMPLATE_DIR` unset and started zero auto-maintenance workers. A transient user service read the persisted `maintenance.auto=false` as well. The Git init and clone call sites I found run in test processes under the preload. The seat and service paths operate on existing repositories or linked worktrees.

On Git 2.56.1, normal init, bare init, ordinary clone, bare clone and linked worktree all read the local setting after dropping the template variable. An explicit `--template` selects its own directory. A clone pointed at the suite template got the setting, and one pointed at an empty template omitted it. I found no explicit template override in the suite. [Git init template precedence](https://git-scm.com/docs/git-init#_template_directory) · [Git clone options](https://git-scm.com/docs/git-clone)

The suite template preserves the `hooks` and `info` directories. The tests that use them create their own exclude file, pre-push hook or pre-receive hook, and all three passed. I found no tests that read the sample hooks or description. Typecheck, diff check and 93 focused status, preflight and install tests passed. The supplied verify log records 1,428 passes. I did not rerun the reported 84-run stress check.

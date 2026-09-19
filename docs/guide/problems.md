# Problems

Start by reading the leaf's state and recent history:

```sh
cd ~/Work/widgets
akrogon status export-csv
```

**Nothing starts.**

Check the repo registration, the leaf's phase, dependencies and the global capacity limit. Confirm the leaf is not parked or marked hand_built.

Dispatch also needs the repository's Herdr workspace. Its name must match the registered repository key, such as widgets.

**The leaf is failed.**

Read the recorded reason. A human-only blocker needs the stated action. A delivery failure needs a usable seat. Repairing either cause does not change the phase automatically.

After resolving it, resume at the right active phase:

```sh
akrogon phase export-csv implement
akrogon next export-csv
```

**A seat looks idle but receives no prompt.**

The harness may report blocked or unknown, or a recently sent prompt may still be within its grace period. Inspect the actual seat before assuming it is safe to resend work.

Do not clear prompt or attempt fields by hand to force delivery.

**A phase move is refused.**

Read the error. Common causes include a dirty worktree, issue files committed on the leaf branch, an empty implementation branch or an invalid transition.

Fix the condition named by the command. Do not bypass it by changing the state file.

**The merge cannot push.**

A competing merge requires another fetch, rebase and check pass. An authentication or network error needs its own fix. A force push is not a recovery step.

**A completed worktree is still present.**

Run a repository sweep:

```sh
akrogon next
```

Cleanup belongs to manual sweeps and startup. A tab left behind by an interrupted merge can also be handled there.

**Sync refuses to run.**

Use the registered main checkout on its configured default branch. Check for staged files outside eligible issue records:

```sh
git status --short
git diff --cached --name-only
```

Decide what to do with those changes before retrying. Do not switch to gacp without checking what its broader commit would include.

## Failure is a recorded stop, not discarded work

A failed leaf keeps its plan, reviews, code and cause available for inspection. That lets you recover at the step that still needs work.

Use this order:

1. Read the failure and referenced artifact.
2. Confirm what happened in the worktree or seat.
3. Resolve the cause.
4. Choose an active phase.
5. Dispatch again.

For CSV export, missing permission may need an operator action. Broken quoting needs code repair. A failed prompt needs delivery diagnosis. Repeating the same recovery without new evidence does not resolve any of those causes.

Execution skills record human-only blockers and end the pass. They do not keep a conversation open waiting for an answer.

Previous: [Limits](limits.md) · Next: [Learn](learn.md) · [Home](../../README.md)

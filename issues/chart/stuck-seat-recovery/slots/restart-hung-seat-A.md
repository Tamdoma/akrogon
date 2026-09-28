# Restart hung seat: A

Read 2026-09-28. pi-extensions at b184ec1.

## Findings

- #35 hang: `tamdoma-subagents/tools.ts:98` calls `ctx.ui.confirm("Allow subagent outside parent root?", ...)` with no options. pi's `ExtensionUIDialogOptions` takes `signal` ("AbortSignal to programmatically dismiss the dialog") and `timeout` (`node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/types.d.ts:36-41`). So the tool's abort signal never reaches the dialog, and esc cannot end it. The report saw one confirm for several parallel spawns, so the other confirms were waiting unseen, which herdr reads as working, not blocked.
- Same class as #32: tamdoma-subagents waits on, or signals for, a human inside a seat that no human attends. #32 holds herdr blocked for an admission fault. #35 waits on a confirm dialog.
- `pi -a` means "trust project-local files", not auto-approve (`pi --help`). A seat has no unattended mode that skips this dialog.

## Options

- A (recommended) Fix the source in tamdoma-subagents: no human wait in a seat. Pass the tool signal to the confirm, and approve or refuse outside-root cwds by rule instead of a dialog when the path is inside the same repository's worktree family. Together with fault-status A, this removes both reported hangs. The watcher keeps notify-only.
- B Add an akrogon restart verb that the watcher may call with evidence. It catches unknown future hangs, but "proven stuck" needs elapsed time, which the seat-stall-detection rule forbids, and a relaunch loses the harness session mid-phase.

Pitfall: A does not cover hangs from other causes. If the operator wants to be fully absent, B's rule change is a separate decision, not a fix for these two bugs.

## Sources

- better-than-training · tools.ts:98, pi extension types.d.ts:36-41, `pi --help`, read 2026-09-28.
- Not searched yet: practitioner sources on process supervision (left to B and C).

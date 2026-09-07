# Ambient skills overrode the dispatched task

What failed: A worker stopped after trying `lifecycle.ts pass-context`, although its dispatch supplied the task, read paths, receipt, heartbeat, and required proof. Increasing the silence timeout could only delay detection of that stopped turn.

Root cause: The seat inherited auto-discovered issue skills for another repository. Those skills required a bootstrap command deliberately removed from akrogon and framework by `2a69b88c`. The reconciler never invoked those skills. A copied runtime configuration introduced a second workflow whose prerequisites and tools did not match the dispatched contract. The inherited check-issue skill also requires subagent tools excluded from these seats.

Fix: `1b83aa8b` disables Pi skill discovery with `--no-skills` in seat launch arguments, independently of extensions used for status reporting, and removes the stale source reference to the deleted command. Shared skills and both lifecycle CLIs remain unchanged. This launch change applies to new seats. Equivalent ambient-skill exposure in Claude and Codex has not been verified or fixed by the Pi flag.

Lesson: A worker's effective instructions include discovered runtime resources, not just its submitted prompt. Planning must identify which instruction sources belong to the workflow. Review and live verification must check the launched worker's available commands and tools against those instructions. Disable unrelated instruction discovery at the runtime boundary rather than restore foreign prerequisites or duplicate their workflow. A longer heartbeat window accommodates slow work but provides no evidence that an ended turn is still progressing.

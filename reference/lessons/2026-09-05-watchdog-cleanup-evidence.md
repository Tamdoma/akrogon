# Pane cleanup needs positive evidence of an idle shell

What failed: Failed launches left twelve idle panes across the two build tabs. A first watchdog draft could also exit if a shell disappeared during inspection.

Root cause: Failed startup lacked cleanup. Foreground process information alone does not rule out background jobs, and pane metadata can change between inspection and cleanup.

Fix: dd5c94be added the watchdog. 9d8cbbef protects registered agents and handles vanished process paths. Cleanup preserves roots and labels, rechecks metadata, and requires an idle shell with no children.

Lesson: Define cleanup eligibility and protected resources during issue creation. Review destructive actions separately from detection. Test missing evidence, concurrent exit, labels, and registered agents before live cleanup.

Startup race: The watchdog could clean a tab whose reconciler pane had not yet appeared, mistaking a starting lane for a stopped one. da4f9d0f gates cleanup on the labeled reconciler pane being a proven idle bare shell; a tab with no reconciler-labeled pane never auto-cleans. Fail closed when the lane's own state is unproven.

Recovery proof: A relaunched lane is not recovered because its command was submitted. The 931s framework outage was declared over only when the heartbeat file advanced under the new process. Submission is an attempt; the advancing heartbeat is the proof. Verify recovery by the resource the machinery itself maintains, not by the action taken to trigger it.

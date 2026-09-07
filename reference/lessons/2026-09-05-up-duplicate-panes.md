# Restarting a lane created a second reconciler pane

What failed: Restarting both lanes with `up` grew each build tab to four panes, including two labeled reconciler panes.

Root cause: `up` always split a pane. It did not look for the existing labeled reconciler.

Fix: b6d26a57 reuses an idle labeled pane and refuses busy panes or duplicate labels. The two existing stopped panes were moved intact to `stopped-reconcilers`.

Lesson: Chart and create-issue decisions about process ownership must include repeated startup, restart, and shutdown behavior. Test a second invocation against existing resources, including busy ones. Cleanup must preserve the operator's protected resources.

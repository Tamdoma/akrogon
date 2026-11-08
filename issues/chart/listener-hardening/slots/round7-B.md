## 1. Writer of the t6x flips

**Disagree with C's attribution to automatic desktop-focus reversion. Agree with D's normal writer path, but individual flips remain unattributed.**

Additional installed-binary evidence separates the mechanisms:

- `FollowWindow` calls `windowServes` at `0x6002ed` and stores its result in `followSelection` at `0x600342`.
- `windowServes` (`0x60efc0`) returns false for a nonempty explicit session (`0x60efce–0x60efd6`, false return at `0x60f02c`). The actual command supplies `--session infra`.
- `followSelection.selected` checks that flag at `0x60d3fa`. When false, it skips `windowLayout` and goes straight to `readSelection` at `0x60d446`. This routine has no `writeSelection` call.

Thus this named-session follower does not periodically read desktop focus and write t6x back. The binary's remaining writers are the workspace-focus path and the previously identified repair paths. The static call graph supports D's explanation. It does not identify the author of a particular version: the captured document events contain no author, and daemon logs omit focus requests. Both terminals being live at sampled times does not exclude a transient layout-repair branch. Timing alone cannot establish that the phone sent no request.

**Cheapest operator test:** choose t15 once, then force-stop Moshi on the phone for three minutes while leaving desktop focus unchanged and having no other active Moshi clients. Keep the existing host selection capture running. A delayed t6x write while the phone is stopped points to host/other-client activity. If it stays t15, reopen Moshi without tapping a tab and observe whether the t6x write returns. This distinguishes an app-resume reassertion from autonomous host activity without changing the host software. No such test was performed in this read-only round.

## 2. Fix choice and costs

**No listed option is a proven complete fix for both terminal switching and Chat View readiness. O1 is the correct repair route.**

- **O1:** Send the proof upstream to Moshi's hc integration owner. This preserves the operator's phone tab/sidebar/Chat View workflow. Reporting alone does not repair the deployed behavior. The implementation must reconcile the selected terminal and conversation/subscription identity coherently.
- **O2:** `HC_SESSION=infra exec hc` is a valid native picker entry point. `hc --help` explicitly says “pick a terminal and attach”; `hc attach --help` confirms Ctrl+Backslash detaches. It removes the `moshi-hook hc attach` follower from the terminal path. Disagree with C's assurance that the gateway sidebar still works unchanged: there is no demonstrated native-picker-session-to-pane binding test, and the picker is not proven to spawn the same identifiable `herdr-core attach <t>` child. Phone Chat View tab taps would no longer steer this terminal viewer. Use only as an explicitly accepted terminal-only workaround, not an equivalent migration fix.
- **O3:** Closing a stale mosh session removes an extra follower. Pinning Mosh selects the carrier already observed. Neither removes the selection mechanism in the remaining follower. There is no evidence that pinning Mosh suppresses all required SSH preflight/context queries.
- **O4:** No supported per-view/no-follow flag was found. `moshi-hook hc attach --help` exposes only `--session`; inspected config keys are `gateway.always_on_discovery`, `suppress_nested_agent_push`, `usage_collection`, and `auto_update`. Removing `--session` changes the window-follow eligibility, but preserving the intended infra core and full phone workflow that way is unverified.

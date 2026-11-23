# Slot D review of lane-first, round 15

**Verdict `ready`** for `9196a585`, rebased as `079d4447` on `ddff2ddc`.

- **F25 closed.** Both real scope launches succeeded. The payload saw the forwarded blank runtime or the original omission as appropriate, and its bus stayed cut. Restoring the former launcher reproduced the blank-runtime connection failure. Removing the inner `env -u` made the omitted-runtime case inherit the manager's path.
- **F26 closed.** I gated the real guard client before registration. The held writer stayed alive and the test waited for the real scope before queuing or killing a run. I also froze the guard through the held writer's exit. The queued record was already gone, and a wake kept attempts at A=0 while the guard held. After thaw and drain, the final wake counted and redelivered once.

All 24 supplied delivery stress runs passed the F26 test. One run failed the unchanged silent-stop test at its attempt assertion (`hd-1-3.log`). The local merge tree matched the rebased head. Typecheck, `git diff --check`, and 180 focused tests across eight files passed. The supplied Verify log `direct/check-test-1795456289272-34744.log` reports 1,416 suite passes and 830 repeat passes.

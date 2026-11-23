# Slot D review of test-hygiene

**Verdict `fix`**

Base `814a2387`  
Head `047fd3fbb1cb0c7ce2eca0945c1ca5c4bebb197d`

## Findings

- **F1 · `tests/e2e/watch-live.e2e.ts:865`.** Criterion 4 can pass without holding a check across a tick boundary. In a disposable copy I removed only the sleep from the status shim, keeping its flag consumption. Due 2 ran without the hold, due 3 sent on schedule, and every hold assertion passed. The same gap is present in the stand-in shell and both paid blocks. Verify that due 2's status call consumed the hold in its own turn and stayed busy across a boundary, then check the send and its turn as the branch does now.
- **F2 · `tests/e2e/watch-live.e2e.ts:825` and `:879`.** The pause proof can reuse an unpaused tick under scheduling delay. I waited for the next due to log its `next` call before issuing `pause`. The root test selected that same due and its already logged status call as the paused check. No newer due was sent before `unpause`, and the full cell passed. Both pause blocks search from `held.due`, which predates the pause. Observe a tick whose status sees the paused state and wait for its turn to finish before asserting zero `next` calls for that turn. The root resume proof should likewise tie `next` to a fresh post-unpause tick.

## Verification

- The free stand-in root and shell cells both passed on the branch. Both screens showed due 2 held and due 4 sent. The deliberate probe confirmed F1 and F2 in a real stand-in root cell. The paid blocks were reviewed by reading.
- All 27 `run-units` tests passed with `--timeout=120000 --max-concurrency=5`. A real systemd probe confirmed that hand and holder runs put the test slice directly under `akrogon.slice`, and leaf and nested runs put it directly under the leaf slice. Each child slice unloaded after the test. Stopping an isolated leaf parent also drained and unloaded its active test child, and the legacy slice list stayed unchanged.
- Typecheck and `git diff --check` passed. Only disposable worktrees and private Herdr sessions were used for the probes.

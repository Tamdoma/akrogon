# Direct review, slot E acting as B

Verdict: `ready`

- Base `9a7cf4166ad1ba094f5aef9d16817f26c5181f87`
- Reviewed head `4325f9ce566c5d8588f84b7a214422e1dffe62a0`

No Fixes or Nits. The `sh` hop exports its PID inside the existing delegated scope and passes the harness arguments through `exec`. The shared Bash entry skips that PID and continues to place shells with a different or unset marker. The strict scope check stays in place, Agy retains its PATH prefix, and the detached helper drops the new marker. `src/AREA.md` describes the new wiring and its source paths resolve. The documented CLI behavior still applies.

## Verification

- Read back [`check-red-on-base-1795623700451-3837015.log`](../direct/check-red-on-base-1795623700451-3837015.log). The real-scope launcher moved into `tools/t-*`, the per-kind argv test found the hop missing, and the real-core Codex launcher stand-in reproduced `seat outside its leaf scope`.
- Read back [`check-targeted-1795623894086-3863118.log`](../direct/check-targeted-1795623894086-3863118.log). Typecheck and all 18 targeted cases passed, including the forked Bash child placement and all three marker states.
- Matched verify receipt `c27ec3df-cd27-4d23-8055-160c435ebc49` to the reviewed commit and tree. Format and typecheck passed. The [test log](../direct/check-test-1795624031428-3867362.log) recorded 1,496 passing tests across 99 files and 20 passing cases over five reruns of `tests/tool-entry.test.ts`. `git diff --check` passed.

## Test-Change trailers

- `27bdd983` adds the launcher, marker, and argv cases from the taken fork. It preserves existing expectations and uses the same-PID launch shape recorded in intake.
- `26b5ad9b` filters the new test's `tools/` listing to `t-*`. The [first targeted log](../direct/check-targeted-1795623872019-3858060.log) shows cgroup control files in the directory, and the assertion still rejects any tool cgroup created by the stand-in launcher. The pinned verify run includes this test revision.

The test runs use a Bash launcher stand-in. Live interactive Codex confirmation remains with the chart's post-install restart.

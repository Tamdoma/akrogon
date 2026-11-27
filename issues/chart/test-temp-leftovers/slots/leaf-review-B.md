# Leaf review B: test-temp-leftovers

## Part 1: final-shape check (forks/nested-temp-root.md `## Taken`)

None. The narrowing discharges my rebuttal D1 honestly: the outcome the leaf must prove is now only the temp-root clause, the store clause carries its non-reproduction evidence and a concrete reopen trigger in the chart's Off route (CHART.md `## Off route` matches). The Taken picks do not conflict with any signpost lock: no record-kind additions (3a of signposts untouched), no migration (reserved-name list in `repoSchema` unchanged, so existing `env`/`pass_env` entries keep parsing), one leaf. The binding decision not to add the two names to the reserved constructed-env list is correct: adding them there would make the seven existing fixture configs unparseable, violating signpost 6a — the picks avoid that.

One verification note, not a defect: the merged finding that `tests/isolation.test.ts` already asserts `worktreeStore(repo)` resolves under the suite root is accurate (I read it), which is why I accept 2a's rejection of a store-side test as non-defective rather than merely tolerated.

## Part 2: implementer review of the leaf drafts

None. Checked as the implementer:

- Criterion 1 is buildable and deterministic in both directions. On base, `checkedRun` calls `ensureLeafTemp` unconditionally (`src/run-check.ts:339-340`), so the inner run always creates the default-root `<h4>/<h8>` — the red state cannot flake. After the fix, both leaf dirs persist empty post-run (only `run-*` is removed), so the test can assert the fixture-root pair exists and the default-root pair does not, after the run completes; no mid-run watching needed. Hash inputs are computable in-test since `readRepo` canonicalizes `repo.root` (`src/config.ts` `readRepo` uses `realpathSync`). The fake-systemd-run seam preserves env exactly as the real scope does (exec in place), so the test needs no real units.
- Criterion 2 is provable as written: the fix copies caller values before the `env`/`pass_env` loop re-copies the same caller values, so declared configs receive the caller's value by construction, and the existing declaring tests (`run-check builds an allowlisted env…` family in `tests/run-check.test.ts`) exercise parse-plus-run through the `test` check.
- Brief facts verified against code: `passForwarded` in `src/verify.ts` and `launchLand` in `src/land.ts` do forward both names; `copied` in `src/run-check.ts` does not; verify pass commands run through `checkedRun` (`src/verify.ts` `runOnce` calls `checkedRun` per command); `reconcileHost` keeps unregistered hash dirs by design.
- The exact-allowlist test (`tests/run-check.test.ts` "run-check builds an allowlisted env") is the only expectation needing the two names added — I found no other test asserting the constructed env name set.
- `readiness.yaml`/`state.yaml` shapes are consistent with a pre-dispatch leaf; binding decisions have their home in design.md verbatim.

No free observations needed beyond re-reading; nothing run.

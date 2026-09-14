The design claims the existing CLI fixtures satisfy the standing end-to-end verification requirement, but they leave no artifact. `tests/helpers.ts:31` recursively deletes each fixture directory through `f.clean()`, and the phase tests call that cleanup in `finally`. `cli()` returns captured output in memory (`tests/helpers.ts:49–56`). Neither contract specifies a verification command that preserves evidence or an artifact path to record.

Add an explicit command that runs the CLI integration tests, preserves their output outside the temporary fixtures, and retains the test exit status. For example:

```sh
bash -o pipefail -c 'bun test tests/phase.test.ts 2>&1 | tee /tmp/akrogon-audit-fixes-phase.log'
```

Require the implementation report to record that artifact path. This fulfils the standing design line already included in the contract without changing test cleanup or adding repository files.

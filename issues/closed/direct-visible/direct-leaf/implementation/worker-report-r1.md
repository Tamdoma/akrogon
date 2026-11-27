# R1 worker report

Product commit: `9c6cede459a361ab7cb76e6b915d0e4894aa54ee`, one commit on `a7127a22559407dda29958e65b6266df9d5936e1`. No test files or issue state changed.

## Changed files and reasons

- `src/direct.ts`: F1 checks the four draft files at the documented paths and rejects owner and slug collisions. F3 checks phase under the global state lock, refuses an enclosing capture, stops runs before waiting for capture writers, then removes the worktree and branch and moves the owner to `<chart>/direct/<owner>` under the exclusive owner lock. Abandoned capture files move intact. F8 re-resolves the leaf under the global state lock after probing the reviewer.
- `src/state.ts`: Keeps draft and rerun resolution at depth two, reuses the full-depth state-holder scan for slug collisions, and rechecks the direct marker on the fresh raw state used for the seat rewrite.
- `src/AREA.md`, `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `docs/reference/commands.md`, and `docs/use/quick-fix.md`: Match the draft layout, drop destination, and refusal rules.

## Tests run

- `bun install --frozen-lockfile --backend=copyfile`: passed before edits.
- `akrogon run-check --name r1-create -- bun test tests/direct-create.test.ts --timeout=120000`: 13 passed, 1 failed. The concurrent rerun regression passed.
  ```text
  check r1-create: 1 /home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/implementation/check-r1-create-1795642230874-2025246.log
  ```
- `akrogon run-check --name r1-drop -- bun test tests/direct-drop.test.ts --timeout=120000`: 6 passed.
  ```text
  check r1-drop: 0 /home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/implementation/check-r1-drop-1795642230478-2025250.log
  ```
- `bun run typecheck`, `bunx prettier --check src/direct.ts src/state.ts`, and `git diff --check`: passed.
- `akrogon run-check --name r1-docs -- bun test tests/command-reference.test.ts tests/docs-links.test.ts --timeout=120000`: 17 passed.
  ```text
  check r1-docs: 0 /home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/implementation/check-r1-docs-1795642168390-1978616.log
  ```
- Inline CLI smoke checks through `akrogon run-check` used disposable fixtures. `r1-smoke` reproduced the readiness error, confirmed status with valid readiness, and verified the phase re-read and owner-lock wait. `r1-refusals` verified each missing draft file and a nested closed leaf collision, with no state, worktree, or branch written.
  ```text
  check r1-smoke: 0 /home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/implementation/check-r1-smoke-1795642169491-1978613.log
  check r1-refusals: 0 /home/ivan/Work/infra/akrogon/issues/open/direct-visible/direct-leaf/implementation/check-r1-refusals-1795642268403-2084132.log
  ```

## Known limitations

`tests/direct-create.test.ts:176` fails after creation succeeds: `Expected: 0`, `Received: 1` from `akrogon status --json`. The fixture writes `{}` for `readiness.yaml`. Status JSON reports `Invalid input: expected array, received undefined` for each of `inputs`, `produces`, `grants`, `retained`, and `proofs`. With those five keys set to empty arrays, the CLI smoke check returned 0 and showed the leaf in `implement`. A owns the fixture correction.

## Unverified criteria

Criterion 5 is not fully green in the committed test suite until A corrects the readiness fixture. CLI smoke evidence covers the blocked status assertion with the documented draft.

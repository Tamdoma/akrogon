# Implementation report: repo-cap

Commit fc1a64b on branch repo-cap.

## Changed files and reasons

- `src/config.ts`: `repoSchema` accepts optional positive-integer `max_active`; `effectiveConfig` emits it as `repo_max_active` only when set so the global `max_active` line stays visible (D1, D4).
- `src/next.ts`: `activeCount` returns `{ total, perRepo }` from the single existing inventory pass; `allocate` refuses a new tab when the total reaches the global cap or the leaf's repo count reaches its cap, only when no matching tab exists (D2, D3).
- `tests/config.test.ts`: `repo_max_active` printed when set, omitted when unset, global `max_active` still printed; repo `max_active` rejects 0, -1 and 1.5.
- `tests/next.test.ts`: repo share under global ceiling, global precedence over a larger repo cap, existing-tab bypass, unreadable charging leaves-plus-unreadable without mark-full.
- Six guide pages: machine ceiling plus optional repo share; setup.html shows the commented key in the repo config example (D6).

## Tests run

- Red: `bun test --changed` with new tests before code: 5 fail, 74 pass.
- Green: `bun test --changed`: 158 pass, 0 fail.
- `bun test`: 215 pass, 0 fail (evidence/cli-verification.log).
- `bun run format`: exit 0. `bun run typecheck`: exit 0.

## Known limitations

- R1 stands: in-practice.html and cheat.html still advise `max_active: 0` to pause, which the global schema rejects; reported, not fixed.
- R2 stands: the repo key is a ceiling, not a reservation; sweep order unchanged.
- Worker 2 exhausted its turn budget after completing all six doc edits; the diff was verified directly and the changed-test command rerun by B (158 pass).

## Unverified criteria

None.

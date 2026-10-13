# Brief 5: wait for systemd to place an adopted shell (repair)

Lane: seat-containment, start from 5e66da5. Owned paths: src/next.ts (the `box` helper) and, only if needed, src/scope.ts.

Defect (live run on 144317d): `adoptShell` runs `busctl ... StartTransientUnit`, which returns once systemd queues the job. `box` in src/next.ts then calls `inOwnScope` at once, sees the shell still in the server cgroup, and throws "Pane <id> for leaf <slug> is not in its own scope after adoption". The shell lands in its scope a moment later.

Fix: after `adoptShell`, poll `inOwnScope` every 50 ms until it returns `inside`, for at most 5 s. `unreadable` still throws at once. If the 5 s run out, throw the existing error with the last cgroup. No other behavior change, no new test edits.

Proof:
- `bun test tests/seat-containment.test.ts` all green, including "a shell systemd moves after the adoption call returns is still boxed" (red on 5e66da5).
- Changed tests: `bun test --changed=99a5ada --timeout=30000` green.
- `bun run format` and `bun run typecheck` clean.

Return: commit sha, changed files and reasons, test commands with pass/fail counts, any mismatch.

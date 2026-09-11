# Implementation report

Implemented D1–D6 and verified C1–C7. Failed-leaf notification delivery persists only after success and resets on transitions. Busy observations track physical seats, retry failed warnings and clear on observed idle/done/agentless panes. Merge waiting and peer fallback are covered. Status displays elapsed busy time without writes or herdr calls.

Changed files and reasons: `src/state.ts` adds default delivery fields, `src/phase.ts` resets failure delivery, `src/next.ts` observes seats and records successful notifications, `src/status.ts` adds durations. `tests/next.test.ts`, `tests/phase.test.ts`, and `tests/status.test.ts` verify the behavior using real CLI subprocesses and isolated external command fixtures.

Tests run:
- Worker fail-first run before source edits: 36 pass, 7 fail. Final changed-test command `AKROGON_BASE=9dc1055a0a1ba3682335622d81f41873de966f11 bun test --changed=9dc1055a0a1ba3682335622d81f41873de966f11`: exit 0, 54 pass, 0 fail, 524 assertions. Worker details are in brief.md.
- `bun /home/ivan/Work/infra/akrogon/issues/open/loop-hardening/dispatch-progress/failure-signals/implementation/verify-cli.ts`: exit 0. Saved `implementation/cli-artifact.log` alongside this report, containing actual fake herdr notification calls, CLI exit outcomes and state/status evidence.
- `bun run format`: exit 0, only scoped files changed.
- `bun run typecheck`: exit 0.
- `bun test`: exit 0, 95 pass, 0 fail, 1028 assertions in 28.45 seconds. Output saved in `implementation/full-test.log`.
- `git diff --check`: exit 0.

Known limitations: Delivery and state saving are separate operations, so a crash between them can duplicate a notification. Warnings require sweeps and cannot establish unobserved idle intervals. Documentation remains outside the locked scope. No dependency, configuration, routing or automatic-failure behavior was added.

Unverified criteria: none.

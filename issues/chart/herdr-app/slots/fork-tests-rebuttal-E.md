# Rebuttal: tests (Seat E)

## Q2. Why free real-`hc` stand-in tests belong inside `checks.test` (vs A, B, D)

- **`akrogon verify` only runs commands configured in `checks` / `merge_checks` (`issues/config.yaml`):** Putting the free, 13 ms real-`hc` + OSC 7501 stand-in tests into a separate manual command outside `checks.test` means `akrogon verify` never runs them, so an `hc` update or engine edit can break real `hc` flags, sockets, or `hc events` while `verify` stays green.
- **Precedent in `tests/`:** `tests/run-units.test.ts` and `tests/leaf-slices.test.ts` already run against the real systemd user manager inside `bun test` (`checks.test`); a scratch-XDG `herdr-core` child process is even lighter and more isolated than systemd user units.

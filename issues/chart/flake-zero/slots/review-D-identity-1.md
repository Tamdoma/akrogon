# Slot D identity-flake review

Verdict **ready** for `92321c1e` on `34742d42`.

The wait now establishes the condition discovery needs. When I left the private core serving and shortened the bound, the wait failed with `still accepts after SIGKILL`. In a separate replay, I routed the effective socket link to a live replacement after discovery. The post-discovery check failed even though the original socket was still down and the link was still a symlink. The test still checks the refusal, names the skipped session, and checks that both socket paths are down. See `tests/hc-identity.test.ts:127–146`.

A threaded Unix socket probe confirmed the distinction. The leader was `Z` while another thread accepted and replied. The listener test's `Z` check concerns a `sleep` child. Session-routing already polls the socket. The fixture's `startTime` is suitable for matching PID generations, but `stopDaemon` also uses its `Z` result as proof of daemon exit before removing runtime state, and the retry tests accept `Z` as exited. Those fixture checks establish leader state and can miss live sibling threads. This is outside the stale-socket test change. See `tests/hc-listener.test.ts:247–275`, `tests/session-routing.test.ts:44–50`, `tests/hc-fixture.ts:84–90,119–135,456–462`, and `tests/hc-fixture-retry.test.ts:93–98,134–146`.

All 36 focused tests across hc-identity, session-routing, and hc-fixture-retry passed. Typecheck and diff check passed. I relied on the supplied real hc thread-starvation, full verify, and stress results.

# Chart: session-flake

Route: direct (operator: full autopilot, A implements, D reviews)

Destination: session-reads, session-routing and hc-delivery stop failing at random; test hc cores stop the leaf slices and daemons they start.

## Open forks
- none

## Direct attempts
- 2026-11-23 landed 9f2cfc05 (D rounds 1-4; F1-F7 closed; F8 recordless runtime at startup and F9 stop-wait bound left for a follow-up commit, landed now because the leak blocks every verify). Verify green 1381.
- 2026-11-23 follow-up landed ddff2ddc (F8-F15, D rounds 5-8, ready at round 8); deployed. The fixture finds a session's daemons in /proc (serve + HC_SESSION + HC_RUNTIME=1), one deadline with SIGKILL caps stop, sweep tests use a private root.

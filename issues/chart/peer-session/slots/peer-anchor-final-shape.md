# Proposed final shape: peer-anchor (autopilot pick 1a 2a, A's)

1. A shared helper in skills/chart-issues/scripts (name chosen by the plan) runs `herdr pane process-info --pane $HERDR_PANE_ID` over the inherited env. It returns when that pane's `shell_pid` is an ancestor of the calling process (a /proc parent walk). Otherwise it throws a refusal naming `HERDR_PANE_ID`, `HERDR_SOCKET_PATH` and what herdr returned. [new mechanism]
2. peer-ask, peer-wait, peer-restart, peer-create and door-reset call it before their first herdr call. peer-restart, peer-create and door-reset also refuse when their A-pane argument differs from the verified pane. [new]
3. door-reset's detached child and peer-wait started by peer-ask inherit the parent's verified env. The detached child does not re-verify, because after the parent exits it is no longer a descendant of the pane shell. [new]
4. Every herdr call keeps its current form (no `--session`, no argv change, no prose change). Peers are assumed in A's session (2a); a peer pane missing there fails at herdr as today.
5. Refusal under autopilot: a non-zero script exit, under the existing rule, which identifies no consultant to drop.
6. Out: a server replaced under the same session name; pi door ancestry is asserted by tests, not yet observed live.

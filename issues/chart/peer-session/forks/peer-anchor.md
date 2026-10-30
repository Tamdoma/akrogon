# Peer anchor

## Question

### Q1 · How do the chart peer scripts know they talk to the herdr session that holds the door and its peers?

Options from the 2026-10-29 shared map: (a) each script first verifies that its inherited herdr env names the pane it actually runs in, because that pane's `shell_pid` is an ancestor of the script's own process, and refuses otherwise; calls then stay on the verified env; (b) an explicit herdr session passed by the door to every script and call; (c) discover each pane id across running sessions and accept a unique hit; (d) find A's session from A's harness session id.

### Q2 · Must every consultant share A's herdr session?

Co-location (one session, today's layout) or a qualified per-seat address.

### Carries

- Intake: [INTAKE.md](../INTAKE.md); operator 2026-10-24 "3a - but we need to map it out immediately after this is done."; operator 2026-10-29 autopilot words (INTAKE.md).
- herdr-session forks (delivered, issues/closed/herdr-session): lifecycle callers find the repo's session by workspace label and never trust the ambient socket; the peer scripts were split out here.
- Lock 2026-09-18: no hidden watchdogs, clocks or polling.
- 2026-10-24 map: [slots/map-merged.md](../slots/map-merged.md).

## Findings

- Blind notes for this fork are the 2026-10-29 opening maps, both written before either saw the other: [A](../slots/map-2026-10-29-A.md), [B](../slots/map-2026-10-29-B.md). Merged: [slots/peer-anchor-merged.md](../slots/peer-anchor-merged.md).
- Proof, read-only, 2026-10-29T07:37:53Z, herdr 0.9.1, local user ivan: `herdr pane process-info --pane "$HERDR_PANE_ID"` over the door's inherited socket returned `shell_pid 8969`, an ancestor of the door's tool shell (`bash -> claude 1578271 -> bash 8969`). For B's codex pane, `shell_pid 4065914` is an ancestor of codex pids 753741 and 755122. With `HERDR_SOCKET_PATH` naming session mdconsultingny, the same call returned `pane_not_found`. No resources created, nothing to clean up. Limits: it does not show a pi door's tool shell ancestry, and it does not cover a herdr server replaced under the same name. (A)
- Pane ids collide across running sessions today (`w1:p1` in mdconsultingny and netreachconsulting) (B E3). `--session` routing beats the inherited socket (B E4).

- B rebuttal: [none](../slots/peer-anchor-rebuttal-B.md). Final shape [slots/peer-anchor-final-shape.md](../slots/peer-anchor-final-shape.md). B check ([F1](../slots/peer-anchor-final-check-B.md)): `tests/fake-herdr.ts` `pane process-info` returns a hashed `shell_pid` (`tests/fake-proc.ts` `shellPid`), and the peer test setups inherit the machine's `HERDR_PANE_ID`, so success fixtures would refuse. Adopted as a fixture tightening: the leaf lets the fake return a configured ancestor pid and sets the fixture's caller pane. No product mechanism added.

## Taken

A's pick under autopilot, 2026-10-29: 1a 2a (not operator words).

- Q1 · 1a: a shared helper in skills/chart-issues/scripts runs `herdr pane process-info --pane $HERDR_PANE_ID` over the inherited env and returns only when that pane's `shell_pid` is an ancestor of the calling process. Otherwise it refuses, naming `HERDR_PANE_ID`, `HERDR_SOCKET_PATH` and herdr's answer. peer-ask, peer-wait, peer-restart, peer-create and door-reset call it before their first herdr call. peer-restart, peer-create and door-reset also refuse when their A-pane argument differs from the verified pane. door-reset's detached child and the peer-wait started by peer-ask inherit the verified env, and the detached child does not re-verify. Every herdr call keeps its current form, with no `--session`, no argv change and no prose change. Reason: the process tree is the one value a stale spare cannot fake. One check removes the wrong-session class for every call after it, with the least code. Rejected: 1b explicit `--session` everywhere (every call site, rerun and prose example changes, and it still needs 1a to learn the session); 1c unique-id discovery (a decoy passes when the real pane is gone, and ids collide today); 1d A's harness session id (needs a trusted first read, goes stale on reset).
- Q2 · 2a: every consultant shares A's herdr session. Reason: peers are created beside A or named in A's tab, which is today's only layout, at no extra code. Rejected: 2b a per-seat address (plumbing for an unused layout).
- Refusal under autopilot: a non-zero script exit under the existing rule, which drops no consultant.
- Out: a herdr server replaced under the same session name.
- Standing consultant dissent: none (B's rebuttal: no disagreements).

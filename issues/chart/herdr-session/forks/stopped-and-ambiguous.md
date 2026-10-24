# Stopped and ambiguous

## Question

Q1. What does discovery do with stopped sessions, duplicate labels across or within sessions, and an unreadable running session?
Q2. In a multi-repo pass, does one repo's refusal stop the pass or only that repo?
Q3. What deadline do discovery calls get, so a hung session cannot stall a pass? (raised by C)
Q4. Does a refusal in an automatic pass raise an operator notification? (raised by C)
Q5. Which session holds the new Himne workspace? (name fix from session-address)

### Carries

- Split taken 2026-10-24: two charts (herdr-session, pull-gh-path), herdr-session first. Operator answer `1a | 2a`.
- Map: [slots/map-merged.md](../slots/map-merged.md)

## Findings

Notes: [A](../slots/stopped-and-ambiguous-A.md), [B](../slots/stopped-and-ambiguous-B.md), [C](../slots/stopped-and-ambiguous-C.md), [merged](../slots/stopped-and-ambiguous-merged.md), rebuttals [B](../slots/stopped-and-ambiguous-rebuttal-B.md), [C](../slots/stopped-and-ambiguous-rebuttal-C.md).

- The B and C briefs lost four backticked phrases to shell substitution when A wrote them (A's error); B rebuilt them from source, C answered all three asks. The substitution also ran `akrogon next --all` twice from A's shell at 2026-10-24T10:19:16Z and 10:19:26Z (infra socket); captured output was only self-update skip lines. Framework transitions near that time carry seat or framework-door sessions.
- Proof: B, installed herdr 0.9.1, 2026-10-24, `herdr --session netreachconsulting workspace list` against a session listed stopped: exit 1, stderr code server_not_running, session still stopped after; no resources, no cleanup. Limits: does not prove a session stopping between list and call.
- Source (B,C, herdr v0.9.1): API commands never spawn a server; duplicate labels are allowed in one session; unnamed workspaces derive labels from cwd.
- Agreement on Q1 rules except the race: a session listed running whose read returns server_not_running is treated as stopped and skipped (C) vs discovery refuses for this invocation (B).
- Q2: per-repo refusal, one report per repo, cached refusal honored by later steps, uncontained paths contained (A,B,C).

## Taken

Operator 2026-10-24, verbatim: "1a 1b | 2a | 3a | 4a | 5a"

Recorded shape: [slots/sa-proposed-shape.md](../slots/sa-proposed-shape.md), with final checks [B](../slots/stopped-and-ambiguous-final-check-B.md) (no change) and [C](../slots/stopped-and-ambiguous-final-check-C.md). Correction from C D1: herdr() calls command(), which passes no deadline (src/shell.ts:124-126); the 10-second discovery deadline is plumbed from run's existing deadlineMs through herdr() for discovery calls, not assumed present. B's 1c (refuse on a session that stops after the list) is foreclosed by the operator's 1b.

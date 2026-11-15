# Chart: failure-identity

## Destination

A red check gets a failure identity akrogon can read as a fact: `akrogon flaky`, `verify --known-red` and red-main notices name the failed script when the log has no Bun test name, two different failed scripts never count as the same failure, and new run records keep their names after the logs are retired (#134).

Map: slots/map-merged.md. Split (A's answer under full autopilot; A, B and C agree on two outcomes): one issue `failure-identity` with leaves `failure-names` and `stored-failure-names`, the second blocked by the first because a stored name must come from the new grammar.

Route: lifecycle

## Forks taken

- [Signposts](forks/signposts.md): A's picks under full autopilot 1a 2a 3a 4a 5a 6a; needs none
- [Identity rule](forks/identity-rule.md): A's picks 1a 2a 3a 4a: names from Bun's own lines per stream, a coarse name always gets the two-log read, names stored in an optional `failures` field, an existing recorded file read on a lookup miss

## Open forks

none

## Fog

none

## Off route

- Recovering framework's 36 retired entries from Git history: signpost 4a.
- Any change in framework, including a fix for `test:remote-image`: signpost 5a. Recorded for framework.
- `akrogon log` for a plain file outside the `issues/` grammar: identity-rule Q4 4a (B's dissent). The file is plain and can be read directly.
- Script and kind on real test titles: identity-rule Q1 (B's dissent), stated cost.
- Reading names from free text such as `[FAIL]`, and any consumer setting: signpost 3a.

## Pending steps

none

## Mode record

- mode 2026-11-11T21:14:48Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/9841db4d-1040-4cc0-8aaf-9a1544445bfe.jsonl: on autopilot (signposts: operator); handed: Tamdoma/akrogon#134 (this chart); consultants: B codex gpt-6.1-sol high, C agy gemini-4-carbon-medium medium (door-created); route lifecycle
- mode 2026-11-11T21:29:20Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/9841db4d-1040-4cc0-8aaf-9a1544445bfe.jsonl: changed list full autopilot (signposts: A), operator words "answer signposts on autopilot as well / full autopilot"; handed list unchanged
- mode 2026-11-11T22:03:29Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/9841db4d-1040-4cc0-8aaf-9a1544445bfe.jsonl: off (every handed chart handed off)

## Autopilot

- switch-on: INTAKE.md, Source: operator 2026-11-11T21:10Z
- consultant: B t1cv codex gpt-6.1-sol high, C t1cw agy gemini-4-carbon-medium medium (door-created); C needed one nudge for its report at the signposts exchange
- friction: the column helper ran before the new seats had panes and reported no pane in the door tab; the rerun after the first exchange laid them out
- signposts: A — original in issues/chart/failure-identity/forks/signposts.md
- route: lifecycle
- recorded only: the operator's "unless you want to fix it yourself" names the direct route, which the door does not offer under autopilot
- pick against A's own notes: identity-rule Q4, A's notes held 4c, the pick is 4a on C's evidence
- recorded only: standing dissent B on identity-rule Q1 (1d) and Q4 (4b); C's question about the check name in red-main notices
- recorded only: 30 `akrogon flaky` tests in akrogon (2026-10-17..24) outside the handed list
- handed off: failure-identity/failure-names and failure-identity/stored-failure-names (issues/open/failure-identity), sources Tamdoma/akrogon#134, stored-failure-names blocked-by failure-names; leaf review B: 2 findings, C: 5 findings, all applied to the drafts before writing (slots/leaf-review-B.md, slots/leaf-review-C.md); `akrogon preflight` exit 0, presence gaps none, `akrogon status` valid with no pause shown
- recorded only: seed 134 is the handed work, full match confirmed by A
- recorded only: signpost 2a narrows the operator's 2026-11-09 answer 3a (known-red-nameless); picked by A because the operator handed the signposts round to A
- friction: both final-shape checks and both leaf reviews found defects A's own read missed (an unquoted hex-like YAML value read as a number, a criterion placed at a CLI that reruns the base); the map did not state where `verify --known-red` reruns
- usage: chart failure-identity - operator wait 33.7 min, operator turns 3; A=55118, B=19929, C=unmeasured output (outcome partial, at the handoff review; USAGE.md)
- recorded only: watcher t3 (claude, tab w-akrogon) nudged by `hc send` after handoff; the send answered `started: true`; what it then does is not checked by the door

Handed off 2026-11-11

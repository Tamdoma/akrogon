# Chart: merge-slow-alarm

## Destination

After each completed merge-scope `akrogon verify`, a run much slower than the repo's recent normal is flagged on its receipt, in verify output, by one herdr notification per episode and in `akrogon status`, naming the leaf where it was first seen; merge results never change. Repo: akrogon. Source: Tamdoma/akrogon#123.

Route: lifecycle

## Forks taken

- [Slowdown alarm](forks/slowdown-alarm.md): A's pick `1a 2a 3a 4a`: fresh-run median normal with partial runs still checked, episode keeping its pre-jump normal, "first seen at" leaf, herdr notice plus status line plus verify line.

## Open forks

none

## Fog

none

## Off route

- Per-command timing: total wall time is what the merge lane pays; profiling is a larger destination. (B)
- Discord broadcast of slowdowns: fires only at owner completion and misses attempts that never land. (B)
- Framework's own cause: removed under framework `issues/open/merge-verify-time/`. (seed)

## Pending steps

none

## Mode record

- mode 2026-10-28T12:31:28Z w8:pNP e9eb89a0-d477-43b1-921b-6eaeb9fba7d8: on handed [Tamdoma/akrogon#123 as merge-slow-alarm, Tamdoma/akrogon#124 as killed-run-fixture]; consultants B w8:pXC (codex)
- mode 2026-10-28T13:14:40Z w8:pNP df4e7766-cbbc-4c40-8f28-60e419fee3e1: off (every handed chart handed off: merge-slow-alarm, killed-run-fixture)

## Autopilot

- switch-on: [INTAKE.md](INTAKE.md) `## Source: operator 2026-10-28T12:31Z`
- consultant: B w8:pXC codex, restarted 2026-10-28 (session 01a1827f-4aeb-78d1-bbd7-e13bf1d9c8df from first exchange)
- route: lifecycle (direct refused: autopilot)
- handed off: merge-slow-alarm/slow-merge-notice (sources Tamdoma/akrogon#123), drafts reviewed by B (slots/drafts-review-B.md, DR1 and DR2 applied), `akrogon status` valid 2026-10-28
- main step: none
- watcher: operator asked for a nudge; sent `/watch-issues tick /home/ivan/Work/infra/akrogon` to w8:pQ6 at 2026-10-28T12:51:38Z, prompt accepted (watcher working); its result was not read by the door
- recorded only: `akrogon flaky` lists merge-flow and prompt-delivery tests (last 2026-10-24); `akrogon status` shows no open leaves and no failed leaves; open charts peer-session and pull-gh-path belong to this door's pane and are outside the handed list
- friction: the opening map's per-fork positions served as both seats' blind fork notes; no separate fork-notes exchange was run before the merge.
- usage: [USAGE.md](USAGE.md)

Handed off 2026-10-28

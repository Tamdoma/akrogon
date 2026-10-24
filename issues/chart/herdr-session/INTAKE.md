# Intake: herdr-session

## Scope

akrogon finds each repo's herdr workspace across running sessions and acts only there, refusing visibly when missing or ambiguous, instead of trusting an inherited HERDR_SOCKET_PATH. Destination: akrogon. Sibling chart pull-gh-path shares the root cause (stale inherited env from long-lived parents).

## Provenance

- GitHub: Tamdoma/akrogon#117
- Operator: 2026-10-24 door note "I pulled a pretty big issue. Let's chart it out."

## Source: Tamdoma/akrogon#117

# akrogon next places seats in whichever herdr session an inherited HERDR_SOCKET_PATH names

Source: Tamdoma/akrogon#117
URL: https://github.com/Tamdoma/akrogon/issues/117

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

On 2026-10-24 `akrogon next homepage-chain-recording`, run from a Claude Code background job attached to the operator's framework pane (`wA:pF9`, herdr session `infra`), failed with `No herdr workspace labeled framework`, and earlier warned `tab wA:tRE not found, skipping rename`. The workspace `framework` existed and was focused in session `infra`.

The job's process carried `HERDR_SOCKET_PATH=/home/ivan/.config/herdr/sessions/mdconsultingny/herdr.sock` and `HERDR_PANE_ID=w4:p2`, values from an unrelated pane (`boulevard-automation`, session `mdconsultingny`). Every herdr call akrogon made went to that session. After a `framework` workspace was created there by the agent, `akrogon next` spawned seat A in it (`w9:p2`), outside the operator's view. The seat ran paid run G9 there. akrogon's leaf state then pointed at a tab in the wrong session, while the leaf's real tab `wA:tRF` (pane `wA:p1GN`) sat idle in `infra`.

Process tree of the job's shell:
```
claude bg-spare  (PID 2268687, started Oct 21 10:16)  HERDR_PANE_ID=w4:p2 HERDR_SOCKET_PATH=.../mdconsultingny/herdr.sock
claude daemon run (PID 2632997)                       HERDR_PANE_ID=wA:pF9 HERDR_SOCKET_PATH=.../infra/herdr.sock
```
The Claude Code daemon pre-spawns spare processes with the spawning terminal's env and hands them to later jobs without refreshing herdr vars. That upstream bug is separate; this report is about akrogon trusting the inherited value.

## Location

- `src/shell.ts:202-212` `herdr()` runs the `herdr` binary with the inherited environment, so `HERDR_SOCKET_PATH` decides the session.
- `src/shell.ts:222-224` `workspaces()` lists only that session.
- `src/next.ts:407-408` picks the workspace by `item.label === repo.name` within that one session.
- `src/land.ts:33-35` forwards `process.env.HERDR_SOCKET_PATH` into the land unit.

## Reproduction

1. Have two herdr sessions, with workspace `<repo>` only in session X.
2. Run `akrogon next <slug>` from a process whose `HERDR_SOCKET_PATH` names session Y (for example a Claude Code background job that claimed a spare created in a session-Y pane).
3. akrogon throws `No herdr workspace labeled <repo>`, or, if Y also has a workspace with that label, places seats there.

Frequency: whenever the inherited socket names a different session than the repo's workspace.

## Expected behavior

The operator's statement: everything happens in the repo's own workspace, in worktrees, never somewhere hidden. akrogon should find the repo's workspace regardless of the session an inherited `HERDR_SOCKET_PATH` points at, and refuse visibly when the label is missing or ambiguous across sessions.

## Urgency

High. Seats and paid runs ran invisible to the operator, and leaf state was pointed at a pane in the wrong session, which needed manual cleanup. Workaround: export the correct `HERDR_SOCKET_PATH` before every akrogon and herdr command.

## Suspected cause

akrogon treats the ambient `HERDR_SOCKET_PATH` as the source of truth for which herdr session holds a repo's workspace (`src/shell.ts:202-224`, `src/next.ts:407`). Contributing condition: the Claude Code background-job spare processes carry a stale herdr env from the pane that started them.
View: both (operator statement, agent evidence from `/proc/<pid>/environ`).
Files read: `src/next.ts:395-420`, `src/shell.ts:173,202-224`, `src/land.ts:28-38` in `/home/ivan/Work/infra/akrogon`. The installed release `/home/ivan/.akrogon/releases/942e2020e78ca0fc8eb9305cf8f0d5b4f86ef190/src/next.ts:407-408` was read as well and matches; it is an installed copy, not the destination source.
Not inspected: how other herdr callers (`turn.ts`, the watch observer) choose the session. Whether herdr itself has a cross-session lookup.
Related reports: none found. #116 (extra pane after allocate) is a different defect. Searched Tamdoma/akrogon, all states: author @me since 2026-10-22 (limit 30), and "herdr socket" (limit 10).

## Source: operator 2026-10-24

I pulled a pretty big issue. Let's chart it out. Use both slot and c consultant slots that are active now in this herdr tab.

## Agent findings

Opening maps by A, B and C: [slots/map-A.md](slots/map-A.md), [slots/map-B.md](slots/map-B.md), [slots/map-C.md](slots/map-C.md), merged in [slots/map-merged.md](slots/map-merged.md). Seed locations verified against main (B,C). `--session` beats a stale socket on herdr 0.9.1 (B,C live probe). Workspace ids repeat across sessions (w8 in infra and mdconsultingny).

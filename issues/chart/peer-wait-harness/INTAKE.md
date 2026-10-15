# Intake: peer-wait-harness

## Scope
peer-wait stops reporting failure for a non-Claude peer whose turn is still open. Independent of worktree-cleanup and check-evidence.

## Provenance
- GitHub: Tamdoma/akrogon#91
- Operator: 2026-10-15, "3 new issues came in. Let's consult with slot b and slot c and slot d, and let's chart them out."; split answer `1a` (three charts, order worktree-cleanup, check-evidence, peer-wait-harness)

## Source: Tamdoma/akrogon#91
# chart-issues peer-wait reports failure for an antigravity peer that is still working

Source: Tamdoma/akrogon#91
URL: https://github.com/Tamdoma/akrogon/issues/91

Origin repo: Tamdoma/tamdoma-framework
Lesson history: learnings/history/2026-10-15-peer-wait-antigravity-idle.md

Unverified intake.

## Observation
On 2026-10-15, in the framework `/chart-issues` door, slot C ran antigravity (`agy`, herdr pane `wA:pTE`) on the opening-map brief. `peer-wait.ts` returned outcome `failure` twice while C was still working. The operator chose to keep waiting. A foreground loop that reran `peer-wait.ts` until outcome `done` then received a complete 69 KB return file (`map-C.md`). Slot B (codex) did not hit this in the same exchange. A later rebuttal exchange with the same agy pane returned `done` normally.

## Location
akrogon `skills/chart-issues/scripts/peer-wait.ts`, called by `skills/chart-issues/scripts/peer-ask.ts:31-37`, with an antigravity peer in herdr.

## Reproduction
1. Open `/chart-issues` with a named C pane running antigravity.
2. Send C a long task through `peer-ask.ts` (the opening map took several minutes).
3. Antigravity starts its own subagents. Its pane shows idle or done while they run.
4. `peer-wait.ts` prints outcome `failure` after the 10 s grace period with the return file still missing.
Frequency: twice in one exchange on 2026-10-15.

## Expected behavior
`peer-wait.ts` reports `failure` only when the antigravity peer's turn has actually ended without a return file, and keeps waiting while its subagents work.

## Urgency
A working antigravity peer reads as failed, so the door stops and asks the operator. Workaround: rerun `peer-wait.ts` in a foreground loop until outcome `done`.

## Suspected cause
`turnOpen` at `peer-wait.ts:130-133` returns false for every peer kind other than `claude`, so `:192-193` reports `failure` once the pane stays out of `working` for `IDLE_GRACE_MS` (10 s, `:67`). For Claude peers a transcript check (`claudeTurnOpen`) confirms the turn is open. No equivalent check exists for antigravity, whose herdr status goes idle or done while its subagents run.
View: agent, from the reporter's observation.
Files read: `/home/ivan/.claude/skills/chart-issues/scripts/peer-wait.ts` (symlink into the akrogon checkout at `/home/ivan/Work/infra/akrogon/skills/chart-issues/scripts/peer-wait.ts`), `skills/chart-issues/scripts/peer-ask.ts`.
Not inspected: antigravity's own session or transcript format, and whether herdr exposes a subagent-aware status for agy. A herdr status that stayed `working` during agy subagent runs would disprove this.
Related reports: Tamdoma/akrogon#44 (closed, peer wait returned before a codex peer answered; same symptom, different harness and cause). Searched Tamdoma/akrogon, all states: `--author @me created:>=2026-10-13` (limit 30) and `peer-wait antigravity` / `peer-wait` (limit 10).

## Agent findings
Opening maps by A, B, C, D and the merged map with rebuttals: [slots](../worktree-cleanup/slots/) (`map-A.md` … `map-D.md`, `map-merged.md`, `map-rebuttal-*.md`). Per-fork findings live in the fork files.

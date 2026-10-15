# Peer wait ends an antigravity turn early

## Case
Framework chart-issues door, 2026-10-15. Slot C ran antigravity (`agy`, pane wA:pTE) on the opening-map brief. `peer-wait.ts` returned outcome `failure` twice while C was still working on the map. The operator chose to keep waiting. A foreground loop that reran peer-wait until outcome `done` then received a complete 69 KB map-C.md.

## Evidence
`skills/chart-issues/scripts/peer-wait.ts:130-133` (`turnOpen`) returns false for every peer whose kind is not `claude`, so `:192-193` reports `failure` once the pane stays out of `working` for `IDLE_GRACE_MS` (10 s, `:67`). Antigravity shows its pane idle or done while its own subagents run, so herdr status alone cannot tell an open turn from a finished one. Codex in slot B did not hit this in the same exchange.

## Learning
Pane status is a turn signal only for harnesses whose status covers subagent work. For any other harness the wait needs a transcript or session check like the Claude one, or a done signal the peer writes, before `failure` is reported.

## Report
https://github.com/Tamdoma/akrogon/issues/91

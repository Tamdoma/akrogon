# Slot D review of lane-first, round 2

**Verdict `fix`**

Base `814a2387`  
Head `d1808dbf34da1e50e6813b7c4005e8277ed46427`

## Findings

- **F4 · `src/stop.ts:89`.** A check can still start after `stop` if admission has promoted it but systemd has yet to register its units. I held a real `run-check` at guard registration, confirmed its record was `live` and its scope absent, and ran `stop`. It returned `0` and printed `stopped`. Releasing registration let the check launch and return `0`. Cancel the pending launch or synchronize `stop` with unit registration so a successful stop closes this window.
- **F5 · `src/stop.ts:65`.** A failed stop can still be reported as success while the service is activating. I refused the stop of a private real service with a live PID. The real `systemctl is-active` printed `activating` and exited `3`. The CLI printed `stopped` and returned `0`, and the PID remained. Preserve the stop error unless the follow-up positively establishes that the unit is stopped or gone. A failed status query should also preserve the original error.
- **F6 · `docs/use/roll-back-a-release.md`, “Roll back by hand”.** The documented recovery path for a broken current executable still leaves the link dangling. I deployed a fixture whose broken release shipped `akrogon-land.slice`, followed the manual steps using the real `814a2387` release, and confirmed that the previous install and deploy record write both succeeded while the link remained dangling. Add conditional cleanup of the owned link to the manual path before the previous installer reloads systemd.

## Re-check

- **F1 closed for `akrogon rollback`.** The upgrade-then-rollback test removed the owned link when the older release lacked the unit. F6 covers the separate manual path.
- **F2 closed for the original refusal.** With the target pass reporting active, the stop returned nonzero, kept the `Access denied` error, tried the other units and printed no `stopped` line. F5 covers the activating state.
- **F3 closed.** The cap-1 fixture now starts the prerequisite that both merge waiters need. The existing cap test still covers eligible waiters, resumes and `check.repair`.
- **F4 closes for a record still waiting.** I replayed the original probe with real units. The queued check exited cancelled and never touched its marker, and the other leaf's holder finished green. The race above remains after promotion.

All 117 tests passed across `install`, `rollback`, `green-merge`, `pause-next`, `run-units` and `command-reference` with `--timeout=120000 --max-concurrency=5`. Typecheck and `git diff --check` passed. The release probes used an isolated state home and fixture systemctl. The real systemd probes used private units.

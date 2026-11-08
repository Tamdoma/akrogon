# engine-shape: merged notes (A,B,C,D,E)

Sources: fork-engine-shape-A.md .. -E.md.

## Q1. Does signpost 1a bind the engine's own hc calls?
- 1a-engine-keeps-code (A,B,C,D,E): 1a governs steps an agent performs from skill text (door, consultants, watcher, direct reviewer). The engine keeps a small hc client in `src/` for what no agent can do: prompt a seat with its guards (busy, grace, delivery record, `src/next.ts:704-776`), read status, close a finished tab, kill on stop. Cost: a hc client in code. Guard against growth: one module, closed verb list in the leaf design, nothing exported for skills (C,D). Engine never reads screen text (C).
- 1a-binds-engine (rejected by all): an agent would have to dispatch leaves, adding a coordinator agent or seats driving each other; changes the workflow.
- B: this is an interpretation of the operator's signpost; the operator must confirm it explicitly before an engine leaf is handed off.

## Q2. What wakes the engine, who installs it?
- systemd user listener (A,B,C,D,E): one service per hc session that hosts repos, running an akrogon listener verb: subscribe to `hc events --json` filtered by akrogon labels, run a catch-up pass (`next --resume`), then run `next` for the owning leaf on status, turn, finished events; ignore `working` and title events; single-flight with one pending flag; exit when the stream ends so systemd restarts it and the catch-up reruns.
- Installed and restarted by akrogon install and self-update (A,B,C,D,E), replacing `herdr plugin link` (`src/install.ts:146-147`, `src/self-update.ts:283-288`); deploy must restart it and prove the new release runs (B,C,D,E).
- Rejected: herdr-app mod (dies with window/layout, all); herdr-setup owning it (version skew with the engine it calls, A,B,C,D,E); nothing resident (signpost 4a); timer polling (operator: no polling, D).
- Evidence: `hc events --help` filters, no replay cursor (all, v); Supervisor event docs and superlance crashmail: listeners act on unexpected exits, tolerate redelivery and buffer loss (A,B); docker-gen regenerates on reattach (C); level-triggered reconcile pattern (D, model-knowledge).
- Pitfalls: missed events on restart (catch-up pass; B: subscribe first, keep events arriving during the pass); unit cannot reach the core socket (probe with `HC_SESSION` from systemd, C,D); duplicate wakes (global lock plus phase/seat state; prove two events give one prompt, B); stale binary after deploy (restart in reload step, B,C,D,E); crash loop before any core exists (backoff, liveness in `akrogon status`, D).
- Open details: one unit per session (template `@`) or one following all sessions (C,D,E); `pull --all` once per boot or on every listener start (D, B); does pause stop the listener (D).

## Q3. What advances a leaf on success?
- 3a turn-end event, same as today (A,B,C): the seat runs `akrogon phase` mid-turn; when hc reports its turn over, the listener runs `next`, which prompts the next seat. phase keeps only its merge wake. Reason: the same seat often takes the next phase (plan.synthesis and implement are both A, `src/routing.ts:35-36`) and is busy until its turn ends; one success path. Cost: advancement waits for turn end and depends on the listener.
- 3b both (D,E): phase also dispatches the next seat directly when it is idle (other seat, hand-run phase from a shell, backgrounded Claude with no status); the listener covers same-seat phases, crash, exit, blocked. D: phase wake runs as a detached unit so a slow pane placement never hangs the seat. Cost: two success paths; double-prompt guard needed (lock plus prompted record) and proven.
- 3c slots message each other directly with `hc send` (none): moves dispatch into agents; rejected with Q1.
- Status is a wake, never success evidence: advancement still reads phase/done state (B,C,E); a turn that ends without phase is surfaced to the watcher, not advanced (A,B,E).
- Differences: D,E weigh hc status gaps (codex question shows working, backgrounded Claude shows nothing) and hand-run phase; A,B,C weigh one path and same-seat reuse.

## Questions the fork did not ask (kept for later forks)
- Where a leaf seat's own report goes when its dispatcher is a systemd program, and whether it gates advancement (B) -> lifetime / watcher.
- How a crash event reaches watch-issues when its Claude session is busy or absent (B) -> watcher.
- Should phase print the next expected step for the pane reader (C).
- Do stop and leftovers call `hc kill` directly (E: yes).

## Corrections after rebuttals (2026-11-06)
- B did not inspect superlance crashmail; that source is A's. B inspected Supervisor's event protocol, listener-failure and buffer-loss docs.
- Q2 restart sequencing (B): the listener runs `next`, which can run self-update (`src/next.ts:1653`); restarting the listener from its own updating child could cut the deploy before its success record (`src/self-update.ts:274,290`). Restart only after the install completes, with a done-criterion that a self-update triggered through the listener ends with the new release running.
- Q2 pull (D): the listener's start runs `pull --all` then `next --resume` in plugin order by default; the alternative is pull once per boot.
- Q3 (E, verified by A): `akrogon phase` already dispatches seats directly today for merge and broadcast (`mergeWake` -> `mergePass` -> `mergeTurn` -> `dispatchMergeLeaf`, `src/next.ts:1148-1333`), while the seat is mid-turn. So the double-prompt guard already exists; 3b adds no new concurrency mechanism.
- Q3 (C): 3b's codex-question and backgrounded-Claude reasons do not hold: neither seat has run phase. 3b's real gains are the other-seat handoff without waiting for turn end and hand-run phase. C's form: phase ends by running `next <slug>` under the existing lock (busy seat refused, one prompt per phase and seat), so there is one dispatcher, not two.
- Q3 (D): hand-run phase was not D's reason for 3b; D asks whether a hand run of `akrogon phase` from a plain shell should start agents at all. D also asks whether phase, mergeWake, landedWake and event wakes unify into one wake mechanism.
- A changes its Q3 pick to 3b in C's form after E's evidence.

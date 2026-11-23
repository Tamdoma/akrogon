# Brief: slot C, blind opening map

You are slot C, consultant to the chart door (slot A, hc t126), repo /home/ivan/Work/infra/akrogon at main (git pull is not needed; main is current). Read-only: edit nothing except your return file. Map independently; do not read other slots' map files.

Think as a systems thinker: where queues and stores build up, which loops feed each other, which proposal fixes a symptom in the wrong layer, what each option breaks or invites over the next months.

Read first:
1. /home/ivan/Work/infra/akrogon/issues/chart/lean-akrogon/INTAKE.md (seeds #148-#151, operator words, agent findings).
2. /home/ivan/Work/infra/akrogon/issues/chart/lean-akrogon/forks/seed-148-decision.md, /home/ivan/Work/infra/akrogon/issues/chart/lean-akrogon/forks/seed-149-decision.md (locks).
3. /home/ivan/Work/infra/akrogon/issues/chart/lean-akrogon/forks/signposts.md (taken session priorities and hard limits; they bind your map).
4. /home/ivan/Work/infra/akrogon/issues/chart/lean-akrogon/slots/history-reversals.md once it exists (two months of reversed decisions). A will message you when it is written; fold it in before returning.
5. The code the seeds cite, read on main (the seeds read an installed release; check each cited line still says that).

Task: a territory map, grounded in code with file:line, covering:
- M1. For each proposal (#148 K1-K5, #149 P1-P14, #150, #151): is the stated mechanism true on main; is it the smallest change that removes the class; what it adds in moving parts; what it could break; keep, change or drop, with reason.
- M2. Backpressure: do leaves waiting in merge count against max_active; does repo-caps refill (436b5179) start new leaves while the merge queue is deep; is admission by queue depth simpler than P10/P14.
- M3. Ownership: every resource akrogon creates (run folders, compile cache, verify worktrees, node_modules, leaf/test slices, ledgers) and what removes it; which are tied to their owner's end and which rely on sweeps.
- M4. Anything else that would make merges faster, more predictable, cheaper in LLM spend, or the framework smaller: whole turns, gates or mechanisms that could be deleted. Architecture is open; say what you would do differently.
- M5. Proposed grouping into charts (each must fit one direct attempt: A implements, one reviewer, at most 12 rounds), their order and real dependencies.
- M6. Open forks: the precise questions that need a pick, each with options.

Mark each claim's confidence. Keep under 300 lines. Write to /home/ivan/Work/infra/akrogon/issues/chart/lean-akrogon/slots/map-C.md, then: hc send t126 "done C: /home/ivan/Work/infra/akrogon/issues/chart/lean-akrogon/slots/map-C.md"

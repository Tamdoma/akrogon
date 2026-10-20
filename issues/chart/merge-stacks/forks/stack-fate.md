# stack-fate

## Question

Delete member stacking (holder-only turns), or keep it and stop re-stacking an unchanged red head after main moves (reopens stacked-turn 2026-10-15 "No caps at all")?

### Carries

- Operator 2026-10-18: "most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code."
- Opening map: issues/chart/paid-proof-bounds/slots/map-merged.md

- Operator 2026-10-19, after the first round: "Is merging one at a time the only real option? be honest with me."
- Operator 2026-10-19: "Okay, say say I didn't rule anything out. What would be the best possible solution? Consult with the consultants and tell e this is very important to me. If I'm stuck with only one at a time merge, that's fine, but I need to find something faster that is just as precise and as good. So do some deep research on this without me imposing any rules or restrictions. Of course consult with both consultants."
- Operator 2026-10-19, on A's finding that 88% of leaves first run the full suite at merge: "This was a part of the speed up because if they were running two full checks of test suites during their run and inside of the merge that just doubles the amount of time that takes to merge. Consider all the updates that we did in the past week. I am aiming for speed as well as accuracy.As well as the cost reductions."

## Findings

Merged notes with tags: slots/stack-fate-merged.md (blind notes stack-fate-A/B/C.md, rebuttals stack-fate-rebuttal-B/C.md, read 2026-10-19).

- A, B and C all pick deleting member stacking. On framework merge-attempts.jsonl (333 attempts, 2026-10-10 to 2026-10-19), 77 stacks landed 5 extra leaves and spent 480 min on 72 red stacks; 51 of 53 red-stack members later merged alone; 62 heads went red again on another base.
- The head-only red mark keeps all member code and drifts to holder-only after the first red.
- Outside queues (GitHub, bors-ng, Zuul, Mergify, Rust rollups) make batching pay with rare failures, splitting or parallel CI; here solo red is about 24% and splitting is foreclosed.
- Slots differ on a leaf in the middle of a stacked merge when the new release installs: drain first (B), strip with conditions (C), loud refusal (A).

No-locks research after the operator's question (slots/best-merge-merged.md; A, B, C notes and rebuttals, read 2026-10-19):

- One at a time is not the only precise option: testing the next leaf on top of the current one in parallel (Zuul, GitHub, Uber) keeps per-leaf proof. Batches checked once on top do not.
- The full suite runs once per leaf, at merge, by design (operator correction). Its 12 min wall is one sequential chain; one test (meta-content-coverage, 7 min) repeats the same real capture eight times. Reshaping it is framework work estimated at 12 to about 5.4-8 min with the same assertions (B,C).
- A green merge spends about 1-3 min and one agent session outside verify; a command-only green path removes them (A,B,C).
- Most merge reds are the leaf's own break that the full suite exposes first; new-main interactions are a minority (B,C).
- Moving hooks:selftest into leaf checks: C keeps it; B withdrew it after the operator correction until total cost is measured.
- Parallel next-leaf testing comes after suite reshaping and the green path, gated on measurement (A,B,C).

## Taken


Operator 2026-10-19: "1a | 2 - Explain to me how this works, who will commence the merging? I'm leaning towards A but I need you to explain it more, dumb it down for me. What are the gains gonna be in absolute and relative terms from this? | 3 - I'm leaning towards A, but I need more explanation. What is this? Dumb it down for me. | 4a | 5a"

- 1a: delete member stacking; every merge turn is the holder alone.
- 4a: parallel next-leaf testing (speculative prefix, depth 2) is deferred. Revisit trigger: after the command-only green merge and the framework suite reshaping land, a measured probe shows two full suites run at once on this host without slowing each other or adding flakes.
- 5a: no upgrade code for an in-flight stacked merge; drain merges before installing; the strict state parse refuses a leftover loudly.
- 2 and 3: explanation given (who merges, gains in time, cost and reliability; what the suite reshape is).

Operator 2026-10-19: "2a | 3a"

- 2a: command-only green merge. The merge turn's command lines the holder up on main, runs the merge verify, checks the receipt and pushes on green with no seat. A red verify, a rebase conflict or a dirty worktree, or a refused push it cannot restack wakes seat B as today. The completion broadcast still needs a model, so a seat starts only when an issue or epic completes. Gains, estimates: about 1 of 13 min per green merge (about 9%), about 3 of 4 merge agent sessions removed, and agent-session failures removed from green merges.
- 3a: framework suite reshape, charted next as its own framework chart: capture once for the repeated identical-input storefront captures, and give meta-content-coverage its own parallel lane. Every check still runs. Estimate: full suite about 12-13 min to about 6-8.5 min.

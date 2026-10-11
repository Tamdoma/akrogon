# Fork notes: remaining automatic `failed` exits, slot B

You are slot B. Blind fork notes: your own position, not a review of A. Read-only: change no repo file, run no akrogon phase/next/unhold/close.

Return path (write only here): /tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3439f-85f2-4472-a49d-d163111cd153/scratchpad/night/fork-failed-exits-B.md

## Intake and operator words
Operator, verbatim: "We need to make sure things are moving and are automated without having failed issues or stopped processes for me in the morning. I only need the most elegant solutions that are holistic, that will simplify things and make them move much faster." Also: "I don't want more complexity."

## Locks (Round 1, taken 2026-10-11, "1a | 2a | 3a |")
Final shapes: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3439f-85f2-4472-a49d-d163111cd153/scratchpad/night/fork-stop-rules.md
In short: S1 the repo hold is gone; a merge red on top and red on base makes only that leaf wait at merge until the base changes, never merging red. S2 the round limit no longer ends in failed; B names the plan problem, A fixes the plan in check.fix. S3 per-check ancestor guard dropped, creation check and own-modules stay.

## Evidence (facts, read it)
Every `failed` exit in both repos since 2026-10-08, with reason: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3439f-85f2-4472-a49d-d163111cd153/scratchpad/night/failed-exits.tsv (43 rows; columns ts, repo, slug, from-phase, reason).
Related: `issues/open/red-base-wait/` (ISSUE.md, known-red-leaf, known-red-merge, forks in `issues/chart/red-base-wait/`), `skills/check-issue/SKILL.md:65`, `skills/implement-issue/SKILL.md:38`, `src/next.ts:552-580` (attempts and unreachable exits), seed `issues/seeds/84-*` (failed leaf unnoticed).

## Questions for this fork
Q1. Before merge, a leaf whose check is red because main is red goes to `failed` (seat moves it per the skills). What should happen instead, given S1 now exists at merge? Consider at least: (a) the leaf proceeds and merge is the only gate for red-on-main; (b) the leaf waits for main to change, then retries; (c) keep failing until known-red-leaf lands. Say what each does to the red-base-wait chain (known-red-leaf, known-red-merge): unchanged, smaller, or unnecessary.
Q2. Seat unreachable (`agent_name_taken`, `agent_not_running`) and prompt undelivered after 3 passes end in `failed` automatically. What should happen instead, if anything?
Q3. Anything in the 43 rows that neither Q1, Q2 nor the Round 1 locks cover and that a human does not have to decide.

## Note format (five parts per question)
1. Your pick, its reason and its cost.
2. Each rejected option and why.
3. Evidence: tier (operator / practitioner / better-than-training / model-knowledge), source with path:line or URL, date read.
4. Pitfalls over the lifetime of the work, and what removes each.
5. Any question you would ask that this fork does not.

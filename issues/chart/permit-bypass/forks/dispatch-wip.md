# Dispatch WIP

## Question
Q1. How many leaves should run at once (max_active 20 today, counted by active leaves only), and should dispatch react to slice pressure?

### Carries
- slots/system-merged.md R4, B3, missing feedback; C M-4 (max_active 8 trial). src/next.ts:414-460.

## Findings
- Lower max_active now; no pressure-reactive dispatch (A,B,C). 6 now (B,C), 8 after the start check (A,C). Leaves already active keep running; max_active counts leaves, not runs (B).

## Taken
Operator 2026-10-13, verbatim "1a, 2a, 3a, 4a, 5a". Round notes slots/ship-{A,B,C}.md, merge slots/ship-merged.md, rebuttals slots/ship-rebuttal-{B,C}.md.
Taken 1a: max_active 6 now, done by the door: config.yaml commit 237208f, `akrogon config` reads 6. The start-check leaf raises it to 8. Pressure-reactive dispatch off route until post-merge timings and memory.events show need.
Revised by operator 2026-10-13 ("We need to get to 12, instead of 6. 6 is too little."): max_active 12, commit after 237208f; the start-check leaf does not change it. Slice at 11 leaves read 17:30: anon 26.1 GB, shmem 11.6 GB, file 25.8 GB, memory.events 0, load 35.

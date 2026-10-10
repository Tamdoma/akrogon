# Rebuttal, slot C

## #63

- R1 (merged line 4, "not proven that the removed worktree held them at merge", A,B). It is proven by the green gate. At `2ccc39534` the test does `cpSync(STAGE11_SCAFFOLD, tmp)` then `copyFileSync(..., tmp/src/data/_approved/services/<slug>.json)` and `copyFileSync(..., tmp/src/pages/services/[...slug].astro)` (framework composition-spine.test.ts:1444-1456 at that commit). `copyFileSync` throws ENOENT when the destination directory is missing, which is exactly the clean-checkout failure. The scaffold tracks nothing under those paths (`git ls-files`). The only way the gate passed in the worktree is that the scaffold copy source held those directories on disk. No further proof is needed.
- R2 (G2, B's pick). Beyond cost: G2 catches no evidenced case that G1 misses. The ignored-file class has zero cases (merged line 6), and the empty-folder case is removed by one git call. A fresh-checkout lifecycle per attempt on the serial slot is paid for a class with no occurrence. B's own pitfall (gate certifies the wrong SHA, line 14) applies only to G2.
- R3 (placement, line 13, A's move() site). `move()` is skipped for a solo holder: src/batch.ts:124 `if (record.solo !== true) await move(...)`. So a clean in `move()` never runs in solo mode, and solo is the mode where B rebases by hand in the same long-lived worktree. mergeTurn (src/next.ts:1037-1050, both the applied and the `solo` prompt pass through it) is the one site that covers both.

## #69

- R4 (H2, B's one bounded idle-vs-loaded comparison). The named flakes are rare: one deploy EPIPE per 36 hours, one zombie stall, timeouts three times in 34 attempts (#207). One comparison of one revision under one artificial load most likely shows nothing either way, which is what happened with #53 (test-runs forks/timeout-cause.md Taken: three parallel post-fix runs at idle, noon runs never traced). Per-gate recording costs two shell lines and collects the number at the exact run that bounced. It is the only form that can answer the seed's own "would disprove" line.
- R5 (split, line 32, A's one akrogon destination for #69). The named flake fixes are framework test code (timeouts, EPIPE retry, isolate zombie, #208 lane race). Akrogon leaves cannot own them, and nothing in akrogon removes them. An akrogon-only destination leaves #69's observed bounces in place.

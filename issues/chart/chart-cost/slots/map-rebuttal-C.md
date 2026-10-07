# Rebuttal C on map-merged.md, 2026-10-06

Disagreement only. Points not listed are accepted, including A's correction of my F7.

R1. Correction accepted, with its reach stated. Re-counting with one usage record per `message.id` (streamed records repeat usage per content block) gives A output of 142,291 (seed-root-cause), 181,468 (merge-turn), 108,538 (leaf-readiness), 137,592 (leaf-run-stalls), with `output_tokens_details.thinking_tokens` at 22%, 34%, 26%, 33%. My 80% figure was wrong. The same duplication inflated every raw token column in my T1 table and my C figures (C dedup: seed-root-cause 72,128 out, merge-turn 110,021, retro-concepts 30,520, fbaaa537 95,981). Ratios between charts hold because the duplication factor is 2.1 to 2.4 on every session, so F1 (no step change) and the merge-turn-versus-seed-root-cause comparison stand. The merged map should state that any token figure drawn from map-C.md's tables is raw and roughly 2.2 times the deduplicated value.

R2. M1's "13-14k A output tokens per fork" for seed-root-cause does not match the deduplicated count: 142,291 over 5 forks is about 28k per fork, 14k only if divided by the 10 operator-visible round texts (5 rounds plus 5 eli rewrites). Per fork is the unit the operator asked about. Same for merge-turn: 181,468 over 4 forks is 45k per fork, so merge-turn is still about 1.6 times seed-root-cause per fork after dedup.

R3. M4 ranks C as the largest dollar item on two charts without B's dollars. B's measured volume on the same two charts is 6.2M and 8.9M input tokens (94-97% cached) with 23k and 37k output plus 3.7k and 9.1k reasoning tokens (codex `token_count` records). Until B is priced, "largest" is unproven for the three-slot bill; the claim should read "C costs more than A on the two 10-05 charts, B unmeasured".

R4. Fog entry "A's effort setting (C, weakened by the correction)" is right to weaken it, but the ordering of K1 should then not carry effort at all: with thinking at 22-34% of A output and output at 28% of A's bill (M5), A's effort is worth at most 6-10% of A's cost. K2 (one rendering, M6) and K3 (peer packet, M7) address larger shares: M5 says text entering context is paid as output and again as cache write, and the three renderings plus the eli rewrite are exactly that text.

No other disagreement.

# Territory map, merged (A, B, C), 2026-10-06

Tags name the slots that reported the point independently.

## Reasons, measured

M1 (A,B,C). No step change at 10-04. seed-root-cause (10-05 morning, after every chart commit in the window) ran about 4 minutes and 13-14k A output tokens per fork. The 10-02 charts were slower (7-9 minutes per fork) at the same A output.
M2 (C, A's timeline agrees). merge-turn (10-05 evening) is the slow, costly chart, for five session-specific reasons: C sat 9 minutes because A inlined a 1,936-character brief that C's harness treated as pasted content; the opening map carried outside practitioner research and came back 2.5 to 3 times larger; the off-menu answer `1d` added a shape check and a rebuttal; a network outage cost about 30 minutes inside a foreground wait; the handoff was the heaviest span.
M3 (A,B,C). 7bac4c1 (10-04) adds work per round and no phase. After it, C fork files average 10-14KB against 2.5-11KB, merged files 5-8KB against 1.4-5.6KB. Its isolated cost is unmeasured (fork difficulty confounds; retro-concepts after the commit stayed small).
M4 (A). Peer C on claude-fable-5-1 is the largest dollar item: $11.37 and $18.84 for the two 10-05 charts against A's $11.20 and $12.92 (cost-state records). Fitted from recorded costs, Fable output costs about 2.2 times Opus 5.5 output. C has run on Fable since 10-01. B's dollars are unmeasured.
M5 (A). A's cost by token class, fitted from 30 recorded Opus sessions: cache write 38%, cache read 34%, output 28%. Text that enters context is paid as output and again as cache write.
M6 (A,B; eli part A,B,C). A writes each round three times (slot A file, merged file, operator round), and the operator asks for an eli/elid rewrite after nearly every round, a fourth copy.
M7 (B,C). Peer context grows all session: B's late final check read 347k input tokens to return 186.
M8 (A). The door hits the context limit and compacts twice per chart, then re-reads the skill files (55-71k cache-write tokens each time).
M9 (C; B agrees it is not between-fork time). Handoff grew with 97435f1 (10-02): needs sheet, grants, fixture and save proofs, presence check.
M10 (A,B,C). The seed-issue commits changed only skills/seed-issue/SKILL.md. Their effect on the door is a longer intake. peer-wait.ts costs no tokens and returns faster than the loops it replaced.

Correction (A on C's F7 and T1 table): C's "A out tokens" column sums duplicate transcript lines (319,168 against 142,291 deduplicated for seed-root-cause). Thinking is 21-34% of A's deduplicated output (thinking_tokens field), not 80%. A's effort setting is a smaller lever than C stated.

## Forks, in the order A proposes to take them

K1 cut-boundary (A,B,C). Which internals may change under the lock: full peer rounds or short positions, rebuttal always or only on disagreement, and which model C runs on.
K2 one-rendering (A,B). A stops writing the round three times.
K3 peer-packet (B,C). File-delivered one-line briefs and a bounded per-fork packet.
K4 plain-first-round (A,B,C). The first round is already in the operator's eli register.
K5 map-research-volume (C). Bound outside research in the opening map.
K6 handoff-script (B,C). One script for presence checks and proofs.
K7 off-menu-answer (C). A new operator option becomes a next-round question or keeps the final-shape check.
K8 proof-of-saving (B,C). How the saving is measured per fork across at least three charts.

Fog: stuck-peer detection in peer-wait.ts (C), compaction pressure (A), A's effort setting (C, weakened by the correction).
Off route (A,B,C): reverting 7bac4c1, 97435f1 or the seed-issue commits; dropping peers or blind rounds.

## After rebuttals
- B R1 accepted: M1 reads "these measured sessions do not show a uniform step increase after 10-04; a general causal effect remains unmeasured".
- B R2 accepted: the script moves polling out of model turns; invocation and result overhead remains and is unmeasured.
- B R3 accepted: the seed commits changed only seed-issue; their indirect chart cost through richer intake is unmeasured.
- C R1 accepted: token figures in map-C.md tables are raw, about 2.2 times the deduplicated value.
- C R2 accepted: 13-14k is A output per answer-to-next-round cycle. Whole chart divided by forks is about 28k (seed-root-cause) and 45k (merge-turn), so merge-turn is about 1.6 times per fork.
- C R3 accepted: M4 reads "C costs more than A on the two 10-05 charts; B's dollars are unmeasured".
- C R4 accepted: A's effort is worth at most 6-10% of A's cost and stays in Fog.
- A, measured after merge: 78 of 81 past fork rebuttal files carry a disagreement (3 say none), so skipping rebuttals on agreement moves to Off route.
- Operator double-check 2026-10-06 (A, not peer-reviewed), replaces M10's first two sentences: the seed-issue commits changed no chart skill text, and they reach the door only through seed text copied into INTAKE.md. One chart has received a new-format seed: merge-turn (Tamdoma/akrogon#57), whose Suspected cause section is 2,066 of 6,589 intake bytes and whose B and C maps were 31KB and 28KB against 9KB and 14KB on seed-root-cause. The 55 framework seeds #123-175 carry no Suspected cause or Related reports section.
- M11 (A, not peer-reviewed). Slot B's reasoning effort sets B's time per turn. Codex transcripts 2026-10-01 to 10-06, median minutes per B turn: medium or unset 1.1 to 2.1 (sessions 11de50, fe6a69, 939a36, 63142b), high 3.9 to 5.3 (903a12, fa5a6d, c2f85d, 57eb2a, 5ec723), xhigh 7.9 (61e976). High was as slow on 10-02 as on 10-06. ~/.codex/config.toml sets model_reasoning_effort = "high" and was last edited 2026-10-04 14:47 local. In the framework door the median peer wait per exchange went from 2.8 minutes (session 8e8cf4d5, B unset) to 7.3 minutes (b689b695, B high).

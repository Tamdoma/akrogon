# Peer exchanges to keep when B is named (C, blind)

## Evidence

Framework charts, `issues/chart/*/slots` (14 charts with peer files):

| Item | Count |
|---|---|
| Rebuttal files (map + per-fork + leaf review) | 28 |
| Rebuttals with substantive corrections | 27 (only `landing-scope-rebuttal-B.md` says "No disagreements") |
| Numbered disagreements per rebuttal, typical | 2 to 8, 180 to 1000 words |
| Final-shape check files | 1 (`satellite-update-loop/slots/final-check-B.md`, 1184 words, real findings) |
| Words in B round files (`*-B.md`, excluding rebuttal/final/review) | 81,466 |
| Words in A round files | 14,653 |
| Words in merged files | 16,334 |

Reading: every exchange type earns its place. The per-fork rebuttal is not rare in framework and corrects the merge almost every time. The cost is not the number of exchanges but B's output size: B writes a complete operator round per fork (`questions.md:48`, "The returned B file is a full round, not a reaction to A"), then A rewrites it into the merged round. Output tokens are the expensive token; B's 81k words are output that is consumed once by A and never shown to the operator.

## Recommended: keep every exchange, shrink B's return to evidence

Keep the blind map, blind per-fork round, merge with tags, rebuttal, final-shape check and leaf-draft review exactly as scheduled at `SKILL.md:35,47,57`. Change only what B returns per fork.

Prose change, `assets/questions.md:48`, last sentence. Remove "The returned B file is a full round, not a reaction to A." Replace with: "B returns, per question, its research line, recommended option with its one reason, and pitfalls, in plain prose; A owns the round shape."

`assets/questions.md:27`, "Every round uses this shape, on every harness and at every effort level" stays, since it governs the operator-facing round. Add no new words.

`SKILL.md:47`, "merges the completed independent rounds" becomes "merges B's return", so the skill and the asset agree.

Effect: B's per-fork output drops from a full formatted round to the three parts A actually merges. A's merge input shrinks the same amount. Rebuttal, tags and blindness are unchanged, so the 27 of 28 correction rate is preserved. This removes one paragraph's worth of duplicated shaping rather than adding any rule.

Pitfalls: a B return without the research line loses tier attribution, so the research line stays required. B still reads the same inputs (`questions.md:48` first sentence), so no blindness change.

## Alternatives

**O2. Map and leaf-draft review only, no per-fork exchange.** Saves one B session per fork. Rejected on the framework count: 14 per-fork rebuttals, 13 substantive, and the akrogon-only figure in `process-review-claude.md:59` (one rebuttal across 18 charts) reflects akrogon charts mostly run without B, not a low yield.

**O3. Status quo.** Keeps 81k words of B output per 14 charts that the operator never reads. No reliability gain over the recommendation.

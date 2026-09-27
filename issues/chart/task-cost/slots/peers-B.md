Research: **operator**, `forks/chart-peer.md`, Taken: B and C must conduct original research and return evidence, recommendations, alternatives and risks. **Better-than-training**, `skills/chart-issues/assets/questions.md:44`: the operator supplies the peer pane. `:48-50` currently describes two participants. The [article](https://claude.dev/blog/what-a-task-costs-on-opus-5-5/) supports judging additional agents by task benefit, not assuming parallelism saves total cost.

**O1 — recommended:** Accept any operator-named peers with identical responsibilities. A remains coordinator. Keep one common merge and one rebuttal per peer, not pairwise debates. The operator chooses the count. This generalizes the existing process without a new selection mechanism and directly answers the request for both B's and C's original research.

**O2:** Let A select peer count by predicted benefit. Avoids some duplication but introduces a discretionary selection policy and can omit research the operator expects. Reject as the default.

**Risks:** More peers add research/output cost and wait for the slowest return. Independent research can use the same sources, but must not reuse another participant's conclusions. Attribution must preserve minority disagreement rather than imply consensus by vote.

**Exact prose changes:**

- `SKILL.md:23`: replace its first clause with “In the first reply, name every operator-supplied peer label and pane, or say single slot;”.
- `questions.md:42-44`: rename heading “Blind peer exchange”; replace the first sentence with “The operator supplies the peer labels and panes and chooses their count; the door does not add peers.” Apply the existing readiness instructions to each peer.
- `questions.md:46-50`: use peer labels in distinct output paths. Replace the exchange description with: “A and every named peer research independently from the same inputs, without reading others' current findings. Each peer returns evidence, recommendation, alternatives and risks. After all return, A writes one merge with explicit contributor labels, such as (A, C). Every peer checks that merge once and returns disagreements. A incorporates all rebuttals into one operator round, retaining unresolved disagreements.” Preserve late-change checks for every peer.
- `SKILL.md:35,47,55,57` and `questions.md:40`: replace B-only/two-slot wording with every named peer, retain independent A research, and require each peer's late-change and leaf-draft review. Replace `(both)` with explicit contributor labels throughout.

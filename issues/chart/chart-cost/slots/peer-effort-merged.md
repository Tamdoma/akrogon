# peer-effort, merged round (A, B, C)

This round settles how hard helper B thinks before it answers. That setting is the biggest measured difference between your fast and your slow framework chart. It also checks one thing I may have misread in your last answer.

### 1 · How hard should B think on chart work?

Codex has a setting called reasoning effort. Your codex config file (`~/.codex/config.toml` line 2) says "high", so every codex pane started without its own setting runs at high. In past charts a typical B turn at high took 4 to 5 minutes and 6 to 11 thousand tokens. At medium it took 1 to 2 minutes and 2 to 3 thousand. Those are middle values from different charts, so single turns vary. B takes at least two turns per question, and I wait for each one.

Research: better-than-training · codex transcripts in ~/.codex/sessions/2026/10, measured 2026-10-06 by A and separately by C · the typical high turn costs 2.5 to 4 times the time and tokens of the typical medium turn, on 10-02 as on 10-06 · it points at effort, not the seed update, for the framework wait, without proving it on matched tasks. better-than-training · OpenAI reasoning guide, https://developers.openai.com/api/docs/guides/reasoning, read 2026-10-06 by B · medium suits research and judgment, high is for complex tasks and should be compared first · medium is a starting choice, not proof of equal quality.

- **1a (recommended)** (A,B,C) Medium, given in the command that starts B's pane: `codex -c model_reasoning_effort=medium`. Your config file stays at high for your other codex work. Nothing is written into the skill. It wins because it is the one setting tied to B's time and tokens, and it touches nothing else. Cost: you must give the flag at every chart launch, and nothing warns you before the chart starts if you forget. The size of the saving and whether high finds more real problems are both unmeasured on the same task.
- **1b** Medium by setting the config file back to medium. No flag to remember. Cost: all your other codex work drops to medium too. This fits only if you set high for chart work in the first place, which C asked and nobody but you knows.
- **1c** High, as the framework chart runs now. Cost: about 4 more minutes of waiting per question.

Pitfalls avoided: an effort value written into the skill against your "don't hard code it" is removed by recording this as your practice with no leaf (A,B,C). A forgotten flag is removed by 1b. Under 1a it is only seen afterwards in the per-chart record that the later proof-of-saving question sets up, and whether the door should show each helper's effort when a chart opens is carried to that question (A,C). That record shows which settings a chart ran with, and it cannot split the effect of effort from the effect of the notes format when both change (B). Medium missing a hard problem is reduced by C and the rebuttal step, and high stays your choice for a hard chart (B).

### 2 · When you said the helpers should not criticize my inputs, did you also mean the rebuttal step?

There are two steps. In step one a helper works blind and never sees my work. That stays, and I removed the part of the note where it could comment on my question. In step two, after I merge, each helper reads my merged text once and lists only what it thinks I got wrong. A helper also reads my text in the quick check after you change something in an answer. Those two are the only places a helper criticizes my text.

Research: better-than-training · slots/map-merged.md "After rebuttals" and past chart rebuttals, counted 2026-10-06 by A and C · all 7 rebuttal points on this chart's map were accepted as corrections, and 78 of 81 past rebuttals carried a disagreement · the rebuttal is where my mistakes get caught before you see them.

- **2a (recommended)** (A,B,C) The rebuttal and the quick check stay as they are. Your condition applies to the blind step only.
- **2b** The rebuttal goes. It saves two helper turns per question, about a minute in total at medium. Cost: nobody checks my merge before you read it, and it changes how the door works.

Pitfalls avoided: me misstating a helper is reduced by the rebuttal under 2a, since a helper can still miss it (B). Under 2b nothing catches it, which is 2b's cost.

Reply `1a 2a`, or a numbered free-text answer.

Challenge check
No helper disagrees with a pick. B warns that the 2.5 to 4 times figure compares different charts, so treat it as a likely saving and not a promise. The first trial of the notes format on this question showed no saving in time or tokens for B or C, which the proof-of-saving question has to explain before notes are called a win. Under 1a nothing catches a forgotten flag at launch (C).

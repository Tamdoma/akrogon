# peer-effort, A's position (written before reading B or C)

Q1. Pick: medium for slot B on ordinary door rounds, set by the operator when the pane starts (`codex -c model_reasoning_effort="medium"`, codex-cli 0.160.1 `--help` line 44), nothing written into the skill. Reason: B's turn takes 1.1 to 2.1 minutes at medium against 3.9 to 5.3 at high (map-merged M11), about 4 minutes less wait per exchange. Cost: whether high finds more real defects is unmeasured.
Rejected: high everywhere (pays 2.5 to 3 times the wait on every fork for an unmeasured gain). xhigh (7.9 minutes per turn). Hard coding an effort in the skill (operator 2026-10-06: "don't hard code it anywhere").
Evidence:
- better-than-training · codex transcripts ~/.codex/sessions/2026/10, read 2026-10-06 · M11 timings by effort.
- better-than-training · B files by effort, read 2026-10-06 · median bytes at unset against high in framework charts: rounds 11.8KB and 14.5KB, rebuttals 1.5KB and 3.8KB, final-shape checks 2.0KB and 9.7KB. High adds most to rebuttals and final checks. Charts differ, so usefulness of the extra text is unmeasured.
- better-than-training · OpenAI reasoning guide, https://developers.openai.com/api/docs/guides/reasoning, search result read 2026-10-06 · lower effort favors speed and token use, higher favors deeper analysis; medium is the default.
Pitfalls:
- A global config edit changes every later pane without anyone deciding it (config.toml went to high on 10-04). Removed by passing effort per pane at launch, or reduced by the door stating each peer's model and effort at open.
- Medium missing a defect high would catch. Reduced by C and the rebuttal step; removed only by measuring, which belongs to proof-of-saving.
Missing question: should the door state each peer's model and effort at open, read-only, so a slow setting is visible before the first fork?

# Peer effort

## Question
Q1. Which reasoning effort should slot B run at for chart door work?

### Carries
- Lock (operator 2026-10-06, verbatim): "cutting down the costs and optimizing the process without necessarily changing how it works because I I actually do like the new way it works."
- Lock: peers B and C, blind independent work, one fork per round, rebuttal after merge and the operator round shape stay.
- Operator 2026-10-06 on slot C's model, verbatim: "But don't hard code it anywhere, this is what I will do internally moving forward."
- Measured (slots/map-merged.md M11): median minutes per B turn by effort, codex transcripts 2026-10-01 to 10-06: medium or unset 1.1 to 2.1, high 3.9 to 5.3, xhigh 7.9. High was as slow on 10-02 as on 10-06. In the framework door the median peer wait per exchange went from 2.8 minutes (B unset) to 7.3 minutes (B high).
- `~/.codex/config.toml` line 2 sets `model_reasoning_effort = "high"`, last edited 2026-10-04 14:47 local. This chart's B runs at medium.
- Codex transcripts: `~/.codex/sessions/2026/10/<DD>/*.jsonl`; `turn_context.payload.effort` holds the effort, `token_count.info.last_token_usage` the tokens. Past B files: `issues/chart/*/slots/*-B.md` and `*-rebuttal-B.md` in this repo and in /home/ivan/Work/infra/tamdoma/framework.
- Related forks, not yet written: one-rendering, peer-packet, plain-first-round, map-research-volume, handoff-script, off-menu-answer, proof-of-saving.

## Findings
- better-than-training · codex transcripts ~/.codex/sessions/2026/10, read 2026-10-06 by A and separately by C · per B turn: high 3.9-5.3 minutes and 6.3-10.7k output tokens with 34-49% reasoning, medium or unset 1.1-2.1 minutes and 1.7-3.3k with 15-25% reasoning, xhigh 7.9 minutes and 12.3k · high costs 2.5-4 times the time and tokens per turn, on 10-02 as on 10-06.
- better-than-training · ~/.codex/config.toml:2, read 2026-10-06 by A, B, C · `model_reasoning_effort = "high"`, file last edited 2026-10-04 14:47 local · a codex pane started without its own effort runs at high. The edit time does not prove what changed then (B).
- better-than-training · codex-cli 0.160.1 `codex --help` line 44, read 2026-10-06 by A · `-c key=value` overrides a config value for one launch · effort can be set per pane with no code change. questions.md:44 already asks for each created peer's arguments (C).
- better-than-training · OpenAI reasoning guide, https://developers.openai.com/api/docs/guides/reasoning, read 2026-10-06 by B · lower effort favors speed and token use, medium suits research and judgment, complex tasks warrant comparing medium and high · medium is a starting choice, not proof of equal quality.
- better-than-training · B files in framework charts, read 2026-10-06 by A · median bytes at unset against high: rounds 11.8KB and 14.5KB, rebuttals 1.5KB and 3.8KB, final-shape checks 2.0KB and 9.7KB · high adds most to rebuttals and final checks, usefulness unmeasured.
- Unmeasured: B's dollars at any effort, and B's quality at medium against high on the same fork (B, C).
- Rebuttals accepted (slots/peer-effort-rebuttal-B.md R1 to R4, -C.md R1 to R3): timings are medians across different tasks and the saving is unmeasured on matched tasks; a record shows settings and does not separate effort from note format; the final-shape check is a second place a peer reviews A's text; 1b came from C's open question, not C's pick; a forgotten flag is not caught at launch under 1a; the rebuttal saves about a minute per fork in total.
- Peer notes: slots/peer-effort-A.md, -B.md, -C.md. Merge: slots/peer-effort-merged.md.

## Taken
Operator answer to round 2 (slots/peer-effort-merged.md), verbatim, 2026-10-06: "1 - okay, But we are not hard coding into the Acrogon system any models, so I will just remember to do it when I tell you what slot B should be, okay? | 2a"

- Q1: 1a as operator practice. The operator gives slot B's effort when naming or starting the pane. No model or effort is written into the skill, config or docs, and no leaf comes from this fork.

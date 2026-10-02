# Implement mode Q1, slot C

Blind round, 2026-10-02. Sources: repo files, `issues/log.jsonl`, the two Claude-seat transcripts under `~/.claude/projects/`.

## 1. What each mode makes A do

- The setting is one repo-wide enum, default `subagents` (`src/config.ts:34`, set at `issues/config.yaml:6`). No code branches on it. Only skill text reads it.
- `subagents`: A writes one sub-brief per unit, "one unit included", gives each worker its own worktree, runs each wave whole with up to 3 workers, and waits on all (`skills/implement-issue/SKILL.md:49`, `worker-protocol.md:7`, `:11`). Workers run only the changed-tests command. Criterion proof and every `checks` command stay with A (`worker-protocol.md:25`). A red proof becomes one more sub-brief (`worker-protocol.md:27`).
- `inline`: A implements the plan itself in wave order, with no worker, sub-briefs or mismatch returns (`SKILL.md:49`, `:51`). A repairs failures itself (`SKILL.md:59`, `:71`). End-of-implement proof and checks are the same in both modes (`SKILL.md:59`).
- Fresh agent: no skill line requires one in either mode. The realistic-review-bar case came from that leaf's own plan (`issues/closed/review-bar/realistic-review-bar/plan.md:18`, criterion 7 needs "a separate agent that wrote none of this leaf"). Inline would still need that one agent when a plan asks for it. I did not measure its cost.

## 2. Claude-seat measurement

Two leaves, four passes, both prose-only skill edits, both on 10-01. Each leaf has a first pass that ended in `failed` on a test red at base, then a second pass that only reran checks.

| Code | Leaf | Total | Worker cost | Checks | Parent model and other |
| --- | --- | --- | --- | --- | --- |
| L1 | wave-table (3 units, 3 workers) | 345 s | about 62 s (18%): 38 s worktrees and briefs, 20 s wait, 4 s cherry-pick | 225 s (65%): 81 s + 144 s | about 58 s |
| L2 | proof-order (1 unit) | 480 s | 0 s | 410 s (85%): 80 + 122 + 63 + 145 s | about 70 s |

- F1. In L2 the seat edited the files itself (6 Edit calls in 5 s, no Agent call) although config says `subagents`. The one-unit worker rule was not followed and nobody flagged it.
- F2. Claude workers are fast. Three workers finished in 12 to 22 s. The old pi workers took 10 to 29 min per unit. The 57-59% worker share does not carry over to this seat.
- F3. Estimate for L1 with the 10 s suite: checks drop from 225 s to about 25 s, total about 145 s (58% less). Inline on top saves at most the 62 s worker cost minus the time to make the edits itself, about 40 s more. For L2 the suite takes 480 s to about 95 s and inline saves nothing.
- F4. This is not enough to decide. Two leaves, no src change, no multi-wave leaf, no repair pass. It is enough to say the suite is the cost on this seat and workers are not.

## 3. Sources (read 2026-10-02)

- S1. Anthropic, "How we built our multi-agent research system", 2025-06-13. https://www.anthropic.com/engineering/multi-agent-research-system. "Most coding tasks involve fewer truly parallelizable tasks than research." Multi-agent uses about 15 times the tokens of chat. Does not cover wall time or small coding tasks.
- S2. Cognition, "Don't Build Multi-Agents", 2025-06-12. https://cognition.com/blog/dont-build-multi-agents. Subagents lack each other's context and make conflicting decisions. A single-threaded agent avoids that. No measurements, and it predates the current models.
- Neither source measures one agent against subagents on small edits. I found none that does.

## 4. Options and recommendation

- O1 repo-wide `inline`. One operator line, reversible. Saves about 40 s on a 3-unit prose leaf by this data. Loses parallel waves on larger leaves.
- O2 keep `subagents`. No change. Costs about 1 min per small leaf.
- O3 per-leaf mode. New mechanism, new plan field, new skill text.

Recommendation: O2 for now. Build the 10 s suite first, then look at the next 5 or more Claude-seat leaves including at least one src leaf. Move to O1 only if worker cost is then a large share. Do not build O3. The measured gain is under a minute per leaf and the old numbers that motivated it came from a harness that is no longer in the seat.

Pitfalls:

- P1. Inline puts every unit in one context. leaf-temp-dir was 4 units and 478 lines (`issues/log.jsonl`, 2026-10-01T11:30). Inline loses the 3-way wave on such leaves, which the wave-table leaf just built (`worker-protocol.md:11`).
- P2. Inline drops sub-briefs and mismatch returns (`SKILL.md:51`). Those are the only written record of what each unit was told to do. Review independence itself is unchanged, since B reviews blind in both modes.
- P3. "Inline has no worker" (`SKILL.md:51`) does not say whether a plan-required separate agent, as in realistic-review-bar, is still allowed. O1 needs that sentence clarified or such a criterion cannot be proven.
- P4. Repair text differs by mode (`SKILL.md:71`). The reviewer-repair lock moves most repairs to B, so the mode matters less for repair than it did.
- P5. F1 shows the seat already skips workers on a one-unit leaf. Either the "one unit included" clause at `SKILL.md:49` is wrong for this seat or the seat broke it. That clause is the cheap fix if the operator wants small leaves inline: drop "one unit included" through a leaf, with no new mechanism and no config change.

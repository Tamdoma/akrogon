# Merged: implement mode

## Surface
- One repo-wide enum, default `subagents`, set at `issues/config.yaml:6`; no code branches on it, only skill text reads it (`src/config.ts:34`, `skills/implement-issue/SKILL.md:49,51,71`). (A,B,C)
- Subagents: one sub-brief per unit "one unit included", up to 3 workers per wave, own worktrees, picks. Inline: A works in wave order, no briefs or mismatch returns. Final proof and every `checks` command are the same in both modes. (A,B,C)
- A plan-required separate agent (realistic-review-bar `plan.md:18`, `brief.md:21`) stays in either mode. Its proof agents took about 9 min there (B). `SKILL.md:51` "Inline has no worker" does not say such an agent is still allowed (C).

## Measured (Claude seat)
- Only 2 leaves, 4 passes, both prose edits on 10-01. Not enough to decide a repo-wide mode. (A,B,C)
- Checks were 77% of the 824 s (B; C 65% and 85% per leaf). Four full suites at 79-81 s. Workers were 22.7 s, 2.7% (B); about 62 s with briefs, worktrees and picks on wave-table, 18% (C).
- With the 10 s suite the four passes drop to about 547 s (B). Inline would save at most about 40-55 s more on wave-table and nothing on proof-order (B,C). B: no positive lower bound, serial units can make it slower.
- proof-order (1 unit) was edited by the seat itself despite `subagents` and the "one unit included" rule; nobody flagged it. (B,C)
- Old pi workers took 10-29 min per unit; the 57-59% worker share does not carry over to the Claude seat. (C) A's blind view relied on that old share.
- Leaf size, 30 akrogon leaves since 09-25: 20 under 60 changed lines, 3 over 400. (A)

## Sources (read 2026-10-02)
- Anthropic, multi-agent research system, 2025-06-13: coding has fewer parallel tasks; about 15x tokens. No wall-time or small-edit data. (B,C)
- Anthropic, Building effective agents, 2024-12-19: start simplest; orchestrator-workers for complex multi-file coding. (B)
- Cognition, Don't Build Multi-Agents, 2025-06-12: subagents lack shared context. No measurements. (C)
- No source measures one agent against subagents on small edits. (B,C)

## Options
- O1 repo-wide inline: one operator line, reversible, under 1 min saved per small leaf by this data, loses parallel waves on big leaves. (A held it blind; B,C against for now)
- O2 keep subagents, recommended (B,C): land the fast suite first, then look at 5+ Claude-seat leaves including src work and switch to O1 only if worker time is then large.
- O3 per-leaf mode: decline (A,B,C).
- O4 drop "one unit included" at `SKILL.md:49` so one-unit leaves run inline (C, pitfall P5). Skill edit, matches what the seat already did.

## Pitfalls
- Inline puts every unit in one context and loses the 3-way wave on big leaves like leaf-temp-dir (478 lines) and slow-run overlap (`SKILL.md:42`). (A,B,C)
- Review independence is unchanged in both modes. (A,B,C)
- Never read "no worker" as "no fresh acceptance agent". (B,C)

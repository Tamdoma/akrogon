# Intake: grounding-standard

## Scope
Set one grounding standard for akrogon and every repo it initializes: the operator guide lives in `docs/guide/`, the planner index lives at `docs/reference-index.md`, and each area that the index cannot describe in one line gets a short area file that planners read and implementers keep current. One issue, leaves proposed in the handoff batch.

## Provenance
- Operator: charting-claude session, 2026-09-11

## Source: operator charting-claude 2026-09-11
> I was wondering why is there no grounding in this repo? There is no reference index at all and there is no grounding at all in the skills. why?

> Do we have anything in the skill that would make it write better documentation inside of some other more complex repo?

> Now I think we need to set a standard. So the website guide it should go into docs forward slash guide. The reference file has to go into the docs folder and it should be renamed to reference-index.md. And then we should implement the useful paths, step four I think.

> Okay, but who is gonna update those helpful files and add new ones? We need a simple, easy to maintain solution for this. without increasing the machinery or the number of skills or whatever.

> Okay, let's chart in.

## Agent findings
Live surface, inspected 2026-09-11:
- `REFERENCE.md` at the root is 9 lines, one link per folder. `issues/config.yaml` names it in `grounding.index`. README line 31 links it. `docs/setup.html` line 74 shows it as the default. `skills/init-issues/SKILL.md` line 32 proposes it as the default for new repos. No code reads the name.
- No area documents exist. `src/`, `tests/`, `plugin/` have no README. `docs/` is the operator HTML guide, 16 pages linking each other by relative name plus `style.css`. Four Playwright specs under `tests/browser/` resolve `../../docs/`. GitHub Pages is not configured for the origin.
- Skills that read grounding: chart-issues line 27 and plan-issue line 23 read the index, linked areas and LESSONS.md. implement-issue line 27 updates affected docs and area index entries and opens the index only on a gap. check-issue and merge-issue exclude LESSONS.md from pass input. init-issues line 56-58 writes only the top index and forbids area documents.
- 8 of 30 closed plans cite a read-first list built from the index. The rest built their list from code and leaf briefs.

External research, 2026-09-11, tiers per chart-issues:
- Tier 2, ETH Zurich AGENTS.md study (arxiv 2602.11988): repository overviews in context files gave no localization speedup; LLM-generated files cost +20% with -0.5 to -2% success. Developer-written +2.4%, not significant.
- Tier 2, SMU AGENTS.md efficiency study (arxiv 2601.20404): 124 PRs, median runtime -28.6%, output tokens -16.6%, completion comparable.
- Tier 2, Khatri ablation (arxiv 2607.27250): correctness flat; selective on-demand topic files cut cache-creation tokens on Claude, ~24% wall clock on one repo.
- Tier 2, McMillan factorial (arxiv 2605.10039): nested vs single instruction file, size and position had no compliance effect.
- Tier 2, Williams probe-tuned guidance (arxiv 2606.20512): small model 25.5% to 33.0%; content that worked was 47% procedural rules, 30% specific file and module references, 23% quality gates.
- Tier 1, Meta engineering 2026-04-06: 59 per-module files of 25 to 35 lines (Quick Commands, Key Files, Non-Obvious Patterns, See Also), every path verified, ~40% fewer tool calls and tokens per task.
- Tier 2, Anthropic Claude Code docs: keep files under 200 lines, trim content derivable from code, per-directory files drift and nobody owns them.
- Interpretation: area files are a cost lever of roughly 20 to 40% on repos the agent cannot read in one pass, not a correctness lever. Value is in commands, exact paths and non-obvious patterns. Overviews and folder listings cost tokens for nothing. Drift is the known failure and mechanical path verification is the only mitigation with evidence.

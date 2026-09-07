# Session summary: akrogon-new-beginning

Written 2026-09-07 late evening by helper-claude, before a /clear. Read this and `INTAKE.md` first. Dense on purpose.

## Context

- Session: fork of the `helper-claude` monitoring session in `/home/ivan/Work/infra/akrogon/mechanics`, renamed `akrogon-new-beginning`. The parent session keeps monitoring the akrogon machinery with helper-codex. This session only explores the rebuild idea and maintains the intake.
- Rules: no edits to machinery files, no git mutations in the akrogon checkout, no duplication of the parent session's work. All output goes to `/home/ivan/Work/infra/akrogon/new-beginning/` (untracked, operator-authorized). Do not create `akrogon-new` yourself; give the operator commands.
- Codex peer: pane `w5:pFC` (tab akrogon, cwd mechanics), operator-directed for independent checks only. Address as `helper-claude: ...` via `herdr agent prompt`. Never put the literal string ".env" in a Bash command.
- Style: eli, plain, short, most important last. No bullets or codes inside INTAKE.md.
- Settings change made this session: `~/.claude/settings.json` env `EDITOR` changed from `code --wait` (VS Code, not installed, broke Ctrl+G) to `omarchy-launch-editor --inline` (Omarchy default, falls back to nvim). Backup at `settings.json.bak.editor`.

## The idea

Rebuild the issue machinery in a new infra repo `akrogon-new` from the July 28 skills (commit `2f1fdbc3` of `tamdoma/issue-lifecycle`, last before automation). Keep the debate model: slots A and B, blind positions, one rebuttal, synthesis by the executing slot, fidelity audit by the other, decision IDs, phases P-draft P-synth I-draft I-synth I-ready C-ready C-fix D-merge. Keep the current intake skills: chart-issues (non-negotiable), create-issue, consolidate-issues, seed-issue. Add a very thin herdr driver that types the skill commands the operator used to type by hand. No reconciler, judge, proof formats, coverage, merger tab, park and unpark, harness test tree. Decisions are made in a `/chart-issues` session in the new repo; `INTAKE.md` is its user-owned input (`issues/chart/INTAKE.md`).

## Files in new-beginning/

- `INTAKE.md`: the one living document, 261 lines, first-person prose in the operator's voice, one line per paragraph, headings only, nothing decided. Sections: Where I am (What the last month taught me, The hierarchy, Fixing the fixer); What I had a month and a half ago; The two bad examples (old repo, current repo, What the logs say, How long the stalls lasted, What I take from it); What I like (The overview without the reconciler, The config file); The fear about complexity (The software factory mistake, No loop no state); The idea (Where I want to be in the loop, Planning and implementation one debate or two, Memory is the files, Two agents at the door, Not every issue deserves a debate, The seed problem); Bloat and watchdogs (Skill files as entry points, Rewriting for the new models, Can herdr do this alone, The simple thing I actually want); Rereads; Testing; Grounding and documentation (Levels of index instead of one list); Quality (Fidelity audit, Implementer self-check and QA reviewer, Advisory pass, The challenge on advisory, Ponytail); Learning; Cost quality speed (Compaction instead of clearing); Layout; What others do; Things I do not know; Notes as they come.
- Split rule agreed: keep one file until about 400 lines or 20,000 words; chart-issues names exactly one input path and does not promise to follow links.
- `slot-ab-jul28/skills/`: 27-file July 28 snapshot, 1,852 SKILL.md lines, 3,970 payload TS lines, 0 tests. Payload scripts never name claude or codex; only install roots (`~/.claude`, `~/.codex`, `~/.pi`) are vendor-named.
- `braindump-issues/`: scaffold of the intake-folding skill (this process as a skill). SKILL.md 42 lines plus `references/sanity-check.md` and `references/example.md`. Written against the Claude Code skills docs, Anthropic skill best practices, and the Opus 5 / Fable 5 prompting guides (all T2, fetched 2026-09-07). Not installed anywhere.
- `slot-ab-jul28/README-jul28.md`: helper-claude's keep/cut list, treat as advice. `new-beginning-intake.md`: original 15-line idea, folded. `skills/`: older July 20 snapshot, not the base.

## How INTAKE.md is maintained

1. Operator throws thoughts in; helper-claude folds them in the operator's voice. Prose, headings and subheadings only, no bullets, tables, or decision codes. Each paragraph on one line.
2. Nothing decided. Helper-claude's solutions appear only as "advice received" or "sanity check, recorded as received", point left open. Helper-claude may advise in chat.
3. Repeated thought: add only the important new details to the existing text.
4. Every thought sanity-checked online first, chart-issues research standard: fetch the real source, record source and tier. Tier 1 named practitioner first-hand; tier 2 official docs, spec, measured result; tier 3 model knowledge only when nothing better. Own measurements from the akrogon log count as tier 2 and need no outside source.
5. Both bad examples referenced with paths and GitHub URLs.

## Operator hierarchy (recorded in three places in INTAKE.md)

Simplicity first, then cost, then quality, then speed. All four matter; this is the order when they conflict. Plus the two rules from the operator's own system prompt: elegance first (remove the problem class, fewest moving parts) and function over form (machine checks only that content exists and states are valid, never exact wording).

## Research done (tier, source), cumulative

- Claude Code best practices, T2: give the agent a check it can run; linter is a valid check; reviewers over-engineer; prune CLAUDE.md.
- Superpowers TDD skill, T2; Simon Willison, T1: red/green TDD by the agent inside the task.
- Anthropic Building effective agents, Schluntz and Zhang, T1: simple composable patterns; add complexity only when it demonstrably improves outcomes; voting pattern (run the same task more than once for diverse outputs; separate calls per consideration).
- Claude Code subagents T2; Codex subagents T2 (learn.chatgpt.com); pi T1 (Zechner): no built-in subagents, `pi --print`.
- herdr 0.8.2, T2: `pane.agent_status_changed` events, states idle/working/blocked/done/unknown, `agent prompt --wait --until idle`, `agent wait`, `agent read`; state comes from harness integration reports; waits do not track turns. Integrations claude, codex, pi current.
- Ponytail, T2 (repo, MIT): 56-line AGENTS.md ruleset (seven-step ladder plus never-cut list), 90-line review persona, hooks only for auto-activation/modes/subagents. Author benchmark 12 tasks Haiku 4.5: −54% LOC; YAGNI seven-word prompt −33% and dropped one path-traversal guard in 20 safety runs. JetBrains, Denis Shiryaev, July 2026, T1: 80 tasks Sonnet 5, −15% LOC median, −10% cost, quality unchanged, never self-activated as optional skill. Correction history: 80–94% headline was chatty-baseline inflation shown by Colin Eberhardt; InfoQ Aug 2026 T2; Rick Hightower June 2026 T1.
- Gall's law, Systemantics 1975/1986, T1. Dex Horthy HumanLayer "Why Software Factories Fail" July 2026, T1: lights-off factory Jul–Nov 2025 reverted; tests feedback in seconds, architecture cost in months; humans at the front. Dennis et al. arXiv Apr 2026, T2: in-context procedure beat LangGraph/CrewAI, failure 11.5/0.5/5% vs 24/9/17%. HN counter-report: eight-month factory working via heavy upfront interview plus adversarial review.
- Skills loading, all three harnesses T2: Anthropic agent-skills write-up (progressive disclosure, three levels, unbounded reference material); Claude Code skills docs (SKILL.md under 500 lines, body stays in context all session, references cost nothing until read); Codex skills docs (name/description/path at start, list capped at 2% of context, body on use); pi docs (system prompt list, body and references on demand).
- Prompting new models, T2: Anthropic prompting best practices (Claude 5 generation follows instructions precisely, responds strongly to system prompt, dial back aggressive language, Opus 5 self-verifies, prefill gone since 4.6, effort replaces budget_tokens, native subagent orchestration). OpenAI GPT-5 prompting guide (contradictory or vague instructions damage GPT-5 more; reasoning_effort and verbosity are settings). No 5.6-specific guide found. Snapshot skills: zero capitalized MUST/NEVER/CRITICAL, 85 lowercase never/must.
- Compaction and cache, T2, Claude Code prompt-caching, costs, context-window docs: cache reads about 10% of input rate; compaction invalidates the conversation layer once by design, summarization reads the warm prefix from cache so mid-session compaction costs a fraction; cold cache (5 min API key, 1 h subscription in-plan) is the expensive case; after compaction Claude Code re-reads up to five recently modified files, re-injects skill bodies capped 5,000 tokens per skill and 25,000 total, truncation keeps the start; file reads append and do not break the cache; a file mention in the summary breaks nothing. Checked for Claude Code only.
- gh CLI, T2: `gh issue view --json` with body, labels, comments, non-interactive; gh 2.100 installed.
- dox (github.com/agent0ai/dox), T2: root AGENTS.md index plus child AGENTS.md per area, agent walks root to area, updates files on the way out; plain markdown, MIT, ~1,400 stars. Not the operator's repo; only the shape is worth taking.

## Verified numbers (all reproduced by codex at w5:pFC where marked)

- Framework landings ("finalize changes" subjects): July 185, August 37; true merges 47 and 8. (codex)
- akrogon `issues/.scripts`: 82,264 TS lines, 423 files, 35,541 lines in 151 test/spec/fixture files. (codex)
- Old orchestrator 3,039 lines at `90160ae5` (Jul 28), 4,714 at `7125e7aa` (Jul 29); first tests 2026-08-03 `7e5b3d8e`.
- akrogon log since 2026-08-01: ~4,600 commits, ~100 landings, 609 mention judge, 89 failed attempts (25 no receipt, 15 no heartbeat, 15 blocked on question record, 10 real check failing, 8 proof shape narrow/13 broad, 6 retired mid-flight, 5 rebase/merge refused), 40 parks (16 attempts-exhausted, 10 operator-question, 5 procedural, 4 review-capped, 3 phase-mismatch, 2 malformed-file), 79 distinct issues, 10 gate-serving. (codex)
- Stalls (failed attempt or park to next moving commit, overlapping, nights included): ~77 h total. Lint/typecheck/quality 3 stalls 0.4 h; tests 6 stalls 1.8 h; no receipt 25 stalls 4.5 h; no heartbeat and proof shape 0 h; question parks and blocks 31 stalls 32 h; other parks 29 stalls 38 h. Five longest all operator-waiting parks: 11.5, 10.9, 10.6, 9.9, 7.4 h. Split recorded in INTAKE as measurement: checks the agent runs itself 9 stalls 2.2 h versus layers watching the agent 110 stalls 74.5 h. (codex)
- Snapshot quality layers: fidelity audit; implement-issue self-check plus spawned QA reviewer; check-issue advisory pass against 164-line advisory-quality-standards.md (hand-counted complexity bands, AQ- ids).
- Snapshot phases verified: consult-issue runs twice, planning (P-draft, P-synth, decision plan with D-ids) and implementation (I-draft, I-synth, execution plan); P-synth→I-draft needed operator approval; I-synth→I-ready needed only the peer's faithful verdict.
- Current create-issue ends with a consult election: agent recommends elect or skip, operator answers, default no consult, stored as one lock. Current chart-issues has a `debate` decision type (both slots blind, operator picks), dispatched by hand. Both intake skills are attended by design.
- Current board.ts: 467 lines, reads committed files only, no state of its own.
- Current config.yaml: model string per seat (claude-fable-5-1, gpt-6-astra, gpt-5.6-luna, gpt-5.6-sol, opus-5[1m], haiku-4-5), model_command and model_flag per harness.
- Reference indexes: framework 752 lines ~20,000 words, website 653 / ~17,000, sedern 579 / ~5,800, portal 465 / ~5,500, akrogon 311 / ~6,800. Skills say the index is the first lookup surface.
- Lessons folder: 19 files, 2,269 lines.

## Operator positions recorded (thoughts, not decisions)

Leaf-only shape. Intake door attended, hands off after intake until merge (non-negotiable). chart-issues is a must; single-issue door is create-issue or a form of consult-issue. Keep the debate model; consult election question must exist in the new repo (cheapest cost lever). Two agents at the door: slot A leads and feeds B nothing of its own, B blind, one herdr prompt, no machinery; open: B once at the end versus step by step, and the skill or config asks whether B joins this phase. Memory is the files only (planning plan, implementation plan). Seeds: GitHub Issues as the online queue, operator pulls when ready; open whether the seed report shape survives. Keep basic deterministic checks inside the leaf; drop judge, proof formats, coverage, gate-serving issues, parking. Herdr to the max; a patch on top of herdr that survives updates before any new mechanism; burden of proof on the agent claiming herdr cannot. Never again build fixers for the machine. Status view: read-and-print command, no loop, no state (recorded as the test for anything new). Keep config.yaml with editable harness and model per slot; never Claude and Codex forever. Skills as entry file plus references, maximum density, rewritten for current models (remove contradictions and compensating rules). Depend on autocompaction, no outside clearing. Ponytail: the 56-line ruleset versus the seven-word prompt is the open dilemma, both plain text. Index levels: top index to areas to code, to cut the 25,000-token first read; merge-issue already updates. Learning: one or two lines per lesson, no new mechanisms.

## Advice given in chat only

Driver reads only `phase`, moves it only through `lifecycle.ts transition`, never parses prose (operator's own lean). Handoff line at end of plan file. Real linter inside the leaf, block or advise by config. Take the 56-line ponytail ruleset as two reference files, nothing else from that repo. Blind-question shape for slot B over kept-in-step shape. One question, one field for the consult election is the whole mechanism. dox: take only the index shape.

## Errors this session

- Write to SESSION-SUMMARY.md refused once because the file changed on disk; re-read before writing.
- Ctrl+G opened VS Code because settings.json set EDITOR to `code --wait`; fixed as above.
- One python replacement asserted on a slightly different sentence ("What dox adds on top of that is only...") and was redone with the exact text.

## Next steps

1. Commands for the operator (not run by helper-claude):
   `mkdir -p ~/Work/infra/akrogon-new && git -C ~/Work/infra/akrogon-new init -q`
   `cp -r ~/Work/infra/akrogon/new-beginning/slot-ab-jul28/skills ~/Work/infra/akrogon-new/skills`
   `cp ~/Work/infra/akrogon/new-beginning/slot-ab-jul28/README-jul28.md ~/Work/infra/akrogon-new/`
   `mkdir -p ~/Work/infra/akrogon-new/issues/chart && cp ~/Work/infra/akrogon/new-beginning/INTAKE.md ~/Work/infra/akrogon-new/issues/chart/INTAKE.md`
2. Open a session in `~/Work/infra/akrogon-new`, run `/chart-issues`.
3. Until then, keep folding operator notes into INTAKE.md under the rules above. Split INTAKE.md only past ~400 lines.

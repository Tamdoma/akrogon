# build-scope, slot A notes

## Q1 pick: do not build now
Reason: the operator's values put removing over adding. The change adds code (result identity, per-file edit identity, a verdict renderer, fixtures across claude, codex and pi) to save the agent from reading at most 20 lines it already reads (log-tail.ts prints the last 20 entries). No missed or false loop call is on record (seed #97 Urgency), and the watch turn stays either way (the agent still judges on-brief and hung tools, SKILL.md:42). The same prose bar keeps working.
Cost: the agent keeps counting by eye; a miscount is possible but unobserved.
Could invite later: if a real missed loop is observed, this becomes new intake with that evidence, which also sizes the window question.

## Q1 rejected: build
- Exact counts are mechanical work an LLM does unreliably (counting is a documented weak spot), and the script already parses every call. But "same result" needs full result text that the script now cuts to one excerpt line (log-tail.ts:392, :412-420), codex groups inner calls into one target (log-tail.ts:276), and pi concatenates edit texts (:260), so honest exact counts need parser work across three formats. The size is not proportional to an unobserved pain.

## Q2 (only if built)
- Script owns the mechanical bar and prints one `loop:` line with evidence; the skill keeps judgment. One place defines the bar, the skill paragraph shrinks. Counts-only would keep the threshold in prose and the bar in two places.
- Window: the 20 printed calls, so the agent and the verdict see the same evidence.

## Evidence
- better-than-training: skills/watch-issues/SKILL.md:42; log-tail.ts:260, :276, :392, :412-420 (read 2026-10-17); seed #97.
- model-knowledge: LLM counting weakness (also noted as a documented Jev weakness in chart jev-classifier). No practitioner source searched for agent loop detection; search not run because the decision turns on local evidence (no observed miss).

## Pitfalls
- Hash equality read as result equality: only full-result comparison counts (if built).
- Undo across different files: identity includes the file path (if built).
- Counts treated as stop authority: the agent keeps the brief judgment and the one-stop-per-seat rule.

## Question the fork does not ask
- Should the seed close as "not built" with the reopening condition (an observed missed or false loop call)?

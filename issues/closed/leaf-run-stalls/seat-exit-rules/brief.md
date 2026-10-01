# Brief: seat-exit-rules

## What
Two seat-A rules in `skills/implement-issue`:
1. During implement or check.fix, after the repairs the protocol already permits (a red full suite sub-brief, worker-protocol.md:23, and a slow-run leaf's in-branch fix, standing-design.md:12), a done-criterion that still fails and cannot pass within the leaf's owned surfaces ends the pass with `akrogon phase <slug> failed --reason "<criterion> red: <cause>" --slot A`. It is never handed off as pre-existing, base red or "modulo" anything.
2. A worker whose failed result carries a provider error (the error text pi returns after its own retries are spent) is relaunched once, after it has ended. The relaunch uses its retained worktree as spawn cwd, its original brief, and this added line: "A previous worker died here. Check what is already done (criteria, commits, changed files and external effects such as uploads) before repeating work. Keep what is correct. Finish the brief." A second provider failure of the same unit ends a leaf pass `failed`, with a reason naming the provider, the error text and both transcript paths. In standalone mode, which makes no phase, state or log calls (SKILL.md:66), the second failure is reported with the same contents instead (B F2). Workers stopped by turn budget or output limit keep the current remainder rule.

## Why
Tamdoma/akrogon#47: emdash-conversion was handed to review "C1 modulo pre-existing base red" (report.md:27,69) and check.fix wrote "Documented, not repaired" (plan.md:133), so review re-filed the same finding and the leaf looped.
Tamdoma/akrogon#46: workers U11 and U11r died on meta 503 overloads. `worker-protocol.md:17` then forced A to hand-write remainder briefs ("never the original brief again"), although the original brief was correct and the worktree held the work.

## Done-criteria
1. `skills/implement-issue/SKILL.md` states rule 1 for both implement and check.fix. It uses the existing failed exit (SKILL.md:31-32) and names the reason format `"<criterion> red: <cause>"`.
2. `skills/implement-issue/worker-protocol.md` (the sentence at line 17) states rule 2. It covers: A recognizes a provider failure by the error text in the failed result; the old worker has ended before relaunch; spawn cwd is the retained worktree; the original brief plus the added line verbatim; one relaunch; the second-failure exit with its reason contents, leaf-only, with the standalone report. "never the original brief again" remains only for turn-budget and output-limit stops.
3. Every configured blocking `checks` command passes, including the resolved changed-tests command. (B,C)

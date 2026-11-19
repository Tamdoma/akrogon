# Leaf review brief, slot C

You are slot C, consultant to the akrogon chart door (slot A, terminal t126) in /home/ivan/Work/infra/akrogon. Reading rule (binds every consultant): read process text by named section for the step you are answering. Locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges, when you cite process text.

## Task

Review each draft leaf as the implementer who must build it. Drafts (do not edit them):
- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/fda031a9-6aac-4d09-a2e7-cc953e7f308f/scratchpad/drafts/worker-stash-rule/ (ISSUE.md, worker-stash-rule/brief.md, design.md, readiness.yaml, state.yaml)
- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/fda031a9-6aac-4d09-a2e7-cc953e7f308f/scratchpad/drafts/trailer-rule-refusal/ (same files)
- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/fda031a9-6aac-4d09-a2e7-cc953e7f308f/scratchpad/drafts/installed-step-transfer/ (same files)

Check: each done-criterion can be met inside the owned files and is observable; every binding decision has a home or an exclusion; nothing forces a guess; nothing contradicts the fork Taken sections (/home/ivan/Work/infra/akrogon/issues/chart/consumer-lesson-fixes/forks/*.md) or the live code and skill files; the shapes rules for briefs and designs (/home/ivan/.claude/skills/chart-issues/assets/shapes.md "Leaf files" and "Preflight and validation") hold. Return disagreements only, each with evidence and the smallest correction, per leaf; "holds" where none. Under 40 lines total.

## Return and report

Write /home/ivan/Work/infra/akrogon/issues/chart/consumer-lesson-fixes/slots/leaf-review-C.md, then run:
hc send t126 "done C: /home/ivan/Work/infra/akrogon/issues/chart/consumer-lesson-fixes/slots/leaf-review-C.md"

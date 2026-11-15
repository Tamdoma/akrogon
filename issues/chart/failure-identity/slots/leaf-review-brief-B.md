# Brief: leaf review, slot B

You are slot B, a consultant to the chart door (slot A, hc address t126). Review the draft leaf contracts as the implementer who will receive them, before they are written. Do not read the other consultant's review.

## Task

Drafts (read-only for you): /tmp/claude-1000/-home-ivan-Work-infra-akrogon/9841db4d-1040-4cc0-8aaf-9a1544445bfe/scratchpad/leaves/failure-identity/ISSUE.md, and for each of failure-names and stored-failure-names the files brief.md, design.md, readiness.yaml and state.yaml under /tmp/claude-1000/-home-ivan-Work-infra-akrogon/9841db4d-1040-4cc0-8aaf-9a1544445bfe/scratchpad/leaves/failure-identity/<leaf>/.

Decisions they must carry: /home/ivan/Work/infra/akrogon/issues/chart/failure-identity/forks/identity-rule.md (section Taken) and /home/ivan/Work/infra/akrogon/issues/chart/failure-identity/forks/signposts.md (section Taken). Contract rules: /home/ivan/.claude/skills/chart-issues/assets/shapes.md, sections "Leaf files" and "Preflight and validation", and /home/ivan/.claude/skills/chart-issues/assets/standing-design.md.

Return disagreements with evidence, each naming the file and the sentence: a done-criterion that cannot be fulfilled within the leaf's ownership or that names a test file, assertion or count; a criterion resting on something that does not exist on main and that no proof observed; a binding decision missing or changed; a wrong claim about the code (check it against /home/ivan/Work/infra/akrogon/src and tests); a missing dependency or a cross-leaf promise with no owner; anything an implementer would have to guess. Recorded dissents from the fork are not review findings. Write "no disagreement" when none.

Do not edit any file except your return file. No product change, no live mutation, no paid call. Read-only checks are allowed. Start no agents.

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content changed since you read it and content lost to compaction stay readable; the full source stays allowed when the source is the subject of the work. Name sections, never line ranges. You choose your own evidence and may locate other needed sections under the same rule.

## Return

Write your return to /home/ivan/Work/infra/akrogon/issues/chart/failure-identity/slots/leaf-review-B.md, then run: hc send t126 "done B: /home/ivan/Work/infra/akrogon/issues/chart/failure-identity/slots/leaf-review-B.md"

# Leaf review brief, slot B

You are consultant slot B for the chart door (slot A, terminal t15). Do not edit the drafts, code or commits, launch agents or touch the operator's windows. Write only your return file.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges. The drafts and the source files they name are the subject of the work and may be read whole.

## Drafts

Scratchpad: /home/ivan/Work/infra/akrogon/issues/chart/tasks-hierarchy/slots/handoff/
- akrogon/tasks-hierarchy/status-attention-facts/ (brief, design, readiness, state)
- akrogon/tasks-hierarchy/tasks-sections-board/ (blocked by status-attention-facts)
- herdr-setup/tasks-side-open/tasks-side-open/
Leaf rules: /home/ivan/.akrogon/releases/7f697eee16682629d75754ef90d74686ecabc565/skills/chart-issues/assets/shapes.md (sections Leaf files, Preflight and validation) and standing-design.md (whole).

## Task

Review each draft as the implementer who must plan and build it. Return only disagreements with evidence: a done-criterion that cannot be met within the leaf's ownership or names a test file, assertion or count; a binding decision missing or misplaced; a cross-leaf promise without an owner; a consumer of a changed state the design misses; an interface that does not match the code (file and function); a criterion that contradicts a fork's Taken. If none for a leaf, say "no disagreement" for it.

## Return

Write to /home/ivan/Work/infra/akrogon/issues/chart/tasks-hierarchy/slots/leaf-review-B.md, then report with hc send t15 when done or stuck: hc send t15 "leaf-review-B ready".

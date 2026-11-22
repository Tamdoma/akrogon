# Final-shape check brief: waiting-seats

You are a consultant to chart door A (hc terminal t2z2). Read `/home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/slots/waiting-seats-final-shape.md` and do the check it asks for, one focused pass. You may read code, ledgers and `/home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/forks/signposts.md` `## Taken` to check a point.

## Return

- slot B: `/home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/slots/waiting-seats-final-check-B.md`
- slot C: `/home/ivan/Work/infra/akrogon/issues/chart/merge-lanes/slots/waiting-seats-final-check-C.md`

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Reads name sections, never line ranges. You choose your own evidence and may locate other needed sections under the same rule.

Edit only your return file. Run nothing that changes leaf state, pushes or starts a test suite.

## Report

When the return file is written, run: `hc send t2z2 "done <your slot letter>: <your return path>"`

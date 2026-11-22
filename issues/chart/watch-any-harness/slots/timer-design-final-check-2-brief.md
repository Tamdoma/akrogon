# Brief: focused final-shape check 2, timer-design (slot B or C)

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with bounded output, and read content you already hold at most once. A section you have not read, content changed since you read it, and content lost to compaction stay readable; the full source is allowed when it is the subject of the work. Name sections, never line ranges. You choose your own evidence.

## Task

Check /home/ivan/Work/infra/akrogon/issues/chart/watch-any-harness/slots/timer-design-final-shape-2.md, the [C2] items in particular, against /home/ivan/Work/infra/akrogon/issues/chart/watch-any-harness/forks/signposts.md (`## Taken` and the 2026-11-20 Correction). Return only defects: a mechanism that cannot work as written, contradicts a lock, or contradicts an inspected fact; each with evidence and consequence. Preference and re-argued dissent are not defects. Under 20 lines; "no defects" is a valid return. Read-only; start no agents.

## Return

Write to /home/ivan/Work/infra/akrogon/issues/chart/watch-any-harness/slots/timer-design-final-check-2-<your slot letter lowercase>.md, then run: hc send t126 "done <your slot letter>: <return path>"

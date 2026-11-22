# Brief: focused final-shape check 4, timer-design (slot B or C)

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with bounded output, and read content you already hold at most once. A section you have not read, content changed since you read it, and content lost to compaction stay readable; the full source is allowed when it is the subject of the work. Name sections, never line ranges. You choose your own evidence.

## Task

Check only the [C4] items in /home/ivan/Work/infra/akrogon/issues/chart/watch-any-harness/slots/timer-design-final-shape-4.md (a delta on final-shape-2.md and -3.md) against the locks in /home/ivan/Work/infra/akrogon/issues/chart/watch-any-harness/forks/signposts.md. Return only defects in those items: a mechanism that cannot work as written, contradicts a lock, or contradicts an inspected fact; each with evidence and consequence. Under 15 lines; "no defects" is a valid return. Read-only; start no agents.

## Return

Write to /home/ivan/Work/infra/akrogon/issues/chart/watch-any-harness/slots/timer-design-final-check-4-<your slot letter lowercase>.md, then run: hc send t126 "done <your slot letter>: <return path>"

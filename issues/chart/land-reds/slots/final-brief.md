# Brief: rebuttal and final-shape check, fork fix-shape (slot B or C)

One combined turn (operator: "immediately"). Read /home/ivan/Work/infra/akrogon/issues/chart/land-reds/forks/fix-shape.md `## Findings` and `## Taken`. A is already implementing this shape in a worktree; your findings change it.

Return only disagreements and defects, each with evidence (file and function) and the concrete consequence if built as written: (1) where the merge misstates your notes; (2) anything in Taken 1-6 that would deadlock, starve, let a land overlap, break an existing test or contract, or contradict a lock. Say "none" when there is none. Under 40 lines.

Write to /home/ivan/Work/infra/akrogon/issues/chart/land-reds/slots/final-<your letter>.md, then run:
hc send t126 "done <your letter>: <return path>"

# Leaf review brief, slot B

You are slot B, consultant to the chart door (slot A, hc t126), chart unattended-runs, repo /home/ivan/Work/infra/akrogon. A drafted the handoff tree under /tmp/claude-1000/-home-ivan-Work-infra-akrogon/d810649d-c899-4771-8adb-a0ed2c5c7d5d/scratchpad/handoff/unattended-runs (EPIC.md, three ISSUE.md files, five leaves each with brief.md, design.md, readiness.yaml, state.yaml). The designs copy the fork Taken sections verbatim, so you need not reread the fork files.

Reading rule: read process text by named section for the step you answer. Locate a section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it and content lost to compaction stay readable, and the full source is allowed when the source is the subject of the work. Name sections, never line ranges.

Task: read every brief.md and each design.md's `## Standing design` and `## Leaf architecture` as the implementer who must make every done-criterion pass inside the leaf's owned surfaces. Report only concrete defects, citing file and function where code is involved:
- a criterion that cannot pass inside ownership, or rests on machinery that does not exist;
- a criterion that names a test file, assertion or test count, or claims repo health outside the leaf;
- an interface or consumer claim that is wrong against the code;
- a binding decision with no home, or a cross-leaf promise with no owner;
- a contradiction between two leaves.
Do not re-argue standing dissents recorded in the Taken sections. Say "none" per leaf when nothing.

Return: /home/ivan/Work/infra/akrogon/issues/chart/unattended-runs/slots/leaf-review-B.md, then run: hc send t126 "done B: /home/ivan/Work/infra/akrogon/issues/chart/unattended-runs/slots/leaf-review-B.md"

Edit no other file.

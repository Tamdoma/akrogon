# Brief for slot D: store-hygiene notes

You are slot D. Read-only on code and files; write only your return file. Delete nothing.

Read:
- Intake: /home/ivan/Work/infra/akrogon/issues/chart/worktree-cleanup/INTAKE.md
- Fork, sections Question and Carries only: /home/ivan/Work/infra/akrogon/issues/chart/worktree-cleanup/forks/store-hygiene.md
- Related taken forks: /home/ivan/Work/infra/akrogon/issues/chart/worktree-cleanup/forks/scratch-copy-removal.md and /home/ivan/Work/infra/akrogon/issues/chart/worktree-cleanup/forks/after-merge-remainder.md (sections Taken)
- Note definition: /home/ivan/.claude/skills/chart-issues/assets/questions.md, section "Blind peer exchange", paragraph starting "For the opening map" (five parts per question).
- Code: /home/ivan/Work/infra/akrogon/src. Live areas you may list and inspect without changing: ~/.akrogon, ~/.config/akrogon, ~/.local/state, /tmp, each registered repo's worktree store (akrogon config), and the akrogon and tamdoma framework checkouts.

Task: blind notes for Q1, Q2, Q3. For Q1, inventory every location akrogon code writes (path, writer file:line, what it holds, current size and leftover count on this host). For each unknown item in the worktree stores today (for example .temp, .dcf*.node-gyp, emdash-conversion-ufix-b), find who creates it and whether deleting it can break a running or later process. For Q2, name the check that proves "safe to delete" and how it fails.

Return: one file, /home/ivan/Work/infra/akrogon/issues/chart/worktree-cleanup/slots/hygiene-D.md. Write to a temp file in that folder first, then rename to the exact path.

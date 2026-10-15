# Brief for slot D: after-merge remainder notes and one final-shape check

You are slot D in an attended chart. Work read-only on code; write only your return file.

Read:
- Intake: /home/ivan/Work/infra/akrogon/issues/chart/worktree-cleanup/INTAKE.md
- Current fork, sections Question and Carries only: /home/ivan/Work/infra/akrogon/issues/chart/worktree-cleanup/forks/after-merge-remainder.md
- Related taken fork: /home/ivan/Work/infra/akrogon/issues/chart/worktree-cleanup/forks/scratch-copy-removal.md (section Taken)
- Peer note definition: /home/ivan/.claude/skills/chart-issues/assets/questions.md, section "Blind peer exchange", the paragraph starting "For the opening map" (five parts per question).
- Code: /home/ivan/Work/infra/akrogon (src/next.ts, src/phase.ts, src/batch.ts, src/reconcile.ts, src/status.ts). Live evidence you may use: tamdoma framework at /home/ivan/Work/infra/tamdoma/framework (issues/log.jsonl, issues/merge-attempts.jsonl), herdr, transcripts.

Task 1. Blind notes for each of Q1, Q2, Q3 in the fork, five parts each per the note definition. For Q1, first establish with evidence whether a stacked member's tab and worktree actually stay after a merge (a real batch merge in framework or akrogon logs, or a reasoned code trace naming every path that could close the tab, including hook events).

Task 2. Final-shape check of the fork scratch-copy-removal section Taken, especially the new mechanism: buildStack names its copy after the leaf's recorded build attempt so reconcile keeps a running build. Disagreements only, with evidence; write "none" if none.

Return: write one file, /home/ivan/Work/infra/akrogon/issues/chart/worktree-cleanup/slots/after-merge-D.md, with sections "# Notes" (Q1, Q2, Q3) and "# Final-shape check". Write it to a temp file in the same folder first, then rename it to the exact return path.

# Fork notes: keep running, slot B

You are slot B. Blind fork notes: your own position, not a review of A. Read-only: change no repo file, run no akrogon phase/next/unhold/close/sync.

Return path (write only here): /home/ivan/Work/infra/akrogon/issues/chart/night-flow/slots/keep-running-B.md

## Intake, locks and question
Chart: /home/ivan/Work/infra/akrogon/issues/chart/night-flow/CHART.md. Intake: /home/ivan/Work/infra/akrogon/issues/chart/night-flow/INTAKE.md (seeds #80 and #84 verbatim, operator notes verbatim). Fork with Question and Carries: /home/ivan/Work/infra/akrogon/issues/chart/night-flow/forks/keep-running.md. Locks: /home/ivan/Work/infra/akrogon/issues/chart/night-flow/forks/stop-rules.md and /home/ivan/Work/infra/akrogon/issues/chart/night-flow/forks/failed-exits.md (Taken sections).
Operator words that bind: "We need to make sure things are moving and are automated without having failed issues or stopped processes for me in the morning." "I only need the most elegant solutions that are holistic." "I don't want more complexity."

Answer Q1 and Q2 from the fork file. For Q1 weigh at least: the watch-issues session cron kept alive (never self-deletes); an OS-level timer (systemd user timer or cron) running `akrogon next --all`; akrogon re-arming passes itself from existing events. Say which passes exist today and what each misses (`docs/guide/next.md`, `src/next.ts`, `skills/watch-issues/SKILL.md`). For Q2 weigh at least: self-update rebases and pushes issue-only local commits as `akrogon sync` does (`src/sync.ts`); the door pushes at handoff; a separate runtime checkout. Use `src/self-update.ts`, `src/sync.ts`, `docs/guide/install.md`.

## Note format (five parts per question)
1. Your pick, its reason and its cost.
2. Each rejected option and why.
3. Evidence: tier (operator / practitioner / better-than-training / model-knowledge), source with path:line or URL, date read.
4. Pitfalls over the lifetime of the work, and what removes each.
5. Any question you would ask that this fork does not.

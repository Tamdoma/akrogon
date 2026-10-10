# Fork notes brief: batch-size, slot B

Blind notes: do not read slots/batch-size-A.md or the other peer's return. No repo edits except your return file.

Fork: /home/ivan/Work/infra/akrogon/issues/chart/merge-throughput/forks/batch-size.md (Question and Carries, including the operator's verbatim question).
Taken forks: /home/ivan/Work/infra/akrogon/issues/chart/merge-throughput/forks/{first-package,red-main-hold,bounce-counting,queue-order,attempt-records}.md "## Taken" sections.
Intake: /home/ivan/Work/infra/akrogon/issues/chart/merge-throughput/INTAKE.md (#62, #68 especially). Code: /home/ivan/Work/infra/akrogon (src/next.ts ~1008-1042, src/phase.ts 150-155 and 770-800, src/batch.ts). Framework log: /home/ivan/Work/infra/tamdoma/framework/issues/log.jsonl.

Answer the operator's question directly, systems view:
1. Why "2" (or not): what batch size maximizes leaves landed per run given pass rate p; is the size better set by p, by queue length, or by a control rule.
2. Which reinforcing loop enforces bad behavior here, and which balancing loops optimize the wrong target (e.g. split keeps the holder, back-of-queue on bounce, batch size driven by queue length). Cite file:line.
3. The most elegant smallest change (red-batch handling: halve-keep-holder vs bisect vs eject culprit; size rule).
Then the five-part blind notes from /home/ivan/.claude/skills/chart-issues/assets/questions.md "Blind peer exchange". Plain words, under 80 lines.

Return to exactly: /home/ivan/Work/infra/akrogon/issues/chart/merge-throughput/slots/batch-size-B.md

# Fork notes brief: shell-sweep, slot B

You are slot B. Write blind notes for one fork. Do not read any other slot's fork-shell-sweep file in /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/slots.

## Task

Answer the three questions in /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/forks/shell-sweep.md section "## Question" (read its "### Carries" too). Per question, write five parts:

1. your pick, with its reason and cost;
2. each rejected option, with its reason;
3. the evidence, with tier (operator, practitioner, better-than-training, model-knowledge), source with file:function or URL, and date;
4. the pitfalls, and what removes each;
5. any question you would ask that the fork does not ask.

Permitted context: the intake /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/INTAKE.md, the fork file above, the locks and map named in its Carries, and the akrogon code at /home/ivan/Work/infra/akrogon. Weigh this fact from the merged map: through hc, a claude turn that ended with a background shell still running looks exactly like a turn still working with one, and claude flips root status to `done` when that shell is killed from outside.

## Rules

- Read only. Change no file except your return file. Run no paid model launch: no claude, codex, pi or agy session. Free local probes (temp dirs, `ps`, `/proc`, cgroup reads, a throwaway hc terminal running plain shell commands) are allowed. Kill nothing you did not start.
- Reading rule: read process text by named section for the step you answer; locate the section before reading it, batch independent reads, bound output to those sections, and read content you already hold at most once. Unread sections, changed content and content lost to compaction stay readable; the full source is allowed when the source is the subject of the work. Name sections, never line ranges, when citing process text.
- Plain words, one fact once, mark low-confidence claims.

## Return

Write /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/slots/fork-shell-sweep-B.md, then run:

hc send t126 "done B: /home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/slots/fork-shell-sweep-B.md"

# Case 5 — lesson whose history already links a report

Same consumer repo as case 1.

New occurrence (checkable mechanism, e.g. an unguarded `JSON.parse` on external stderr): the seat records a lesson and writes its history file `learnings/history/2026-10-10-stderr-parse.md`. During the write, the seat's seed-issue dedupe lookup already found a covering report, and the history file already carries the link:

```markdown
Report: https://github.com/Tamdoma/tamdoma-framework/issues/88
```


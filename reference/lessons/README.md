# Lessons

Short post-mortems written while fixing the machinery. Every entry answers three questions: what
failed, why the machinery let it fail, and what change (to code, to the chart issues, to how issues
are created, or to how we verify) prevents the class of failure, not just the instance.

Update the relevant lesson as work proceeds: record a confirmed finding, a corrected diagnosis,
an agreed prevention, its implementation, and its live verification when each becomes known.
Do not wait for the incident or session to close. One file per failure class, named
`YYYY-MM-DD-<slug>.md`; extend it for repeated instances rather than creating duplicates.
Use this shape:

```
# <one-line failure name>

What failed: <observed behavior, one or two sentences>
Root cause: <the actual defect, not the symptom>
Fix: <commit + one sentence>
Lesson: <the class-level prevention — a missing invariant, a test gap, a process gap>
```

Maintained by both build agents (helper-claude, helper-codex). The implementation owner updates the
lesson and the peer checks its claims. Agree file ownership before concurrent edits. Preserve
historical evidence, correct mistaken conclusions explicitly, and distinguish proposed, committed,
activated, and observed behavior. Record general prevention with concrete evidence beneath it.

Read before designing new machinery. Lessons inform issue creation and engineering decisions;
the reconciler does not read them as runtime instructions or infer state from agent panes.

## Cross-class reviews

- [2026-09-06: factory reliability](2026-09-06-factory-reliability.md) — morning changes,
  accounting limits, unfinished recovery work, and inspected inputs for the marketing/web factory.

# Fork notes brief: pane-record (slot C)

You are consultant slot C for the chart door. Work independently. Return blind notes per question, your own position, not a review of anyone.

Reading rule: read process text by named section for the step you answer. Locate a section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content changed since you read it, and content lost to compaction stay readable. The full source stays allowed when the source is the subject of the work (here: akrogon source and tests). Name sections, never line ranges, when reading process text.

Note definition: /home/ivan/.claude/skills/chart-issues/assets/questions.md section "Blind peer exchange" (the five parts of a returned peer file).

## Intake

/home/ivan/Work/infra/akrogon/issues/chart/orphan-pane/INTAKE.md (Tamdoma/akrogon#116 and the operator's words). Operator values: simplest, most elegant, reduce code before adding.

## Current question and carries

/home/ivan/Work/infra/akrogon/issues/chart/orphan-pane/forks/pane-record.md, sections Question and Carries only. Do not read its Findings.

## Live surface

/home/ivan/Work/infra/akrogon at HEAD 92dddada: src/next.ts (allocate, broadcastPass, dispatch path calling allocate), src/scope.ts (inOwnScope, adoptShell), src/reconcile.ts, docs/guide/next.md, tests/seat-containment.test.ts and any other test you find relevant. Check every consumer of recorded `state.pane` ids that relies on "recorded implies boxed".

## Locks

Route lifecycle, debate no. No other locks.

## Return

Write your notes to /home/ivan/Work/infra/akrogon/issues/chart/orphan-pane/slots/pane-record-C.md and nothing else. Do not edit any other file.

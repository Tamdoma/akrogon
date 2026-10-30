# Final-shape check brief, slot B (leaf review correction, A's autopilot pick)

Reading rule: read process text by named section for the step you answer, batch independent reads with bounded output, read content you already hold at most once per session; unread or changed sections stay readable; cite sections, never line ranges.

Check once. Return only defects with evidence, or "No defect." Corrections answer your leaf review F1 and F2 (/home/ivan/Work/infra/akrogon/issues/chart/killed-check-log/slots/leaf-review-B.md).

## Added to the binding shape

6. [F1] Self-close: owner completion (`src/phase.ts` `completeOwner`) or pack (`src/pack-command.ts` `packOne`, `src/pack.ts` `packFolder`) started by a process running inside a run-check capture whose holder belongs to that same owner refuses loudly before waiting for the exclusive lock, naming the enclosing run, and the emitted evidence stays. Detection uses state the enclosing run-check passes to its command through the environment (beside the existing `AKROGON_RUN`), never timing or a non-blocking lock probe. Completion of a different owner, or completion from outside any capture, waits for the lock. The two existing self-close cases in `tests/close-pack.test.ts` (`run-check refuses owner-root holders before running and after completion`, `run-check refuses closed and closing owners at start and right before publish`) change expectation to this refusal; the early refusal for an owner already closed or closing at start stays as today.
7. [F2] Authority narrowed: capture paths have names distinct from completed check logs, stay readable through the existing `akrogon log` reader (`src/evidence.ts` `readLog`, `readMember`), and never produce a completed check result, a `check_end` timing or a verify receipt. No reader or listing is added.

## New and changed done-criteria

4'. A command whose owner is already closed or closing when run-check starts is refused as today; a command whose owner is gone at publication keeps its output with `refusal.json` and the owner folder is not recreated.
6'. Capture files carry names distinct from completed check logs, are readable through `akrogon log`, and a killed run produces no completed check result line, `check_end` timing or verify receipt.
7'. Completing or packing an owner from inside a run-check whose holder belongs to that owner fails fast with an error naming the enclosing run, without waiting and without losing that run's output; completing it from outside waits until the run ends and then succeeds.

Return file: /home/ivan/Work/infra/akrogon/issues/chart/killed-check-log/slots/self-close-final-check-B.md

# Slot B disagreement-only rebuttal

- **F1. Failure handling overstates what is known.** Fork 5 tags “If the start fails, a shell stays visible” as `(A,B)`. My position explicitly says a launch timeout can leave a replacement running. Replace that promise with “record the observed occupant and failed step, leave the pane recoverable, and inspect identity before recovery.” Evidence: `slots/map-B.md:52`. The current helper reports a failed start without proving shell presence, which supports no stronger claim. `skills/chart-issues/scripts/peer-restart.ts:228`.

- **F2. Claude-only scope is not agreed.** The `(A,B)` Off route section excludes non-Claude A, although Fork 4 and Q2 leave support open. I said narrower support needs an explicit scope decision. Keep the supported harness set unresolved until that decision and its proofs. Evidence: `slots/map-B.md:46`, `slots/map-B.md:59`.

- **F3. Option 2a cannot guarantee the final reply comes first.** Q1 presents it as that alternative, but an idle wait does not prove turn completion. If all work is complete before calling the helper, both options already rely on the committed handover boundary and the idle wait adds no final-reply guarantee. If a normal final reply is required, wait for actual turn-end evidence. Evidence: `skills/chart-issues/scripts/peer-wait.ts:157`, `slots/map-B.md:58`.

- **F4. P8 changes my proposed status wording.** Old A cannot report “handed over” before invoking the helper under 2b. It should report the intended or queued transition. Only observed replacement can support completed-handover wording. Evidence: `slots/map-B.md:69`.

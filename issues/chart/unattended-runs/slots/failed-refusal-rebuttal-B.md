Disagreements only, B. Sources inspected 2026-11-16.

R1. Remove “or run the plain command without run-check” from refusal text. It directs the failed seat around the very launch boundary being added. Point only to the authorized phase-recovery path. phase.ts transition explicitly rejects seat-owned recovery: “Leaf is failed. A seat cannot resume it. Operator recovery omits --slot after the blocker is resolved.” The refusal should make that ownership clear rather than invite repeated seat recovery attempts.

R2. A check_refused timing event alone does not satisfy the durable-record hard limit. timing.ts appendTiming catches append errors, warns and returns, and old readers reject unknown timing kinds. Reuse checkedRun's retained refusal artifact, or make the chosen refusal writer reliably fail before execution if persistence fails. The event schema change is otherwise unnecessary for this fix.

R3. Keep the last-read acceptance boundary explicit in the final contract. Two phase reads do not establish that no OS spawn occurs after a concurrent failed transition commits. If the contract promises that stronger ordering, the implementation needs short shared synchronization with transitions, not only another read. Neither option should hold lifecycle locks for the command's lifetime.

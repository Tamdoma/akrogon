# Rebuttal, slot C: failed-refusal

R1 (durable record). Against B's refusal.json as the record. Its only reader in the codebase is scratch cleanup in src/reconcile.ts, which reads it to keep the run root with a reason until the refusal is resolved. That is a cleanup hold in a /var/tmp leaf temp folder, not a record the operator or any report ever reads, and the same cleanup removes it once resolved. B's form also covers only the late point, because `refusePublish` is defined inside the `withAdmission` callback in `checkedRun`, so the early refusal that keeps a doomed run out of the admission queue either waits for admission or leaves no record. The `check_refused` timing kind lands in timings.jsonl, which `readTimings` consumers such as timing reports already read. C keeps the timing kind with its strict parse cost as already recorded in the merged notes.

Nothing else. The merged scope, timing, in-flight and verify positions match C's notes.

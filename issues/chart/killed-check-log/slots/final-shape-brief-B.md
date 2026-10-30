# Final-shape check brief, slot B (round 1, A's autopilot pick `1a 2a`)

Reading rule: read process text by named section for the step you answer, batch independent reads with bounded output, read content you already hold at most once per session; unread or changed sections stay readable; cite sections, never line ranges.

Check this proposed final shape once. Return only defects (wrong, missing, contradicting a lock or the code) with evidence, or "No defect." Corrections from your rebuttal are marked [B-F1], [B-F2], [B-F3].

## Final shape

1. Capture: the command's stdout and stderr go to run-unique capture files inside the holder from launch, for both held and nested admission. run-check prints the capture path before waiting, without any exit claim. The shared shell helper's behavior for other callers is unchanged.
2. Publication: on command exit with a publishable owner, the completed combined log is produced as today (same name pattern, same result line, same `Result` stdout/stderr replay and final-newline handling), then the partial capture files are removed. [B-F2] Partial removal is conditional on successful publication; a closed, closing or vanished owner keeps today's refusal and keeps the captured output with `refusal.json`, never recreating the owner.
3. Exclusion: a kernel-released file lock. [B-F1] Its lifetime equals the lifetime of every capture writer and of the wrapper's publication, including partial removal (for example carried on the open file description every writer inherits). It is taken before the capture files are created and the owner fence (`ownerRefusal`) is rechecked under it. Pack and owner movement take it exclusively before snapshot.
4. Authority: a partial capture never counts as a completed check or a verify receipt.
5. Proofs (done-criteria): [B-F3] (a) SIGKILL a real wrapper after distinct stdout and stderr markers are written, run reconcile, then read both markers from the holder; (b) start pack while a capture is live, show pack cannot finish before writers and publication end, then read both streams from `evidence.tar.zst` through `akrogon log`; (c) normal exit leaves exactly the completed log as today; (d) closed-owner refusal still keeps output.
6. Off route: busy alert (lock 2026-09-18), seat-surviving checks, implement-issue timeout wording.

Return file: /home/ivan/Work/infra/akrogon/issues/chart/killed-check-log/slots/durable-capture-final-check-B.md

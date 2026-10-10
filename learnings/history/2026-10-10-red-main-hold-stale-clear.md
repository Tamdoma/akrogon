# Revalidate a hold before clearing it

Date: 2026-10-10
Case: red-main-hold, review B, head ec9fe3810ae88935046265d19b73e4d68d278cd6.

Evidence: overlapping real next CLIs allowed one caller to clear an old hold and start an attempt while another caller was comparing that old hold. A real red-on-base phase call then wrote a new hold. The delayed caller's unconditional clear deleted the new hold and started another attempt on the same red main. Full trace and results are in issues/open/merge-throughput/red-main-hold/review-B.md, F2.

Learning: taking a lock only for deletion does not protect a decision made before acquiring it. Re-read and compare the current record within the deletion lock, or let an existing locked decision perform the deletion. A later guard cannot recover a record already deleted by a stale decision.

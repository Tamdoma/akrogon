# Refused-stop brief: lane-first (slots B and C, independent)

Worktree /home/ivan/.akrogon/worktrees/akrogon/lane-first, head e5b59a07 (base 814a2387). Design: forks/design.md (lane-first stop design). D rounds 8-10: slots/review-D-lane-8.md, -9.md, -10.md.

Problem: the repo hold for a land is a file record (src/admission.ts), while the thing that must be gone is a systemd scope (akrogon-run-*.scope plus its -guard.service, src/scope.ts). Rounds 9 and 10 patched the case where `systemctl stop` refuses or fails: an `unstopped` record flag, sweep retries, a guard that deletes the record before stopping (src/scope.ts:98-101), concurrent sweeps resurrecting a removed record (src/admission.ts:282-306), a test shim faking not-found by bus socket (tests/helpers.ts:100-113). D round 10 found four more holes (F16-F19).

Question: what removes this class instead of patching it? Options to weigh (add your own):
- O1. Keep record-based holds; serialize per-run stop+record updates under a lock; guard keeps the record until stop is confirmed.
- O2. The hold is the unit itself: a repo line is held while any akrogon-run-* unit of that repo exists in systemd (e.g. a per-repo slice whose activity is the hold), the record is only metadata. Cost: a systemd query per admission check (admission uses file reads only today).
- O3. A refused stop is not retried automatically: it fails loudly and leaves the repo line blocked by a marker that only `akrogon stop` (after confirming the units are gone) clears.
Per option: what it breaks or invites later, cost, file:line evidence. Recommend one. How often does `systemctl --user stop` actually fail on this host (journal, logs)?

Do not edit code. Write slots/refused-stop-<your letter>.md.

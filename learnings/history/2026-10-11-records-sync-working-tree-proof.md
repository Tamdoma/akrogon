# Checkout move proof

Date: 2026-10-11
Case: records-sync, slot B initial check.review, reviewed head d6ea570387054dc73d8de9ee570b70773ee304c3.

## Evidence

`issues/open/night-flow/records-sync/implementation/review-B-mixed.log` records a real Git checkout with two incoming file updates. An operator edit already matched the incoming blob in one file. The keep reset refused, and a mixed reset advanced HEAD while leaving the other previously clean file at its old contents. The command reported deployed, then current on the next trigger.

## Learning

When reviewing a checkout update, choose representative incoming files and compare the resulting worktree contents and dirty state as well as HEAD. A correct commit reference and successful deploy message do not establish that the runtime files were updated. Which files and overlaps are representative requires review judgment, so this lesson has no fixed-pattern command guard or separate intake report.

# Slot D review, owner roots, round 4

## owner-workers

Verdict ready

- Previous head `71de2c61f3a372c3aa5a446f900f37521c0dfcff`
- Head `e79958e0e90a2e0494c5870295f84f6c9aca4935`

1. **F7 fixed.** The guard compares Git's registered paths with the real paths of open leaves' existing primary checkouts (`src/phase.ts:428–442`). The new regression test refused the phase move on the previous head, citing the peer checkout. On this head the move advanced to `check.review`. The closed-slug regression test also passed and still refuses a move while a detached worker remains.

All 70 tests in `tests/phase.test.ts` passed.

## owner-skills

Verdict ready

- Previous head `07d48d0c4ac7c155a31d7215550570b4701513a1`
- Head `336e4dc6a490a6fa0e6393089b90b64fdbf88f10`, including consult fix `132efcbf31c60076b9fa2bdf4c8fde9a27671304`

2. **F3 fixed.** The close command renames a new file over the live status entry (`skills/watch-issues/scripts/consults.ts:279–282`). The new regression test changed the hard-linked backup to `closed` on the previous head. On this head the case closed, the backup stayed `open`, and the temporary status file was gone. The linked-case and linked-status refusal tests also passed.

All 10 tests in `consults.test.ts` passed. The touched files ran with `--timeout=120000 --max-concurrency=5`. Both fix diffs passed `git diff --check`.

The owner-locks verdict remains ready for the staged rollout documented in round 2.

# Slot A notes: existing-backlog Q1

## Pick: migrate once with the same pack
Each closed owner gets its `evidence.tar.zst` from its plain logs, the plain logs leave the tree in the same commit, and ended charts get `akrogon pack <chart>`. Open and parked tracked logs are untracked (`git rm --cached`) and stay on disk. Reason: one rule for old and new evidence; the tree drops from 945 MiB to about 23 MiB; `akrogon log` and flaky already read archives by the taken resolver. Cost: a one-time migration command delivered by an akrogon leaf, then run per repo by the operator or the door on that repo's main, since the akrogon leaf cannot commit in framework. History keeps the old blobs (no rewrite).

## Rejected
- Leave: the 945 MiB stays in every framework checkout, which is the reported problem.
- Remove from the tree only: evidence then lives only in history, unreadable without git archaeology; breaks the operator's readability answer.

## Evidence
- Taken shapes: evidence-location Taken items 3, 5, 6; log-coverage Taken items 1, 3, 6.
- Sizes: framework 944.9 MiB in 4,462 logs, 45 closed owners pack to 23 MiB (C, earlier).

## Pitfalls
- Migration deletes a log not in the verified archive: the same byte-equal read-back as the close pack.
- A run on a dirty tree mixes unrelated changes into the migration commit: refuse unless `issues/` is clean.
- Two hosts migrate the same repo: the second sees archives and no plain logs, a no-op.

## Question
- Is the migration a command (`akrogon pack --closed`) or a one-time script in the leaf? A command stays as dead code once done.

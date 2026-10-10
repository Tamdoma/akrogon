# Brief: batch-limit-repo

## What
Repo config gains `batch_limit` (issues/config.yaml, integer >= 1, default 4) counting the whole merge stack including the holder. mergeTurn's follower selection (src/next.ts:1017-1020) takes at most `batch_limit - 1` followers, or `min(batch_limit - 1, holder state batch_limit)` when the holder carries a split limit from today's split. The first batch of a holder is never the whole queue. A member that conflicts while its stack builds is excluded only from that attempt: the attempt record keeps the excluded slug, and the next attempt may carry it again. The persistent per-leaf `solo` mark set at src/next.ts:1179-1181 goes away; the holder-conflict solo attempt (batch `solo`, src/next.ts:1152-1163) is unchanged (A,B,C; operator 2026-10-10). `akrogon config` prints the key, and the setup and merge guides document it.

## Why
Queue length sets batch size today (whole-queue first batch, limit reset per holder at src/phase.ts:154): a long queue makes a big batch that goes red and grows the queue (#62, #68). A conflict solo mark keeps a leaf out of batches for its whole stay in merge, though its conflict was with one stack that may since have landed (B,C).

## Done-criteria
1. With 6 leaves queued and no `batch_limit` set, the first attempt's batch record holds the holder plus 3 members.
2. With `batch_limit: 1`, an attempt carries no members; with `batch_limit: 2` and a holder split limit of 0, it carries no members; with `batch_limit: 4` and a holder split limit of 1, it carries 1.
3. A `batch_limit` of 0, a negative number or a non-integer is refused by config parsing with an error naming the key.
4. A member that conflicts in one attempt's stack build is left out of that attempt and is eligible as a member in the next attempt (A,B,C).
5. `akrogon config` prints the effective `batch_limit`, and docs/guide/setup.md and docs/guide/merge.md describe it with the default 4 and total-stack meaning.
6. The blocking `checks` pass.

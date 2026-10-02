# Intake: temp-release

Destination akrogon: leaf temp stops slowing or breaking tests and its RAM is freed as soon as the leaf releases.

## Provenance
Operator note in session, 2026-10-02. No GitHub issue found (`akrogon pull` in akrogon: 2 open, #52 and #53; framework seeds have no temp issue).

## Operator note, verbatim
"I pulled another issue. We need to chart the temp folder issues and revert to tmp while also clearing all the ram as soon as teh leaf releases. Or whatever you think is the best. We just can't keep it like this in their own temp folders, because the tests are slow, and they break. Consult with slot B about it."

## Agent findings (A, 2026-10-02)
- F1 History. Chart test-time-and-temp (handed off 2026-10-01) placed leaf TMPDIR at `/var/tmp/akrogon-<uid>/<slug20>-<hash12>` (issues/chart/test-time-and-temp/forks/leaf-temp.md), delivered in 1db7734. Commit 5b2f4d0 (2026-10-02 16:56) moved the root back to `/tmp/akrogon-<uid>` because on-disk `/var/tmp` made headless Chromium captures hang at random in framework verify, added `NODE_DISABLE_COMPILE_CACHE=1` for seats (the node compile cache grew one leaf to 657k files), and empties a leaf's scratch when a new tab starts (src/next.ts:338-353). The installed `akrogon` runs this repo's src (readlink), so 5b2f4d0 is live.
- F2 Why per-leaf folders exist: Chromium's socket under TMPDIR must stay within 108 bytes (measured TMPDIR limit 62 bytes); `/tmp` inode exhaustion hit framework leaves before (emdash-conversion u10-report.md:12, emdash-kit review-A.md:60, review-B.md:153); a shared TMPDIR gives no owner for deletion.
- F3 Deletion today: only for merged leaves, on tab close or `cleanupMerged` catch-up (src/next.ts:599-622, 777). Failed, parked and closed-unmerged leaves keep their folder until a new tab empties it or the operator's 7-day `tmp-sweep`.
- F4 Live state now: `/tmp` is tmpfs 62G, 11G used, 532k of 4.19M inodes. `/tmp/akrogon-1000` holds 0 bytes (one empty leaf folder). `/tmp/claude-1000` holds 9.5G and 508k inodes. Leftover framework test folders in plain `/tmp`: five `page-measure-*` (~100M, ~3.7k files each) and `bc-sb-*` (up to 151M). `/var/tmp/akrogon-1000` still holds 3 folders, 12M, from before 5b2f4d0.
- F5 Unknown: which tests are slow or break now, after 5b2f4d0, and whether the cause is the per-leaf path, cold caches, RAM pressure, or leftover temp written outside TMPDIR.

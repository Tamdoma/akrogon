# temp-release map: A independent

## Findings
- A1 The slow and breaking causes on record are both fixed in 5b2f4d0 (live): on-disk `/var/tmp` made headless Chromium captures hang, and the node compile cache keyed every random fixture path (657k files in one leaf). The leaf folder itself sits on the same tmpfs as plain `/tmp`, so it is equally fast.
- A2 No framework failure is logged after 5b2f4d0 (framework issues/log.jsonl, last failure 14:59, commit 16:56). Whether anything is still slow or breaking is unmeasured.
- A3 Going back to plain `/tmp` (no per-leaf TMPDIR) removes the only owner that lets akrogon free a leaf's RAM. It also brings back the shared-`/tmp` inode exhaustion seen before (emdash-conversion u10-report.md:12). The per-leaf folder is what makes "free RAM on release" possible.
- A4 RAM is freed today only for merged leaves (src/next.ts:599-622, 777). Failed, parked and stopped leaves keep their scratch in RAM until a new tab empties it (src/next.ts:340) or the 7-day sweep runs.
- A5 Writes outside leaf TMPDIR: `/tmp/claude-1000` 9.5G and 508k inodes (Claude Code's own temp from operator sessions, not a configured seat harness); `page-measure-*` from 2026-09-30, before leaf temp existed (page-measure.test.ts:110,207 uses `os.tmpdir()`); `bc-sb-*` created 13:29 and 13:57 today by an unfound writer. `/var/tmp/akrogon-1000` holds 3 stale folders (12M) from before the move.

## Forks
- T1 Release point: when is a leaf's scratch deleted? 1a whenever its tab is gone, any outcome (the existing `tab_closed` event plus catch-up); 1b merged only (today); 1c at every phase end. Recommend 1a: a tab gone means no seat can use the scratch; the skills already say anything needed later goes in the leaf folder.
- T2 Location: keep per-leaf folders on `/tmp` (today) or plain system `/tmp`. Recommend keep: same RAM, plus an owner for deletion and the 62-byte socket bound.

## Off route
- `/tmp/claude-1000` growth: operator's Claude Code sessions, not akrogon.
- Old `page-measure-*`, `bc-sb-*` and `/var/tmp/akrogon-1000` leftovers: one-time operator cleanup.
- Framework tests that leak temp folders: framework destination.

## Pitfalls
- Red-on-base runs record log paths under TMPDIR (implement-issue:38, check-issue:57); with 1a those paths vanish once the tab closes. Failing names and tails are already copied into the report, so only the full log is lost.
- Deleting while a worker launched outside the tab still writes: the worker inherits TMPDIR but its process may outlive the tab.

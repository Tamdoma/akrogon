# Brief: log-reader

## What
Add `akrogon log <path>`, one resolver that finds a recorded log either as a plain file or as a member of its owner's `evidence.tar.zst`, and make `akrogon flaky` read logs through that resolver. Skill lines that tell a seat to read a recorded check or verify log name `akrogon log <path>`.

## Why
Closed owners will hold their logs only inside `evidence.tar.zst` (leaf close-pack), and recorded paths still say `issues/open/...` and point at the checkout that wrote them. Without one reader, every log cited in a report, receipt or timing record becomes unreadable once its owner closes.

## Done-criteria
1. `akrogon log <path>` prints the exact bytes of a plain log at a recorded path, given as an absolute path from any checkout of a registered repo (main checkout or a worktree) or as a path relative to cwd, including a member whose own path contains an `issues/` folder (for example `issues/chart/<chart>/direct/nested/issues/check-x.log`) (B).
2. When the plain file is gone and the owner folder holds `evidence.tar.zst` with that member, `akrogon log` prints the member's exact bytes, including bytes 0, 13 and 255, for a recorded `issues/open/<owner>/...` path whose owner now sits under `issues/closed/`, for a `issues/parked/<owner>/...` path, and for `issues/chart/<chart>/direct/<member>`.
3. Run outside any repo, `akrogon log` resolves against every registered repo and exits non-zero naming the matching repos when more than one matches; a path that matches nothing, or an archive that cannot be read, exits non-zero naming the path.
4. `akrogon flaky` lists the failed test names of a red verify log whether that log is plain or packed; it prints `(log gone)` only when neither a plain file nor an archive exists for the owner, and exits non-zero naming the archive when the archive is broken or lacks the member.
5. Every skill line in `skills/` that tells a seat to read a recorded check or verify log, other than the lines check-path-print owns (its log-coverage item 8 list), names `akrogon log <path>`, and `akrogon log` appears in the README command table (C).

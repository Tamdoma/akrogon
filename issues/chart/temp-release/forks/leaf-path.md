# Leaf path

## Question
Q1. Should leaf temp stay a per-leaf folder on `/tmp` with a shorter name (`/tmp/akrogon-<uid>/<hash12>`) checked against the full nested socket path, go back to plain system `/tmp`, or keep today's name and give browsers a separate short runtime folder?

### Carries
- INTAKE operator note: "revert to tmp ... Or whatever you think is the best."
- Prior lock test-time-and-temp/forks/leaf-temp.md Q1: `<slug20>-<hash12>` name, hash-only foreclosed; reopened on map F3.
- Map F3, F4 (slots/map-merged.md).

## Findings
- Round files: slots/map-A.md, slots/map-B.md, slots/map-merged.md, slots/map-rebuttal-B.md.
- (A,B) Recommend keeping a per-leaf folder on `/tmp`, shortened to `/tmp/akrogon-<uid>/<hash12>`, with the full nested socket path checked before handoff: page-measure plus browser-core socket is 121 bytes today, 101 shortened for uid 1000, 107 worst case for a 10-digit uid (B; source arithmetic, Linux limit 107).
- (A,B) Plain `/tmp` is the same tmpfs, so it buys no RAM speed; it drops the only owner for deletion. Owned folders still share one inode pool (B R2).
- Alternative 1c: keep today's name and give browsers a separate short runtime folder; needs its own owner and cleanup (B).
- Research: unix(7) sun_path; systemd.io/TEMPORARY_DIRECTORIES (systemd team); framework page-measure.mjs:312, cdp-core.mjs:67-70,118-121; offer-join simple-banner.test.ts:25-32, route-fidelity.test.ts:88-98.

## Taken
2026-10-02, operator, verbatim: "1a"

Leaf temp stays one folder per leaf on `/tmp`, renamed to `/tmp/akrogon-<uid>/<hash12>` (12 hex of sha256(repo.root + "\n" + slug)), still derived by `leafTemp`, never stored, created 0700. The handoff checks the full nested socket path (framework page-measure plus browser-core) against the Linux 107-byte limit for a 10-digit uid. Running panes move to the new path only when their tab restarts. Reason: same RAM as plain `/tmp`, keeps an owner for deletion, and fits the nested socket. Foreclosed: 1b plain system `/tmp`, 1c separate short browser folder. Reopens test-time-and-temp leaf-temp's `<slug20>-<hash12>` name.

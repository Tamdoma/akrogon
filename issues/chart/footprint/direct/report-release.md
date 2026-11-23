# Direct landing: release-slim (2026-11-22)

- 0a74a994 on main: `/issues export-ignore`. D: round 1 fix (docs link), A rebutted, round 2 ready.
- Verify green. Guard refused the receipt only because A changed the live test command (timeout 30000 to 120000) during the run; the code verified green.
- Deployed 0a74a994. New release 53 MB on disk (was about 250 MB).

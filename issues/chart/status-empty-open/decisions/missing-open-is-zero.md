# What does status print for a repo with no open leaves?

## Question
Confirm: missing `issues/open` reads as zero leaves, and a zero-leaf repo prints its name followed by an indented `no open leaves` line. Exit code stays 0.

### Carries
None.

## Findings
- scanRepo in src/status.ts throws on a missing folder and readLog already tolerates a missing file, so the fix is symmetrical.
- The row format is parsed by tests/status.test.ts with a field regex, so the new line must not look like a leaf row.

## Resolution
Operator answer (2026-09-11): `1-A`. Missing `issues/open` counts as zero leaves. A zero-leaf repo prints its name followed by an indented `no open leaves` line. Exit 0. Reason: one symmetrical fix matching how readLog already tolerates a missing file, and it answers both complaints in the report. Foreclosed: fixing only the crash and leaving the bare name.


# Intake: host-run-load-names

## Scope

A run-check under a made-up name that runs a whole full suite skips the one-at-a-time line. Destination: akrogon (src/run-check.ts). Follow-up to host-run-load (Tamdoma/akrogon#118), its accepted limit "ad-hoc run names unbounded" (rebuttal C R2).

## Provenance

- Operator: 2026-10-24 door session w8:pNP

## Source: operator 2026-10-24

ok, and how much would that slow everything down?

ok, fix it here yourself, use slot b to check your work

then commit and gacp

autopilot do it yourself

## Agent findings

- 2026-10-24 ~18:20: framework cover-image-sizes ran `akrogon run-check --name merge-verify-rerun8 -- sh -c '... && sh -c '\''bun run framework:verify'\'''` (pid 2867326) while undersized-photo-hold's verify held the line. Two framework verifies at once, load 55 on 32 threads.
- Classification today: `full: repo.config.full.includes(name)` at src/run-check.ts:229, name only.
- Operator chose O1 with an exact end match: a run counts as full when its command ends with a full check's command, nothing after it, at a word boundary. `npm test -- one.test.ts` stays light (R1). A changed command can still slip past (R2, accepted).

# What happens to the unread priority and slot fields?

## Question
Keep, or delete with migration?

### Carries
`src/state.ts:15,28`, strictObject schema, shapes.md state template, chart door writes `priority`.

## Findings
(both) no reader in scheduling. (B) status detail serialises them; removal under strictObject rejects old files without a migration.

## Resolution
Operator 2026-09-11: "Just make sure that in the future if they're not used or consumed anywhere, delete them. We want to keep everything simple and moving Without adding new machinery and potential failure points." Delete `priority` and `slot` from the schema, from `dispatchSlot`, from shapes.md and the chart door handoff batch, and strip them from every existing state file under open, closed and parked in the same leaf. Foreclosed: keeping them as metadata; giving priority scheduling meaning.

# Brief: status-attention-facts

## What

`akrogon status --json` owns one attention predicate per leaf and reports it: each leaf carries `attention`, a list of the recorded facts that make it need the operator, and `red` becomes `attention.length > 0`. Two facts join the existing three (failed phase, missing artifact, undelivered prompt): a dependency labelled parked, missing or unreadable, and a merge whose command-owned land job stopped without recording a successful push. Each leaf also carries `waits_on`, the unfinished required seats with no busy timestamp for its phase, from `src/routing.ts`. The envelope's `red` total keeps its meaning (red leaves + unreadable entries + failed deploy) and so grows with the new facts.

## Why

The Tasks board is being regrouped by what each task needs (chart tasks-hierarchy). Its Needs you section and the panel-bar red dot (`envelope.red > 0`) both read the JSON envelope and must agree on one definition, owned by the producer. The text view of `akrogon status` is not changed by this leaf. Today a task waiting on a parked or missing dependency, or a merge whose job died, looks calmly waiting forever, and the board would have to copy akrogon's phase rules to say which seat is next.

## Done-criteria

1. In `akrogon status --json`, a leaf whose `blocked_by` names a dependency labelled parked, missing or unreadable has `red: true` and an `attention` entry naming that dependency and its label; a leaf whose dependencies are all merged or live leaves has no attention entry for them.
2. A leaf in phase merge with a command-owned land attempt whose unit is not active and whose batch records no successful push (`recorded` not true) has `red: true` and an attention entry for the stopped land job; the same leaf with the unit active, with `recorded: true` (a pushed land awaiting reconciliation), or after the land handed off to the seat, has none.
3. Failed phase (with or without a failure record), a recorded missing artifact and a delivery error on a seat with no busy timestamp still each give `red: true` with their own attention entry, and a leaf with none of the five facts has `red: false` and an empty `attention`.
4. Every leaf in the JSON carries `waits_on`: the required seats of its phase (per `requiredSlots` in `src/routing.ts`, with `fix_rounds`) that are not in `done` and have no busy timestamp; check.review before a fix with both seats idle gives A and B, after a fix gives B, and merged or failed gives none.
5. The envelope `red` equals red leaves + unreadable entries + failed deploy, counting the leaves made red by criteria 1 and 2.

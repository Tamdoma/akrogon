# Opening map, A (blind)

Base data: slots/precharter-D.md F1-F7, precharter-A.md (ledger 10-17..24: 400 framework merge runs, 214 red, 182 leaves).

## Forks

K1 Receipt grain. Today one receipt per configured command (`verify` = whole `bun run framework:verify`), keyed by tree (src/verify.ts greenRun). Options: (a) keep; (b) member grain: merge_checks names a parallel group of members, akrogon runs and records each member; (c) parse member results out of one log. Pick (b): the suite already has members, akrogon already has tree receipts and scopes; (c) keeps one opaque process and parsing, more fragile. Breaks: framework package.json core alias and run-verify-stages; verify-aliases tests that pin "a red core lane runs every core lane".
K2 Decided red. Options: (a) run all members to the end (today, --no-exit-on-error); (b) stop the group at the first red member. With K1b, (b) loses nothing: members that never ran have no receipt and run next round, members that passed are skipped. Without K1b, (b) hides other failures and costs extra rounds. Pick (b) only together with K1b.
K3 Base side of --known-red. base-red lock: base runs fresh. Under K1b the base runs fresh but only the head's red members, not the whole suite. This keeps the lock and its reason (a flaky or broken unit must be seen red on the real base now), and cuts the base run to the red member. Reject reusing a green base receipt (D I2): it changes the known-red verdict for load flakes, so it is not free. Pitfall: base-red says an incomplete run blocks; with K2b the head run is incomplete by design, so the rule becomes "every member that ran red".
K4 Same-head retry (merge-issue, implement-issue, check-issue one retry rule). Under K1b the retry reruns only red members. Pitfall: a member that fails only under full-suite load passes when rerun alone, so contention flakes go green more easily. That is the retry rule's existing judgment gate, not new.
K5 Unrecorded suite runs (D F6, 50 CPU-h). Options: (a) prose (today); (b) run-check refuses a command equal to a configured checks/merge_checks entry or member, pointing to `akrogon verify`; (c) run-check records a receipt. Pick (b): one refusal at the point of use, removes the class; (c) creates a second receipt writer.
K6 Scope. Members are a per-repo config list, so every repo gets it; repos without a group keep one command. Framework needs one leaf to declare its members (package.json, issues/config.yaml), blocked by the akrogon leaf.

## Pitfalls
- Tree receipts trust that a member's inputs are in the tree; same assumption as today, now per member.
- Members run as separate processes lose bun run's shared stdout; logs per member (receipt has per-command log already).
- Cheap stays a prior stage; merge_covers stays.
- Measuring: before/after from the journal "Consumed" lines joined to run ids (D's method); no new ledger field.

## Estimate
Red suite: about half the core CPU of a full run (fail-fast) and a base run of one member instead of a whole suite; retries of one member. D estimates 60-70 CPU-h of 484 over 11 days; more after K3 since the base is now one member.

Last operation: wrote A's blind map.
Next: merge with B and D maps.

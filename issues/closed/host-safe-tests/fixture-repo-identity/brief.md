# Brief: fixture-repo-identity

## What

Every test fixture registers a repo identity unique to that fixture, derived from the fixture itself, and every test consumer of that identity reads it from the fixture: the global config `repos` key, `setPrefixes` and `setSeat` maps, `hcCore`'s discovery document, seat names and labels and the tests' expectations of them, and the `leafSlice` input of every test teardown and slice lookup. Product code is unchanged. Result: two concurrent runs of the suite on one host (for example two `akrogon verify` runs of different leaves) never stop each other's seat slices.

## Why

Tamdoma/akrogon#130 reported `tests/hc-delivery.test.ts` "a working seat gets no send ..." red in 5 of 5 verifies while other leaves' verifies ran on the same host. Two channels existed. The leaked hc-shutdown units channel is delivered by 97034315. The remaining channel: every fixture registers its repo as `repo` (tests/helpers.ts `fixture`), `leafSlice` hashes `repo.name/slug` (src/scope.ts), and test teardowns run `systemctl --user stop leafSlice({ name: 'repo' }, slug)` in the real user manager, so a concurrent run's teardown stops the other run's live seat. Observed 2026-11-09 on main 49d2c916: a second run started 7 s or 10 s after the first failed at hc-delivery.test.ts:145 (`cli` exit 3) both times; started 3 s after, both passed (the teardowns coincided).

## Done-criteria

1. When one fixture's teardown stops its slices while another fixture with the same leaf slug still has a live seat, the other seat survives and completes its delivery sequence. The proof synchronizes on the first fixture's teardown landing while the second fixture's seat is live (not a launch delay) and is red on the base (the line-145 failure class) and green after.
2. The tests this leaf changes pass in the configured `test` command; reds outside the leaf (the hc-listener pair recorded 2026-11-09) are judged by the existing `akrogon verify --known-red` path, not by this leaf.

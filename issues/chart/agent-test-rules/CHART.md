# Chart: agent test rules

## Destination
akrogon seats write only tests worth having, change an existing test expectation only with a cited source, never get stuck on a bad test, and `akrogon phase` refuses a move that changed an existing test without a cited source.

## Forks taken
- [test-authority](forks/test-authority.md): cited source required for any seat to change an existing expectation (1a); `akrogon phase` git check (2a); this chart owns rules only (3a).
- [test-worth](forks/test-worth.md): real boundary first (5a); delete false or duplicate tests with reason and survivor (6a); fail-before/pass-after or one deliberate break (7a).
- [outcome-criteria](forks/outcome-criteria.md): done-criteria state results, never tests (4h); no brief lock now (9a).
- [bad-base-test](forks/bad-base-test.md): first seat fixes a wrong test on base in its own commit (8a).
- [test-change-check](forks/test-change-check.md): built-in test path rule (10a); `Test-Change: <path> <why>` trailer per file (11a); check-only run before merge push (12a).

## Open forks
None.

## Fog
None.

## Off route
- Test selection, running fewer tests, Bun speed: framework-test-scope and akrogon-slow-phases own them (test-authority 3a).
- One-time prune of existing suites: operator chose 6a over 6b.
- B-only acceptance test ownership: not chosen (round 4 alternatives).
- Deduplicating standing-design.md:7-10 against implement-issue:57: not needed for any answer.
- Peer-wait stall in this door: seeded as Tamdoma/akrogon#54.

Handed off 2026-10-03

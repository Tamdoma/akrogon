# Direct plan: next-same-work

Task source: forks/same-work.md Taken (operator 1a, 2026-10-21). Destination in CHART.md.

## Done-criteria

1. `akrogon next x` with open issue `x` holding only leaf `x` starts leaf `x` once.
2. An epic whose only issue has the epic's name starts that issue's leaves once.
3. Matches selecting different leaf-path sets still refuse with the kind+path listing and no Herdr call (issue `x` with leaves `x` and `y`; epic with a second issue; owner vs unrelated leaf; two same-name issues).
4. An unreadable leaf under a matched owner keeps the refusal.
5. An existing folder from cwd keeps path meaning (unchanged test).
6. docs/guide/parts.md says a same-work bare name starts the work and a path is needed once readings differ.

## Unit (serial-solo, one wave)

- Tests (committed first, tests/next.test.ts named-target block): flip "refuses an issue and its same-name leaf" to a start (Test-Change: operator 1a); add epic/only-issue start, issue with second leaf refuses, unreadable sibling refuses.
- Code: src/next.ts resolveName collapses matches when every match's leaf-path set is equal and no unreadable/unknown inventory entry sits under a matched owner.
- Doc: docs/guide/parts.md folder section.

## Proof

- Targeted: `bun test tests/next.test.ts -t "same-work|ambiguous name|existing folder|named target"` via akrogon run-check.
- Full: `akrogon verify --holder <chart>/direct` at landing.

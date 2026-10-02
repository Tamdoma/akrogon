# Heavy run slot

## Question
Q1. Should heavy test runs (merge suites, base runs, slow proofs) on one machine take turns through one machine-wide slot, with waiting visible and costing no repair round, released when the process and its children exit?

### Carries
- F3: nothing limits heavy commands across leaves; max_active counts leaves (src/next.ts:276-307).
- Map recommendation (A,B): one host slot to start, enforced where heavy callers run commands, not in next's prompt loop; not lower max_active; not load-average adaptive.

## Findings

## Taken

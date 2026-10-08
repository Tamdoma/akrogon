# Leaf split, merged notes (A, B)

## Agreed
- Two parallel leaves in the one standalone issue, no blocked-by. (A,B)
  - named-targets: owner and leaf name resolution at selectLeaves, collision refusal, discovery errors kept, target docs and the same-name path example in docs/guide/parts.md. (A,B)
  - blocked-report: manual reporting subjects (selection and --all inventories), failed/deps/inputs report in dispatch, automatic silence, merged exclusion, report docs in docs/guide/next.md. (A,B)
- Each is checkable alone: names with today's waits, the report with today's slug, path, bare next and --all targets. (A,B)
- Cost: both edit src/next.ts, tests/next.test.ts and docs/guide/next.md, so the second to merge resolves conflicts. File overlap is not a dependency. Two leaves use two seat pairs. (A,B)
- Rejected: one leaf, either order edge, a third integration or docs leaf, a new epic. (A,B)
- The blocked-report tests use paths, never owner names. The names leaf does not change wait reporting. (A,B)
- Evidence: src/next.ts:1167-1207 selection versus :593-660, :698-717, :1231-1270 dispatch and routing; tests/next.test.ts:1204-1217 already tests waits through --all. (A,B)

## Differ
- Combined test of `next <epic>` over a mixed tree. A: it can only land with the second merge, so leave it out of both contracts and rely on each leaf's own tests plus the full suite after both land. B: verify composition on the combined code, no third leaf, no edge.

# Merged round: mismatch reporting (2026-09-19)

Correction (A, confirmed by B): a mismatched leaf does not block that repo's healthy leaves at dispatch; discover() drops it and the sweep dispatches the rest (src/next.ts:515-531, tests/next.test.ts:1098-1113).
New finding (B): activeCount() counts every unreadable leaf, mismatches included, toward the global max_active (src/next.ts:255-265). With 96 foreign leaves and max_active 12, no new leaf can allocate in any repo. The seed's "dispatch continues for other repos" holds only for leaves already allocated.

Q1 aggregate: (both) yes, one structured line per (repo, stored key) per invocation with registered key, stored key, count and paths; per-leaf lines stay for schema, depth, duplicate-slug and I/O causes. (B) deduplicate across repeated discoveries within the invocation, keep nonzero exit status, a mismatch is any stored key unequal to the registered key, registered or not. (A) first path in the line for the existing tests' skip.path lookup; (B) all paths, so the line is complete evidence.
Q2 keep dispatching: (both) yes. (B) requires classifying a parsed ownership mismatch separately from unreadable state so foreign records do not consume capacity; keep foreign leaves out of dispatch, cleanup and dependency lookup; keep selectLeaves' quiet return when only foreign leaves matched.
Q3 walk-time only: (both) yes; init unchanged.
Recommendation (both): 1-A 2-A 3-A, with Q2-A carrying the capacity fix.

# 1. Goal
Repair F1 and F2 from review-A.md and review-B.md for status, preserving plan C1–C6. Repair round 1, reviewed head 333ce854da8798f06be1674bc9daa9ae4da42730. B delegates this bounded unit under implement: subagents.

# 2. Numbered acceptance criteria
1. F1: A discovered unreadable state.yaml (including dangling symlink) reports its exact path and repo, exits nonzero, and retains another readable repo. Demonstrate a new regression red before production repair and green afterward.
2. F2: Existing status scenarios still verify each required value associated with its field, hierarchy/attention order, exact ages, history filtering and no writes. Assertions tolerate cosmetic spacing, optional tab quotes and A/B slot ordering. Parse existing YAML/JSON detail data rather than asserting serialization strings. No new output API.
3. Keep production changes confined to discovered-state reading. No other behavior changes.

# 3. Read-first list
../review-A.md, ../review-B.md, ../plan.md, ../brief.md and ../design.md. Worktree src/status.ts, src/state.ts, tests/status.test.ts, tests/helpers.ts. Pattern: existing subprocess fixture tests. Read /home/ivan/.codex/skills/implement-issue/ponytail.md and worker-protocol.md. There is no configured grounding index.

# 4. Change list and needed interfaces
src/status.ts: replace rediscovery with existing readState(folder) after finding state.yaml, preserving diagnostic path and existing uniqueness/repo checks. tests/status.test.ts: add the F1 regression and revise F2 assertions. No shared-file change needed. Existing readState returns State and throws on unreadable or invalid input.

# 5. Do-not, reasons and exceptions
Do not change state.ts, routing, next, config, dependencies or output design because the review fixes are confined to status traversal and assertions. Do not remove behavioral assertions, accept unassociated number occurrences, or build a general parser framework to avoid test failures. Do not call real herdr, GitHub or modify real state in tests. Return a mismatch with evidence if scope/interfaces need changing. Only B's revised brief authorizes an exception. These exclusions keep the repair minimal and preserve the accepted behavior, with exceptions only through a revised brief.

# 6. Ordered steps
Add the unreadable-state fixture assertion first and run red. Repair src/status.ts. Revise status assertions to check semantic values. Use small test-local extraction/regex only as needed, parsing YAML/JSON directly where available. Demonstrate cosmetic variants satisfy revised assertions while incorrect values do not (a temporary verification is sufficient, no test framework for the tests). Run the targeted check green, capture a real two-repo failed-state invocation in repair-1-command-evidence.json under this directory, remove temporary scripts, then complete this report. About two changed files. No commits or phase transitions by the worker.

# 7. Commands
AKROGON_BASE=33387facaaa93d38f2937d646f262233812cdf50 bun test tests/status.test.ts
No configured changed-test runner exists. This is the actual targeted Bun command. Save red/green outputs under this implementation directory. B owns formatting, typecheck and the full suite after the worker returns.

# 8. Done-when, evidence and report
F1 and F2 verified without weakening C1–C6. Record concrete command evidence and artifact paths. C7 live takeover remains operator-owned after merged. Preserve L1/L2 limitations.

Changed files and reasons: src/status.ts reads a discovered state directly with readState and retains repo/slug validation and exact diagnostic path. tests/status.test.ts adds the dangling-state two-repo regression, parses diagnostics and YAML/JSON detail values, and checks row fields independently of whitespace, tab quotes and slot ordering. Only these two worktree files changed.
Tests run: AKROGON_BASE=33387facaaa93d38f2937d646f262233812cdf50 bun test tests/status.test.ts first failed at the new unreadable-state nonzero assertion (repair-1-red.txt), then passed all 5 tests with 127 assertions (repair-1-green.txt). Temporary cosmetic verification reused the actual row assertions and passed 91 assertions, accepting spacing/quote/order variants and rejecting seven incorrect field values (repair-1-cosmetic.txt). Temporary test removed. A real two-repo status invocation returned code 1, exact unreadable repo/path, and the readable tree (repair-1-command-evidence.json). All artifacts are beside this brief. Formatting, typecheck and full suite remain B-owned.
Known limitations: L1 intervention timing, L2 unlocked diagnostic reads.
Unverified criteria: C7 operator post-merge proof. F1/F2 verified. C5 notification behavior was unchanged and its full-suite recheck remains B-owned. No commit or phase transition performed.

# Slot B brief: Leaf split final-shape check

Operator answer 2026-10-08: `1a` (two parallel leaves, no blocked-by).

Proposed final shape to record as Taken:
1. Leaf `named-targets` and leaf `blocked-report` in one standalone issue, no blocked-by between them.
2. Composition is proven by two criteria instead of a combined test:
   - named-targets: for an epic and for a nested issue, `next <name>` produces the same Selection (repo and leaf set) as `next <its repo-relative folder path>` from the repo root.
   - blocked-report: reporting subjects are the leaves of the Selection (or the --all inventory), independent of the input form. A test shows a one-leaf folder target and the same leaf's slug produce the same report, and a multi-leaf folder target reports each subject.
3. Each leaf updates only its own docs: named-targets the target forms and same-name path example (docs/guide/parts.md, target text in docs/guide/next.md); blocked-report the report and automatic silence text in docs/guide/next.md.
4. Whichever merges second resolves the src/next.ts, tests/next.test.ts and docs/guide/next.md overlap.

Return only problems with this shape (does it actually prove name targets get the report; missed cases; evidence) to /home/ivan/Work/infra/akrogon/issues/chart/next-named-targets/slots/leaf-split-final-check-B.md, or "No problem." No repo edits.

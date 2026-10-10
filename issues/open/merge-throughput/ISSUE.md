# Issue: merge-throughput

- [bounce-repair-proof](bounce-repair-proof/brief.md): a merge-bounce repair reruns the exact command that rejected it
- [batch-limit-repo](batch-limit-repo/brief.md): repo cap on merge stack size, default 4, and solo marks clear
- [dependents-first](dependents-first/brief.md): leaves with the most waiting dependents dispatch and merge first
- [merge-attempt-records](merge-attempt-records/brief.md): one line per merge attempt in issues/merge-attempts.jsonl
- [red-main-hold](red-main-hold/brief.md): a red main holds the merge turn instead of bouncing holders
- [hold-fix-leaf](hold-fix-leaf/brief.md): one named fix leaf may merge during a hold
- [merge-bounce-rounds](merge-bounce-rounds/brief.md): every merge bounce counts toward fix_rounds
- [red-batch-culprit](red-batch-culprit/brief.md): a red batch ejects the leaf B names instead of halving

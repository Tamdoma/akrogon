# Brief: archives proof (consultants B and C, independent)

Fork: /home/ivan/Work/infra/akrogon/issues/chart/footprint/forks/archives.md (taken: keep nothing physical if git + ledgers answer "what happened, where").
Repos: /home/ivan/Work/infra/akrogon and /home/ivan/Work/infra/tamdoma/framework (read only).

Task: pick 6 closed leaves across both repos that had at least one red check (look in issues/closed/**, merge-attempts.jsonl, verify-runs*, log.jsonl). For each, answer the operator-style question "what failed, where, and why" TWICE:
1. using only what stays without archives: git log/show, ledger rows (merge-attempts, verify-runs, log.jsonl, flaky), reports/markdown in the closed folder;
2. using the evidence archive (evidence.tar.zst) too.
Score each leaf: archive needed (yes/no) and what exactly was missing without it (failing test names, excerpt, command, log path...).
Then recommend: stop committing archives, keep a small extract (e.g. failing test names + 20-line excerpt into a ledger row), or keep archives. Name the code path that writes the archive (file:line) and what the smallest change would be. No edits.
Write to <your slot>: B -> slots/archives-B.md, C -> slots/archives-C.md (folder: /home/ivan/Work/infra/akrogon/issues/chart/footprint/slots/). Then hc send t126 "done <slot>: <path>".

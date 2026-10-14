# Review brief: peer-ask, round 2 (slot B)

Operator: "if you hadn't run the script, that's a problem. Find out why you hadn't -- and fix it".

Cause, from A's transcript: A sends a prompt in one command and runs peer-wait.ts in a later one. Twice today something got between the two: a new operator message at 06:22, and a review sent with send-text, which bypassed the skill rule. The wait never ran and the answers sat for about 10 minutes.

Fix: /home/ivan/Work/infra/akrogon/issues/chart/idle-processes/slots/peer-ask-diff-2.patch (worktree /tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3f182-ee22-4083-abee-b4fb35991889/scratchpad/wt-ask). peer-ask.ts takes a budget and then pane/file/message triples. It refuses reused return files and bad args before any prompt, prompts each peer with the guarded herdr call, then runs peer-wait.ts for every started peer in parallel. It exits non-zero if any prompt or wait failed. questions.md:46 names it. peer-wait.ts is unchanged.

D's round-1 review (/home/ivan/Work/infra/akrogon/issues/chart/idle-processes/slots/peer-ask-review-D.md) covered: null exit code on signal, the parallel shell form hiding failures, missing tests, and parseBudget. Check those are fixed, and look for anything new.

Review as an implementer. Write /home/ivan/Work/infra/akrogon/issues/chart/idle-processes/slots/peer-ask-review-2-B.md: defects only, each with file:line and a concrete failure, or "no defects". Change nothing else.

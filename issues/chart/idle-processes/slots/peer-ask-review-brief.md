# Review brief: peer-ask (slot D, B is at model capacity)

Operator: "if you hadn't run the script, that's a problem. Find out why you hadn't -- and fix it".

Cause found in A's transcript: A prompts a peer in one command and waits with peer-wait.ts in a later one. Twice today something came between them: a new operator message at 06:22, and a review sent with send-text that bypassed the skill rule. The wait never ran and the answers sat for about 10 minutes.

Fix: /home/ivan/Work/infra/akrogon/issues/chart/idle-processes/slots/peer-ask-diff.patch (worktree /tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3f182-ee22-4083-abee-b4fb35991889/scratchpad/wt-ask). New peer-ask.ts runs the guarded herdr prompt and the peer-wait loop in one call, so there's no gap. peer-wait.ts keeps its CLI for reruns after outcome budget. questions.md:46 now names peer-ask.

Review as an implementer. Write /home/ivan/Work/infra/akrogon/issues/chart/idle-processes/slots/peer-ask-review-D.md: defects only, each with file:line and a concrete failure, or "no defects". Change nothing else.

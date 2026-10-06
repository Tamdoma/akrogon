# issues-only, slot A

Evidence: framework "add issues" commits on 2026-10-05 change `issues/` and `learnings/` (`55f002467`, `d4dc8cefa` touch `learnings/LESSONS.md` and `learnings/history/*`). Under merge-order 3a, B writes LESSONS lines before merge, so `learnings/` commits will keep arriving during runs. A rule that excludes only `issues/` still reruns for them. akrogon tests read `learnings` only in init fixtures (`tests/init.test.ts`), framework scripts and tests reference neither folder.

1a recommended: command-owned reuse rule. When the top push is rejected, fetch the new main M2; if `git diff --quiet M1 M2 -- . ':(exclude)issues' ':(exclude)learnings'` and `git diff --quiet M1 M2 -- issues/config.yaml` both hold (M1 = main the batch was tested on), restack onto M2 and push without rerunning; record M1, M2 and both diffs in review-B.md. Anything else reruns. The decision is printed by the command so seats do not judge it. Cost: pushed SHA differs from tested SHA though code outside akrogon's record folders is identical; a consumer check that reads issues records or LESSONS would be unsound (none found).
1b: `akrogon sync` waits while a turn is held. Operator plain commits still race; sync blocked up to a run.
1c: always rerun. Correct, but each operator commit during a run costs a full run.
Pitfalls: `issues/config.yaml` change always reruns. A restack conflict (a leaf touching `learnings/`) falls back to the normal path.

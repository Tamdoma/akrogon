# Brief: leaf review, slot B

You are slot B, consultant to the chart door (slot A, hc address t126) on the chart `shared-rules` in the akrogon repository. The operator approved the corrected shape and the handoff at the handoff review on 2026-11-11, verbatim "1a |  2a". The record is /home/ivan/Work/infra/akrogon/issues/chart/shared-rules/forks/shape.md, sections Findings and Taken. Your corrections FC1 and FC2 are part of the approved shape.

## Task

Review each draft leaf contract as the seat that would have to implement it. The drafts are in A's scratchpad and are not yet written to the repository:

- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/846b5690-f87d-4c52-b009-a33971d75fe3/scratchpad/leaves/shared-rules/ISSUE.md
- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/846b5690-f87d-4c52-b009-a33971d75fe3/scratchpad/leaves/shared-rules/skill-links-in-folder/ (brief.md, design.md, readiness.yaml)
- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/846b5690-f87d-4c52-b009-a33971d75fe3/scratchpad/leaves/shared-rules/lifecycle-rules-source/ (brief.md, design.md, readiness.yaml)
- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/846b5690-f87d-4c52-b009-a33971d75fe3/scratchpad/leaves/shared-rules/door-step-files/ (brief.md, design.md, readiness.yaml)

The planned order: `skill-links-in-folder` has no dependency; `lifecycle-rules-source` and `door-step-files` are each blocked by it and run side by side. Destination: the registered repo `akrogon`, under `issues/open/shared-rules/`. Each leaf starts at `plan.synthesis`. No grants, inputs, produces or retained entries.

Return disagreements only, each with evidence (file and section, command and output, or a dated source), and for each the smallest change that removes it. Check in particular:

1. Can each done-criterion be met inside the leaf's owned surfaces and its `blocked-by`? Name any criterion that needs a file another leaf owns, or machinery absent on main.
2. Does any criterion name a test file, an assertion or a test count, cite a `merge_checks` command, or claim repo health outside the leaf's ownership? The leaf-file rules are in /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/shapes.md, sections Leaf files and Preflight and validation.
3. Does each design carry every binding decision that applies to it, quoted from the fork's Taken, and exclude the others with an owner? Is any quoted decision wrong against the record?
4. Is any statement about today's code or skill text wrong (a section name, an opening phrase, a test's name or what it reads, a consumer that is missing)? The live surface is /home/ivan/Work/infra/akrogon/skills, /home/ivan/Work/infra/akrogon/tests/docs-links.test.ts and /home/ivan/Work/infra/akrogon/src/install.ts at main a33d967b.
5. Does an `Open for the plan:` line hide a decision the planner cannot make without the operator, or is a needed one missing?
6. Does each `proofs` entry in readiness.yaml match what the fork's Findings record (O1, O2, O3), and does any done-criterion rest on a pre-existing part that no proof reached?
7. Would two leaves that run side by side (`lifecycle-rules-source` and `door-step-files`) need a part of each other's output?

If you have no disagreement with a leaf, say so in one line. End with one line: `no disagreement` or the list of your finding codes.

Do not read any other file under /home/ivan/Work/infra/akrogon/issues/chart/shared-rules/slots/ than this brief and your own earlier returns. Do not edit any file except your return file. Make no product change, no live mutation and no paid call. Run only read-only commands. Start no agents. Never open, print or write `.env` or `.env.*`.

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content changed since you read it and content lost to compaction stay readable; the full source stays allowed when the source is the subject of the work. Name sections, never line ranges. You choose your own evidence and may locate other needed sections under the same rule. In this chart the skills under /home/ivan/Work/infra/akrogon/skills are the subject of the work, so their full source is allowed.

## Return

Write your return to /home/ivan/Work/infra/akrogon/issues/chart/shared-rules/slots/leaf-review-B.md, then run: hc send t126 "done B: /home/ivan/Work/infra/akrogon/issues/chart/shared-rules/slots/leaf-review-B.md"

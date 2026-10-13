# Opening map brief (blind, same brief for slots B and C)

You are a charting consultant for the akrogon issue lifecycle (repo `/home/ivan/Work/infra/akrogon`). Slot A (Claude) runs the interview with the operator. You work independently. Do not read other slots' map files. Do not edit any repo file, do not run `akrogon next`, `akrogon phase` or any mutating command. Read-only investigation and scratch scripts under `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/cf0be9e3-21db-4a2f-9248-8cab8e0d5f5b/scratchpad/door/<your-slot>-work/` only.

Write your result to exactly this path (your slot letter in place of X):
`/tmp/claude-1000/-home-ivan-Work-infra-akrogon/cf0be9e3-21db-4a2f-9248-8cab8e0d5f5b/scratchpad/door/map-X.md`

## Intake (operator note, verbatim)

> Look at the discussion I had with the watch framework tab inside of the framework workspace. I want to see if we can speed up the process by eliminating chunks and using leaves instead.This is just my idea, but I'm open on doing any kind of a revamp that will speed up the process of implementation, which will not trigger as many tests, or better said, test rounds, as today. I want you to base everything on the actual logs from the previous two or three weeks of work. [...] This is very important, so give me the data that I really need.

## The watch-tab discussion

- Key excerpt (the chunk discussion and the agent's numbers): `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/cf0be9e3-21db-4a2f-9248-8cab8e0d5f5b/scratchpad/door/watch-chunk-discussion.md`
- Full operator/assistant text of that tab since 2026-10-10 (1.7 MB, grep it): `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/cf0be9e3-21db-4a2f-9248-8cab8e0d5f5b/scratchpad/door/watch-dialog.md`
- Treat the watch agent's numbers as claims to verify, not facts. In particular it claimed: small leaf (<200 lines) median 132 min in check+merge after implement; 92 merge failures across 143 leaves since Oct 1; chunk overhead 10-20 min; dechunk saves 15-30 min per chained leaf; `test_changed` stub (#87) fixed 2026-10-12 12:54 UTC.

"Chunk" = "unit" = worker sub-brief inside one leaf's implement phase (see `skills/implement-issue/{SKILL.md,worker-protocol.md,brief-template.md}`, `skills/plan-issue/SKILL.md:59`).

## Live surfaces

- Lifecycle docs: `/home/ivan/Work/infra/akrogon/docs/guide/{phases.md,merge.md,next.md,state.md,limits.md}`, `README.md`
- Skills: `/home/ivan/Work/infra/akrogon/skills/{plan-issue,implement-issue,check-issue,merge-issue}/`
- Command: `/home/ivan/Work/infra/akrogon/src/{phase.ts,next.ts,merge*.ts,config.ts,compare.ts,red-record.ts,base-run.ts}` (find the merge/stack code yourself)
- Prior speed work: `/home/ivan/Work/infra/akrogon/issues/closed/{parallel-units,long-implement}/`, charts under `/home/ivan/Work/infra/akrogon/issues/chart/`, lessons `/home/ivan/Work/infra/akrogon/learnings/`
- Framework config: `/home/ivan/Work/infra/tamdoma/framework/issues/config.yaml` (checks, merge_checks verify, merge_covers, fix_rounds 8)
- Akrogon config: `akrogon config` (run from each repo root)

## Data (the actual logs; window 2026-09-21 to 2026-10-12)

Per registered repo (`akrogon config` lists `repos`; framework is the main volume, also check akrogon, lens, blepsis):
- `issues/log.jsonl`: every phase transition with ts, from, to, slot, attempts, fix_rounds, verdict, head, diff stat, session
- `issues/merge-attempts.jsonl`: merge attempts with holder, members, outcome, start, end
- `issues/base-runs.jsonl`, `issues/red-records.jsonl`
- `issues/closed/**/<leaf>/`: state.yaml, plan.md, implementation/report.md, review-A/B.md, check logs
- `issues/token-ledger.yaml` (framework)
- Seat session transcripts: paths in log.jsonl `session` field (pi sessions under `~/.pi/agent/sessions/`, codex under `~/.codex/sessions/`, claude under `~/.claude/projects/`). Use these to count test/check command runs per phase if you can.

## Task

Produce an independent territory map for: "how do we cut implementation wall-clock time and the number of test rounds per delivered change, possibly by replacing chunks with leaves, or by any other revamp?"

Measure from the logs, do not estimate where a log answers. At minimum, give your own numbers for:
1. Per-leaf time by phase (plan, implement, check.review, check.repair, check.fix, merge, queue/wait between phases), median and p90, by size bucket, in the window.
2. Test rounds: how many times checks or the full verify ran per merged leaf, where in the lifecycle, and how long each took. Merge ejections and fix rounds per leaf and their cause classes (real defect vs flaky vs red main vs environment vs stale base).
3. Chunk cost: units per leaf, chained vs parallel, per-unit overhead, and defects attributable to unit boundaries.
4. Where wall-clock is idle (seat waiting, queue, dispatch gaps) vs working.
5. Whether the #87 change and other recent fixes already moved the numbers (before vs after, with sample size).

Then the map:
- Material forks (decisions that change the outcome), each with options, what each could break or invite later, and your pick with reason.
- Questions a practitioner would ask (cite named practitioners or primary sources with URL and date where you use outside knowledge, e.g. trunk-based development, merge queues, stacked diffs, test impact analysis).
- Pitfalls over the work's lifetime and what removes each.
- Anything surprising or contradicting the watch agent's claims.

Format: compact markdown. Each number cites its source file and how you computed it. Mark low-confidence items. List inputs read vs skipped. Keep it under about 2,500 words.

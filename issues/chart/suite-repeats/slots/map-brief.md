# Opening map brief: where akrogon's lifecycle time goes, and what to remove

You are a consultant seat (B, C or D, named in your prompt) in a chart-issues door for the akrogon repo at `/home/ivan/Work/infra/akrogon`. Work blind and independently: do not read any other seat's map file in `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/6fae401d-8a9c-4738-8769-5fa2827e9f67/scratchpad/map/`. Read only. Change nothing in any repo, run no `akrogon next`, `phase`, `verify` or anything that writes. The one file you write is your return file.

Return file (absolute, write it once when finished):

- Seat B: `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/6fae401d-8a9c-4738-8769-5fa2827e9f67/scratchpad/map/map-B.md`
- Seat C: `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/6fae401d-8a9c-4738-8769-5fa2827e9f67/scratchpad/map/map-C.md`
- Seat D: `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/6fae401d-8a9c-4738-8769-5fa2827e9f67/scratchpad/map/map-D.md`

## Reading rule

Read process text (skills, docs, chart files) by named section for the step you are answering: locate the section first, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source is allowed when the source is the subject of the work. Name sections, never line ranges, when you cite process text. Code may be cited by path:line.

## Intake (operator, verbatim)

Message 1: "<- anyhting useful we could use in this X post for akrogon? I'm just brainstorming on how to speed up, increase quality, etc."

Message 2: "use slot b consultant (already active codex) and create new slot c consultatnt (pi), and slot d consultant (agy with argon high effort) to discuss this and whether it's feasible to optimize the similar mechanisms inside of akrogon repo for faster and more efficient processes. Think about it as a systems thinker. Less is always more (less code, even removing) instead of cramming more code and increasing mental complexity. Think about if we can optimize what that screenshot talks about somehow."

The X post (screenshot, transcribed by A, @Voxyz_ai):

> Claude Code and Codex can push dozens of PRs a day now. Writing the code takes minutes, and the rest of the time goes to waiting on CI. Nine changes took each PR's CI from up to 40 minutes down to 2. One step was having an agent pull the last 150 CI runs and split every job into three parts: waiting for a machine, setup, and actually running. That alone showed that half the test jobs weren't using the dependency cache at all, a bug that had been sitting there for a whole year.
>
> Prompt: "Audit this repo's CI: 1. Use gh to pull the last 150 CI runs and split each job's time into three parts: waiting in the queue for a machine, setup (checkout, installing dependencies, restoring the cache), and actually running the task. List the 5 slowest jobs and how many seconds each part takes. 2. Check these 9 things one by one: queueing on the default runners; slow lint; slow typechecking; tests that aren't sharded, or machines that are too small; every test file reloading the whole app; slow setup (cache misses, clones that aren't blobless, more parallel tasks than cores); jobs that don't run in parallel; every PR running the full test suite; no local checks before push. 3. For each problem, tell me how many seconds it costs now, which line of which file to change, and roughly how much it would save. List the ones that cost more money (new runners, bigger machines) or run fewer tests separately for me to decide. Give me the report first. Don't change anything."
>
> Table, CI per PR 40 min -> 2 min: machine wait 11 min -> 8 s; lint 2 min -> 5 s; typecheck 70 s -> <5 s; test shard 100 s -> 35 s; checkout 36 s -> 12 s; install deps 33 s -> 13 s.

## Your task

Produce a territory map for: can akrogon apply the post's idea (measure where each leaf's wall time goes, then cut the biggest pieces) to its own lifecycle, and which cuts are removals rather than additions? In akrogon the "CI" is the leaf lifecycle: seats' agent turns (plan.synthesis, implement, check.review, check.repair, check.fix, merge) plus the checks run inside them. Think as a systems thinker: feedback loops, where work is repeated, what a rule costs everywhere it applies, and whether a mechanism can be deleted instead of tuned. Prefer fewer moving parts.

Measure before claiming. Numbers must come from the live data, with the command you ran.

## Live surfaces

- Config: `akrogon config` (run in the repo root): `checks` (format, test, typecheck, each wrapped with setup), `merge_checks`, `fix_rounds`, `max_active`, slots.
- Timing data: `issues/timings.jsonl` (schema in `src/timing.ts`; kinds visit_start, prompt, seat_done, check_start, check_end, batch, wait, repo_pause; data from about 2026-10-12). Phase moves: `issues/log.jsonl` (`src/log.ts`).
- Timing reader: `akrogon timing <slug>`, `akrogon timing --cohort --since <iso>`, `akrogon timing --flow --since <YYYY-MM-DD>` (`src/timing-report.ts`).
- Check runner and setup wrapper: `src/run-check.ts`, `src/config.ts` (`setupCommand`, `withSetup`), `src/verify.ts`, `src/admission.ts`.
- Seat process text: `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/chart-issues/` and its `assets/standing-design.md`.
- Closed leaves: `issues/closed/`. Flaky record: `akrogon flaky`.
- Grounding: `docs/reference-index.md`, `learnings/LESSONS.md`.

## Existing locks and prior charts (read the Destination and Forks taken sections before proposing overlapping work)

Under `issues/chart/<name>/CHART.md`: `check-reruns` (handed off 2026-10-01: slow checks run once where they prove something), `suite-time` (closed 2026-10-26: full test check 20% faster), `verify-waste` (handed off 2026-10-24: no test CPU on known verdicts), `leaf-speed` (handed off 2026-10-13: timing record and `akrogon timing`), `changed-test-proof`, `akrogon-slow-phases`, `host-run-load`, `host-test-load`, `merge-throughput`, `merge-slow-alarm`, `long-implement`, `test-time-and-temp`, `system-speed` (closed), `framework-test-scope` (held 2026-10-13: running only affected tests was held). Do not re-propose a settled decision without saying which lock it reopens and why the data justifies it.

## Return format

Markdown, compact, with these parts:

1. Measurements: the time split you computed (agent turn vs check vs wait, per phase and per check name), with the commands you ran and the leaf window.
2. The post's nine items mapped to akrogon: for each, whether it applies, the measured cost now, and the file or skill section involved.
3. Material forks: each a decision the operator must make, with options, what each option could break or invite later (not only now), and which option removes a mechanism rather than adds one.
4. Removal candidates: mechanisms, rules or code you believe can be deleted or collapsed, each with evidence that its cost exceeds what it catches, and what currently catches the same failure.
5. Pitfalls over the work's lifetime and what removes each.
6. Practitioner questions you would ask that this brief does not.

Each claim cites path:line, a named section, a command output or the data, with low-confidence items marked.

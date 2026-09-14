# Akrogon process review

You are reviewing the whole akrogon process as an outside consultant: charting, handoff, the lifecycle phases, the command, the skills, and the herdr coupling. The system works today and I do not want to move away from it. I want to know whether it can be made simpler without losing function. If a rule is doing real work, keep it. If it is not, say so with evidence. Find holes.

Judge every proposal against these criteria, in this order. A later criterion never wins against an earlier one.

1. Simplicity: fewer rules, fewer files, fewer moving parts.
2. Clarity: an operator or a fresh agent can hold the process in their head and predict what happens next.
3. Elegance: one mechanism per concern, no special cases, no guards stacked on guards.
4. Function over form: judge substance, never wording or format. A check that demands exact words will fail on a probabilistic agent.
5. Cost: model sessions, tokens, operator attention.
6. Speed: wall clock from handoff to merged.

If the process needs to be complex to keep its function, that is acceptable. Complexity that buys nothing is not.

## What akrogon is

One file says where the work is. Everything follows from that.

A piece of work is a leaf: a folder under `issues/open/` with `brief.md`, `design.md` and `state.yaml`. The phase of the leaf is one line in `state.yaml`. Akrogon opens a herdr terminal tab with two agent panes, slot A and slot B, ideally different model vendors. They hand the work back and forth through a fixed list of phases: `plan.positions`, `plan.rebuttal`, `plan.synthesis`, `implement`, `check.review`, `check.fix`, `merge`, `merged`, plus `failed`. An agent ends its phase with `akrogon phase <slug> <phase> --slot <A|B>`. That command rewrites `state.yaml`. A herdr hook fires on pane state change and runs `akrogon next`, which reads the files, sees what is ready, and prompts whoever is next. There is no server, no database, no daemon, no watcher.

Before leaves exist there is charting. The operator opens the `chart-issues` skill with a note. The agent draws a territory map, then puts forks to the operator one screen at a time. Each fork taken is recorded with the operator's verbatim answer and reason. Fuzzy areas stay as fog until they are sharp enough to be a fork. When no fork is open and no fog is left, the chart hands off: leaf contracts are written to `issues/open/` and dispatch takes over.

Vocabulary: territory, map, fog, fork, question, round, chart, off route. A fork is one route split, one file, holding one or more questions always shown on one screen. A fork is taken when the operator answers. A taken fork is never reopened.

## Where things are

Repo root: `/home/ivan/Work/infra/akrogon`. The installed command and skills are symlinks into this checkout.

| Path | What it is |
| --- | --- |
| `docs/guide/*.html` | The operator story, 17 short pages. Read `idea`, `parts`, `state`, `chart`, `next`, `phases`, `files`, `merge`, `in-practice`, `limits`, `problems` first. Strip the HTML or open in a browser. |
| `README.md` | Command table, skill table, sync and park rules. |
| `skills/chart-issues/SKILL.md` and `assets/{questions,shapes,standing-design}.md` | Charting and handoff. Questions is the round shape and the blind B exchange. Shapes is every file shape plus the preflight. |
| `skills/plan-issue/SKILL.md` | Blind positions, one rebuttal, synthesis by B. |
| `skills/implement-issue/SKILL.md`, `brief-template.md`, `worker-protocol.md`, `ponytail.md` | Implementation by B, inline or through sequential subagent workers under an eight-section brief. |
| `skills/check-issue/SKILL.md` | Blind review by A and B with `ready`, `nits`, `fix` verdicts. A alone re-checks after a fix. |
| `skills/merge-issue/SKILL.md` | A rebases, runs checks, pushes fast-forward, broadcasts on issue completion, closes its own tab. |
| `skills/broadcast-issue/SKILL.md` | Discord message after an issue completes. |
| `skills/seed-issue/SKILL.md`, `skills/init-issues/SKILL.md` | GitHub intake from a consumer repo, and repo setup. |
| `src/routing.ts` | The phase table: which skill, which slots, which next phases. 40 lines. Start here for the lifecycle. |
| `src/next.ts` | Dispatch: capacity, tab and pane allocation, prompting, re-prompt grace, stand-in pane, attempts, busy notices, merged cleanup, completion sweep. 700 lines. |
| `src/phase.ts` | The transition command, `completeOwner`, the code-only and clean-worktree gates. |
| `src/state.ts` | The `state.yaml` schema and locks. |
| `src/sync.ts`, `src/pull.ts`, `src/park.ts`, `src/status.ts`, `src/config.ts`, `src/install.ts`, `src/init.ts` | Operator commands. |
| `plugin/herdr-plugin.toml` | The whole coupling to herdr: two startup commands and four events, each just `akrogon next`. |
| `config.yaml` | Machine config: slots, harness commands, `max_active`, registered repos. |
| `issues/config.yaml` | This repo's lifecycle config: `rebuttal`, `fix_rounds`, `implement`, `checks`, `advisory`, `grounding`, `broadcast`. |
| `issues/chart/*/`, `issues/closed/*/chart/` | Real charts, taken forks, slot exchange files. |
| `issues/closed/*/` | Real completed leaves with plan, briefs, reviews, reports. |
| `issues/log.jsonl` | Every phase move with timestamp, slot, attempts, fix rounds, verdicts. |
| `learnings/LESSONS.md`, `learnings/history/` | Lessons recorded by passes. |
| `muse-audit.md`, `issues/AKROGON-AUDIT-FIXES.md` | A prior code-only audit of `src/` and my verdict on it. Do not repeat that work. Your scope is the process. |

Two more registered repos run the same process and have their own `issues/` trees and logs: `/home/ivan/Work/infra/tamdoma/framework` and `/home/ivan/.pi/agent/extensions`. Use their logs and closed leaves as data too.

The skills were compressed recently. Older, longer versions are in git history. Run `git log --oneline -- skills/chart-issues/SKILL.md` and `git show <sha>:skills/chart-issues/SKILL.md` to compare. Judge whether the compression lost function, not whether it lost words.

## Hard constraints

Do not propose against these. They are decided.

- No daemons, watchers, pollers or servers. The hook and the operator are the only triggers.
- `state.yaml` is the only truth. The command owns every phase change, counter and dispatch. Skills guide agents, they never move state.
- The operator commits and pushes issue records. Agents commit code on leaf branches only.
- Leaf branches carry code only. Every issue artifact is written in the registered checkout.
- Two slots, cross-vendor where possible. Blind positions and blind initial review stay blind.
- No configurability added for hypothetical needs. A proposal that adds a flag is worse than one that removes a rule.

## Already settled recently

Note these so you do not spend time on them. You may still say if a settled item looks wrong, but as a one-line aside.

- Vocabulary renamed to forks, taken, fog, off route.
- `next --all` and `pull --all` are scoped to the current repo when run inside one.
- Merged worktrees are force-removed at cleanup.
- Handoff preflight refuses a leaf that would touch `issues/`.
- The old chart rules "a chart past roughly twenty forks is a destination set too far" and "one fork per session, read only CHART.md" are gone from the current skill. Say whether anything they guarded is now unguarded.
- The pi loop guard is being changed to key on repeated tool results.
- Eight small code fixes from the muse audit are queued as a leaf.

## Read in this order

1. The guide pages. Get the operator story before any rule.
2. `README.md`.
3. `src/routing.ts`, then the skills in phase order: chart, plan, implement, check, merge, broadcast.
4. `src/next.ts` and `src/phase.ts` for what the command actually enforces.
5. `plugin/herdr-plugin.toml`.
6. Real data: one full chart from open to handoff, two closed leaves end to end including reviews and reports, and the three `log.jsonl` files.
7. `learnings/LESSONS.md` and the history files it links. Lessons are what actually went wrong.
8. Git history of the skills.

## Questions to answer

### A. Charting

1. The map first, then rounds. Is the territory map earning its place, or does it duplicate the first round?
2. Fork types: grilling, research, prototype, debate, setup. Are five types needed, or do some collapse without loss?
3. The round shape in `questions.md` is mandatory in full even for one small question. Is that right? What breaks if a small round is allowed to be small?
4. The blind B exchange for charting: A and B map independently, A merges with attribution, B rebuts once, B reviews leaf drafts. Count the sessions and operator waits this costs per chart. Is the quality gain shown anywhere in the real charts? Look at the `slots/` files in real charts for evidence either way.
5. Research source tiers: practitioner, better-than-training, model-knowledge, with redo on a lower tier. Is this enforced or enforceable? Does it change outcomes?
6. Prototype: time-boxed, code discarded every time. Is discarding always right?
7. With the twenty-fork cap and the one-fork-per-session rule gone, what stops a chart from sprawling or from settling several forks against a stale map? Is anything needed in their place, or does the map-and-fog structure already handle it?
8. Fog, forks open, forks taken, off route: four sections. Is any one of them dead in practice? Check real `CHART.md` files.
9. A taken fork is never reopened. A correction is a new fork naming the one it supersedes. Is this the simplest way to keep history honest?
10. Handoff: the preflight, the implementer dry-run per leaf, decision coverage, B's review of leaf contracts. Which of these caught a real defect? Check lessons and history. Which never did?
11. Is charting doing work that plan.positions and plan.synthesis then redo? Where is the line between a taken fork and a plan decision, and is it drawn once?

### B. Handoff and leaf contracts

1. Brief, design, state per leaf, plus `ISSUE.md` and `EPIC.md` indexes. The design copies every binding decision verbatim into each affected leaf. Is verbatim copying the right mechanism, or is one shared file plus a pointer simpler and as safe? Consider what an implementer actually reads.
2. `standing-design.md` is copied verbatim into every design. Is it read? Does it change behavior?
3. Sources, blocked-by, debate, hand_built. Is each field earning its place? Check how often each is non-default in real states.

### C. Lifecycle

1. Nine phases. Walk one closed leaf through them with timestamps from the log. Where did the wall clock go? Where did the model sessions go?
2. Debate: positions, rebuttal, synthesis. How often is `debate: yes` chosen? When it was, did the synthesis differ from what direct synthesis would have written? Look at positions and rebuttal files in closed leaves.
3. Blind initial review by both A and B, then A alone on re-check. Count from the logs how often A and B disagreed on the verdict. If they rarely disagree, what does the second reviewer buy?
4. Fix rounds capped at three, then `failed`. From the logs, how many leaves failed, and why. Was the cap the right stop, or did the operator have to intervene earlier anyway?
5. The implement phase: eight-section brief, sequential subagent workers, mismatch returns, changed-test command per worker, full suite by B. Is the worker protocol pulling its weight versus inline implementation? Compare leaves under each mode if both exist.
6. Merge by A with rebase, checks, fast-forward push, and repair on conflict. Is the merge slot doing anything the command could not do mechanically? If merge became a command step, what is lost?
7. Broadcast by the merge slot only, because the tab closes. Is this the simplest way to get one Discord message out?
8. Ponytail is included by both implement and check as an identical file. Is a duplicated file the right way to share it?
9. Every skill repeats the same four lines: ground in docs, challenge fuzzy terms, verify with a scenario, check the live surface. And the same peer-question paragraph. And the same footer rules. Is repetition across skills a cost or a feature for agents that only load one skill?
10. Lessons: one line per lesson, a history file, pruned at chart open, not read as pass input except by plan. Trace two lessons from being written to being applied. Did the mechanism work?

### D. The command

1. `next.ts` handles capacity, tab allocation, pane allocation, prompt, re-prompt grace, stand-in pane, attempt counting, busy notices, merged cleanup, completion sweep and hook context. Which of these could be deleted if a rule elsewhere changed? Which are compensating for a herdr limitation rather than a process need?
2. Global lock, repo lock, leaf lock. The audit already found leaf locks redundant. Is the repo lock also redundant given the global lock?
3. `sync`, `park`, `unpark`, `pull`, `status --charts`. Which are used? Check shell history and the logs. Which could be a plain git or shell command in the guide instead of a subcommand?
4. `failed` moves only to `implement`. Is that the right single exit?
5. Re-prompt grace, stand-in pane on the third attempt, three attempts then failed. Is the stand-in pane rule earning its complexity? Find a log record where it fired.

### E. Prose versus machinery

For every rule that lives in skill prose, ask whether the command could enforce it mechanically with less total complexity, and for every command gate ask whether prose would do. Name the ones where the current side is wrong. Function over form applies: never propose a check that matches words.

### F. Cost and speed, measured

From the three `log.jsonl` files produce one table per repo: leaves, median and worst time per phase, fix round distribution, failed count, attempts distribution, debate yes count, verdict agreement between A and B. Then say where the time and the sessions go and which single change would cut the most without touching function.

### G. Holes

Things the process does not handle, or handles by accident. Examples of the kind of thing I mean: a seat that runs for hours without writing anything, a leaf whose only diff is under `issues/`, a chart that is handed off while a fork is still open, two operators, a repo with no tests, a leaf that needs a credential nobody listed. Find ones I have not named. For each, say whether the fix is a rule, a gate, or nothing.

## Method rules

- Every claim carries evidence: a file and line, a log record, a real chart or leaf path. No evidence, no finding.
- Every proposal states what it removes, what it keeps, what breaks, and which of the six criteria it serves. If it serves cost or speed but hurts simplicity or clarity, say so and drop it.
- For each proposal, walk one real closed leaf or chart through the changed process and say what would have happened differently.
- Give a keep, drop or merge verdict on every existing rule you touch. Silence on a rule means keep.
- Do not propose flags, modes or configuration.
- Do not change any file in any repo. Report only.
- Do not read live worktrees under `issues/worktrees/` as evidence of process, they are in flight.

## Output

Write `process-review-<your-name>.md` at the repo root.

1. Summary in at most ten lines: the three changes with the best simplicity gain per function lost, and the biggest hole.
2. Findings as `F1`, `F2`, ... ordered by value, each with: claim, evidence, proposal, what it removes, what breaks, criteria served, verdict on touched rules.
3. Keep as is: the rules you were tempted to change and why you did not.
4. The measured tables from section F.
5. Holes from section G.
6. Answers to every numbered question above, one to three sentences each, in the same numbering.

Plain language. No praise, no hedging. State each fact once.

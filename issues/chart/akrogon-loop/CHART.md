# Chart: akrogon-new loop

Chart skill version: 4

Handed off 2026-09-09 into `../../open/akrogon-loop/`.

## Destination

Goals: the operator works only at the two attended doors, chart-issues and create-issue. After the door, two slots and one stateless command carry every leaf to merge with no operator action, several leaves at once across repos, on a system with no loop of our own and no state but the issue files. Signals: one real framework issue merges with zero operator actions after the door, then a second merges while a third runs. Throughput and stall hours read from git log afterwards. Deliverables: the rewritten skill, the `akrogon next` command and herdr hook, the config, the install shape, the GitHub intake path, the status view, the quality and index and lessons rules. The operator chose the whole intake in one chart on 2026-09-08.

## Notes

Domain: the issue lifecycle tooling in this repo, driven through herdr panes. Every session consults the herdr skill and the chart-issues skill. Slot B takes part blind on every decision, see learnings/charting and # Door Second Slot. Vocabulary: epic, issue, leaf; no "series", no "category". Standing preferences in order: simplicity, clarity, elegance, cost, speed, quality (operator 2026-09-09: "Speed is very important to me"). Success signals beyond merges and stall hours: less machinery to maintain and an affordable total (intake 13, 19, 257); judged by the operator, not measured. Elegance first, function over form. No code ever reads agent prose. No parking in any form. Anything new answers two questions: does it need to keep running, does it need to remember what the files do not say. Herdr to the max, a patch beside herdr before a new mechanism. Local herdr is 0.9.0. Input notes: issues/chart/INTAKE.md, user-owned.

## Decisions So Far

- After the door, no approval: [Merge Without Approval](decisions/merge-without-approval.md)
- Old machinery finishes its in-flight issues, nothing converts: [No Migration](decisions/no-migration.md)
- Claude Code slot A, Codex slot B first: [First Pair](decisions/first-pair.md)
- Only the operator installs, skills must stay individually usable: [Operator Only Install](decisions/operator-only-install.md)
- The door settles and warns about human-only steps: [Door Settles Human Steps](decisions/door-settles-human-steps.md)
- 38 mismatches between the July 28 lifecycle and the intake contracts, lifecycle side gets rewritten: [Contract Fit](decisions/contract-fit.md)
- Herdr types into a busy pane and 'done' means stopped, so the caller checks idle: [Busy Pane Prompting](decisions/busy-pane-prompting.md)

- One skill serves both the territory and the single issue, [# One Door Skill](decisions/one-door-skill.md)

- No driver loop: skills run `akrogon phase`, the herdr event hook runs `akrogon next` and recovers, failed after both slots fail, [# Next Command Owner](decisions/next-command-owner.md)

- One implementation debate by default, skipped at the door for very small issues, one rebuttal round per repo, fixed roles, any harness in any slot, [# Debate Count](decisions/debate-count.md)
- One dotted phase name per pass moved only by `akrogon phase`, concurrent slots share a phase with a done list, reviews decide from verdict flags, [# Turn Within Phase](decisions/turn-within-phase.md)
- State is the issue's own file, the command finds it by cwd, tabs and panes created from the slug, work starts only on `akrogon next`, [# Driver State](decisions/driver-state.md)

- Peer questions only in solo passes, wait then prompt, one exchange, owner decides, tie by least change, state untouched, [# Peer Questions](decisions/peer-questions.md)

- Audit and QA pass gone, repo tools measure, reviewers judge with Nits, A's position-only findings are Nits and reusable ones become lessons at merge (2026-09-10), fix rounds capped, tests from the brief's criteria, ponytail as one file, [# Quality Layers](decisions/quality-layers.md)

- One eight-section brief under 1,500 words, B never cheap and spawns the worker, sub-briefs in order, mismatches return to B; 2026-09-10: section 4 needed interfaces, section 5 mismatch rule, section 6 advisory size, section 8 report skeleton, one launch reminder line, B sends back a return with a missing report at no fix round, `/implement-issue <task>` with no leaf runs standalone, [# Implementer Brief](decisions/implementer-brief.md)

- Workers run only the changed-tests command, the full suite runs once per leaf before handoff, operator-locked

- The consult election stays: one question at the door, one field in state, the whole flow obeys it, intake 151, operator-locked 2026-09-10: that one field is `debate`; `consult` dropped, [# Debate Count](decisions/debate-count.md)
- The grilling format stays as it is: batches, recommended first, N-A replies, no harness-specific asking, intake 143, operator-locked

- Skill Rewrite: seven family skills (chart, plan, implement, check, merge, seed, broadcast), init per Distribution; cap 300 lines/4k tokens/20 rules with reference triggers; re-read after compaction; peer answers as files; symlink roots; worker model from config. [Skill Rewrite](decisions/skill-rewrite.md)

- Parallel Merge: slot A rebases, rechecks, pushes fast-forward to origin main, no lock or queue; conflict or red checks return through check.fix; merged after push; broadcast never blocks; B repairs itself at the last configured round. [Parallel Merge](decisions/parallel-merge.md)

- Config Shape (corrected by Model Tiering: no `workers` key; 2026-09-10: per-repo `implement: subagents | inline`, default subagents): global akrogon-new/config.yaml (max_active, slots, harness launch lines, toolkits, repos) and per-repo issues/config.yaml (remote, branch, rebuttal, fix_rounds, implement, checks that block, advisory, grounding, broadcast); `akrogon config` prints the merged result; no blocking flag. [Config Shape](decisions/config-shape.md)

- Distribution: tool repo holds command, skills, plugin; `akrogon install` once per machine (PATH and skill symlinks, herdr integrations, plugin link); `akrogon init` per repo; update is git pull; skills name the command as dependency. [Distribution](decisions/distribution.md)

- Bootstrap: command, plugin and implement/check/merge skills are hand-built leaves driven by the operator in two panes with both slots guiding; installer from source once; tool builds the rest on its own repo; first automated leaf fresh, no debate; takeover proven by one hands-off merge plus one repair exercise. [Bootstrap](decisions/bootstrap.md)

- Model Tiering: slots always strong; akrogon knows only the slot models, workers and broadcast writer are the harness's business (`workers` key dropped); `akrogon phase` appends one mechanical JSON line per phase move to issues/log.jsonl including the harness session id, no tokens, no prose. [Model Tiering](decisions/model-tiering.md)

- Repeat Safety: compare-and-set plus one kernel flock per leaf; hook is the only caller of `next`; stalled prompt resent once then peer; re-prompt resumes; broadcast once per issue when its last leaf merges, no record; state first, log diagnostic. [Repeat Safety](decisions/repeat-safety.md)

- Multi Chart Layout: charts at issues/chart/<slug>/; tree epic/issue/leaf (epic = two or more issues, simple issue has none); bare unique slugs, order in blocked-by; index per container, never read by the command; issue = parent folder, issue lock at merged; state in the registered checkout; `hand_built` skips dispatch; handoff writes directly; finished issue or epic moves to issues/closed. [Multi Chart Layout](decisions/multi-chart-layout.md)
- Handoff Location: the "Last operation" and "Next" lines are printed only, never saved; "Next" reproduces the prompt line the next pass receives, or `none`; the tail doubles as the Skill Rewrite backup read (50 to 100 words, never for slot, phase or readiness). [Handoff Location](decisions/handoff-location.md)
- Status View: `akrogon status` reads state and log across repos, prints failures then the full tree, exits; hook sends a herdr notification on `failed`; verdict word from state, review file is the record; no stuck verdict, no hand_built column, no broadcast record. [Status View](decisions/status-view.md)
- Index Levels: two-level plain Markdown index (top file of areas from `grounding.index`, area files of entry points), split only where needed; plan builds the read-first list, workers start from it, check follows the diff; implementer updates docs and index lines, checker verifies; drift script retired. [Index Levels](decisions/index-levels.md)
- GitHub Intake: door consolidates by destination and speed of resolution (parallel leaves where no dependency); seed-issue posts to GitHub, target fixed by the framework routing file or the repo origin; `akrogon pull` mirrors open issues into gitignored `issues/seeds/`, `--all` from the startup hook, the door pulls too; handoff writes `sources` into leaf state; the command closes the GitHub issues when the owner issue or epic closes. [GitHub Intake](decisions/github-intake.md)
- Door Second Slot: B joins chart-issues when its pane is named at open, no key or question; blind map, one blind pass per decision on the Question section and locks, full batch, merge with tags, one disagreement-only rebuttal, one focused check on late operator changes; A owns the interview. [Door Second Slot](decisions/door-second-slot.md)
- Lessons: per repo `learnings/LESSONS.md` (one line per lesson, pointer to history, never canon) and `learnings/history/` (never pruned); the finding agent writes both in its pass, checker verifies; a line leaves when applied or when the operator prunes at chart open; plan-issue and chart-issues read the list; old folder moves to history unchanged. [Lessons](decisions/lessons.md)
- Command Tests: a small test tree, one file per subcommand, run by bun test as the repo's `checks.test`; a handful of real-file, real-process scenarios (CAS refusal, duplicate call, race, pull mirror, status fixture), herdr and gh faked at one edge, Bootstrap the live proof; tests only for contracts or observed defects, never wording, no coverage target; never real panes, install roots, GitHub or the herdr socket. [Command Tests](decisions/command-tests.md)

## Not Yet Specified

Nothing. Graduated 2026-09-09: command tests → # Command Tests (resolved); the Moshi push and branch watcher paragraph was settled by # Status View (the hook's herdr notification on `failed` is the only push) and # Repeat Safety (ancestry check replaces the watcher); vocabulary and success signals moved to Notes.

## Out Of Scope

- The Moshi phone push from the reference folder: foreclosed by # Status View, which made the hook's local notification on `failed` the only push, and by # Next Command Owner, under which nothing waits on the operator.

- The framework routing file (path, shipping to client projects) is the framework repo's decision; akrogon only reads it through seed-issue. From # GitHub Intake.

- Repairing or extending the old akrogon orchestrators. The intake treats both old repos as the example not to follow.
- Any third-party skill installed as a plugin or dependency. Text may be borrowed into our own skills folder only.

Pi worker tier: tamdoma-subagents needs a write-capable child tier before pi can be slot B. Extension work, tested outside akrogon.

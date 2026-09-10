# Design: command

Chart skill version: 4

## Binding decisions, verbatim

### # Bootstrap

The hand-built path: the `akrogon` command (install, init, config, phase, next, status), the herdr plugin, and the implement, check and merge skills, as one or two leaves in the handoff marked hand-built. The operator drives those leaves in two herdr panes, typing every pass prompt with both slots guiding, so the loop is seen once by hand before it is automated. Everything else (plan, chart, seed, broadcast skills, status view, intake work) is built by the tool on this repo, which is its own first consumer; the old-shaped issues/config.yaml and issues/.scripts are removed in the first hand-built leaf and rewritten by `akrogon init`. After the hand-built leaves merge: installer run once from source with bun, then every step through the installed command and skill symlinks. Hand-built leaves finish by hand; the first automated leaf is fresh and elected without debate; takeover is proven by one hands-off merge plus one deliberate check.fix exercise on a real failing check, then parallel leaves. If the command cannot dispatch its own repair during bootstrap, it is repaired in a direct session with the operator guided by both slots and the run is recorded as failed automation. new-beginning/ and reference/ are deleted in the last leaf once nothing in the handoff or archived chart points into them. Why: the operator's July numbers show hand-driving lands work, and one hand-driven pass is the operator's model of what the command automates. Forecloses: reviving the July 28 lifecycle, a temporary driver script, a second state store, transferring a half-done hand leaf into automation.

From # Lessons 2026-09-09: the last bootstrap leaf moves reference/lessons into learnings/history/ unchanged, fixing relative links, deriving no active line.

From # Command Tests 2026-09-09: the bootstrap leaves that build the command each add its test file under a small test tree run by `checks.test`; the takeover leaf is the live proof and no automated test drives real herdr or GitHub.

### # Next Command Owner

No driver loop. Every skill pass ends by running `akrogon phase <slug> <next>` and stops; the herdr plugin event hook (pane.agent_status_changed, pane.exited, startup) is the only caller of `akrogon next`, which reads state, checks the target pane idle, and prompts the next pass. Retry policy: same slot twice, then the peer once, then `failed`; blocked or unknown panes go to the peer wake-up path. No heartbeat, no deadline, no timer: a silently hung agent stays undetected rather than adding a clock (operator 2026-09-08, prototype measured on herdr 0.9.0: the hook fires once per status change with HERDR_PANE_ID and HERDR_PLUGIN_EVENT_JSON, no cwd in the payload). Nothing after the chart waits on the operator. Forecloses: a driver process, a temporary driver script, heartbeats, polling, a stale marker, any park.

### # Turn Within Phase

Whose turn it is comes from one field: `phase`, a dotted name per pass, about 24 names, moved only by `akrogon phase` with compare-and-set and tmp+rename. A pass whose two slots run concurrently (positions, rebuttals, check reviews) is one phase with a `done` list and per-slot `attempts`; the command refuses to advance until both slots are done, and for reviews it decides from two recorded `--verdict` flags. The fix loop is the review phase entered again with `fix_rounds` one higher, capped by config, cap reached means `failed`. The routing table is a typed constant in the command. Why: one field with no product of phase and step makes illegal pairs unrepresentable (Minsky, gen_statem, statecharts, Temporal), a crash re-prompts the same pass, and no code reads prose or scaffolded files. Forecloses: run-status tokens, a step field beside phase, files-as-turn-signal, a shared single done value, any review verdict parsed from text.

### # Driver State

State lives in the issue's own `state.yaml`: `phase`, `attempts`, `done`, `slot` and `pane` hints. `akrogon next` finds the issue from the pane's cwd, which herdr restores across restarts, or from the folder the operator names. Tabs and panes are created and named automatically by the command from the slug, one tab of two panes per leaf, never reused. Slot is text in the prompt. The phase-to-skill-and-slot table is a constant in the command. Work starts only when the operator runs `akrogon next` on a leaf, an epic folder or `--all`; a merge closes the tab and starts what it unblocked, bounded by `max_active`. Blocked or unknown panes go to the peer wake-up path from # Next Command Owner. Auto-approval per harness is a fact, not a setting: Claude `--dangerously-skip-permissions`, Codex `-a never -s danger-full-access`, pi `-a`. Why: cwd is the one fact herdr owns and restores, so no mapping file, no registry, no program to maintain. Forecloses: a pane registry, tab renaming by hand, a separate `start` verb, pane reuse across issues, marker files for slot, any auto-start after the chart.

From # Config Shape 2026-09-08: `akrogon next` starts a slot by filling the harness launch line from config with the slot model and effort and handing it to herdr; `akrogon config` prints the effective config for a repo.

From # Model Tiering 2026-09-09: `akrogon phase` also appends one JSON line to `issues/log.jsonl` per move, from data it already holds plus `git rev-parse HEAD` and `git diff --shortstat $AKROGON_BASE` in the worktree.

From # Repeat Safety 2026-09-09: `next` and `phase` take `flock` on `<leaf>/.lock` (gitignored) around state read-modify-write; `next` prompts with `--wait --until working` and a short timeout; a `working` event never counts an attempt.

From # Multi Chart Layout 2026-09-09: "series" is now "epic" (two or more issues); the command moves a finished issue or epic to issues/closed under the issue lock; `hand_built: true` leaves are skipped by `next` and `--all`; the authoritative state is the registered checkout, never a worktree copy.

From # GitHub Intake 2026-09-09: state.yaml gains an optional `sources` list; `akrogon phase merged` closes the listed GitHub issues when the owner folder moves to closed, state check first, one retry, failure printed.

### # Repeat Safety

Safe twice by construction: `akrogon phase` is compare-and-set on phase, fix round and attempts, so a repeated or late move is refused; a merge that landed without the phase written is detected by ancestry and set to `merged`. Concurrency is serialized by a kernel `flock` on `<leaf>/.lock` around every state read-modify-write and around the whole `next` pass for that leaf; skills never call `next`, the herdr hook is the only caller. A stalled prompt is resent once, then handed to the peer; a re-prompted pass inspects the worktree and finishes what remains, rerunning checks only on changed code, missing evidence or a concern. Broadcast is one message per issue, sent by the merge skill when the command reports the issue's last leaf merged, one immediate retry, no success record. State is authoritative and the log is diagnostic; state is written first, a log failure never reruns a move. Retry policy is # Next Command Owner's: same slot twice, peer once, then failed; blocked or unknown panes go to the peer. Why: compare-and-set and one kernel lock cover every duplicate without a process, a timer or a second store, and the operator ranks speed above the sequential alternative. Forecloses: invocation ids, a herdr idempotency feature, per-leaf broadcasts, the term "category" (retired), recoverable logging, any operator wait.

Operator confirmation 2026-09-09: "When we say issue series ... consists of more issues that are sub issues, they are the categories ... broadcasting happens when the entire issue is done, which in the simple issue is just one issue, one category, and with the series it's as many broadcasts as there are issues that are part of it." Confirmed by slot A: series folder, one folder per sub-issue (the category), leaves inside; one broadcast per sub-issue when its last leaf merges; a simple issue is one category.

Operator correction 2026-09-09: the category is the issue. A series is a group of issues; an issue has one or more leaves; the broadcast for an issue fires when its last leaf merges, so a series broadcasts once per issue, and a simple issue broadcasts once. "Category" in this file means "issue".

Operator, 2026-09-09, locked vocabulary: "the category doesn't even have to exist as a term ... It's either one issue or a series of issues if it's a complex thing that we are doing. And every issue has either one leaf or multiple leaves." Three terms only: series, issue, leaf (series renamed epic later the same day in # Multi Chart Layout). Every earlier "category" in the chart files was rewritten to "issue" the same day.

From # Multi Chart Layout 2026-09-09: the term "series" is retired for "epic". The merged transition holds `<issue>/.lock` around the state write, the completion check and the move to issues/closed; a failed move is retried by the next run.

From # GitHub Intake 2026-09-09: GitHub close runs inside the owner-close transition under the issue lock, checks the issue state before acting, one retry, so a repeated transition never double-comments.

### # Config Shape

Two files. Global `akrogon-new/config.yaml`: `max_active` (machine-wide, default 3), `slots.a` and `slots.b` (harness, model, effort), `workers` (harness name to model string, open-ended, any harness herdr can start), `harnesses` (one launch line per harness with `{model}` and `{effort}` placeholders: `claude --model {model} --effort {effort}`, `codex -m {model} -c model_reasoning_effort={effort}`, `pi --model {model} --thinking {effort}`, `grok -m {model} --effort {effort}`), `toolkits` (language to runner, `typescript: bun:test`, proposed by init for repos without tests, never a migration), `repos` (name to path). Per repo `issues/config.yaml`: `remote`, `default_branch`, `worktree_root` (default issues/worktrees), `rebuttal` (default true), `fix_rounds` (default 3), `checks` (lint, typecheck, test, test_changed with `$AKROGON_BASE` = the leaf's branch point on main, refreshed on rebase; every one blocks), `advisory` (optional commands whose failure is a Nit), `grounding`, `broadcast`. No `quality.blocking` flag. Skills never parse YAML: `akrogon config` prints the effective config for the current repo, global plus repo plus defaults, once per pass. Edits take effect at the next action, running panes keep their launched model, no per-leaf snapshot. Slot B repairs itself on the last allowed round; workers get the rounds before it. Dropped: gate, certificates, analyzed_scopes, scripts_dir, branch_prefix, env_source, tab, compaction, speed, pane.create; skill install roots go to # Distribution.

Why: each setting has one home and one reader; the launch line per harness keeps code free of vendor names so any harness is a one-line edit; removing the blocking flag removes the contradiction slot B found and the per-linter definition it would have needed.

Forecloses: a single merged config, harness names in code, a quality blocking flag, per-repo max_active, frozen per-leaf config, a per-key config command.

Operator note 2026-09-08: the tool repo is akrogon, so the global config is akrogon/config.yaml.

Operator 2026-09-10 (1-A): per-repo key `implement: subagents | inline`, default `subagents`. `inline` means slot B writes the same brief as its own plan and implements it in order itself, `test_changed` as it goes, the full suite once, repairs itself, no sub-briefs, no worker, no mismatch return; chosen for a repo whose work cannot be split into bounded pieces (visual feedback loops such as 3D work) or whose log shows inline cheaper. Read by implement-issue through `akrogon config`; nothing else changes. Evidence: Morph routing benchmark 2026 (small tasks: Opus alone $2.78 vs planner plus Flash $3.18, same pass), Cursor 2026-07-20 (large project: 8x cheaper delegated), theinfinity.dev 2026-08-19 (delegate above about 250k main context), Co-Coder 2026-05-31 (cross-piece dependencies cost context transfer). `remote` and `default_branch` are the merge target: every `origin/main` in # Parallel Merge and # Repeat Safety reads as `<remote>/<default_branch>` from `akrogon config`, origin/main being the defaults.

Operator 2026-09-10 (1-A, broadcast secret): the Discord webhook or bot token is the tool's one secret and lives in one file outside every repo, `~/.config/akrogon/env`, read only by the broadcast send script, which fails loudly when the file is missing. Per-repo `broadcast:` holds channel ids or names, safe to commit. No skill folder ever holds an env file, because skill folders are tracked and symlinked into the harness roots. `akrogon init` prints the path when the file is absent. This is a carry on the standing line that secrets live in the consumer repo's gitignored env: that line covers the consumer app's secrets; the broadcast token belongs to the tool.

### Operator explanations 2026-09-08 (chat, recorded for handoff)

test_changed base. Workers run one after another in the same worktree. "Changed since when" must be the commit where the leaf branched from main, not the previous worker's commit, otherwise tests affected by worker one are skipped by worker two until the full suite. The command passes that commit as `AKROGON_BASE`; when the leaf rebases, the base becomes the new rebase point.

checks and advisory. Every command under `checks` blocks: a failure returns the leaf for repair. `advisory` is an optional list of commands whose failure is reported as a Nit and never blocks; style-only linters go there. A command that mixes style and real errors goes under `checks`. There is no blocking flag.

Fix rounds. `fix_rounds` defaults to 3. Rounds before the last are done by the cheap worker under a sub-brief; the last allowed round is done by slot B itself. To get B sooner, lower `fix_rounds`; nothing else changes.

Harness launch lines. Config holds one line per harness with `{model}` and `{effort}`; the command fills them and hands the line to herdr. Verified 2026-09-08 from installed help: `claude --model {model} --effort {effort}`, `codex -m {model} -c model_reasoning_effort={effort}`, `pi --model {model} --thinking {effort}`, `grok -m {model} --effort {effort}`. Adding a harness is one config line; no harness name appears in code.

akrogon config. Prints the effective config for the repo in the current directory: global plus repo file plus defaults, one call per pass. Skills read that output and never parse YAML.

Correction from # Model Tiering 2026-09-09, operator-locked: the `workers` key is dropped. akrogon knows only `slots.a` and `slots.b` models; worker subagents and the broadcast writer are configured inside each harness. `harnesses` launch lines stay.

From # Index Levels 2026-09-09: `grounding.index` points at the top index file; area files are reached by its links, no extra config key.

From # GitHub Intake 2026-09-09: no new config key; the GitHub repo comes from the registered checkout's origin; `issues/seeds/` joins the gitignore line `akrogon init` writes.

From # Command Tests 2026-09-09: the akrogon repo's `checks.test` is `bun test` over a small test tree; no test-related config key.

### # Distribution

Tool repo `akrogon` holds the command, the seven skills, and the herdr plugin folder. Install once per machine with `akrogon install`: `~/.local/bin/akrogon` symlinked to the entry file, dependencies only in the tool checkout, one symlink per skill folder into `~/.claude/skills` (Claude) and `~/.agents/skills` (Codex and pi), `herdr integration install <kind>` for each harness in the global config, `herdr plugin link` for the plugin. Install refuses to replace a real folder bearing a new skill's name and prints the removal line. Per repo: the init-issues skill inspects and proposes, `akrogon init` writes issues/config.yaml, issues/open, the worktree gitignore line, and the repo entry in the global config. The consumer repo holds nothing else of ours; its own package manifest is untouched. Verify with `akrogon config` and one harmless handoff. Update is `git pull` in the tool repo at any time; the next pass reads the new text. Each skill folder is self-contained and its SKILL.md names the akrogon command as its dependency. Why: symlinks make one checkout the only copy, so update and install are one step each and no copy can drift, and the two commands hold the only machine-specific steps. Forecloses: an installed executable build, copies of skills in harness roots, a scripts folder or package.json in consumer repos, permanent skill-name prefixes, a coexistence window with the old skills.

From # Status View 2026-09-09: the plugin hook also runs `herdr notification show` when a leaf moves to `failed`; the only push to the operator, no loop.

From # GitHub Intake 2026-09-09: the `[[startup]]` hook runs `akrogon pull --all` beside `next --all`; still nothing GitHub-specific installed, `gh` is a machine prerequisite like `flock`.

### # Multi Chart Layout

Charts live at `issues/chart/<chart-slug>/` with CHART.md, INTAKE.md (source text verbatim plus scope) and decisions/, always a subfolder, never moved; a handed-off chart gets one "Handed off <date>" line. The work tree is `issues/open/<epic>/<issue>/<leaf>/` or `issues/open/<issue>/<leaf>/`: a leaf is any folder holding state.yaml, an issue is the folder holding leaves, an epic is a folder holding two or more issues; a single issue has no epic. Plain slugs, unique within the repo, enforced at handoff; commands take the bare slug; no order or mode markers in names; order lives only in each leaf's blocked-by. An index file per container (EPIC.md listing issues, ISSUE.md listing leaves, one line each with purpose), written by the handoff, never read by the command. A leaf's issue is its parent folder; the merged transition holds `flock` on `<issue>/.lock` around the state write and the "every sibling merged" check and reports completion only from the transition that made it true, so one broadcast per issue. Authoritative state is the registered repo checkout from global `repos`; worktree copies of issues/ are inert. `hand_built: true` in leaf state makes `next` and `--all` skip the leaf. The handoff writes directly into issues/open in one attended pass; a leaf whose blocked-by names a missing folder is refused. A finished issue, or a finished epic as a whole, is moved by the command to `issues/closed/` under the issue lock right after the completion check; a failed move is retried by the next run. One log file, `issues/log.jsonl`. Why: every fact the command needs is a folder or a state field, every fact a person needs is one short index file beside the thing it describes, and one rename closes work. Forecloses: the term "series", July 28 markers and series-wide state, an explicit issue reference in state, a state copy in worktrees, per-leaf broadcasts, staged publishing, issue records that never close.

From # Status View 2026-09-09: operator dropped the `hand_built` marker from status rows ("useless"); the flag still skips `next`.

From # GitHub Intake 2026-09-09: `issues/seeds/` is a gitignored derived mirror of open GitHub issues, the one folder outside leaf folders, deletable at any time; leaf state.yaml gains `sources: [owner/repo#n]` written by the handoff; the transition that moves an owner issue or epic to issues/closed also closes those GitHub issues.

From # Lessons 2026-09-09: `learnings/LESSONS.md` and `learnings/history/` are per-repo tracked files beside issues/, the only prose read outside the leaf by plan-issue and chart-issues.

### # Model Tiering

Slot A and slot B always run their configured strong model for every pass; no pane changes model between phases. akrogon is aware of the two slot models only, because it launches the panes; worker subagents, the broadcast writer, their models, effort and any override are configured and chosen inside each harness, and the implement skill says only "delegate the sub-brief to a subagent". The `workers` key leaves the global config (correction to # Config Shape). The repair cap and the last-round-by-B rule stay in the command. A worker earns its keep by subscription allowance plus paid overage per completed leaf, failed leaves counted, measured from the performance log: `akrogon phase` appends one JSON line per phase move to `issues/log.jsonl` with the mechanical fields listed in Findings, no tokens, no prose; token usage is joined later from harness session files by an analysis agent. Why: the machinery holds one lever, the slot model, and cannot push a wrong one for workers; the log is one write in code that already runs and gives the data the intake's stall analysis needed by hand. Forecloses: a `workers` map, worker effort keys, a spawn table in skills, cost estimates written by agents, prose in the log.

From # Status View 2026-09-09: status shows minutes since the leaf's last log line for the current phase, or "unavailable"; no stuck verdict.

Operator 2026-09-10: advice, not a lock. Slot B on a subscription-capped frontier model (Fable 5.1 on a Max plan, GPT-6 Astra by API) is the cost driver of a delegated leaf, about two thirds of spend (Cursor 2026-07-20). Slot B stays never cheap; when the budget is the constraint, pick the cheapest model that still plans well (Opus 5, GPT-5.6 Luna medium) before switching a repo to `implement: inline`.

### # Busy Pane Prompting

Herdr does not refuse prompts to a working pane, it types them in, and the agent may drop the earlier instruction. 'done' means the pane stopped, not that the work finished. The driver must check idle before every prompt and must read completion from the phase, never from the pane state. Forecloses relying on herdr for never-stack.

### # Parallel Merge

Slot A merges inside the leaf's tab: rebase the leaf branch on current `origin/main`, rerun the config checks, push fast-forward only to `origin main`. There is no local main branch, no lock and no queue; git's refusal of a non-fast-forward push is the serializer, and the loser rebases, rechecks and pushes again. The leaf is `merged` only after the push succeeds; then the cheap writer broadcasts with one retry, failure recorded in the leaf folder, never blocking. A rebase conflict or red checks after rebase: slot A writes findings as a reviewer would (conflicting files or pasted failing output, rebased-on commit), moves the leaf to `check.fix`; slot B repairs in the same worktree, slot A re-checks the repair diff, then merges again; fix rounds count as usual, and at round three slot B repairs itself with no worker before `failed`. A break on main found later by another leaf's full suite is fixed forward by that leaf in its own `check.fix`, failing tests as acceptance criteria, no revert step.

Why: the push already does what a lock or queue would, and reusing check.fix gives conflict resolutions a second reader with no new phase, file or counter; 2026 evidence (Piaggio, Mikhalev, Lin) says the danger is untested combinations and resolvers discarding the other side's intent, which checks-after-rebase and the re-check cover.

Forecloses: a merger tab or process, a local main checkout, file locks, force pushes, a revert step, broadcast as a completion condition.

Reshape 2026-09-08 after # Config Shape: "round three" reads as "the last allowed round" of `fix_rounds`.

### Operator explanations 2026-09-08 (chat, recorded for handoff)

Merge sequence. Review passes. Slot A runs `akrogon phase <slug> merge`, then in the leaf worktree: fetch, rebase the leaf branch onto `origin/main`, run every command under `checks`, push the branch to `origin main` fast-forward only. Never force. If the push is rejected because main moved, repeat from fetch. A rejected push lands nothing. A lost network reply may still have landed: check whether the leaf head is an ancestor of `origin/main` before repeating. After the push succeeds, `akrogon phase <slug> merged`; the tab closes; the cheap writer runs broadcast-issue once with one retry; a broadcast failure is written into the leaf folder and never reopens the leaf.

Conflict or red checks after rebase, step by step. 1. Slot A writes findings into the same file the reviewer uses: the conflicting files, or the failing command output pasted, plus one line naming the commit the branch is now rebased on. 2. Slot A runs `akrogon phase <slug> check.fix`; fix_rounds plus one. 3. `akrogon next` prompts slot B in the same tab with implement-issue, phase check.fix; B reads the findings file, repairs in the same worktree, runs its checks, runs `akrogon phase <slug> check.review`. 4. Slot A re-checks only the repair diff, gives `--verdict`, and on ready returns to merge. Same cap as any repair; on the last allowed round B repairs itself without a worker; at the cap the leaf is `failed` with A's diagnosis paragraph. The whole loop stays in one tab and one worktree; other leaves are in other tabs and are not involved.

Main broken after two green leaves both landed. The leaf that discovers it, through its own full suite after rebase, fixes it forward in its own check.fix with the failing tests as acceptance criteria. No revert step. The checker's existing rule against weakening a failing test applies.

From # Repeat Safety 2026-09-09: the broadcast after merge is per issue, not per leaf; the merge skill sends only when `akrogon phase <slug> merged` reports the issue's last leaf merged.

From # Status View 2026-09-09: the carried "broadcast failure visible in status" is retired; Repeat Safety records no broadcast outcome, so status has nothing to show.

From # Index Levels 2026-09-09: area index files make parallel doc updates different-file merges; a same-line conflict is resolved at merge by keeping both true entries and rechecking pointers.

### # Quality Layers

Four layers become two. The plan audit and the mandatory QA subagent are gone; the implementer may spawn a subagent freely and nothing records it. The repo's own tools measure: config lists the check commands, linter, typecheck, full tests, an optional changed-tests command, and optionally a mutation-testing command; a quality blocking flag says whether failures block. Reviewers judge: a finding blocks only for a real defect, wrong behavior, broken contract, a concrete maintainability problem, or one of ponytail's four never-cut items when it is also a defect; everything else is a "Nit:" and never starts a fix round. Verdicts are ready, ready with nits, or fix. A re-check reads the repair diff only, confirms earlier findings, and may add a blocking finding only if the repair introduced it; fix rounds are capped by config, three by default, then failed. Reviewers rerun checks only on a change, missing evidence or a concern. Tests: the planner writes acceptance criteria in the brief, the implementer derives tests from them before code, red then green, one per criterion, a fail-first test for a bug, no test for trivial one-liners; the checker compares tests to criteria and rejects mocks of the unit under test. Code-quality advice is one 32-line file, ponytail's rule text, in the skills folder, required reading for implement and check, no plugin, no separate simplify pass. Why: the intake measured the watchers at 74 stall hours a month against 2 for deterministic checks; Shiryaev July 2026 measured rules-in-context working and passive skills never activating; 2025 and 2026 evidence shows agents special-case tests after failures and over-mock, and criteria written by another role before code remove the target. Forecloses: the fidelity audit phase, a mandated QA pass, AQ- ids and the advisory rulebook, a required quality paragraph, a post-hoc simplify pass, full re-review per round, any test selection logic in akrogon, an installed ponytail plugin.

Operator addition 2026-09-08: before a leaf is marked failed at the fix-round cap, slot A writes one paragraph into the plan, what kept failing and why. Prose for the operator only, nothing reads it. On the operator's follow-up about swapping the implementer at the cap: rejected, the reviewer would become author and judge, three failures usually mean a wrong brief or design, and it adds a second counter. Failed is terminal like merged, the operator restarts with `akrogon phase <slug> implement` after fixing the brief, or drops the leaf.

Operator 2026-09-08, later reply: round 2 Q5 answered in words, "understood, I agree", recorded as 5-A. TIA clarified: always used where the repo's config names a changed-tests command, never required, never selected by akrogon; sub-briefs each run the fast command, B runs the full suite once.

Operator-locked 2026-09-08: the brief's commands section lists `test_changed` for the worker and nothing else; workers never run the full suite; the full suite runs once per leaf, by B after the last worker, before handoff; reviewers rerun it only on a specific concern. Config names `test_changed` wherever the runner supports it, which is every repo surveyed.

Reshape 2026-09-08 after # Parallel Merge: check.fix is also entered from merge on conflict or red checks after rebase, with findings written by slot A; at fix round three slot B repairs itself, no worker, before failed (operator 4-yes).

Reshape 2026-09-08 after # Config Shape: the `quality.blocking` flag is gone; every command under `checks` blocks, an optional `advisory` list reports failures as Nit. Slot B repairs itself on the last allowed round, workers take the rounds before it.

From # Index Levels 2026-09-09: the checker verifies the implementer's docs and index lines against the diff; the reviewer never authors them; drift audit script retired.

From # Command Tests 2026-09-09: in the akrogon repo, check-issue treats a test that asserts prose or output wording as a maintainability defect; exact text is testable only where it runs as written; a new test needs a contract or an observed defect behind it, never coverage.

Operator 2026-09-10 (1-A, nits from A's position): at check.review slot A reads its own positions-A.md and rebuttal-A.md first; they say where to look hardest. A finding grounded in a done criterion, a failing `checks` command or a reproducible defect is a Fix and cites which. A finding grounded only in A's own position is a Nit with its reason, never a Fix, so it cannot open a check.fix round. At merge, a Nit slot A still holds and finds reusable becomes one lesson line plus its history file under the # Lessons rule; B meets it at its next plan. No new turn, no new file, no B reply on the same leaf.

### # Merge Without Approval

Yes. After the door, no approval step exists anywhere in the loop. The operator answered 3-A on 2026-09-08 because the August stall was operator availability, and the two-door rule means the operator is only at intake. This forecloses a merge-ready wait, an approval gate at P-synth as July 28 had, and any hold state.

### # GitHub Intake

Reports reach GitHub through seed-issue, which a colleague's agent runs. The target is fixed by files, never judged: when the installed framework's routing file names an upstream issues repo, seed-issue posts there with `gh issue create -R`; otherwise it posts to the current repo's GitHub origin; a malformed file, missing origin or non-GitHub origin is a visible failure. The file writer and the FIXER submission script are retired. The routing file's path and shipping belong to the framework repo.

`akrogon pull` runs inside a registered repo: it lists that repo's open GitHub issues and writes one file per issue into `issues/seeds/<number>-<slug>.md`, deleting seed files whose issue is closed only after a complete successful listing. The folder is a gitignored mirror, derived, never edited; it is the one explicit exception to "no state outside leaf folders" because it can be deleted and rebuilt at any time. `akrogon pull --all` does the same for every registered repo and is called by the herdr startup hook beside `next --all`. The chart-issues door runs `pull` when opened. No timer.

The door consolidates as locked in Skill Rewrite: it skips seeds whose `owner/repo#n` already appears in `sources` under issues/open, issues/closed or a chart intake, copies each imported seed's text into the chart intake or brief as the evidence of record, and maps each report to one completion owner, an issue or an epic. The handoff writes `sources: [owner/repo#n, ...]` into the state.yaml of every leaf under that owner.

Closing is the command's: when `akrogon phase <slug> merged` moves the completion owner to issues/closed, in that same step it runs `gh issue close -R owner/repo n --comment "merged <commit>"` for every entry in `sources`, checking the issue state first, one retry, failure printed, never reversing the merge. The next pull removes the seed file. The broadcast message stays with broadcast-issue.

Why: the operator wants the queue online where colleagues' agents already are, seeds on disk to chart from without moving anyone's files, and closure that needs no hand. Files fix the target, a mirror fixes the copy, the issue number fixes the duplicate check, and the command already owns the transition that means done.

Forecloses: a GitHub issue template as the intake shape, an import comment or label on GitHub, a label query in the door, a local import registry, closure by merge-issue or by commit keywords, a timer-driven pull, seed-issue asking where to post.

Operator rule 2026-09-09 (chat, recorded for handoff): the chart-issues door consolidates seeds by destination and by speed of resolution. Seeds that share a destination and no dependency become parallel leaves of one issue; independent issues are shaped to run side by side; only a planner-named dependency (see # Parallel Merge) puts leaves in order. The door proposes the split that finishes soonest, not the tidiest one, and shows it to the operator before writing.

### # Command Tests

Separate test files, one per subcommand, run by bun test as the akrogon repo's `checks.test`; the shipped command carries no test code. The tests are a handful of command-level scenarios on a temp repo with real files and real processes: a stale phase move refused, the same command run twice, two processes racing on one leaf, pull adding and deleting seeds, status on a fixture tree. Herdr and gh are substituted at one thin boundary. The Bootstrap takeover stays the live integration proof. A test exists only for an observable contract: a state transition, a file shape, a refusal, or a defect that happened; never for prose or output wording, except text that runs as written (commands, numbers, fixed references); no coverage target; check-issue treats a wording test as a maintainability defect under # Quality Layers. Routine tests never touch the operator's real panes, install roots, GitHub issues, or the herdr socket. New tests need a contract or a defect behind them, never coverage, and the akrogon repo's briefs say so; the operator's rule is that the suite stays small.

Forecloses: inline `--self-test`, a line budget for tests, tests that restate the routing table, and any test that drives real herdr or GitHub.

### Decisions not binding this leaf

- # Status View: leaf status builds the status subcommand and the notification on failed; this leaf leaves no stub
- # GitHub Intake: binding only for the merged transition shape (3-A); pull, seeds and the gh close call are leaf pull-close

### Standing creation-locked design lines

- Never mock auth.
- Server-side authorization on every non-public path.
- State changes as real backend mutations.
- No hardcoded secrets.
- No vanity tests.
- Mandatory negative and edge-case tests.
- Any chunk touching a user-visible flow must carry at least one verification command that exercises the flow end to end and leaves an artifact. Browser flows use Playwright only: headless Chromium, trace on, no video, installed as a consumer-repo dev dependency by the first chunk needing it. Non-browser flows use a real request or invocation. The gate judges the exit code and the completion half records the artifact path as evidence.
- Chunk ownership defaults to agent-owned. Only a step physically requiring the operator makes its chunk operator-owned, which parks at dispatch before any seat spawns. Credential access alone never qualifies.
- Every secret including production lives in the consumer repo's gitignored .env. The operator explicitly accepts that agents can read it. No secret vault, broker, or off-machine credential pile exists.

Reading note 2026-09-10: the standing lines above are the operator's creation-locked text and stay verbatim. Where they say the gate judges an exit code, this design has the checker's verdict and the blocking `checks` commands; where they say a chunk parks at dispatch, this design has no parking: an operator-owned step is done by the operator in the leaf's tab and the leaf waits in its phase.


## Leaf architecture

Layout: `src/akrogon.ts` entry, one file per subcommand under `src/`, `src/routing.ts` holding the phase table as a typed constant, `src/state.ts` for the state file read-modify-write under flock, `src/log.ts`, `src/shell.ts` as the one boundary for `herdr`, `gh`, `git` and `flock` process calls, `plugin/` for the herdr plugin manifest and hook script, `config.yaml` at the repo root (the repo becomes `akrogon` after handoff), `tests/<subcommand>.test.ts`. Leaf file names, fixed for every leaf: `positions-A.md` and `positions-B.md` (blind positions), `rebuttal-A.md` and `rebuttal-B.md`, `plan.md` (the synthesis; slot A's diagnosis paragraph is appended to it after `failed`), `implementation/brief.md` (the worker brief), `review-A.md` and `review-B.md` (each reviewer's findings; A's re-check notes and merge findings append to `review-A.md`), `questions/<id>.md` (peer answers), `.lock` (gitignored). State fields written by the handoff: `slug`, `phase`, `created`, `priority`, `repo`, `debate`, `blocked-by`, `sources` (optional), `hand_built` (only when true). A pane runs one turn at a time and is prompted again only after a phase move, so the `done` guard is the whole stale-call defence. Fields written by the command: `attempts` (map slot to count for the current phase), `done` (list of slots done in the current phase), `fix_rounds`, `verdict` (map slot to word), `tab`, `worktree`. Log line fields (one JSON object per phase move): `ts`, `repo`, `slug`, `from`, `to`, `slot`, `attempts`, `fix_rounds`, `verdict`, `head`, `diff` (shortstat against `AKROGON_BASE`), `session` (the harness session id from the pane, when known). Phase names: `plan.positions`, `plan.rebuttal`, `plan.synthesis`, `implement`, `check.review`, `check.fix`, `merge`, `merged`, `failed`; a leaf with `debate: no` starts at `plan.synthesis` and slot B writes the plan alone. Config: the harness launch lines in the global config carry each harness's auto-approval flags (`claude --model {model} --effort {effort} --dangerously-skip-permissions`, `codex -m {model} -c model_reasoning_effort={effort} -a never -s danger-full-access`, `pi --model {model} --thinking {effort} -a`), so no harness name is in code; per-repo defaults `worktree_root: issues/worktrees`, `rebuttal: true`, `fix_rounds: 3`, `implement: subagents`; `broadcast` keeps the existing shape `discord: webhook_env: [NAME]`. Slot is passed with `--slot` from the prompt line. Ownership: everything under `src/` except `src/status.ts` and `src/pull.ts`, `plugin/`, `config.yaml`, `tests/`, `issues/config.yaml`, `package.json`. Handoff answers that bind: 1-A, 2-A, 3-A, 4-A of 2026-09-09 (see the carries in # Bootstrap, # GitHub Intake, # Turn Within Phase). Tests per # Command Tests: one file per subcommand under tests/, bun test, real files and real processes on a temp repo, herdr and gh substituted at one thin boundary (one module wrapping every `herdr` and `gh` process call, replaced by the tests), a test only for a state transition, a file shape, a refusal or an observed defect, never wording; never the operator's real panes, install roots, GitHub or the herdr socket. Tests point the command at a temp global config through the `AKROGON_HOME` environment variable (default: the tool checkout root); nothing else reads that variable. Operator drives: the operator types every pass prompt in two herdr panes with both slots guiding; the phase field is moved by the operator with the command once it runs; this leaf finishes by hand and is never transferred half-done into automation.

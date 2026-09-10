# Design: pull-close

Chart skill version: 4

## Binding decisions, verbatim

### # GitHub Intake

Reports reach GitHub through seed-issue, which a colleague's agent runs. The target is fixed by files, never judged: when the installed framework's routing file names an upstream issues repo, seed-issue posts there with `gh issue create -R`; otherwise it posts to the current repo's GitHub origin; a malformed file, missing origin or non-GitHub origin is a visible failure. The file writer and the FIXER submission script are retired. The routing file's path and shipping belong to the framework repo.

`akrogon pull` runs inside a registered repo: it lists that repo's open GitHub issues and writes one file per issue into `issues/seeds/<number>-<slug>.md`, deleting seed files whose issue is closed only after a complete successful listing. The folder is a gitignored mirror, derived, never edited; it is the one explicit exception to "no state outside leaf folders" because it can be deleted and rebuilt at any time. `akrogon pull --all` does the same for every registered repo and is called by the herdr startup hook beside `next --all`. The chart-issues door runs `pull` when opened. No timer.

The door consolidates as locked in Skill Rewrite: it skips seeds whose `owner/repo#n` already appears in `sources` under issues/open, issues/closed or a chart intake, copies each imported seed's text into the chart intake or brief as the evidence of record, and maps each report to one completion owner, an issue or an epic. The handoff writes `sources: [owner/repo#n, ...]` into the state.yaml of every leaf under that owner.

Closing is the command's: when `akrogon phase <slug> merged` moves the completion owner to issues/closed, in that same step it runs `gh issue close -R owner/repo n --comment "merged <commit>"` for every entry in `sources`, checking the issue state first, one retry, failure printed, never reversing the merge. The next pull removes the seed file. The broadcast message stays with broadcast-issue.

Why: the operator wants the queue online where colleagues' agents already are, seeds on disk to chart from without moving anyone's files, and closure that needs no hand. Files fix the target, a mirror fixes the copy, the issue number fixes the duplicate check, and the command already owns the transition that means done.

Forecloses: a GitHub issue template as the intake shape, an import comment or label on GitHub, a label query in the door, a local import registry, closure by merge-issue or by commit keywords, a timer-driven pull, seed-issue asking where to post.

Operator rule 2026-09-09 (chat, recorded for handoff): the chart-issues door consolidates seeds by destination and by speed of resolution. Seeds that share a destination and no dependency become parallel leaves of one issue; independent issues are shaped to run side by side; only a planner-named dependency (see # Parallel Merge) puts leaves in order. The door proposes the split that finishes soonest, not the tidiest one, and shows it to the operator before writing.

### # Multi Chart Layout

Charts live at `issues/chart/<chart-slug>/` with CHART.md, INTAKE.md (source text verbatim plus scope) and decisions/, always a subfolder, never moved; a handed-off chart gets one "Handed off <date>" line. The work tree is `issues/open/<epic>/<issue>/<leaf>/` or `issues/open/<issue>/<leaf>/`: a leaf is any folder holding state.yaml, an issue is the folder holding leaves, an epic is a folder holding two or more issues; a single issue has no epic. Plain slugs, unique within the repo, enforced at handoff; commands take the bare slug; no order or mode markers in names; order lives only in each leaf's blocked-by. An index file per container (EPIC.md listing issues, ISSUE.md listing leaves, one line each with purpose), written by the handoff, never read by the command. A leaf's issue is its parent folder; the merged transition holds `flock` on `<issue>/.lock` around the state write and the "every sibling merged" check and reports completion only from the transition that made it true, so one broadcast per issue. Authoritative state is the registered repo checkout from global `repos`; worktree copies of issues/ are inert. `hand_built: true` in leaf state makes `next` and `--all` skip the leaf. The handoff writes directly into issues/open in one attended pass; a leaf whose blocked-by names a missing folder is refused. A finished issue, or a finished epic as a whole, is moved by the command to `issues/closed/` under the issue lock right after the completion check; a failed move is retried by the next run. One log file, `issues/log.jsonl`. Why: every fact the command needs is a folder or a state field, every fact a person needs is one short index file beside the thing it describes, and one rename closes work. Forecloses: the term "series", July 28 markers and series-wide state, an explicit issue reference in state, a state copy in worktrees, per-leaf broadcasts, staged publishing, issue records that never close.

From # Status View 2026-09-09: operator dropped the `hand_built` marker from status rows ("useless"); the flag still skips `next`.

From # GitHub Intake 2026-09-09: `issues/seeds/` is a gitignored derived mirror of open GitHub issues, the one folder outside leaf folders, deletable at any time; leaf state.yaml gains `sources: [owner/repo#n]` written by the handoff; the transition that moves an owner issue or epic to issues/closed also closes those GitHub issues.

From # Lessons 2026-09-09: `learnings/LESSONS.md` and `learnings/history/` are per-repo tracked files beside issues/, the only prose read outside the leaf by plan-issue and chart-issues.

### # Repeat Safety

Safe twice by construction: `akrogon phase` is compare-and-set on phase, fix round and attempts, so a repeated or late move is refused; a merge that landed without the phase written is detected by ancestry and set to `merged`. Concurrency is serialized by a kernel `flock` on `<leaf>/.lock` around every state read-modify-write and around the whole `next` pass for that leaf; skills never call `next`, the herdr hook is the only caller. A stalled prompt is resent once, then handed to the peer; a re-prompted pass inspects the worktree and finishes what remains, rerunning checks only on changed code, missing evidence or a concern. Broadcast is one message per issue, sent by the merge skill when the command reports the issue's last leaf merged, one immediate retry, no success record. State is authoritative and the log is diagnostic; state is written first, a log failure never reruns a move. Retry policy is # Next Command Owner's: same slot twice, peer once, then failed; blocked or unknown panes go to the peer. Why: compare-and-set and one kernel lock cover every duplicate without a process, a timer or a second store, and the operator ranks speed above the sequential alternative. Forecloses: invocation ids, a herdr idempotency feature, per-leaf broadcasts, the term "category" (retired), recoverable logging, any operator wait.

Operator confirmation 2026-09-09: "When we say issue series ... consists of more issues that are sub issues, they are the categories ... broadcasting happens when the entire issue is done, which in the simple issue is just one issue, one category, and with the series it's as many broadcasts as there are issues that are part of it." Confirmed by slot A: series folder, one folder per sub-issue (the category), leaves inside; one broadcast per sub-issue when its last leaf merges; a simple issue is one category.

Operator correction 2026-09-09: the category is the issue. A series is a group of issues; an issue has one or more leaves; the broadcast for an issue fires when its last leaf merges, so a series broadcasts once per issue, and a simple issue broadcasts once. "Category" in this file means "issue".

Operator, 2026-09-09, locked vocabulary: "the category doesn't even have to exist as a term ... It's either one issue or a series of issues if it's a complex thing that we are doing. And every issue has either one leaf or multiple leaves." Three terms only: series, issue, leaf (series renamed epic later the same day in # Multi Chart Layout). Every earlier "category" in the chart files was rewritten to "issue" the same day.

From # Multi Chart Layout 2026-09-09: the term "series" is retired for "epic". The merged transition holds `<issue>/.lock` around the state write, the completion check and the move to issues/closed; a failed move is retried by the next run.

From # GitHub Intake 2026-09-09: GitHub close runs inside the owner-close transition under the issue lock, checks the issue state before acting, one retry, so a repeated transition never double-comments.

### # Distribution

Tool repo `akrogon` holds the command, the seven skills, and the herdr plugin folder. Install once per machine with `akrogon install`: `~/.local/bin/akrogon` symlinked to the entry file, dependencies only in the tool checkout, one symlink per skill folder into `~/.claude/skills` (Claude) and `~/.agents/skills` (Codex and pi), `herdr integration install <kind>` for each harness in the global config, `herdr plugin link` for the plugin. Install refuses to replace a real folder bearing a new skill's name and prints the removal line. Per repo: the init-issues skill inspects and proposes, `akrogon init` writes issues/config.yaml, issues/open, the worktree gitignore line, and the repo entry in the global config. The consumer repo holds nothing else of ours; its own package manifest is untouched. Verify with `akrogon config` and one harmless handoff. Update is `git pull` in the tool repo at any time; the next pass reads the new text. Each skill folder is self-contained and its SKILL.md names the akrogon command as its dependency. Why: symlinks make one checkout the only copy, so update and install are one step each and no copy can drift, and the two commands hold the only machine-specific steps. Forecloses: an installed executable build, copies of skills in harness roots, a scripts folder or package.json in consumer repos, permanent skill-name prefixes, a coexistence window with the old skills.

From # Status View 2026-09-09: the plugin hook also runs `herdr notification show` when a leaf moves to `failed`; the only push to the operator, no loop.

From # GitHub Intake 2026-09-09: the `[[startup]]` hook runs `akrogon pull --all` beside `next --all`; still nothing GitHub-specific installed, `gh` is a machine prerequisite like `flock`.

### # Config Shape

Two files. Global `akrogon-new/config.yaml`: `max_active` (machine-wide, default 3), `slots.a` and `slots.b` (harness, model, effort), `workers` (harness name to model string, open-ended, any harness herdr can start), `harnesses` (one launch line per harness with `{model}` and `{effort}` placeholders: `claude --model {model} --effort {effort}`, `codex -m {model} -c model_reasoning_effort={effort}`, `pi --model {model} --thinking {effort}`, `grok -m {model} --effort {effort}`), `toolkits` (language to runner, `typescript: bun:test`, proposed by init for repos without tests, never a migration), `repos` (name to path). Per repo `issues/config.yaml`: `remote`, `default_branch`, `worktree_root` (default issues/worktrees), `rebuttal` (default true), `fix_rounds` (default 3), `checks` (lint, typecheck, test, test_changed with `$AKROGON_BASE` = the leaf's branch point on main, refreshed on rebase; every one blocks), `advisory` (optional commands whose failure is a Nit), `grounding`, `broadcast`. No `quality.blocking` flag. Skills never parse YAML: `akrogon config` prints the effective config for the current repo, global plus repo plus defaults, once per pass. Edits take effect at the next action, running panes keep their launched model, no per-leaf snapshot. Slot B repairs itself on the last allowed round; workers get the rounds before it. Dropped: gate, certificates, analyzed_scopes, scripts_dir, branch_prefix, env_source, tab, compaction, speed, pane.create; skill install roots go to # Distribution.

Why: each setting has one home and one reader; the launch line per harness keeps code free of vendor names so any harness is a one-line edit; removing the blocking flag removes the contradiction slot B found and the per-linter definition it would have needed.

Forecloses: a single merged config, harness names in code, a quality blocking flag, per-repo max_active, frozen per-leaf config, a per-key config command.

Operator note 2026-09-08: the tool repo is akrogon, so the global config is akrogon/config.yaml.

Operator 2026-09-10 (1-A): per-repo key `implement: subagents | inline`, default `subagents`. `inline` means slot B writes the same brief as its own plan and implements it in order itself, `test_changed` as it goes, the full suite once, repairs itself, no sub-briefs, no worker, no mismatch return; chosen for a repo whose work cannot be split into bounded pieces (visual feedback loops such as 3D work) or whose log shows inline cheaper. Read by implement-issue through `akrogon config`; nothing else changes. Evidence: Morph routing benchmark 2026 (small tasks: Opus alone $2.78 vs planner plus Flash $3.18, same pass), Cursor 2026-07-20 (large project: 8x cheaper delegated), theinfinity.dev 2026-08-19 (delegate above about 250k main context), Co-Coder 2026-05-31 (cross-piece dependencies cost context transfer). `remote` and `default_branch` are the merge target: every `origin/main` in # Parallel Merge and # Repeat Safety reads as `<remote>/<default_branch>` from `akrogon config`, origin/main being the defaults.

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

### # Driver State

State lives in the issue's own `state.yaml`: `phase`, `attempts`, `done`, `slot` and `pane` hints. `akrogon next` finds the issue from the pane's cwd, which herdr restores across restarts, or from the folder the operator names. Tabs and panes are created and named automatically by the command from the slug, one tab of two panes per leaf, never reused. Slot is text in the prompt. The phase-to-skill-and-slot table is a constant in the command. Work starts only when the operator runs `akrogon next` on a leaf, an epic folder or `--all`; a merge closes the tab and starts what it unblocked, bounded by `max_active`. Blocked or unknown panes go to the peer wake-up path from # Next Command Owner. Auto-approval per harness is a fact, not a setting: Claude `--dangerously-skip-permissions`, Codex `-a never -s danger-full-access`, pi `-a`. Why: cwd is the one fact herdr owns and restores, so no mapping file, no registry, no program to maintain. Forecloses: a pane registry, tab renaming by hand, a separate `start` verb, pane reuse across issues, marker files for slot, any auto-start after the chart.

From # Config Shape 2026-09-08: `akrogon next` starts a slot by filling the harness launch line from config with the slot model and effort and handing it to herdr; `akrogon config` prints the effective config for a repo.

From # Model Tiering 2026-09-09: `akrogon phase` also appends one JSON line to `issues/log.jsonl` per move, from data it already holds plus `git rev-parse HEAD` and `git diff --shortstat $AKROGON_BASE` in the worktree.

From # Repeat Safety 2026-09-09: `next` and `phase` take `flock` on `<leaf>/.lock` (gitignored) around state read-modify-write; `next` prompts with `--wait --until working` and a short timeout; a `working` event never counts an attempt.

From # Multi Chart Layout 2026-09-09: "series" is now "epic" (two or more issues); the command moves a finished issue or epic to issues/closed under the issue lock; `hand_built: true` leaves are skipped by `next` and `--all`; the authoritative state is the registered checkout, never a worktree copy.

From # GitHub Intake 2026-09-09: state.yaml gains an optional `sources` list; `akrogon phase merged` closes the listed GitHub issues when the owner folder moves to closed, state check first, one retry, failure printed.

### # Command Tests

Separate test files, one per subcommand, run by bun test as the akrogon repo's `checks.test`; the shipped command carries no test code. The tests are a handful of command-level scenarios on a temp repo with real files and real processes: a stale phase move refused, the same command run twice, two processes racing on one leaf, pull adding and deleting seeds, status on a fixture tree. Herdr and gh are substituted at one thin boundary. The Bootstrap takeover stays the live integration proof. A test exists only for an observable contract: a state transition, a file shape, a refusal, or a defect that happened; never for prose or output wording, except text that runs as written (commands, numbers, fixed references); no coverage target; check-issue treats a wording test as a maintainability defect under # Quality Layers. Routine tests never touch the operator's real panes, install roots, GitHub issues, or the herdr socket. New tests need a contract or a defect behind them, never coverage, and the akrogon repo's briefs say so; the operator's rule is that the suite stays small.

Forecloses: inline `--self-test`, a line budget for tests, tests that restate the routing table, and any test that drives real herdr or GitHub.

### # Debate Count

One debate, on the implementation plan, by default. The door asks one question, debate or not, next to the consult election, and writes one field; very small issues skip it and slot B writes the plan alone. Planning's unique outputs, decision IDs, codebase grounding and the execution checklist, move into the implementation synthesis. One rebuttal round stays a per-repo flag, default on, fired only on a real fork. Roles are fixed, slot A strategist, audit and merge, slot B implementation synthesis and execution, and any slot may run any harness at any time. Why: the door locks decisions, so a planning debate would re-litigate them at eleven top-model passes per issue, and the rebuttal evidence (Khan, Du vs Smit, "Stop overvaluing MAD") only supports a second round when a fork exists. Forecloses: a planning debate, a second implementation debate, a per-issue rebuttal setting, any slot-to-harness binding.

From # Door Second Slot 2026-09-09: the door's second slot is separate from the implementation debate field; naming B's pane at chart open does not touch it.

Operator 2026-09-10 (F1-A): the consult election and the debate question are one question and one field. `consult` leaves state.yaml; `debate: yes|no` is the whole election, asked once at the door with a recommendation from the settled design, default no, read by plan-issue. Intake 151's requirement, one question and one field, is met by `debate` alone; the second field arrived when the planning debate was cut and had no reader.

### Decisions not binding this leaf

- none

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

`src/pull.ts`, plus the close call added at the named place in `src/phase.ts` that leaf `command` left in the merged transition; `gh` is a machine prerequisite like `flock`, called through `src/shell.ts`. Slug derivation for seed files is mechanical from the issue title; the number is the identity. No new config key; the gitignore line for `issues/seeds/` is already written by `akrogon init` (leaf command). Ownership: `src/pull.ts`, the close call in `src/phase.ts`, the startup line in the plugin manifest, `tests/pull.test.ts`, the close cases in `tests/phase.test.ts`. Not this leaf: seed-issue, the door's consolidation. Tests per # Command Tests: one file per subcommand under tests/, bun test, real files and real processes on a temp repo, herdr and gh substituted at one thin boundary (one module wrapping every `herdr` and `gh` process call, replaced by the tests), a test only for a state transition, a file shape, a refusal or an observed defect, never wording; never the operator's real panes, install roots, GitHub or the herdr socket. Tests point the command at a temp global config through the `AKROGON_HOME` environment variable (default: the tool checkout root); nothing else reads that variable.

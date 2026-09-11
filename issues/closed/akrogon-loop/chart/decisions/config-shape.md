# Config Shape

Chart skill version: 4

Status: resolved
Type: grilling

## Question

What does issues/config.yaml hold and nothing more: harness and model per slot so no slot is vendor-bound, the repos block, the install roots list, the per-repo variables the commands read, `max_active`, the check fix-round cap, the rebuttal flag (intake 75, 85, 271). The chart lists the config as a deliverable and no decision owned it until the coverage pass of 2026-09-08.

Reshape 2026-09-08 after # Debate Count, # Turn Within Phase, # Driver State: the phase-to-skill-and-slot table lives in the command, so config holds only per-repo variables.

## Findings

### Slot A research 2026-09-08 (tier 2, local)

Old akrogon config (~/Work/infra/akrogon/issues/config.yaml): roles.consultant and roles.implementer as lists of runtime, model, compaction, effort, speed, pane.create; gate thresholds and certificates; analyzed_scopes; scripts_dir, branch_prefix, env_source, tab per repo; grounding index, docs, surfaces; broadcast webhook_env. Current akrogon-new config: issues_root, scripts_dir, worktree_root, branch_prefix, repos, broadcast, grounding none. Harness model flags: claude `--model` and `--effort`; codex `-m`; pi `--model provider/id:thinking`. `herdr agent start --kind` lists 23 harness kinds, so any-harness costs nothing. Intake 85: harness and model per slot in one place, never vendor-bound. Intake 271: one tool repo listing repos, consumer repos carry their own issues tree.

Slot A view: two files. Global in akrogon-new: repos, slots (harness, model, effort), workers per harness, max_active, toolkit table. Per repo: checks, quality.blocking, fix_rounds, rebuttal, grounding, broadcast. Skills never parse YAML; they run `akrogon config <key>` and read one value, so three harnesses do not need three parsers. Harness launch details (executable, model flag) live in the command's routing table, not in config. Defaults live in the command, the per-repo file holds overrides only. Drop from the old config: gate, certificates, analyzed_scopes, scripts_dir, branch_prefix, env_source, tab, compaction, speed, pane.create.

### Slot B research 2026-09-08 (blind)

Sources: Wiggins, Twelve-Factor config (tier 1, 2017); Medisetty, Uber engineering productivity 2026-08-27 (tier 1): centralized model defaults, separate primary and subagent models, fleet-wide usage bounds; Fowler 2024-01-18 (tier 1); King 2019-11-05 (tier 1) parse once at the boundary; Bun 1.4.0 `test --changed` help and Vitest `--changed` docs (tier 2, inspected 2026-09-08); July 28 config at its commit (tier 2).

Slot B proposes two files with each key owned by one file. Tool config: max_active, skill_roots, slots a/b with harness and model, harnesses block with argv, model_flag and worker per harness, preferred_test_toolkits, repos. Repo config: remote, default_branch, worktree_root, branch_prefix, rebuttal, fix_rounds, checks (lint, typecheck, test, test_changed with `$AKROGON_BASE`, mutation), quality.blocking, grounding, broadcast. Slot B found two ambiguities: quality.blocking (Quality Layers) versus red checks always returning for repair (Parallel Merge), resolved by limiting the flag to quality-only findings; and "B repairs at round three" versus a configurable cap, resolved as "B repairs on the final allowed round". Questions: two files; one machine-wide pair; max_active machine-wide at three; advisory scope; fixed AKROGON_BASE refreshed on rebase; bun:test preferred for new TypeScript setups, existing runners kept; final-round rule; config read at the next action with no snapshot. Challenge: harness launch fields may duplicate what herdr owns; advisory scope must be precise; valid YAML proves no model or script exists.

## Resolution

From # Quality Layers 2026-09-08: config holds the check commands (lint, typecheck, test, optional test_changed, optional mutation), a quality blocking flag, and the fix_rounds cap.

Operator note 2026-09-08: the operator wants one preferred testing toolkit for every repo akrogon attaches to. Lean: a per-language toolkit table in akrogon's own global config, not the repo's; init proposes it as recommended, offers to install it in the repo as a dev dependency, the per-repo config holds the resulting commands and can override. Never a refusal at init. Ties to # Distribution for what init becomes.

Finding 2026-09-08 (tier 2, local inspection of six repos under ~/Work): every repo is TypeScript on bun:test or vitest, both of which ship a changed-files mode (`bun test --changed=<ref>`, `vitest run --changed <ref>`), so the changed-tests command needs no plugin anywhere. Three repos also chain plain `bun file.ts` scripts in package.json, which no runner selects; they run in the full command only. Preferred toolkit table can be one line per language: typescript → bun:test or vitest, unchanged.

From # Skill Rewrite 2026-09-08: config carries a `worker` model role per harness; implement-issue and merge-issue read it to spawn workers and the broadcast writer. Key shape decided here.

### Rebuttal round 2026-09-08 (slot B on the merged batch)

Slot B disagreed on five points. Q1: akrogon-new is itself a consumer repo, so global and repo files would collide at issues/config.yaml; put the global file at akrogon-new/config.yaml. Accepted. Q2: one command per key means repeated calls and inconsistent reads; let `akrogon config` return the whole effective config for a repo in one call. Accepted. Q3: launch details in code mean a new harness is a code change; slot A keeps them in code because herdr already knows executables and only the model flag differs. Shown as disagreement. Q5: "quality-only" is undefined for a mixed linter exit code; separate advisory commands or keep mixed failures blocking. Accepted as: every command under `checks` blocks, an optional `advisory` list reports as Nit, no blocking flag. Q10: symlink roots still need to be known; defaults need naming. Accepted: roots go to # Distribution, defaults listed.

### Operator answers round 1, 2026-09-08

1-A two files, with the note: worker harnesses are not hardcoded, any harness (claude, codex, pi, grok, other) may appear under `workers`. 2-A `akrogon config` prints the effective config. 4-A machine-wide max_active. 6-A fixed base (plain restatement asked). 7-A bun:test proposed. 8-A last allowed round, with the operator's proposal that the worker gets at most two rounds; asked to be challenged. 9-A next action. 10-A drop list and defaults.

Open: 3 (operator leans to one launch line per harness in config), 5 (plain restatement asked).

### Operator answers round 2, 2026-09-08

"I accept everything": 3-B one launch line per harness in config, 5-A no blocking flag, `checks` block and `advisory` reports as Nit. Operator requirement: every launch line carries every variable the harness supports, at least `{model}` and `{effort}`. Flags verified locally 2026-09-08 (tier 2, `--help` of installed binaries): claude `--model`, `--effort` (low..max); codex `-m`, effort via `-c model_reasoning_effort=`; pi `--model`, `--thinking` (off..max); grok `-m`, `--effort`. Two variables cover all four.

## Resolution

Two files. Global `akrogon-new/config.yaml`: `max_active` (machine-wide, default 3), `slots.a` and `slots.b` (harness, model, effort), `workers` (harness name to model string, open-ended, any harness herdr can start), `harnesses` (one launch line per harness with `{model}` and `{effort}` placeholders: `claude --model {model} --effort {effort}`, `codex -m {model} -c model_reasoning_effort={effort}`, `pi --model {model} --thinking {effort}`, `grok -m {model} --effort {effort}`), `toolkits` (language to runner, `typescript: bun:test`, proposed by init for repos without tests, never a migration), `repos` (name to path). Per repo `issues/config.yaml`: `remote`, `default_branch`, `worktree_root` (default issues/worktrees), `rebuttal` (default true), `fix_rounds` (default 3), `checks` (lint, typecheck, test, test_changed with `$AKROGON_BASE` = the leaf's branch point on main, refreshed on rebase; every one blocks), `advisory` (optional commands whose failure is a Nit), `grounding`, `broadcast`. No `quality.blocking` flag. Skills never parse YAML: `akrogon config` prints the effective config for the current repo, global plus repo plus defaults, once per pass. Edits take effect at the next action, running panes keep their launched model, no per-leaf snapshot. Slot B repairs itself on the last allowed round; workers get the rounds before it. Dropped: gate, certificates, analyzed_scopes, scripts_dir, branch_prefix, env_source, tab, compaction, speed, pane.create; skill install roots go to # Distribution.

Why: each setting has one home and one reader; the launch line per harness keeps code free of vendor names so any harness is a one-line edit; removing the blocking flag removes the contradiction slot B found and the per-linter definition it would have needed.

Forecloses: a single merged config, harness names in code, a quality blocking flag, per-repo max_active, frozen per-leaf config, a per-key config command.

Operator note 2026-09-08: the tool repo is akrogon, so the global config is akrogon/config.yaml.

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

Operator 2026-09-10 (1-A): per-repo key `implement: subagents | inline`, default `subagents`. `inline` means slot B writes the same brief as its own plan and implements it in order itself, `test_changed` as it goes, the full suite once, repairs itself, no sub-briefs, no worker, no mismatch return; chosen for a repo whose work cannot be split into bounded pieces (visual feedback loops such as 3D work) or whose log shows inline cheaper. Read by implement-issue through `akrogon config`; nothing else changes. Evidence: Morph routing benchmark 2026 (small tasks: Opus alone $2.78 vs planner plus Flash $3.18, same pass), Cursor 2026-07-20 (large project: 8x cheaper delegated), theinfinity.dev 2026-08-19 (delegate above about 250k main context), Co-Coder 2026-05-31 (cross-piece dependencies cost context transfer). `remote` and `default_branch` are the merge target: every `origin/main` in # Parallel Merge and # Repeat Safety reads as `<remote>/<default_branch>` from `akrogon config`, origin/main being the defaults.

Operator 2026-09-10 (1-A, broadcast secret): the Discord webhook or bot token is the tool's one secret and lives in one file outside every repo, `~/.config/akrogon/env`, read only by the broadcast send script, which fails loudly when the file is missing. Per-repo `broadcast:` holds channel ids or names, safe to commit. No skill folder ever holds an env file, because skill folders are tracked and symlinked into the harness roots. `akrogon init` prints the path when the file is absent. This is a carry on the standing line that secrets live in the consumer repo's gitignored env: that line covers the consumer app's secrets; the broadcast token belongs to the tool.

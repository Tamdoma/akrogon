# Distribution

Chart skill version: 4

Status: resolved
Type: grilling

## Question

How do skills and scripts reach each harness and each consumer repo? Candidate from the intake: one skill folder in the tool repo, per-skill symlinks in each harness root, one PATH command for the scripts, consumer repos hold only config and issues. Must work for every harness with no special path, and a later person must be able to pick up the skills individually, for example by downloading the folder from GitHub. What does init-issues shrink to, and what happens to a running leaf when the shared text changes?

Coverage pass 2026-09-08 adds: the herdr integration per harness is an install step, without it pane state is unknown (intake 177).

Reshape 2026-09-08 after # Debate Count, # Turn Within Phase, # Driver State: the herdr plugin that hooks `akrogon next` is an install step beside the harness integration.

From # Skill Rewrite 2026-09-08: init-issues is the only July 28 skill left undecided; it becomes `akrogon init` if this decision makes init a command, otherwise it stays a skill.

From # Config Shape 2026-09-08: skill install roots (symlink targets) are decided here, not in config. Init proposes the toolkit from the global `toolkits` table for repos without tests and never migrates a working runner. Global config lives at akrogon-new/config.yaml, per-repo at issues/config.yaml.

## Findings

### Slot A research 2026-09-08 (tier 2, local)

Skill roots on this machine: ~/.claude/skills, ~/.codex/skills, ~/.pi/agent/skills, ~/.agents/skills; chart-issues is already a per-skill symlink into akrogon-new in all four and works. The old akrogon skills are real copies in three roots under the same names the new set uses (implement-issue, check-issue, merge-issue, seed-issue, broadcast-issue, plus consult, create, explain, init, consolidate, issue-master). ~/.local/bin/akrogon is a shim to the old akrogon launcher. herdr 0.9.0 has `herdr plugin link <path>` to register a plugin directory in place and `herdr integration install <kind>` per harness. The consumer repo today carries issues/.scripts with package.json and lockfile copied by sync-payload.ts; the July 28 init skill scaffolds that copy. Claude and Codex docs (intake 279) follow symlinked skill folders.

Slot A view: one install script in the tool repo, idempotent: per-skill symlinks into every harness root that exists, ~/.local/bin/akrogon symlink to the tool entry, `herdr plugin link` on the tool repo's plugin folder, `herdr integration install` for each harness in config. Consumer repos hold only issues/config.yaml, issues/open and gitignored worktrees; no scripts, no package.json. init: `akrogon init` writes the skeleton and defaults; the toolkit and grounding proposal is judgment, so a small init-issues skill runs the command then proposes. Updates: git pull in the tool repo; the next pass reads the new text, no pinning. A later person copies one skill folder from GitHub, with the README stating the akrogon command dependency.

### Slot B research 2026-09-08 (blind)

Sources: Pocock skills repo (tier 1, inspected 2026-09-08) offers centrally updated bundles and editable copies with an attended setup skill; Medisetty, Uber, 2026-08-27 (tier 1) managed harness config at fleet scale; Wiggins 2017 (tier 1) explicit isolated dependencies; Codex, Claude and pi skill docs (tier 2): Codex and pi read ~/.agents/skills, Claude its own root, Codex does not merge duplicate names; herdr integrations and plugins docs (tier 2): linking a plugin does not run its build; Agent Skills spec (tier 2) accommodates tool requirements.

Slot B proposes eight steps: tool checkout holds executable, skills, references, hook plugin; one PATH link to the entry point with dependencies only in the tool checkout; per-skill links into ~/.agents/skills and ~/.claude/skills; herdr integrations plus linked plugin; a shortened init-issues skill inspects scripts and grounding and proposes config; `akrogon init` writes directories and config mechanically; verify through `akrogon config` and one harmless handoff that loads a skill and fires the hook; update the tool between active runs. Slot B found two things slot A missed: the new lifecycle skills share names with the old copies that must keep serving in-flight issues under # No Migration, so a global replacement changes what an old session reads after compaction; and "usable individually" must state the akrogon command as a declared dependency rather than promise a standalone mode. Challenge: a source checkout that moves breaks links; coexistence must not become a second install path; individually usable is a product boundary.

### Rebuttal round 2026-09-08 (slot B on the merged batch)

Q2: linking into every existing root risks duplicate discovery (Codex reads ~/.agents/skills and does not merge duplicate names); one root per harness instead. Accepted. Q4: the consumer keeps its own package.json, accepted test dependencies may go there, init writes the worktree gitignore rule. Accepted. Q5: a third option, invoke new skills by explicit source path during coexistence, no renaming and no waiting. Added as an option. Q6: Config Shape's live-settings rule does not cover executable and skill text; update between active runs, reinstall dependencies when the lockfile changes. Shown as disagreement. Q7: the akrogon dependency is stated in SKILL.md, not a README. Accepted.

Operator note 2026-09-08: the tool repo will be named akrogon, not akrogon-new; the old akrogon repo will be deleted. Every path above reads akrogon/... . Q5 narrows: with the old repo gone, the old skill copies in the harness roots are removed at install, and coexistence lasts only as long as the operator keeps the old repo.

Operator answer 2026-09-08 (chat): the herdr plugin also carries a `[[startup]]` hook running `akrogon next --all` once after herdr restores a session, so a reboot or herdr restart heals every unfinished leaf: missing agents are started in their tabs and the slot whose turn it is gets prompted. Plugin manifest: two `[[events]]` (pane.agent_status_changed, pane.exited) calling `akrogon next --pane`, one `[[startup]]` calling `akrogon next --all`. No watcher, no process.

### Operator explanations 2026-09-08 (chat, recorded for handoff)

The herdr plugin is one folder in the akrogon repo, registered once with `herdr plugin link akrogon/herdr-plugin`. Manifest:

```toml
plugin_id = "akrogon"
name = "akrogon"
version = "1.0.0"
min_herdr_version = "0.9.0"
description = "Runs akrogon next when a pane's agent settles or exits."

[[events]]
on = "pane.agent_status_changed"
command = ["akrogon", "next", "--pane"]

[[events]]
on = "pane.exited"
command = ["akrogon", "next", "--pane"]

[[startup]]
command = ["akrogon", "next", "--all"]
```

What it does. Herdr fires an event when an agent in a pane changes state or the pane closes, and runs the command once per event with the event JSON in `HERDR_PLUGIN_EVENT_JSON`. `akrogon next --pane` reads the pane id and status from it, maps the pane to a leaf through the pane's working directory, reads the leaf phase file, and acts only if the idle pane is the slot whose turn it is; otherwise it exits. The event never moves a phase; only a skill does, by `akrogon phase` at the end of its pass. An idle event with the phase unchanged means the pass did not finish: attempts plus one and the same slot is re-prompted with the same pass. After the second failure of the same pass, the hook prompts the other slot with one line (issue, pass, pane, "look at it, unblock or answer what you can, then run akrogon next"); the peer resends, escapes and resends, or takes the pass itself. A `blocked` or `unknown` pane goes the same peer route, because herdr refuses to prompt a blocked pane and only an agent can answer a dialog. If the peer's attempt also fails, the leaf is `failed` and drops out. Nothing waits on the operator (# Next Command Owner, operator-locked). Corrected 2026-09-09: an earlier version of this paragraph said the blocked pane is left for the operator and the cap shows the leaf as stuck; that contradicted # Next Command Owner and is withdrawn. Herdr down means every agent is down with it, since panes are its child terminals; after a restart herdr restores tabs and working directories as empty shells, and the startup hook runs `akrogon next --all`, which reads every unfinished leaf, starts missing agents in their tabs, and prompts the slot whose turn it is. No watcher, no process of ours between events. Known limit, accepted in # Next Command Owner: an agent that hangs without ever going idle is not detected.

Operator answers 2026-09-08, round 1: 1-A, 2-A, 3-A with a follow-up, 4-A, 5-A, 6-A, 7-A, 8-A. Follow-up on 3: can the init step also batch the herdr commands? Answer: the herdr commands are per machine, not per repo, so they go into the one-time `akrogon install` (PATH symlink, skill symlinks, `herdr integration install <kind>` for every harness named in the global config, `herdr plugin link` for the plugin folder). `akrogon init` stays per repo: issues/config.yaml, issues/open, gitignore line, repo entry in the global config. Two commands, each idempotent, each printing what it did and what it skipped. Challenge answer: the old akrogon repo is deleted as soon as this chart is done, so the Q5 window is zero; the old skill copies in `~/.claude/skills` do not vanish with the repo, so `akrogon install` refuses to overwrite a real folder with the same name as a new skill and prints the removal line for the operator. New fork from the challenge: how this chart itself is implemented before the command and skills exist; opened as # Bootstrap.

## Taken

Tool repo `akrogon` holds the command, the seven skills, and the herdr plugin folder. Install once per machine with `akrogon install`: `~/.local/bin/akrogon` symlinked to the entry file, dependencies only in the tool checkout, one symlink per skill folder into `~/.claude/skills` (Claude) and `~/.agents/skills` (Codex and pi), `herdr integration install <kind>` for each harness in the global config, `herdr plugin link` for the plugin. Install refuses to replace a real folder bearing a new skill's name and prints the removal line. Per repo: the init-issues skill inspects and proposes, `akrogon init` writes issues/config.yaml, issues/open, the worktree gitignore line, and the repo entry in the global config. The consumer repo holds nothing else of ours; its own package manifest is untouched. Verify with `akrogon config` and one harmless handoff. Update is `git pull` in the tool repo at any time; the next pass reads the new text. Each skill folder is self-contained and its SKILL.md names the akrogon command as its dependency. Why: symlinks make one checkout the only copy, so update and install are one step each and no copy can drift, and the two commands hold the only machine-specific steps. Forecloses: an installed executable build, copies of skills in harness roots, a scripts folder or package.json in consumer repos, permanent skill-name prefixes, a coexistence window with the old skills.

From # Status View 2026-09-09: the plugin hook also runs `herdr notification show` when a leaf moves to `failed`; the only push to the operator, no loop.

From # GitHub Intake 2026-09-09: the `[[startup]]` hook runs `akrogon pull --all` beside `next --all`; still nothing GitHub-specific installed, `gh` is a machine prerequisite like `flock`.

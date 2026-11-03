# Slot B draft review

Checked 2026-11-03. Herdr-setup leaf references below are relative to `issues/chart/herdr-panels/slots/drafts/herdr-setup/right-panel/`. Akrogon leaf references are relative to `issues/chart/tasks-panel/slots/drafts/akrogon/tasks-board/`.

## panel-top-bar

- **F1. The declared agent data source lacks required fields.** `design.md:55` filters `agents()` by parent, and `needs-you-panel/design.md:48` additionally expects kind/status_ms from that API. `AgentInfo` has none of those fields (`/home/ivan/.config/herdr-app/herdr.d.ts:155`). Use the raw terminal/report facts from `terminals()` (`:209`) joined to the agent's place/Program. Both leaves need the same classification rule, including blocked children versus top-level done agents.
- **F2. The red-dot criterion consumes an undeployed cross-repo prerequisite.** `brief.md:22` and `design.md:55` require the real `akrogon status --json`, but this leaf has no prerequisite (`state.yaml:5`) or recorded deployment order for `status-json`. Read-only `akrogon status --json` currently exits 1 with `ERR_PARSE_ARGS_UNKNOWN_OPTION`. Record how the producer reaches the installed command before this criterion runs. A missing executable and an installed release without JSON support are different states. Contract rule: shapes **Preflight and validation**, unavailable destination-default-branch dependencies.
- **F3. Losing panel memory is not an implementation option.** `design.md:50` offers “accept losing remembered choices once,” contradicting `brief.md:17` and the binding preservation rule. Keep the migration required and leave only its mechanism open. The API does not expose another copy's localStorage directly; establish the existing store/read path rather than offering an unapproved loss.
- **F4. Accessible names were dropped.** `brief.md:21` and `design.md:21` require only hover names for icon-only buttons. Intake **Round 5**, 4a and `slots/look-final.md:8` also require accessible labels. Restore that requirement here, its owning leaf; the native API exists at `/home/ivan/.config/herdr-app/gpui-kit.d.ts:981`.
- **F9 applies here too:** this leaf owns the rendered count and red dot, including their theme proof.

## needs-you-panel

- **F1 applies to the data architecture** at `design.md:48`; `agents()` cannot supply the stated metadata or draft turn identity.
- **F5. Its logo criterion contradicts the live-Program decision.** `brief.md:19` requires logos from `knownAgents()`, but `slots/look-final.md:7` explicitly takes Needs-you's Program from the live terminal. `knownAgents()` describes launchable programs/installability (`herdr.d.ts:33`); the agent already carries its resolved live Program (`:167`). Use that live Program, including custom table overrides, rather than a second launch-table lookup.

## files-panel

No disagreement.

## changes-panel

No disagreement.

## spaces-scroll

No disagreement.

## status-json

- **F6. The watch contract omits inputs to its deployment alert.** `brief.md:19` restricts global targets to config, pause, stop, reconcile-host and runs. Deployment failure comes from `~/.akrogon/deploy.yaml` (`src/release.ts:25`, `:120`), and the active revision comes from the `current` link (`:21`, `:44`). Those can change without a listed watch target changing. Include their metadata events so a visible deployment failure/dot can appear or clear without reopening the panel. Do not restore a recursive watcher over the entire global home.

## tasks-mod

- **F7. File targets are passed to a folder-only documented API.** `design.md:54` says `watchFolder` on each target, while `status-json/brief.md:19` emits individual YAML/JSON files as well as directories. `herdr.d.ts:397` documents recursive folder watching, not a file subscription. Define and prove the per-kind watch mechanism and its owner. Merely replacing these with their common parent would reintroduce the forbidden recursive `~/.akrogon/worktrees` subscription. The top bar's watcher choice at `panel-top-bar/design.md:55` needs the same resolution.
- **F8. The actual Files/Changes handoff has no cross-repo prerequisite or integration owner.** `brief.md:5`, `:16`, `:21` promise opening the other panels through the real shared interface, but `state.yaml:5` depends only on `status-json`. The controller is owned by herdr-setup `panel-top-bar`, and pin consumers by `files-panel`/`changes-panel`; none exists on herdr-setup's current HEAD, confirmed by `git ls-tree -r --name-only HEAD mods`. Record their landing/install precondition before this live proof, or assign the final wiring proof to a named owner whose contract accepts it. An inert `setShared` write in a Tasks-only probe layout does not prove the promised handoff.
- **F9. The required rendered theme evidence has no complete owner.** `slots/look-final.md:18` and intake **Probes** require L1: pills, count and red dot on plain/hovered/selected rows in sage-terra, miasma, Gruvbox and a light theme. This brief's proof (`brief.md:21`) assigns live runs only to criteria 1/4/6; stage appearance in criterion 3 is left to the pure view-model proof. Assign the actual pill rendering to this leaf and count/dot rendering to `panel-top-bar`, with the agreed palette/state coverage. A row-data test cannot establish native tint composition or selected-row contrast.

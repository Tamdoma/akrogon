# Patches in herdr-setup

## Question

Signpost 3 (operator verbatim): "if it doesn't have something we need, use the herdr-setup space ... to create patches that will survive upstream updates." Facts read 2026-11-07: `hc` 0.1.18 and `herdr-app` 0.1.13 are prebuilt binaries in `~/.local/bin`; no herdr-core or herdr-app source is on the machine. Old herdr was patched at source: `/home/ivan/Work/infra/herdrdev/herdr-patched` (a fork of github.com/herdrdev/herdr with fix commits and a "patched-release" binary superseding upstream), plus `/home/ivan/Work/infra/herdr-plugins/*`. herdr-setup today is files on public surfaces: `mods/` (12 mods), `layouts/`, `keys.json`, `settings.json`, `bin/herdrapp`, linked by `./install`, with `tests/` for its mods. The taken forks already place in herdr-setup: the equal-heights weights helper (start-and-pane Q3, `doc.set`), notices in the `session-status` mod (notices), the global herdr skill (herdr-skill). `herdr-app feedback <text>` drafts feedback for the person to send.

1. What counts as a herdr-setup patch: only files built on public surfaces (mods, layouts, keys, settings, `bin/` helpers, linked skill, the `hc connect` API, `herdr-app do`), or also wrappers that shadow `hc`/`herdr-app` on PATH, or source patches like old herdr's when source exists?
2. Surviving updates: how does a patch notice that an hc or herdr-app update broke it (herdr-setup tests run after an update, a version check in `./install`, akrogon's e2e, nothing until it fails), and what happens when upstream ships the missing feature?
3. Upstream: is each gap that needed a patch also reported upstream (`herdr-app feedback` draft for the operator), and where is each patch's akrogon-facing contract tested (herdr-setup tests, akrogon e2e, both)?

### Carries

- Signposts: forks/signposts.md `## Taken` (3 verbatim; 2a e2e proof before deleting old, no fallbacks) and its 2026-11-06 directions (closest to today, no new features, fewest parts).
- All taken forks' `## Taken` (binding), especially start-and-pane Q3, notices, herdr-skill.
- Map: slots/map-merged.md fork "patch-mechanism".

## Findings

- Merged notes: slots/fork-patch-mechanism-merged.md (A,B,C,D,E with rebuttal corrections).
- Corrected: herdr-app and herdr-core source is public (Apache-2.0, `gh repo view`), but a source build never auto-updates. Old herdr's patch machinery (`omarchy-customizations/herdr/`, units `herdr-patches.path/.service/.timer`, `herdr-claude-rules.*`) is old-herdr-only and goes at cutover.
- Agreed: a patch is herdr-setup files on public surfaces (mods and clones, layouts, keys, settings, named `bin/` helpers on `hc`, `hc connect`, `herdr-app do`, the linked skill); no PATH wrappers, no binary edits; no version pin; retire a patch by switching the caller to the native feature in one change once it passes the same behavior test; one `herdr-app feedback` draft per real gap, recorded as drafted, sent or declined; tests on both sides (herdr-setup its half, akrogon e2e the contract against real hc and herdr-app, notices observing the toast posted); herdr-setup leaves land and `./install` runs before dependent akrogon e2e.
- Q1: source patches never, a future unreachable gap is a new operator decision (A,C,D,E) vs allowed as a reproducible patch when a required gap needs it (B).
- Q2: existing checks only, a break found at the next test run or call (A,E) vs one check the operator runs after each hc or herdr-app update: herdr-setup checks, a named-session probe, versions printed beside the last verified pair, clone diff (B,C,D).

## Taken
Operator 2026-11-07, door t15, verbatim: "1a | 2b |"

Read as:
- A herdr-setup patch is herdr-setup files on public surfaces only: mods (clones carry `cloned_from`), layouts, `keys.json`, `settings.json`, named `bin/` helpers that call `hc`, `hc connect` (`doc.get`/`doc.set`) or `herdr-app do`, and the linked skill. No PATH wrappers shadowing `hc` or `herdr-app`, no binary edits, no version pin.
- Q1 1a: no source patches to herdr-core or herdr-app, even though their source is public. A gap that only their code can fix gets a `herdr-app feedback` draft and comes back to the operator as a new decision.
- Q2 2b: herdr-setup gets one check command the operator runs after an hc or herdr-app update. It runs herdr-setup's checks and behavior tests (observing the new build actually loaded, not assuming a layout switch did it), probes a named session (`herdrapp session list`, `hc ls` inside it, since `HC_SESSION` is undocumented), diffs clones against the shipped copies, and prints the installed hc and herdr-app versions beside the last pair that passed. No automatic trigger and no timer: herdr-app has no post-update hook.
- Agreed, not asked: when upstream ships the missing feature, the patch is deleted and the caller moves to the native surface in one change, after it passes the same behavior test, no fallback. Each real gap gets one feedback draft for the operator, recorded with the patch as drafted, sent or declined. Tests on both sides: herdr-setup tests its half; akrogon's e2e in a throwaway session tests the contract against real hc and herdr-app (notices observe the toast posted before deletion and pending kept on a posting failure) and fails clearly when herdr-setup is not installed. herdr-setup leaves land and `./install` runs before dependent akrogon e2e proofs.

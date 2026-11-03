# Map A

## Material forks

M1 Destination and route. The bundle lives in /home/ivan/Work/omarchy-customizations/herdr-app (git, GitHub ivanjuras/omarchy-customizations). `akrogon pull` there: "No initialized registered checkout" (2026-11-03). Lifecycle leaves need a registered destination, and akrogon's engine still dispatches into old herdr (akrogon issues/chart/herdr-app/INTAKE.md, "Found 2026-11-01"), which the operator no longer uses.
- a (rec) Operator registers omarchy-customizations with akrogon (outside this door), checks = `herdr-app check <mod>` per changed mod plus a JSON parse of layouts. Leaves wait for dispatch until akrogon runs in herdr-app or run in old herdr meanwhile. Invites: akrogon writes issues/ into a dotfiles repo.
- b Chart here, hold handoff until akrogon's herdr-app port lands. Nothing runs before then.
- c Direct route (door implements, B reviews). Excluded: more than one outcome; also needs a registered repo for verify and guards.

M2 Where edits live and how they reach sessions. Personal mods are copied by install.sh:308-314 into ~/.config/herdr-app and linked into each session home on launch (README "Sessions"). Shipped mods are replaced on start (AGENTS.md "Layouts"), so files/changes/spaces/tabs must be cloned into the bundle under new names and flat.json pointed at them. Cost: Herdr's upstream fixes to files/changes stop reaching the clones (cloned_from records the version). Pitfall: edit-in-~/.config vs edit-in-repo drift; removed by a done-criterion that the bundle is the only edited copy and install.sh copies every new mod.

M3 Tasks board (A4) data. No `akrogon status --json` (src/status.ts reads issues/log.jsonl and verify-runs.jsonl as text). Options:
- a (rec) Add `akrogon status --json` in akrogon (second destination: its own chart/leaf) and have the mod `exec` it, re-run on watchFolder of each registered repo's issues/ folder. One parser, the CLI stays the authority.
- b Mod parses issues/open/*/state.yaml and log.jsonl itself. Duplicates akrogon's state model in JS; breaks silently when akrogon's records change.
Slow flag: akrogon already prints "Slow merge ... last 6m vs normal 4m"; reuse that judgment, do not recompute.
Jump-to-leaf: leaf state stores old herdr pane ids today. In herdr-app the port plans per-leaf labels herdr.space/herdr.tab. Click-to-jump depends on that port; v1 shows the leaf without a jump, or the port adds a label like akrogon.leaf=<repo>/<slug> that the mod matches in terminals().

M4 Needs-you (A5) scope and reply path.
- Which agents count: `blocked` (permission prompts) and `done` (finished while not looked at). A chart door ending a turn with a question is `done`/`idle`, not `blocked`. Rec: blocked + done, ordered blocked first, then oldest.
- Question text: `hc read <addr> --lines N` (screen only while working; full history once stopped). Show last non-empty block, markdown stripped.
- Reply: `hc send` from another terminal arrives wrapped `<hc from=...>` (herdr-app INTAKE "Things hc got wrong"). From a mod's exec there may be no sending terminal. Required probe: send from a mod exec to claude, codex, pi, agy and observe wrapping and submission. Alternative: focus the agent and type through herdr-app (`send:` key action exists only for keys).

M5 Decision buttons (A6). Detect only an explicit reply key ("Reply `1a 2b`") or numbered options `1a`/`D1`/`O1` in the agent's last turn. Group chips by question number, one pick per question, plus free text; send "1a 2b" the same way as M4. Rec: merge A6 into A5's reply area plus a strip under the terminal, sharing one send path. Pitfall: wrapped/rendered screen text loses markdown; parse from `hc read` history after the turn stops, not the live screen.

M6 Changes (A1). Scopes: Working tree (today), Branch vs base (`git diff $(git merge-base HEAD origin/<default>)`), Recent commits (`git log -n 20` + per-commit diff). Commit button: rec remove (agents commit; `git add -A` sweeps issues/*.jsonl). Alternative: stage selected only.

M7 Files (A2). TextView.markdown for .md; filename filter over `git ls-files` (respects .gitignore, fast); "Recently changed" from git status + mtime. Remote spaces: exec on the machine.

M8 Picker and open-as-pane (A3). `git worktree list --porcelain` for the space's repo; includes ~/.akrogon/worktrees and ~/.herdr/worktrees. Open-as-pane: `pane.split {direction:"right", mod, props:{file|folder}}`.

M9 Spaces (A8). Shipped spaces already scrolls (mods/spaces/main.js:375 overflow_y_scrollbar). The problem is flat.json giving spaces and agents weight 1 each with min 90. Rec: spaces block px height (or max) with scroll, agents weight. Needs-you sits between them.

M10 Look. Use theme() names only, never hex (flat has no look of its own; settings theme "omarchy"). Logos: Program.icon with tint/tile, as agents-by-tab already draws (agents-by-tab/main.js:68); status via theme working/blocked/done/idle and svg spin, no timers. Beautiful = same row height, radius and type scale as agents-by-tab and spaces.

## Practitioner questions
- How does it look with 0, 1, 30 items, narrow (sidebar 44px rail) and wide?
- What happens on a remote machine's space?
- Refresh cost: watchFolder per repo, no polling loops redrawing the window.

## Pitfalls
- Three session homes: a change made only in one home. Removed by M2 criterion.
- Panel default "shown" fights tabs mod per-space memory (tabs/main.js:20-45); Tasks must join shared "workspace.panels" and the panel-body stack.
- Codex/agy start popups swallow typed text (herdr-app INTAKE). Probe covers agy.

## Split
L1 Changes clone (A1 + its A3 part). L2 Files clone (A2 + its A3 part). L3 Tasks board (A4) blocked-by akrogon status --json (other destination). L4 Needs-you + decision buttons (A5+A6). L5 Sidebar sizing (A8). Shared flat.json edits are file overlap, not dependency.

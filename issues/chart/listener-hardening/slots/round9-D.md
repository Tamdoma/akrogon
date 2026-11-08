# Round 9, slot D: review of 652d412 (link-hints)

Paths are relative to the named herdr-setup worktree. B's F1 to F3 and C's D1 are fixed. I checked the rest for anything they missed.

## Findings

- F1 (low) The machine is taken from the wrong space when a layout terminal block has focus, so the remote rule breaks in that state. `mods/link-hints/main.js:29` always sets `this.machine` from `spaces().find((s) => s.id === f.space).machine`. But `focused().space` is the current window context, and with a layout terminal block focused `pane` is null while `terminal` and `cwd` describe the block, not its source pane (herdr.d.ts:219-227, AGENTS.md:947-951). So a remote terminal in a focused block gets the shown space's machine: if that space is local, `machine` is null and `existing()` (`main.js:47`) checks the remote pane's paths on this computer and can open a local file with the same path. The other way around, a local block under a remote shown space lists URLs only. No machine is configured today (`hc machine ls` is empty), so this needs a connected machine plus block focus to trigger. Two sibling mods in this repo already handle this state by reading the machine from the terminal address when `pane` is null: `mods/files-view/main.js:17` and `mods/changes-view/main.js:13` use `f.pane === null ? (f.terminal?.includes("/") ? f.terminal.split("/")[0] : null) : space?.machine ?? null`. Use that shape here. It also removes the crash on the same line when `spaces().find(...)` misses and `.machine` runs on undefined, which happens before the try/catch in `init`. Not reproduced live: read-only review, no remote machine, overlay not opened.

## Checked, no defect

- B F1 and C D1: a whole URL ending a near-full row stays in the list beside the joined guess; a short row is not joined. B F2: paths and URLs split over 2 to 5 rows come out whole at every cut point in both terminal wrap (fixed width, no indent) and program wrap (indented continuation), cols 20 to 120. B F3: `labels()` gives distinct labels at 0, 26, 27, 676, 677, 17576 and 17577. Empty labels only appear past 26^4 links, which a single screen cannot hold.
- The join filter (`links.js:27-31`): a match is only added from the join where it reaches into that join's last row, so longer joins do not re-add shorter ones or swallow following prose past its first space.
- Live screens (`hc read --json --lines 0`, 18 terminals) run through `candidates` plus the existence check: kept lists were only real paths on screen, same result as B and C found.
- Candidates cost on hostile screens (120 rows of dots, slashes, fake URLs): worst case 120 ms, no hang.
- `hc read <t> --json` with `--json` last works and defaults to the screen only (`--lines` default 0). `hc get` returns `cols`. Focus, Esc and close calls match `confirm` and `menu`. `mod.json` dialog with fraction height matches `picker`. `keys.json:60` and README agree with the code. Nothing else in the repo still claims Ctrl+Shift+L switches layouts.
- `bun test`: 157 pass, 1 skip, 0 fail. `herdr-app check mods/link-hints`: passes. Worktree left clean.

Verdict: changes needed (F1 only)

## Re-check of 3cef1ac

Re-check: ready. F1 is fixed at `mods/link-hints/main.js:30`: a layout block (`f.pane === null`) now reads the machine from the terminal address prefix, the files-view shape, and the `spaces().find(...)` lookup no longer runs when `focused()` or the terminal is null. I ran the expression against all six cases (no focus, mod pane, local pane, remote pane, remote block under a local space, local block under a remote space): each gives the right machine. The diff from 652d412 touches only this line. `herdr-app check mods/link-hints` passes and `bun test tests/link-hints.test.js` is 12 pass, 0 fail.

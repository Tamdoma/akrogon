# Tasks panel: seat A notes

Evidence: better-than-training, /home/ivan/Work/infra/akrogon/src/status.ts read 2026-11-03 (`note()`, `cells()`, `statusCommand()`), `akrogon status` run 2026-11-03.

## 1. Row and grouping

Pick: two parts, top to bottom. (a) An "Attention" block, only when non-empty: failed leaves, Missing keys, deploy failed, slow merge, prompt errors, unreadable repos. These are status.ts's header lines today. (b) Repos, each a header with its name and a paused mark, then its leaves grouped by epic/issue as `akrogon status` already groups them (status.ts `rows()`). A leaf row: slug, phase, time, the seat logos working on it (A/B harness from the seat config, drawn with Program icons), blocked-by, merge-queue place ("holder", 2, 3), and small tags for stopped, land, broadcast pending, fix rounds, verdict. Repos with no open leaves fold into one dim line. Cost: a dense row; tags wrap in 368 px.
Rejected: grouping by phase across repos. The operator thinks per repo ("did it merge? provjera-datoteka?"), and the queue is per repo.
Pitfall: a panel that shows less than the text command. Removed by a done-criterion: every line kind `akrogon status` prints has a place in the panel, checked against a fixture repo set.

## 2. "Taking too long"

Pick: no new rule now. The panel colors only what akrogon already judges: failed, slow merge (verify.ts decideSlow), prompt delivery errors, stopped. Time is shown on every row. A per-phase baseline, if wanted, is akrogon's to compute and emit in `--json` later; the panel never computes it. Cost: a stuck plan phase isn't red until akrogon learns a rule.
Rejected: panel-side medians (duplicates akrogon logic in the mod); operator-set thresholds (one more config to keep current).
Note: status's TIME is time since the first delivered prompt (status.ts `starts()`), not time in the current phase. If time-in-phase is wanted, `--json` must carry the phase-entry timestamp (last log record with `to === phase`, as `cells()` already finds).

## 3. Click

Pick: a click expands the row in place with what `akrogon status <slug>` prints today: history (last 10 transitions), Missing lines, kept paths, seats for the next start, plan path. Two buttons: "Show changes" (points Files and Changes at the leaf's worktree, A3) works today. "Open agent" appears only when a live terminal carries the leaf's labels, which arrives with akrogon's herdr-app port. Cost: no jump until the port.
Rejected: matching by folder now (A and B share a worktree, so a folder can't tell seats apart; B's rebuttal).

## 4. Default panel

Pick: nothing opens by itself. The right panel stays closed as today and remembers its choice per space (tabs mod). The Tasks button sits beside the others. Reason: the operator wants existing interfaces unchanged. Cost: one click to see Tasks the first time in a space.
Note: adding the Tasks and Needs-you buttons means cloning the shipped `tabs` mod (it hardcodes Files and Changes, tabs/main.js:97-98) or reaching them only by key. The button row looks the same with two more buttons.

## 5. Repos and `--json`

Pick: all registered repos, the current space's repo first. Note: `akrogon status` run inside a registered repo shows only that repo (statusCommand `current` filter); `--json` needs an all-repos mode for the panel.
`--json` fields: generated time; deploy failure; per repo: name, root, paused, unreadable paths with errors, slow merge (first, ms, normal_ms), merge queue (slug, place, no-merge-record), full-run admission line, unpacked lines; per leaf: slug, path, group path (epic/issue), phase, phase-entry time, first-prompt time, blocked-by, stopped, busy_since per seat, seat harnesses (a, b), attempts, fix_rounds, verdict, done, delivery errors, failure, land, broadcast pending, missing gaps, worktree. Leaf detail (`--json <slug>`) adds history, kept paths, seats with sources, plan path.
Probe: none outside akrogon; a fixture test in akrogon pins the JSON shape.

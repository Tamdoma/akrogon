# Direct report: right-panel (herdr-setup)

Base `b1d904d`; head: see `## Direct attempt` in CHART.md. Branch `right-panel`, worktree `/home/ivan/.akrogon/worktrees/herdr-setup/right-panel`. Plan: `direct/plan.md` (decisions D1-D18, implementation notes). Worker briefs: `direct/brief-2.md` (panel-bar), `brief-3.md` (files-view), `brief-4.md` (changes-view), `brief-5.md` (needs-you), `brief-6.md` (visual pass, icons, live checks), `brief-8.md` (Agents list nesting). Shots: `direct/live/`.

## Changed files

- `layouts/flat.json`: `tabs` block mod `panel-bar`; `panel` without `max`; `panel-body` children tasks, needs-you, files (files-view), changes (changes-view); `spaces` 180 px, `agents` weight 1 (PT, SS).
- `mods/prefix/main.js`: `t`, `y` toggle and `f` open through `panel.request` (PT 3).
- `install`, `bin/herdrapp`: `herdrapp session seed` adds the four views to every home's `workspace.panels`; new sessions seeded at creation (PT 8).
- `mods/panel-bar/` (tabs clone): routine (`routine.js`), gated buttons, ⤢/⤡, focus return, window-start and focus-jump shrink, per-space memory seeded from the shipped tabs store, Needs-you count, Tasks red dot, narrow mode, tab logo from the tab's own agent (`tabOwner`, operator request), closing a panel whose view lost its mod.
- `mods/files-view/`, `mods/changes-view/`: clones per FP/CP (filter, Recent, markdown + Raw, Working/Branch/Commits, no Commit, worktree pin with machine, gone message), one header control shape.
- `mods/needs-you/`: rows, round parser, drafts, guarded sends.
- `mods/agents-by-tab/`: `tree.js` `topLevel`: sub-agents nest under their live parent even when the parent reports no status (operator request: "slot b and c and d are not even indented ... Fix it", "in general").
- Docs: `mods/AREA.md`, `README.md` keys.
- Tests: `tests/{panel-bar,files-view,changes-view,needs-you,agents-by-tab}.test.js`, fixtures `tests/fixtures/needs-you/` (recorded 2026-11-03, see its README).

## Proof

- Tests first: `02c7a2e` red (`check-tests-red-before-code-1793734607073-152598.log`, modules missing). Later cases: `tabOwner` (deliberate break turned it red, then restored), `topLevel` (its "no agent dropped" case was red on the worker's version and found a real drop of agents outside `spaces()`, fixed in `63fdb96`).
- Full run at the PT4 repair head `c0660fd`: `bun test` and `herdr-app check` for every mod: `check a-tests-after-u6: 0 .../direct/check-a-tests-after-u6-1793736981068-273539.log`. Worker logs: `check-u2-*`, `check-u3-*`, `check-u4-*`, `check-u5-*`, `check-u6-*`, `check-u8-*`.
- Seeding against temporary homes: `check l3-seed: 0 .../direct/check-l3-seed-1793734831365-157673.log`.
- Live (headless output, session `right-panel-1`; method in plan implementation notes), from `brief-6` return: PT 1, 3 (requests), 5, 6, 7, 10, 11; SS 1, 2; FP 1, 5, 6; CP 1, 5; NY 1, 4, 7, each with its `u6-*.png`. Agents list: `u8-before.png`, `u8-after.png`. PT4 repair: closed panel with an absent mod's block active → `herdr-app status` errors `[]`.
- Grant G1 (needs-you-panel): 4 launches in `right-panel-1`: t3 claude haiku (replied `--force`), t4 agy as sub-agent of t3 (trust prompt, `hc keys enter`), t5 pi (exited at once: "Unknown option: -i", no model turn), t6 codex (replied `elid`); all killed or removed. Absence read-back: t3, t4, t6 `finished`, t5 gone, none live: `check g1-absence: 0 .../direct/check-g1-absence-1793738042657-622887.log`.

## Corrections and findings

- `run-check --holder <chart>/direct` refuses from the herdr-setup worktree (EACCES, holder in another repo); runs start from the akrogon checkout with `sh -c "cd <worktree> && ..."`.
- D18: herdr-app refuses `svg()` paths through a linked mod folder and modules through linked files; mods ship no svgs (shipped icons + Nerd Font glyphs via `settings().font_family`; there is no `settings().font`).
- `herdr-app check` loads a mod against the default home: the panel-bar one-time seed wrote `workspace.panels` into the operator's main `shared.json` (same list `install` writes).
- `terminals()` returns `status_ms: null`; Needs-you waiting time reads `hc get --json`.
- A forced send of "1" to Claude Code's AskUserQuestion arrives as free text ("The answer came back as '1'"); the readiness claim "force answers Claude correctly" holds only for typed answers.
- The grant's `pi -i <question>` form is wrong for Pi 1.5.0.

## Repair round 1 (review B round 1)

- Full run at head `80f89e2`: `check r1-tests-and-checks: 0 .../direct/check-r1-tests-and-checks-1793740698430-729697.log` (56 tests, every mod check).
- F1, F2: `09fe795`. Files lists the whole repo from a subfolder (`git ls-files ... -- :/`, paths relative to the cwd, `../` outside it) and Recent maps repo-root paths the same way (`fromTop`); clicking Recent clears the filter and typing leaves Recent (`pickRecent`, `typed`). Tests: `tests/files-view.test.js` (subfolder listing, Recent from a subfolder, list modes), red before the helpers existed.
- F3: requirement mismatch recorded under limitations (PT 4), `check pt4-saved-open`.
- F4: every listed outcome observed live in session `right-panel-1`, window launched on the headless output; clicks through a short-lived uinput pointer at Hyprland-moved coordinates, the pointer returned to the operator after each click, keys through Hyprland `send_shortcut` addressed to the test window (operator 2026-11-03: "you do all those tests. i did them, but repeat them"). Shots `direct/live/f4-*.png`:
  - PT 1 `f4-01-*`: Files click opens full (`main` hidden, panel weight 1), a second click closes, typed text lands in the shell.
  - PT 3 `f4-02*`, `f4-03*`: `ctrl-b f` opens Files, `ctrl-b t` switches to Tasks at full size, again closes; `ctrl-b y` from a Needs-you reply box closes and typed text lands in the shell.
  - PT 2 `f4-16*`: ⤢ makes the panel full (`main` hidden, weight 1), ⤡ returns it to side size. A click right after focus left the window only refocuses it (focus follows mouse): a property of this pointer method, repeated once.
  - PT 9 `f4-04a`, `f4-04b`: window at 700 px shows icon-only buttons; hovering shows the name ("Changes").
  - PT 5: bar memory cleared, shipped tabs store set to {check: changes}; after relaunch, leaving and returning to `check` shows Changes, the bar's store now holds the imported map, `status` errors `[]` (`f4-15-pt5-seed.png`).
  - FP 3 `f4-06`: from `src/sub`, filter `readme` lists `README.md ../..`. FP 4 `f4-07`: Recent after a filter empties the filter and lists repo-wide recent files. FP 2 `f4-08a..c`: formatted, Raw, formatted. FP 7 `f4-09`: an appended line appears without a click. FP 5, 6 `f4-05*`: picker from a gone pin, pick, ×.
  - CP 4 `f4-10a`, CP 2 `f4-10b` (Branch "vs main", 2 files and diff), CP 3 `f4-11*` (merge commit shows `docs/c.txt` against its first parent, root commit shows its 3 files).
  - NY 3 `f4-12*`, `f4-13a`: option clicks draft `1b | 2a`, edited to `1b | 2b`, Send delivers it (fake agent prints `RECEIVED: "1b | 2b"`); elid delivers `elid`. NY 6 `f4-14*`: a half-written draft survives switching views; Load the rest adds question 1. Fake agents (`direct/live/fake-agent.sh`) report `done` by OSC 7501 and replay the recorded round shape; no model launch.
  - NY 5 is a race between render and click (`stale()`), not reachable by a human or this pointer: covered by `tests/needs-you.test.js` "stale". NY 4's forced send to Claude Code was observed under G1 (t3).
- Found in the live run and fixed, `80f89e2`: the worktree picker listed from the pinned folder, so a gone pin made it fail ("cannot run git: No such file or directory") and blocked "another pick" (FP 6, CP 5); it now lists from the folder the space follows. The × was a bare glyph whose clicks fell through to the label; it is an 18 px target now.
- Incident: before keys moved to `send_shortcut`, one `wtype readme` reached the operator's focused Chrome window (focus follows mouse after the pointer returned); reported to the operator.
- Operator look pass (D19 in plan), `ad7bb29`, `d20b6e9`: Needs you, Files, Changes restyled; Needs-you sizes follow `settings().font_size`.

## Repair round 2 (review B round 2)

- F5: `20cd68b`. The picker lists from a live pin (another repo when Tasks pinned one) and from the followed folder only when the pin is gone; Files saves the pick with the list's machine (`pickFrom`, tests in `tests/files-view.test.js` and `tests/changes-view.test.js`). Live: a framework worktree pinned into space `check` the way Tasks pins lists `framework main` and `fixture-weave-recorder` (`f4-17-picker-pinned-other-repo.png`), × unpins.
- F3: operator Q5 O1 accepts the upstream exception (plan D20); feedback drafted to herdr-app.
- Full run at head `20cd68b`: `check r2-tests-and-checks: 0 .../direct/check-r2-tests-and-checks-1793741094540-747319.log` (62 tests, every mod check).

## Known limitations and unverified criteria

- PT 4 requirement mismatch (review B round 1 F3). A view whose mod was never present has no button, its key does nothing and `status` shows no error (L2, `u6-pt4-gated.png`). The one case that still errors: a view left open when its mod is removed before the next start. herdr-app draws the saved stack child before any mod runs, so `mod tasks: no mod folder ...` is recorded; the bar then closes the panel; selecting another view does not clear the error, the next reload does. `check pt4-saved-open: 0 .../direct/check-pt4-saved-open-1793738000637-617869.log` (steps 2-4). No herdr-setup fix exists: no mod code runs before the first draw, and at quit `View.close` may only run `exec` and `terminal.kill` (AGENTS.md, Cleanup), so the bar cannot close the panel on the way out. The fix belongs in herdr-app (clear a missing-mod error once its block is no longer shown); drafted with `herdr-app feedback`.

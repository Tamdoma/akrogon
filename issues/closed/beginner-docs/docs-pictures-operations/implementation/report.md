# Implementation report: docs-pictures-operations

Base: 7efe3d672e15773ff5f59396b5c8a0bf7c8a9cd8 (origin/main unchanged after fetch, so no refresh moved the branch). Committed head: 48ca1da9d3b6570e1df8b79eef09f6494b54d444.

Mode: delegated, one wave of three workers (plan U1-U3). The briefs are `implementation/brief-1.md`, `brief-2.md` and `brief-3.md`. Worker commits were cherry-picked in order: f6bbd6d2 → 1031b49f, ecd3bff5 → 7494f0df, fdc9a330 → 82dac286. All three worker worktrees were removed.

## Changed files and reasons

- `docs/pictures/change-flow.svg` (U1): moving, one marker pass ending on merged. Includes the D6 edge repair → land ("B fixed it all").
- `docs/pictures/working-day.svg` (U1, plus A's fix in 48ca1da9): moving loop. A added the "intake:" prefix to the first box so the spec's intake node is named.
- `docs/pictures/dispatch-order.svg`, `control-states.svg`, `failure-recovery.svg`, `watch-loop.svg` (U2): still pictures.
- `docs/pictures/releases.svg`, `lessons-flow.svg`, `verification.svg`, `records-vs-code.svg` (U3, plus A's fix in 48ca1da9): still pictures. A added "green" and "red" words to the two verify outcome arrows so they do not rely on color alone.

No docs page, test or source file changed (plan D1, D7, D9).

## Criterion proof

### C1. The files exist and draw the spec content

- Command: `akrogon run-check --name svg-wellformed -- sh -c 'test $(ls docs/pictures/*.svg | wc -l) -eq 10 && xmllint --noout docs/pictures/*.svg'`
- Red on base 7efe3d67 (at plan.synthesis): `check svg-wellformed: 1 .../implementation/check-svg-wellformed-1792764742883-2852854.log`.
- Green on 48ca1da9: `check svg-wellformed: 0 .../implementation/check-svg-wellformed-1792765198704-2917111.log`.
- Content: A viewed every picture under reduced motion and checked it against the plan's content list. The node and edge review against the sources belongs to B.

### C2. Picture check

Setup: the loopback server `python3 -m http.server 8765 --bind 127.0.0.1` served `$S/serve`, which holds a symlink to `docs/pictures` and the pages `embed-light.html` and `embed-dark.html` (body background `#ffffff` or `#0d1117`, 16px margin, `<img style="max-width:100%">`). The blepsis tab was D855F45F with the viewport set to 600x1500. `S=/var/tmp/akr-1000/5d20/51e60392/claude-1000/-home-ivan--akrogon-worktrees-akrogon-docs-pictures-operations/54f2e040-a4f2-47e9-810f-fab24c2243be/scratchpad/picture-check`.

- Reduced motion, all ten pictures (`emulate_media reduced-motion`, navigate, screenshot, sleep 4, screenshot). Every run-check exited 0. For each picture the 0s and 4s screenshots are byte-identical (same md5), and each shows the complete picture. On the moving files the marker sits on "merged". Final heads' logs:
  - `rm-change-flow`: `check-rm-change-flow-1792765093194-2901838.log`
  - `rm-working-day`: `check-rm-working-day-1792765202958-2917228.log` (rerun after 48ca1da9)
  - `rm-dispatch-order`: `check-rm-dispatch-order-1792765101727-2903374.log`
  - `rm-control-states`: `check-rm-control-states-1792765105995-2904097.log`
  - `rm-failure-recovery`: `check-rm-failure-recovery-1792765110243-2904781.log`
  - `rm-watch-loop`: `check-rm-watch-loop-1792765114477-2905229.log`
  - `rm-releases`: `check-rm-releases-1792765118746-2905810.log`
  - `rm-lessons-flow`: `check-rm-lessons-flow-1792765122992-2906460.log`
  - `rm-verification`: `check-rm-verification-1792765207192-2917721.log` (rerun after 48ca1da9)
  - `rm-records-vs-code`: `check-rm-records-vs-code-1792765131458-2907634.log`
  - Screenshots: `$S/shots/<name>-reduced-0s.png` and `$S/shots/<name>-reduced-4s.png`.
- Motion, the two moving files (`emulate_media none`, screenshots at 1s and 3s). The 1s and 3s screenshots differ, and the marker is in a different place in each:
  - change-flow: `check-motion-change-flow-1792765134758-2908107.log`, screenshots `$S/shots/change-flow-motion-1s.png` and `-3s.png`.
  - working-day: `check-motion-working-day-1792765210493-2918326.log`, screenshots `$S/shots/working-day-motion-1s.png` and `-3s.png`.
- Widths and backgrounds (`blepsis render_html http://127.0.0.1:8765/embed-<bg>.html --width <w> --full-page`):
  - `embed-light-800`: `check-embed-light-800-1792765211427-2918786.log`
  - `embed-light-360`: `check-embed-light-360-1792765212317-2919216.log`
  - `embed-dark-800`: `check-embed-dark-800-1792765213242-2919630.log`
  - `embed-dark-360`: `check-embed-dark-360-1792765214186-2920031.log`
  - Screenshots: `$S/shots/embed-{light,dark}-{800,360}.png`. A read the native-size crops (`$S/shots/crop-*.png`). Every label reads on both backgrounds. At 360px the text renders at about 10-11px: small but legible.
- Cleanup: the per-tab daemon was stopped (`blepsis stop D855F45F`) and the server was stopped by its own PID. The shared blepsis browser was not quit because other leaves have tabs open in it.

All logs are under `/home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/`.

## Checks

`akrogon verify` on 48ca1da9 gave `verify leaf 48ca1da9d3b6570e1df8b79eef09f6494b54d444: green`, with 1115 pass and 0 fail. Logs: test `check-test-1792765413272-2921828.log`, typecheck `check-typecheck-1792765415728-2921828.log`. Wall time was 3m09s.

## Worker returns

- U1: xmllint check 0 (`check-u-xml-1792764984842-2882636.log`). The worker placed the text by estimate, and A's picture check confirmed it fits.
- U2: xmllint check 0 (`check-u-xml-1792764933457-2875275.log`). In control-states the started/stopped sides are a free choice.
- U3: xmllint check 0 (`check-u-xml-1792764944220-2877163.log`). The worker also rendered the files with rsvg-convert.

## Known limitations

- The picture check proves the SVGs in Chromium opened directly and through `<img>`. It does not prove that GitHub passes the reduced-motion setting into an embedded image (design svg-set Q4 limit).
- `render_html` screenshots capture moving pictures at load, so the marker shows at its start position. The still content is complete in them.
- The D6 corrections (plan N2) follow the source over the map wording, and B should confirm them.

## Unverified criteria

C1's check of nodes and edges against the sources is B's review by design. Nothing else is unverified.

## Repair proof: a5d6c942 (slot B)

F1 from both initial reviews is fixed in a5d6c942b15eeef04c6e76c7e6b8a391ad9b291b. The failure-recovery node now separates code on the leaf branch from plans/reviews in issues/. The source review, before/after evidence and cleanup details are in review-B.md, dated check.repair entry.

The unchanged planned C1 command passed. Repeated C2 for the changed picture under reduced motion, then regenerated the four full-page embeds. Both complete reduced-motion captures are identical. The corrected labels fit at 800px and 360px on light and dark backgrounds. Existing direct/motion evidence remains valid for unchanged files.

Screenshot root: /var/tmp/akr-1000/5d20/51e60392/picture-repair-ogoks0vm/shots/.

- failure-recovery-reduced-0s.png and failure-recovery-reduced-4s.png.
- embed-light-800.png, embed-light-360.png, embed-dark-800.png and embed-dark-360.png.
- Native crops: failure-recovery-{light,dark}-{800,360}.png.

Final proof receipts:

- `check svg-wellformed: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-svg-wellformed-1792765627812-3791267.log`
- `check rm-failure-recovery: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-rm-failure-recovery-1792765704848-4028901.log`
- `check embed-light-800: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-embed-light-800-1792765657880-3848329.log`
- `check embed-light-360: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-embed-light-360-1792765658806-3849725.log`
- `check embed-dark-800: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-embed-dark-800-1792765659781-3851998.log`
- `check embed-dark-360: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-embed-dark-360-1792765660840-3854026.log`
- `check repair-screenshot-pair: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-repair-screenshot-pair-1792765724748-4131742.log`

Cleanup complete: the loopback server and repair tab are closed, scratch HTML/symlink removed, screenshots retained.

### Final verification

`akrogon verify` on a5d6c942b15eeef04c6e76c7e6b8a391ad9b291b: green. Receipt 2db7fca5-4b01-4be7-ac48-7d0f186e4afb, scope leaf, setup 0. Tests: 1115 pass, 0 fail.

- `format: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-format-1792765637711-3791889.log`
- `test: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-test-1792765800332-3791889.log`
- `typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-pictures-operations/implementation/check-typecheck-1792765802663-3791889.log`

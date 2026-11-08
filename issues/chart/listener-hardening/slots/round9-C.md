# Round 9, slot C: review of f9a3c60 (link-hints)

Verdict: changes needed (D1 only; everything else checked out).

## Defects

- D1 A complete URL that ends a near-width row is replaced by a wrong joined URL. `mods/link-hints/links.js:24-26`: when `end.length >= cols - 8`, `own` swaps a URL that ends the row for the match found in `row + nextRow.trimStart()`, and the real URL is gone. Claude Code wraps prose at word boundaries, so a URL ending such a row is usually whole and the next row is new text. Reproduced with the committed code (node, cols 50, row 44 chars):
  - `"Docs are at https://docs.example.com/guide/a\nThen run the install step."` -> `["https://docs.example.com/guide/aThen"]`
  - same row followed by `"│ next box row"` -> `["https://docs.example.com/guide/a│"]` (the URL class allows box glyphs).
  On live screens this margin is common: t15 had 15 of 31 rows within 8 columns of its width, the other Claude Code terminals 3 to 6. Smallest fix: treat URLs like paths and keep both the row's own match and the joined one (`[...own, ...across]` without the swap); a URL cannot be existence-checked, so do not drop either. The test at `tests/link-hints.test.js:26-29` then expects both strings.

## Checked, no defect

- `sh` call (`main.js:48`): `for f do ...; done` is valid in bash-as-sh (`/bin/sh` -> `/usr/bin/bash`); ran it with `/etc/hosts /nope "/tmp/a b"`: prints only `/etc/hosts`, exit 0. Files go in argv, no quoting path. Argument count is bounded by screen matches.
- `hc get --json` has `cols` (t6d: `cols 38, rows 9`); `spaces()` has `id` and `machine` (`herdr.d.ts:111-122`); `focused()` gives `terminal` and `cwd` (`herdr.d.ts:227`). Focus pattern (`cx.focus_handle()`, `focus()` in init, `track_focus` + `on_key_down` in render) matches `AGENTS.md:913` and the picker.
- Open commands return at once, so the 30 s `exec` limit (`herdr.d.ts:10`) is not hit: `xdg-open` takes `BROWSER=omarchy-launch-browser` from the app's environment (pid 1458767) and that script hands the URL off through `omarchy-cmd-browser-handoff` or `systemd-run --user` (`/usr/bin/omarchy-launch-browser:41-45`); `code` runs `cli.js`, which spawns the window detached (`/usr/share/code/resources/app/out/cli.js`, `detached:` + `unref()`).
- Live scan of 10 terminals with the committed `candidates` + existence check (t1, t3, t4, t6, t15, t3f, t3g, t32, t3k, t6d): kept lists were exactly the real paths on screen (`~/Work/infra/akrogon`, `/home/ivan/Work/infra/tamdoma/framework`, ...); noise (`5.5`, `v2.1.317`, `0.00`, row-join artifacts like `mod.Nobody`, `./run.shagain`) was all dropped. No wrapped path was on any live screen to test; the unit test at `tests/link-hints.test.js:21-25` covers it.
- `keys.json:60` one line changed; README paragraph correct. `mods/AREA.md:26` still names `layout.switch` as a way to reload mods; the command still exists (`herdr-app commands`), only the key is gone, so it stays true.
- Note, not a defect: `[ -e ]` keeps directories (the prompt's cwd on every bash screen), and `code --goto <dir>` opens a folder window. Foot's script behaves the same; use `-f` if that is unwanted.

## Re-check of 652d412

Re-check: ready.

- D1 / B F1: `links.js:32` now keeps the row's own URL and adds the joined guess only when the row is near the width. Reproductions from above on the amended code: `["https://docs.example.com/guide/a","https://docs.example.com/guide/aThen"]`, `[".../guide/a",".../guide/a│"]`; a short row stays `["https://x.dev/a"]`. The real URL is never lost.
- B F2: `links.js:27-31` joins up to `MAX_ROWS` (5) rows; a path spread over 5 rows comes out whole, over 6 it does not (by design). Live proof on t15's screen just now: `/home/ivan/Work/infra/akrogon/issues/chart/listener-hardening/` + next row `slots/round9-C.md` produced and kept the full path.
- B F3: `labels()` at `links.js:38-43`: `labels(0)` is `[]`, 27 links start `aa, as`, `labels(677)[676]` is `saa`, 700 labels are all distinct. `main.js` `type()` prefix logic works unchanged with 3 letters.
- `bun test tests/link-hints.test.js`: 12 pass, 0 fail. Live scan on t15, t3, t6, t6d: kept lists are only real paths; the extra join candidates are dropped by the existence check.

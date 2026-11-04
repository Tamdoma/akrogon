# Report: tasks-mod

Serial-solo implement pass. Base `ada0dab9`; head `44482211` (A's `d1b3bdf..419e2161` + B's `bf3baedf..44482211` repair commits). `akrogon verify` on `44482211` → **green**: `check-test-1793726373871-3850278.log` (1296 pass).

## Changed files

- `herdr-app/tasks/mod.json`, `main.js` — the mod: `exec("akrogon",["status","--json"])` per scan, `watchFolder` loops per `watch.folders`, `watch.files` content poll on tick, `cx.timer.every(30000)` redraw, seat logos + letters via `knownAgents()`, `repo/slug` row identity, `tasks.expand`/`tasks.pin` commands plus row/button clicks, props `envelope`/`fill`/`expand` for shots.
- `herdr-app/tasks/model.js` + `model.d.ts` — pure view model: ordering, folding, alerts, rows, pill slots (paused grey), kept paths in detail, pin intents, watch-file diff.
- `herdr-app/tasks/schedule.js` + `schedule.d.ts` — scan event → rescan decision (never overlap; failed first scan retries on the 30 s tick).
- `src/install.ts` — `planSkillLinks` plans `{herdr-app/<mod> → ~/.config/herdr-app/mods/<mod>}` when `herdr-app/` exists under `listRoot`; stale scan generalized over skill roots + mods dir.
- `src/AREA.md`, `docs/start/install.md`, `docs/reference/releases-and-updates.md`, `.gitignore`.
- `tests/tasks-mod.test.ts`, `tests/tasks-mod-host.test.ts` (host-surface reproductions by B), `tests/fixtures/status-envelope.json`, `tests/install.test.ts`.

## Review outcome

`review-A.md` verdict **fix** (2 fixes, both repaired by B: unbounded exec retry on failed first scan — `899551bc`; `panel.request` seq reset on remount — `6805e64b`). `review-B.md` verdict **fix** twice: F2–F7 repaired by B in place (see "B's in-review repairs") with C1/C3/C4 live reproofs under `evidence/repair-b-*`; F1 (invalid live captures) handed to A — round-1 repair below, then B's re-check rejected round-1 frames (hand-built envelopes missed producer-required fields → render errors; no kept logs), so F1 was re-run under run-check with producer-complete inputs in round 2.

## F1 rounds 2–3 — method and results

Round 2 (below) re-ran the proofs with kept logs but saved its frames under /tmp, which was then cleaned — B's second re-check found the cited PNGs absent. Round 3 preserved the minimum frames directly under `implementation/evidence/` (`a3-*.png`, session `tasks-mod`, unit `tasks-mod-a3-proof`, props envelope `env-live.json` built from the recorded fixture with `watch.folders=[$T/watched]`):

- **C6a preserved pair**: `evidence/a3-prop-1.png` → `evidence/a3-prop-2.png`, Δ62 s (`check c6-pair: 0 implementation/check-c6-pair-1793728468881-24709.log`): `tasks-mod 0h 25m→0h 26m`, `tasks-panel 2h 11m→2h 12m`. inotify on `env-live.json` logged **0 opens for the entire window** (mount read preceded the watch start; see opens log in the same check output), then exactly 1 after `touch watched/hit1` — `evidence/a3-prop-3.png` is the post-trigger frame.
- **C5 frame restored**: `evidence/a3-err.png` — `deploy failed: attempted abcd1234efgh, step links`, `blepsis /x/state.yaml — zod…`, `Slow merge: framework`, healthy akrogon rows, never blank (replaced the deleted `tasks-a-err.png` reference; B's C5 acceptance stands).

Round 2 (kept below for its exec/observation logs; its frames are gone and no longer cited):

Session `tasks-mod`, unit `tasks-mod-a2-proof`, same layout/env approach. Every shot below was opened and verified against its claim before being cited — the F1 defect was citing uninspected frames.

Session `tasks-mod` recreated: `systemd-run --user --unit=tasks-mod-a2-proof --slice=akrogon.slice` with `HERDR_APP_HOME=~/.config/herdr-app-sessions/tasks-mod`, `HC_SESSION`, `XDG_RUNTIME_DIR`, `WAYLAND_DISPLAY`. `mods/tasks` → leaf `herdr-app/tasks`; probe layout = one tasks block; `shared.json` seeded `frame.welcomed` (the welcome overlay obscured round-1 frames). All temp work under `/tmp/tasks-a2.gysIlQ` (now cleaned). Nothing under `~/.config/herdr-app/` was written (operator rule).

- **C6a live times advance (round-2 observation)**: `check c6-live2` recorded `live-1`/`live-2` shots Δ62 s on the real `akrogon status` board — `tasks-mod 0h 24m→0h 25m`, `tasks-panel 2h 09m→2h 10m`, `panel-top-bar 0h 17m→0h 18m`. Frames were /tmp-scoped and are gone; the a3 pair above is the preserved evidence.
- **C6b live folder trigger**: `mkdir issues/open/tasks-a2probe/timed-probe + state.yaml` under the real watched `issues/` → `timed-probe` row rendered ~7 s later; removed again next shot. Same `check c6-live2` log.
- **C6 no-rescan, trigger, coalescing — exact counts**: `props.envelope=$T/env-live.json` = the recorded envelope with `watch.folders=[$T/watched]`; the mod's own scan path (`readTextFile(prop)` in `loadEnvelope`) opens that file once per scan, so `inotifywait -e open` counts scans exactly. `evidence/opens.log` + `check c6-inotify: 0 implementation/check-c6-inotify-1793727862497-6865.log`: 1 open at mount; still 1 after 62 s (tick redraws, zero rescans); one `touch` under `watched/` → 2 opens (triggered rescan); a 30-touch burst at 0.12 s → 25 opens total ≈ one scan per ~200 ms scan window (hits in-flight coalesce into one follow-up; opens serialize). Equivalence: identical `loadEnvelope` branch and `watch.folders` watch-loop code path; only the byte source differs (planned D11 demo prop).
- **C6c no overlap, real exec path**: ppid-filtered `/proc` sampler on session `herdr-app` pid 4186388 logged two sequential `akrogon status --json` execs for create+burst triggers — `start=…661.039 last=…661.364`, then `start=…661.417`: disjoint windows, the follow-up begins only after the first finishes. `evidence/samples2.log`, `check c6-overlap: 0 implementation/check-c6-overlap-1793727675994-4190.log`.
- **C5 error envelope (accepted by B)**: `evidence/a3-err.png` — `deploy failed: attempted abcd1234efgh, step links`, `blepsis /x/state.yaml — zod…`, `Slow merge: framework`, healthy rows render, never blank.

### Discarded method (documented)

FIFO-as-envelope: `readTextFile` returns null for non-regular files → "board unavailable"; abandoned. Exec-counting PATH wrapper: session `herdr-core` prepends `~/.local/bin` to `exec` PATH; superseded by inotify on `akrogon.ts` and the ppid sampler.

## Proofs per criterion

1. **Ordering/fold** — model tests green (verify); `evidence/repair-b-recorded-board.png` (B: recorded envelope, Himne first after `space.new`, empties folded).
2. **Row parts** — model + host tests green; B's theme shots show logos + A/B letters + busy spinner.
3. **Pills ×4 themes** — `evidence/repair-b-{sage-terra,miasma,gruvbox,flexoki-light}-{plain,hover,selected}.png` (distinct hashes; flexoki-light bg (255,252,240)); cyan/green apart, words readable; own-base pill. `check repair-b-theme-frame-check: 0`.
4. **Expand + pin/request** — `evidence/repair-b-recorded-expanded.png` (kept paths); `check repair-b-{files,changes,remount}-readback: 0` — seq increasing across remounts.
5. **Exit-1 envelope** — model test + `evidence/a3-err.png`.
6. **Times/rescan/no-overlap** — above; `check c6-pair`, `check c6-live2`, `check c6-inotify`, `check c6-overlap` all exit 0.
7. **Install/deploy links + herdr-app check** — install/deploy tests in verify; `herdr-app check herdr-app/tasks` → `check passed` on `44482211`.
8. **Verify** — `check-test-1793726373871-3850278.log` green on `44482211`.

## B's in-review repairs (commits `bf3baedf..44482211`, each test-then-fix)

- Seat letters beside logos/spinner (`2efd3d3c`); pill opaque `t.background` base (`8096b2ba`); repo kept paths in expansion (`086ee16a`); repo/slug row identity for cross-repo slug collisions (`791cd6c3`); `panel.request` seq `Date.now()` seed + max-with-shared (`6805e64b`); paused repos grey pills (`142face5`); failed first scan retries on the 30 s tick (`b008f3ce`); format pass (`44482211`). Reproduction tests in `tests/tasks-mod-host.test.ts` (Test-Change trailers on each commit).

## In-implementation fixes (A, original pass)

- `props()` null crash, `<name>:<value>` command delivery, `watch.files` directory entry EISDIR (`878ff4d`, `3bc94aa7`).

## Wall times

- `akrogon verify` ~7 min. F1 round-1 ~25 min, round-2 ~50 min (session, run-checks, timer waits). B's repair+reproof ~75 min per its record.

## Known limitations

- Ambient `~/.akrogon/runs` writes make a "zero rescans" window unprovable on the raw live exec path; the inotify-on-prop run covers the identical `loadEnvelope`/watch code path with exact counts.
- Ambient folder hits can add scans inside observation windows (explains occasional extra opens/execs in `opens.log`/`samples2.log` vs the scripted triggers); attribution is annotated per window.
- Red row variants needing the herdr-app port (seat `blocked`) stay out per design; panel-open end-to-end is the chart's pending check.
- Sessions `tasks-mod` deleted after each proof round; units `tasks-mod-a2-proof`/`tasks-mod-a3-proof` stopped. Temp dirs cleaned; the a3 frames and env-live input are preserved under `implementation/evidence/`.

# patch-mechanism: merged notes (A,B,C,D,E)

Sources: fork-patch-mechanism-A.md .. -E.md.

## Corrections (verified by A, 2026-11-07)
- Source exists: `herdrdev/herdr-app` and `herdrdev/herdr-core` are public Apache-2.0 GitHub repos, pushed 2026-11-06 (`gh repo view`; C). The fork question's "no source" (A,D,E) is wrong. A source build "never updates" (AGENTS.md; C), so source patches stay possible but lose auto-update.
- Old herdr's patch machinery is live on this machine: `omarchy-customizations/herdr/` (`ensure-patches`, `install-patches`, `patches/`) with systemd units `herdr-patches.path` (watches herdr binaries), `.service`, `.timer`, `-failed.service`, and `herdr-claude-rules.path/.service` (C). It is old-herdr-only, so it goes at cutover (signpost 2a; cutover fork).

## Q1. What counts as a patch
- Files on public surfaces only, as herdr-setup already is (all): mods (clones carrying `cloned_from`), layouts, `keys.json`, `settings.json`, named `bin/` helpers using `hc`, `hc connect` (`doc.get`/`doc.set`) or `herdr-app do`, and the linked skill. All three herdr-setup pieces the taken forks place (weights helper, notices in `session-status`, skill) fit (all). These survive updates: shipped files are moved aside, clones and personal files are never overwritten (AGENTS.md Layouts and The files; C,D,E).
- Rejected by all: PATH wrappers shadowing `hc`/`herdr-app` (the app starts and updates the core itself and calls the real binaries; argument rewriting breaks silently; caller and parent detection at risk). Binary edits (all).
- Source patches: never (A,E) vs last resort only for a gap proven unreachable from public surfaces, rebuilt from the exact release tag, accepting lost auto-update and the old rebuild machinery (B,C) vs a new operator decision if ever needed (D). No taken fork has such a gap left (B,C,E).

## Q2. Surviving updates
- No version pin and no resident watcher (all). Retirement: when upstream ships the feature, the patch is deleted and the caller moves to the native surface in one change, no fallback (all, signpost 2a), after the native path passes the same behavior test (B,D).
- Detection:
  - herdr-setup's existing checks (`herdr-app check` on mods, JSON, `bash -n`, `bun test`; `issues/config.yaml`) plus akrogon's e2e and strict schema boundary; no extra step (A,E). E adds capability assertions (`hc schema` methods, `herdr-app commands`) to herdr-setup tests and `herdr-app check` in `./install`.
  - Same, plus `./install` prints installed hc and herdr-app versions beside the versions last verified (a committed `versions` file), run by the operator after an update; the old path-unit-plus-timer pattern rejected as polling (C).
  - A herdr-setup patch list (`PATCHES.md`) with gap, surface, akrogon contract, last-checked versions and upstream feedback state, plus one check command the operator runs at the app's update restart; `./install` warns on version drift but still links (D). One explicit check entry point after each update, then akrogon e2e on the actual version pair (B).
- Pitfalls: `herdr-app check` covers only the first render, so event paths need tests (C,D); symlinked mods do not hot-reload, so checks need a fresh window or layout switch (B,C,D,E; herdr-setup LESSONS); clone drift is diffed against the shipped copy after updates (AREA.md; C,D,E). Updates never kill core terminals; a notice may wait for the window restart (C).

## Q3. Upstream and contracts
- Each gap that needed a patch gets one `herdr-app feedback` draft for the operator to review and send, recorded with the patch as drafted, sent or declined (all). B: only real upstream defects or missing generic capabilities, not local layouts or workflow. INTAKE's codex status report and `herdr-plugins/herdr-registry-durability/REPORT.md` are today's practice (C,D,E).
- Tests on both sides (all): herdr-setup tests its mod or helper (`herdr-app check`, `bun test`); akrogon's e2e in a throwaway session tests the contract it depends on against real hc and herdr-app (notice file written and gone, weights read back equal, skill linked and loaded), failing clearly when herdr-setup is not installed (C). No shared test code (C). B: record the paired versions in the shared proof.
- Order: herdr-setup leaves land and `./install` runs before dependent akrogon e2e proofs (C,E); there is no cross-repo `blocked-by` (E). Who owns post-update checks and the paired run (B).

## Corrections after rebuttals (2026-11-07)
- B: B allowed a reproducible source patch only when a required gap needs one and source exists; B did not propose the old path/timer rebuild machinery. The symlink reload lesson covers a link added after startup only; checks must observe the new build loaded, not assume a layout switch did it. "Existing checks, no extra step" (A,E) has no trigger after a native update: a break is found at the next relevant call or test run. The notice e2e must observe the toast posted before deletion, receipt folding, and pending kept on a posting failure, not only "file gone".
- C: moves source patches to "never" with D's rider (a source build never updates, so it fails signpost 3's own test; a future unreachable gap is a new operator decision). Against E's catalogue assertions (`hc schema` method list, `herdr-app commands` names): a second contract copy; the behavior tests fail on the same break with a better message. Adds to the post-update check: `HC_SESSION` is undocumented and herdrapp's sessions rest on it, so run `herdrapp session list` and `hc ls` in a named session after each core update.
- D, E: no disagreement.

# drafts-review C

Six disagreements found. All other criteria read as passable within their leaf's ownership.

## D1 — status-json watch targets omit `deploy.yaml` (status-json criterion 7)

Criterion 7 lists only `issues/`, `config.yaml`, `paused.yaml`, `stopped.yaml`, `reconcile-host.json`, `runs/`. The "deploy failed" line kind (criterion 2, and one of `red`'s inputs in criterion 6) comes from `~/.akrogon/deploy.yaml`: `src/release.ts:26`, read by `status.ts:522-526`. `tasks-mod` refreshes only on those watch targets, so a failed deploy with nothing else changing would not refresh the board or the red dot.

## D2 — designs name `agents()` for fields it does not have

- `needs-you-panel` design: "Data: `agents()` for status, `kind`, `status_ms`, parent". `AgentInfo` (`~/.config/herdr-app/herdr.d.ts` AgentInfo, Status line 79) has `status` as a bare `Status` string and no `kind`, `status_ms`, or `parent`. `parent` exists only on `terminals()` (d.ts:209-212), `kind`/`status_ms` only via `hc get <t> --json`.
- `panel-top-bar` design: the Needs-you count uses "`agents()` (status `blocked`, or `done` with no parent)" — same missing `parent`. Criterion 10 ("count when agents are `blocked` or top-level `done`") needs the data source named.

## D3 — panel-top-bar criterion 8 doesn't state that `install` writes every existing session

"Every herdrapp session's `workspace.panels`" includes sessions in `~/.config/herdr-app-sessions/<name>/shared.json` (`bin/herdrapp:9-10`, `seed_new` only writes a session at creation, :121-136). As written, an implementer could read the criterion as main `shared.json` + seed for new sessions only, which fails existing sessions. Say explicitly whether `install` iterates `sessions_dir`.

## D4 — panel-top-bar criterion 10 has an unowned cross-repo dependency

The red dot reads `red` from `akrogon status --json`, produced by akrogon leaf `status-json` in chart tasks-panel. `state.yaml` `blocked-by` covers only intra-repo leaves, so this leaf lands without its dependency merged. The design's "missing `akrogon` means no dot" does not cover `akrogon` present without `--json` (old release). An implementer must guess whether stubbing `akrogon` on PATH satisfies the check.

## D5 — `worktree.pin` never says what `machine: null` means

The shared value `{ machine: string | null, folder }` is written by `tasks-mod` and read by `files-panel`/`changes-panel`. Nothing in any design says `null` means "this machine". `tasks-mod` pins "the leaf's worktree" which lives in `~/.akrogon/worktrees/` on the local machine; an implementer could emit a real machine id that Files then interprets as remote. One sentence fixes it.

## D6 — tasks-mod blocked-by is on the wrong chart file's assumption

Not a defect — `blocked-by: [status-json]` is correctly set. Included only to note that `status-json` has `proofs: []` and `inputs`/`produces` empty in `readiness.yaml`; check whether that blocks leaf admission before `tasks-mod` can be declared ready.

## Checked and fine

- `panel.request`, `worktree.pin`, `workspace.panels`, `panel-body` block ids, and `red` interfaces are byte-identical across all five designs that name them; each has a named owner.
- `hc read --json` exists (`hc read --help`); `exec`, `hc`, `setShared`, `watchFolder`, `run` all in herdr.d.ts; `TextView.markdown` in gpui-kit.d.ts:20709; `tooltip` exists for criterion 9 hover names; `akrogon install` is real (`src/akrogon.ts:172`, `src/install.ts:111`) and session mods link from `~/.config/herdr-app/mods/` (`bin/herdrapp:98-103`).
- Fixtures exist (`slots/fixtures/needs-you/`, 4 round + 9 none screens with README matching criterion 2).
- `herdr-setup` `checks.test` (`bun test --pass-with-no-tests`) exists for the pure-module proofs; criteria never name test files, counts, or merge_checks.
- `ctrl-b f` today runs `layout.select` + `layout.show` (`mods/prefix/main.js:57`); the designs route it through `panel.request open`, which preserves the never-close behavior criterion 3 requires.
- `flat.json` `panel` has `max: 900` (line ~143) and `sidebar-lists` `spaces`/`agents` (`weight: 1`, `min: 90`) as the spaces-scroll design describes.

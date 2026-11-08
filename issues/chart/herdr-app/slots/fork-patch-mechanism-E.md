# Fork: patch-mechanism (Seat E)

## Q1. What counts as a herdr-setup patch

1. **Pick:** Only files built on public/persistent surfaces in `herdr-setup` (`/home/ivan/Work/infra/herdr-setup`): custom or `cloned_from` mods (`mods/<name>/`), custom layouts (`layouts/<name>.json`), `keys.json`, `settings.json`, standalone `bin/` helpers under their own names (`bin/herdrapp` and the consultant equal-heights weights helper from `start-and-pane` Taken Q3 3a calling `hc connect` `doc.get`/`doc.set`), and the symlinked `skills/herdr/` directory (`herdr-skill` Taken Q1-Q2). No PATH wrappers shadowing `hc` or `herdr-app`, and no source patches.
   - **Reason:** `herdr-app` rewrites only its shipped mods and layouts listed in `installed.json` (`herdr-setup/bin/herdrapp:84`, `~/.config/herdr-app/AGENTS.md:8-9,755-756`, `herdr-setup/README.md:55-57,65`), leaving non-shipped/cloned mods, custom layouts, `keys.json`, `settings.json`, `skills/herdr`, and standalone `~/.local/bin/*` scripts untouched across updates. By contrast, `hc update` (`hc --skill:230-245`) and `herdr-app` updates (`herdr-setup/install:11`) overwrite `~/.local/bin/hc`, `~/.local/bin/herdr-core`, and `~/.local/bin/herdr-app` directly, so a PATH wrapper shadowing `hc` or `herdr-app` would be wiped on the next update. All three `herdr-setup` additions needed by this epic (`mods/session-status` notices, `bin/` weights helper, `skills/herdr`) fit this surface.
   - **Cost:** Customizations stay within what `herdr-app` mods/layouts/commands and `hc` (`hc connect` `doc.get`/`doc.set` + CLI) expose.
2. **Rejected options:**
   - **PATH wrappers shadowing `hc` or `herdr-app` in `~/.local/bin`:** Rejected because `hc update` and `herdr-app` updates replace `~/.local/bin/hc` and `~/.local/bin/herdr-app` (violating signpost 3 "survive upstream updates") and a wrapper around `hc` adds a fragile shim in front of JSON/stdio streams (`hc events`, `hc connect`).
   - **Source patches like `/home/ivan/Work/infra/herdrdev/herdr-patched`:** Rejected because `herdr-core` and `herdr-app` are prebuilt binaries with no source on the machine (`forks/patch-mechanism.md:5`, `map-merged.md:9`), and no taken fork requires a binary change.
3. **Evidence:**
   - `operator`: `forks/signposts.md` (`## Taken` 3, 5a, 2026-11-06 directions); `forks/start-and-pane.md` (`## Taken` Q3 3a/3c, F1, F3); `forks/notices.md` (`## Taken` Q1 1a, Q2 2a); `forks/herdr-skill.md` (`## Taken` Q1-Q3), read 2026-11-07.
   - `practitioner`: Dotfiles/customization layering for auto-updating desktop apps (chezmoi/Stow user-space override pattern, OpenCode config layering): keep customizations in user-space extension directories (`~/.config/<app>/mods/`) and standalone helpers rather than modifying or shadowing the bundle's auto-replaced binaries, read 2026-11-07.
   - `better-than-training`: `/home/ivan/Work/infra/herdr-setup/install:10-60`, `herdr-setup/bin/herdrapp:79-117`, `herdr-setup/README.md:51-65,89-97`, `~/.config/herdr-app/AGENTS.md:8-9,716-766`, `ls -la ~/.local/bin/hc ~/.local/bin/herdr-app`, read 2026-11-07.
4. **Pitfalls:**
   - **A new `bin/` helper in `herdr-setup` is not syntax-checked by `herdr-setup`'s `shell` check:** Removed by design part (update `herdr-setup`'s `shell` check in config / `install` to cover all `bin/*` scripts).
   - **Symlinked mod folder not hot-reloading in an already-open session window (`herdr-setup/learnings/LESSONS.md:2`):** Removed by design part (`herdr-setup/install:37-39` runs `herdr-app do layout.switch --name flat` when a window is open, which reloads mods per `mods/AREA.md:25`).
5. **Unasked question:** None.

## Q2. Surviving updates: detecting breakage and retiring patches when upstream ships

1. **Pick:** Detect breakage through capability and schema checks in **both** repos: in `herdr-setup`, `herdr-app check` on every mod (`mods` check), `bun test` over mod modules and `bin/` helpers (`test` check, including checking required `herdr-app commands` and `hc schema` `doc.get`/`doc.set` shapes), and `./install` running `herdr-app check` after linking; in `akrogon`, the pinned `hc schema` boundary test (`identity` Taken Q1 1a) and throwaway-session e2e tests (`signposts.md` Taken 2a). When upstream ships a missing feature natively, switch the caller to the native feature and delete the `herdr-setup` patch in one cutover commit (no dual fallback per `signposts.md` Taken 2a).
   - **Reason:** Checking actual capabilities (`herdr-app check mods/<name>`, `hc schema`, `herdr-app commands`, `gpui-kit.d.ts` / `herdr.d.ts`) catches breaking upstream changes immediately on update or test run without blocking compatible minor/patch releases of `hc` or `herdr-app`. Retiring replaced patches immediately prevents dead code and drift.
   - **Cost:** Adding schema/command assertions for the weights helper and `session-status` notice watcher to `herdr-setup/tests/`, and running `herdr-app check` in `./install`.
2. **Rejected options:**
   - **Hard binary version check in `./install` refusing newer `hc`/`herdr-app` versions:** Rejected because `hc` and `herdr-app` update independently and most updates preserve public mod/CLI contracts; capability checks (`herdr-app check`, `hc schema`) test what actually matters.
   - **Nothing until runtime failure:** Rejected by `signposts.md:74` ("nothing should break... a regression is a failed migration") and `identity` Taken Q1 1a.
   - **Keep the `herdr-setup` patch as a fallback after upstream ships the feature:** Foreclosed by `signposts.md` Taken 2a ("no fallbacks").
3. **Evidence:**
   - `operator`: `forks/signposts.md` (`## Taken` 2a, 3, 2026-11-06 directions); `forks/identity.md` (`## Taken` Q1 1a), read 2026-11-07.
   - `better-than-training`: `cd /home/ivan/Work/infra/herdr-setup && akrogon config` (`checks.mods`, `checks.json`, `checks.shell`, `checks.test`); `herdr-setup/mods/AREA.md:5,26`; `~/.config/herdr-app/AGENTS.md:45-47,758-765`, read 2026-11-07.
4. **Pitfalls:**
   - **Upstream `herdr-app` updates a shipped mod (`workspace-status` or `agents`) that a `cloned_from` mod in `herdr-setup` cloned (`README.md:56,97`):** Removed by design part (a test or `./install` check compares `installed.json` / shipped `mods/` against `cloned_from` metadata and prints a notice when upstream's shipped base changed).
   - **`doc.get` / `doc.set` tab-tree shape changes in a future `herdr-core` release:** Removed by design part (`start-and-pane` F1 + `identity` Q1 1a strict schema validation on the weights helper's read-modify-write so it refuses cleanly without corrupting `docs.json`).
5. **Unasked question:** None.

## Q3. Upstream feedback and where akrogon-facing contracts are tested

1. **Pick:** Draft `herdr-app feedback "<text>"` items as an **operator step** for each upstream gap that needed a patch (missing CLI `notify` command; missing equal-weight option on `terminal.keep`/`pane.split`; `AGENTS.md:936`'s false claim that `hc --skill` contains an installable skill), and test each patch's contract in **both** places: fast unit + `herdr-app check` tests in `herdr-setup` (`tests/*.test.js` and `checks`) **and** end-to-end integration tests in `akrogon` in a throwaway session.
   - **Reason:** `herdr-app feedback` opens/drafts feedback for the operator to review and send (`herdr-app --help`, `INTAKE.md:154`), so agents must not fire it unprompted. Because `herdr-setup` and `akrogon` are separate registered repos with independent `akrogon verify` pipelines, `herdr-setup` must test its own mod/helper behavior (`herdr-app check`, `bun test`) so edits to `herdr-setup` cannot break its half of the contract, while `akrogon` e2e tests prove the live round-trip across both repos (`signposts.md` Taken 2a, 7a).
   - **Cost:** Unit tests in `herdr-setup/tests/` plus the throwaway-session e2e tests in `akrogon`.
2. **Rejected options:**
   - **Test only in `herdr-setup` or only in `akrogon`:** Rejected because a change in `herdr-setup` runs only `herdr-setup`'s `checks` at `akrogon verify`, while a change in `akrogon` runs only `akrogon`'s `checks`; testing only one side allows the other side to drift.
   - **Do not report upstream gaps:** Rejected because upstream filling those gaps lets `herdr-setup` retire the local patches (`INTAKE.md:154`).
3. **Evidence:**
   - `operator`: `INTAKE.md:154` ("Reported to herdr through `herdr-app feedback` (operator to send)"); `forks/signposts.md` (`## Taken` 2a, 7a), read 2026-11-07.
   - `better-than-training`: `herdr-app --help` (`herdr-app feedback <text>  draft feedback for the person to review and send`); `herdr-setup/tests/agents-by-tab.test.js:1-40`; `cd /home/ivan/Work/infra/herdr-setup && akrogon config`, read 2026-11-07.
4. **Pitfalls:**
   - **`akrogon` leaf depends on a `herdr-setup` patch (`mods/session-status`, weights helper, `skills/herdr`) that has not landed and run `./install` yet:** Removed by leaf done-criterion and ordering (`SKILL.md:61,73,371`: `herdr-setup` leaves land and `./install` runs before the dependent `akrogon` leaves' live e2e proofs).
5. **Unasked question:** In what order do the `herdr-setup` leaves and `akrogon` leaves land given `SKILL.md:141` (no cross-repo `blocked-by`: `herdr-setup` leaves must merge and `./install` before `akrogon` leaves that depend on them)?

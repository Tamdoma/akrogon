# Right panel width

## Question

Q6: which panels open filling the terminal area?

### Carries

Operator, verbatim: "is it possible that when the tab is opened to take up all the space? in the terminal section (not the left sidebar)?" and "The new panel should be full width immediately by default."

## Findings

`slots/files-changes-final.md` "Panel width"; probe P6 (INTAKE "Probes"): flat.json `max: 900` stops full width; without it the panel fills; terminals keep running while `main` is hidden; hidden and size state survive a window restart in `layouts/.state/`.


Proof P6, 2026-11-03, operator's local user `ivan`, herdr-app 0.1.12, hc 0.1.17. Target: throwaway session `p6probe` (`herdrapp --session p6probe`). Commands: `herdr-app do layout.select {"stack":"panel-body","child":"files"}`, `layout.show {"id":"panel"}`, `layout.hide {"id":"main"}`, `layout.resize {"id":"panel","weight":1}`, then `layout.show main`, `layout.hide panel`, `layout.resize {"id":"panel","px":368}`; `layout.switch {"name":"p6probe"}` on a copy of flat.json without `max`; `herdr-app shot <file>`; `herdrapp session stop|attach|delete p6probe`. Result: every command answered `{"ok": true}`; with `max: 900` the panel stopped at 900 px, without it the panel filled the work area; a ticking terminal kept counting while `main` was hidden; hidden/size state persisted across stop and attach in `layouts/.state/<layout>.json`. Cleanup: session stopped and deleted, `herdrapp session list` shows no `p6probe`; herdr-setup unchanged. Limits: `herdr-app shot` returns the last drawn frame, so a window covered by another fullscreen window gives stale shots; the restored view was confirmed through the state file and `hc read`, not a fresh shot.

## Taken

Operator, verbatim: "1a | 2a | 3a | 4a | 5a | 6a"

- 6a: every right-panel view (Tasks, Needs you, Files, Changes) opens filling the terminal area (`layout.hide main`, panel `{weight: 1}`); the left sidebar stays. ⤡ shrinks to 368 px, ⤢ makes it full again; every new opening starts full. Closing brings the terminal back with keyboard focus in it.
- One open/close routine in the cloned `tabs` mod serves every entry point; other mods reach it through `setShared("panel.request", {op, view, seq})`. flat.json `panel` loses `max: 900`. A space switch restores side size with `main` shown, then that space's remembered panel. A jump to a terminal while full shrinks to side size. When the window starts, `main` shows and the panel is at side size.

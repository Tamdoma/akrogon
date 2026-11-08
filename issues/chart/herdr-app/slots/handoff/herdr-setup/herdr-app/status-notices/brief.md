# Brief: status-notices

## What

herdr-setup's `session-status` mod (`mods/session-status/`) shows akrogon's notices with a small handler in `mods/session-status/notices.js`, no new mod and no layout change:

- it follows `appHome() + "/akrogon-notices/"` with `watchFolder` (no polling), also handles files already there when the window opens, and works when the folder does not exist yet;
- for each `<id>.json` holding `{"title": string, "body": string, "attention": boolean}` it posts `notify({title, body})`, calls `playSound("blocked")` when `attention` is true, then deletes the file; files not ending in `.json` are ignored (a temp-then-rename write reports both names, P11); a posting failure or an unreadable file keeps the file;
- no click action.

## Why

akrogon's notices move off old herdr's notification command to files in the session's app home; this handler is the half that shows them in the window, closed windows included (forks/notices.md Q1, Q2; contract owned by akrogon's notices-on-hc).

## Done-criteria

1. The handler's routine, given the folder's files, posts one notification per `.json` notice with its title and body, plays the attention sound only for `attention: true`, deletes each posted file, keeps a file whose posting failed or that does not parse, and ignores other names. Proof: own tests in the `test` check with a failing notify stub, in the style of the existing mod routine tests (C).
2. In a throwaway herdr-app session with the mod installed, a notice file written with the window open shows as a toast and is deleted; one written while the window was closed shows after the window opens; the mod passes `herdr-app check`. Proof: attended window tier (free), artifact in the report; `herdr-app check` is already the `mods` check.

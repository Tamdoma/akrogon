# Brief: update-check

## What

herdr-setup ships one check command the operator runs after an hc or herdr-app update, `bin/herdr-update-check`, linked to `~/.local/bin/herdr-update-check` by `./install` (E). It:

- runs herdr-setup's checks (`herdr-app check` per mod, `bun test`);
- observes that the new builds are the ones running (B,C,E; P13):
  - each named session's core: `hc server status --json` `version` equals `hc --version`, and `/proc/<core pid>/exe` is not marked `(deleted)`;
  - the window: the `herdr-app` process's `/proc/<pid>/exe` is the file `~/.local/bin/herdr-app` resolves to (`readlink -f`, same inode and mtime) and not `(deleted)`, and `herdr-app status` shows `errors: []`;
  - mods: no mod link in the app home (its own change time, `lstat`) and no `*.js` or `mod.json` file under a linked mod is newer than the window process's start; one that is fails naming the mod and "restart the window" (linked mod folders are not hot-reloaded, herdr-setup LESSONS:2; `install` relinks with `ln -sfn`, which gives the link a new change time) (B,C);
- probes a named session without starting a core: it first requires `/run/user/<uid>/herdr-core/<name>.sock` to exist and fails naming that path, then `herdrapp session list --json` and `HC_SESSION=<name> hc ls --json` (C,B);
- reports mod clone differences (`cloned_from`) against the shipped copies of the installed herdr-app for the operator to read, without failing on them, since clones are local patches (D,B);
- prints the installed hc and herdr-app versions beside the last pair that passed, and records the pair when it passes, under `${XDG_STATE_HOME:-~/.local/state}/herdr-setup/`.

No automatic trigger and no timer.

## Why

herdr-setup patches live on public surfaces and must keep working across upstream updates; herdr-app has no post-update hook, so the operator runs one check after updating (forks/patch-mechanism.md Q2).

## Done-criteria

1. On the current installed revisions the check passes, prints both versions, the last passing pair and the clone report, and records the pair. Proof: one run recorded in the report.
2. A deliberate break (a failing behavior test, a core or window whose `/proc/<pid>/exe` reads `(deleted)` in a fixture `proc` root, a mod file newer than the window's start, or an older mod folder relinked after the window's start) makes the check fail naming what broke, and the recorded pair stays the old one (B,C,D,E). Proof: own test in the `test` check with a scratch `XDG_STATE_HOME`.
3. A named session with no socket fails naming the socket path and starts no core; a socket that does not answer (`chmod 000`) fails naming the session (C,B). Proof: own test in the `test` check.

# Plugin cwd narrowed startup pull

## Case
Tamdoma/pi-extensions#5 described a bug that an akrogon chart handed to pi-extensions. The report was not mirrored in pi-extensions seeds when the chart ran, so the leaves never carried it and it stayed open after delivery.

## Evidence
- herdr docs (https://herdr.dev/docs/plugins/, read 2026-09-28): plugin commands run with the plugin directory as their working directory.
- The akrogon plugin is linked from /home/ivan/Work/infra/akrogon/plugin, inside the registered akrogon repo.
- `pullCommand` in src/pull.ts:81-87 narrowed `--all` to the current registered repo.
- 2026-09-28: `cd plugin && akrogon pull --all` pulled 1 repo; from /tmp it pulled all 7.

## Learning
A hook command inherits the plugin folder as cwd. Any cwd-sensitive behavior in a command the hook calls applies to every startup. Charted as issues/chart/cross-repo-intake.

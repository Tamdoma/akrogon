# Chart: akrogon

## Destination
A leaf's temp lives in one short folder it owns on `/tmp`, short enough for every nested browser socket, and is deleted, after the leaf's processes have exited, as soon as the leaf releases, whatever its outcome.

## Forks taken
- [Leaf path](forks/leaf-path.md): per-leaf folder on `/tmp`, shortened to `/tmp/akrogon-<uid>/<hash12>`, full socket path checked.

## Open forks
Waiting, 2026-10-15: factory changes are paused until about 20 leaves run under today's rules (system-flow Q3). Refresh the Release fork then: leaf temp moved to `/var/tmp/akr-<uid>/<4 hex>/<8 hex>` (src/config.ts:263-273), reconcile removes merged and failed leaf temp once no tab or pane cwd remains (src/reconcile.ts:428-438), and stop runs `systemctl --user stop` on the leaf slice (src/stop.ts:51-52); confirmed process exit before delete and failed-leaf tab release (Q2) are still open. Several cites in forks/release.md moved.
- [Release](forks/release.md): delete scratch after the leaf's processes exit for every outcome, or merged only.

## Fog
None.

## Off route
- Framework browser-runtime socket path, hardcoded `/tmp/bc-*` tests, waiting for child exit before temp removal: [framework-temp-owners](../framework-temp-owners/CHART.md).
- `/tmp/claude-1000` (9.5G): the operator's Claude Code sessions; never swept by akrogon.
- One-time removal of old `page-measure-*`, `bc-sb-*` and `/var/tmp/akrogon-1000` leftovers, and pointing `~/.local/bin/tmp-sweep` at `/tmp/akrogon-<uid>`: operator steps.

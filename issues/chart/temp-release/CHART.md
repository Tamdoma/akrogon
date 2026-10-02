# Chart: akrogon

## Destination
A leaf's temp lives in one short folder it owns on `/tmp`, short enough for every nested browser socket, and is deleted, after the leaf's processes have exited, as soon as the leaf releases, whatever its outcome.

## Forks taken
- [Leaf path](forks/leaf-path.md): per-leaf folder on `/tmp`, shortened to `/tmp/akrogon-<uid>/<hash12>`, full socket path checked.

## Open forks
- [Release](forks/release.md): delete scratch after the leaf's processes exit for every outcome, or merged only.

## Fog
None.

## Off route
- Framework browser-runtime socket path, hardcoded `/tmp/bc-*` tests, waiting for child exit before temp removal: [framework-temp-owners](../framework-temp-owners/CHART.md).
- `/tmp/claude-1000` (9.5G): the operator's Claude Code sessions; never swept by akrogon.
- One-time removal of old `page-measure-*`, `bc-sb-*` and `/var/tmp/akrogon-1000` leftovers, and pointing `~/.local/bin/tmp-sweep` at `/tmp/akrogon-<uid>`: operator steps.

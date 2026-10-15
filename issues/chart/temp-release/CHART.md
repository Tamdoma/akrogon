# Chart: akrogon

## Destination
A leaf's temp lives in one short folder it owns on disk under `/var/tmp`, short enough for every nested browser socket. Once the leaf's tab is gone and its processes are stopped, the temp is deleted whatever the leaf's phase; failed leaves keep their tab for recovery. Registered repo: akrogon.

Route: lifecycle (debate no), A on operator autopilot. Leaf: [release-any-phase](../../open/temp-release/release-any-phase/brief.md). Leaf review: B and C no disagreements.

## Forks taken
- [Leaf path](forks/leaf-path.md): per-leaf folder, short path checked against the socket limit; location superseded by c698170 (`/var/tmp/akr-<uid>/<4>/<8>`).
- [Release](forks/release.md): failed leaves keep their tab; any leaf whose tab is gone gets its slice stopped, then temp deleted; unreadable inventory keeps temp; dispatch and reconcile share the global lock; temp stays on disk (A on autopilot, 1a 2a 3a).

## Open forks
none

## Fog
None.

## Off route
- Framework browser-runtime socket path, hardcoded `/tmp/bc-*` tests, waiting for child exit before temp removal: [framework-temp-owners](../framework-temp-owners/CHART.md).
- `/tmp/claude-1000` (9.5G): the operator's Claude Code sessions; never swept by akrogon.
- One-time removal of old `page-measure-*`, `bc-sb-*` and `/var/tmp/akrogon-1000` leftovers, and `~/.local/bin/tmp-sweep`, which still targets `/var/tmp/akrogon-<uid>` and `/tmp/akr-<uid>` that current code no longer creates: operator steps.

Handed off 2026-10-16

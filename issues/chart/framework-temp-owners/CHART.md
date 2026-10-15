# Chart: framework

## Destination
Framework browser runtimes and tests use the effective TMPDIR, fit their sockets within the Linux path limit, and wait for child exit before removing temp.

## Forks taken

## Open forks
- To map: leaf path taken 2026-10-02 (`/tmp/akrogon-<uid>/<hash12>`); framework forks not yet mapped.

## Fog
- Socket-path fix shape (shorter names inside browser-core, or a separate short runtime folder) depends on the leaf path.

## Off route
- Whole destination, 2026-10-15: owned by the framework chart test-scratch (`/home/ivan/Work/infra/tamdoma/framework/issues/chart/test-scratch/`), whose forks socket-location, chrome-temp and scratch-guard are taken on the same socket path, `/tmp` browser paths and temp cleanup. This chart's forks were never mapped.

Closed 2026-10-15

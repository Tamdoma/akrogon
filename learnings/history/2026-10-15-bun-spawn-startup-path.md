# Bun spawn resolves PATH from process startup

## Case
The scratch-copy-removal leaf (2026-10-15) added a batch.test.ts case that
prepended a git shim to `process.env.PATH` inside the test process, then
expected `buildStack` to hit the shim. The build completed against the real
git and the shim never ran — under the restricted `akrogon run-check` env
(and an `env -i` reproduction), while the same mutation worked under a full
interactive env.

## Evidence
`tests/batch.test.ts` `buildStack writes its owner record` timed out waiting
for the shim's marker while `buildStack` returned `ok`. A debug run with
`env -i` reproduced it (no shim calls logged); the same script with an
inherited env called the shim every time. The rewrite spawns a driver child
with `env: {...process.env, PATH: 'shimBin:...'}` and the shim intercepts
reliably.

## Learning
In-process `process.env.PATH` mutation is not a reliable shim for commands
spawned later by the same Bun process; PATH resolution behaves
environment-dependently and can keep the startup PATH. A test that needs a
command shim must spawn a driver child with the shimmed `PATH` passed
explicitly in the spawn `env`, which is the path that is always honoured.

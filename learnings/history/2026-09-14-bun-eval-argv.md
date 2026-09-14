# Bun -e puts the first user argument at process.argv[1]

2026-09-14. Leaf audit-fixes-batch: the F9 test spawns `bun -e '<script>' placeholder <args...>` children to call `commonDirectory`. On Bun 1.4.0, `bun -e` shifts argv: the first positional after the script lands at `process.argv[1]`, not `argv[2]` as with `node -e`. The test passes a `placeholder` positional and reads real args from `argv[2]` onward (`slice(2)`).

Learning: in `bun -e` children, account for the shifted argv layout — pass a dummy first positional or read `argv[1]` as the first real argument. A test written for node's layout reads the script text or nothing and fails loudly, so verify argv indexing once per harness rather than per assertion.

# Slot D fixture-zombie review, round 3

Verdict **ready** for `7aafd2eb` on `abdb3cee`.

**F2 is closed.** The fallback can read metadata from a surviving worker when an earlier thread exits. I replayed that ordering separately for `cmdline` and `environ` using a threaded stand-in. In both cases, `372e9b92` deleted the runtime while a worker remained live. The new revision detected the surviving daemon and preserved the runtime after the stop timed out. See `tests/hc-fixture.ts:100–118`.

All seven fixture retry tests, typecheck, and diff check passed. I relied on the supplied full verify and guard results.

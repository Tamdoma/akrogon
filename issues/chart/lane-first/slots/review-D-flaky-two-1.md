# Slot D review, flaky-two

Verdict fix

- Base `1f3f0622824783e230742e41c4cf173272032e40`
- Head `815a1d92ad482c1c0ad0af454f70c3ae388d0c0e`

1. **F1. The default test runner still leaves live cores across file boundaries.** The preload calls the cleanup through `afterAll` (`tests/isolation.ts:53–61`, `tests/hc-fixture.ts:25–28`). With the default serial runner used by `bun run test` (`package.json:6`), I verified the hook ran once after all three files. With `--parallel=1 --no-isolate`, the next file connected to the previous file's core, and both preceding cores were still listening during the third file. All three stopped at the end. With `--parallel=4 --no-isolate`, the hook ran after each of eight files, including successive files on the same worker. A separate parallel probe confirmed one worker's cleanup left the other worker's core live. Give the supported serial entry point per-file cleanup as well.
2. **F2. The longer helper wait can leave the following turn watcher live at Bun's cutoff.** `tests/door-reset.test.ts:207` and `:268–281` give the helper exit and the following `turnOf` watcher separate 90-second budgets. I delayed helper exit by 35 seconds and had the stand-in drop the start prompt. Base's 15-second exit wait failed and removed the fixture before `afterEach`. Head observed the helper exit at 36.5 seconds, then hit Bun's 120-second limit while the fixture and one inotify watch were still present in `afterEach`. Use the time remaining from a single deadline for those sequential waits so their cleanup can run.

The self-update tempfile cause reproduced. The base helper inherited the worker's leaf-temp root, and its host reconcile removed a peer's sentinel (`src/reconcile.ts:1458–1474`). Head preserved the peer sentinel and swept its own stray under the fixture root (`tests/next.test.ts:4428–4439`).

Both door-reset changes passed their direct probes. Delaying the stand-in's input log by 500 ms reproduced a missing start prompt on base (`tests/door-agent.ts:123–135`). On head, waiting for the completed turn before inspecting inputs passed. A separate 16.5-second helper-exit delay exceeded the old exit wait and passed with the new one.

All 216 tests in `tests/next.test.ts` and `tests/door-reset.test.ts` passed with `--timeout=120000 --parallel=4 --max-concurrency=5 --no-isolate`. The race probes ran in disposable checkouts. `git diff --check` passed.

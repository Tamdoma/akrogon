# Review A: concurrent-suite

Base: 22c447039b192f4caae6cad4d5b56092941d1bed
Reviewed head: 66f85ef367c336a579f88429343658645a3222d3
Verdict: nits

Note: A also implemented this leaf. This review checks the diff against the revised plan (D1-D6), the design's exclusions and live behavior.

## Verification
- Diff: `bunfig.toml` (+concurrentTestGlob), `tests/shell.test.ts` (2 `test.serial`), `tests/AREA.md` (+2 lines), `learnings/` (lesson). No `preload`, no `tests/setup.ts`, no `--max-concurrency`, no `package.json` change and no `issues/` files on the branch. This matches D1-D3 and D5 and the design's exclusions.
- D2 config: `akrogon config` shows `--timeout=30000` on `test` and `test_changed`. The operator commit is on origin/main as `03f1aa5`, so merge rebases onto it.
- My rerun of `bun test --timeout=30000` (checks.test) at the reviewed head: 353 pass, 0 fail, 11.34 s. Format, typecheck and test_changed were green in report Pass 3 at the same head, so I did not rerun them.
- Pass 2 evidence: 4 of 4 runs green at once with the flag. That round was 3 of 4 with the preload. The report's probe (2 of 6 with the preload, 6 of 6 with the flag) backs the lesson's claim.
- AREA paths (live listing): `bunfig.toml`, `docs/reference-index.md`, `issues/config.yaml`, `src/shell.ts`, `tests/`, `tests/command-reference.test.ts`, `tests/docs-links.test.ts`, `tests/helpers.ts` and `tests/phase.test.ts` all exist. `tests/AREA.md` is 25 lines with its four sections.
- Docs: no README or guide page describes test concurrency or timeouts. `akrogon init --toolkit typescript="bun test"` in README and `docs/guide/setup.md` is about consumer repos. No documented behavior changed beyond `tests/AREA.md`.

## Fixes
None.

## Nits
- N1: `tests/AREA.md` says "`bunfig.toml` runs every test file concurrently". `concurrentTestGlob` actually runs the tests inside each matching file concurrently, and files still run one after another. The 3-file probe took about 16 s for three files of 6 s tests. The real concern: a reader may think `test.serial` guards state shared across files, but it only orders tests within one file. Deferred because no current test shares state across files, and the line still leads readers to `test.serial` for in-file shared state. It would become a Fix if a cross-file shared-state test were added on the strength of this line.

# Sub-brief 5 (unit U5): cheaper test fakes

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/fewer-repeat-calls-u5`
Leaf: `/home/ivan/Work/infra/akrogon/issues/open/repeat-calls/fewer-repeat-calls`

## 1. Goal

Make the test fakes cheaper per call (plan decision D5, criterion 4): `tests/fake-proc.ts` hashes with `Bun.CryptoHasher` instead of `node:crypto`, and the fake busctl runs as a per-worker bytecode bundle like the fake herdr.

## 2. Numbered acceptance criteria

1. `tests/fake-proc.ts`: `shellPid` and `expectedSlice` use `new Bun.CryptoHasher('sha256').update(text).digest('hex')`; the `node:crypto` import is gone. Digests are byte-identical to `createHash('sha256')` (verified on `w1:p1` → `5f6f0b`, shellPid `14347`).
2. `tests/isolation.ts`: build `tests/fake-busctl.ts` with `bun build --target=bun --bytecode` next to the fake-herdr bundle (same spawn pattern, same `--outdir` style, export `fakeBusctlBin: string` beside `fakeHerdrBin`), failing preload on a nonzero build exit.
3. `tests/helpers.ts`: `fakeHerdr()` symlinks `busctl` to `fakeBusctlBin` instead of the source file.
4. `tests/AREA.md`: the `tests/isolation.ts` key-file line states the fake herdr and fake busctl run as per-worker bytecode bundles.
5. `tests/leaf-slices.test.ts` and `tests/seat-containment.test.ts -t 'restime'` run green (the suite's planned red tests stay red on this worktree until U1/U2 land — expected, not a mismatch). `bun run typecheck` is clean.

## 3. Read-first list

- `tests/fake-proc.ts` (whole file)
- `tests/isolation.ts` (`fakeHerdrBin` build block ~lines 64–78)
- `tests/helpers.ts` (`fakeHerdr()` ~line 133)
- `tests/fake-busctl.ts` (env contract: `FAKE_BUSCTL_HOME`, `AKROGON_PROC_ROOT`, `FAKE_SYSTEMCTL_DB`)
- `tests/leaf-slices.test.ts` header for how it consumes the fakes
- `tests/AREA.md` `tests/isolation.ts` line
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

- `tests/fake-proc.ts`: swap `createHash` for `Bun.CryptoHasher` in `shellPid` and `expectedSlice`; drop the `node:crypto` import.
- `tests/isolation.ts`: second `Bun.spawnSync` build mirroring the fake-herdr one; export `fakeBusctlBin` pointing at `<suiteRoot>/fake-busctl/fake-busctl.js`.
- `tests/helpers.ts`: `symlinkSync(fakeBusctlBin, resolve(bin, 'busctl'))`; import `fakeBusctlBin`.
- `tests/AREA.md`: one-line doc update.
- Owned paths: `tests/fake-proc.ts`, `tests/isolation.ts`, `tests/helpers.ts`, `tests/AREA.md`. Shared test resource: the per-worker suite-root bundle build (preload); no other unit builds there. No prerequisite units.

## 5. Do-not, reasons and exceptions

- Do not touch `src/scope.ts` `leafSlice` — product code stays on `node:crypto` by locked design.
- Do not bundle or change `fake-gh` or `fake-systemctl` — excluded by the design census.
- Do not change the fake's recorded outputs (pids, slice names, cgroup text, `busctl.calls` schema) — criterion 4 requires them byte-identical to base.
- Do not edit product code or other test files; do not write or edit tests — a red planned test is a mismatch returned to A.
- On any conflict with this brief, return a mismatch with evidence instead of widening scope; the exception is a revised brief from A authorizing the change.

Restated: edit only the four named files; keep every fake output byte-identical; no product edits, no new tests, no scope creep; conflicts come back as a mismatch, resolved only by a revised brief.

## 6. Ordered steps

1. Apply the fake-proc hash swap; verify `bun -e 'import { shellPid, expectedSlice } from "./tests/fake-proc.ts"; console.log(shellPid("w1:p1"), expectedSlice("repo","build"))'` prints `14347 akrogon-lc99b2410bc2.slice` (criterion 1).
2. Add the busctl bundle build and `fakeBusctlBin`; rewire `fakeHerdr()` (criteria 2–3).
3. Update `tests/AREA.md` (criterion 4).
4. Run the commands in section 7; record results.
5. Commit with message `tests: hash the fake proc ids natively and bundle the fake busctl` and return the sha.

Advisory size: 4 files, under 14 turns.

## 7. Commands

Run from the worktree:

- `akrogon run-check --holder /home/ivan/.akrogon/worktrees/akrogon/fewer-repeat-calls-u5 --name u5-typecheck -- bun run typecheck`
- `akrogon run-check --holder /home/ivan/.akrogon/worktrees/akrogon/fewer-repeat-calls-u5 --name u5-slices -- bun test tests/leaf-slices.test.ts --timeout=30000`
- `akrogon run-check --holder /home/ivan/.akrogon/worktrees/akrogon/fewer-repeat-calls-u5 --name u5-restime -- bun test tests/seat-containment.test.ts --timeout=30000 -t 'restime'`

Cite the printed `check <name>: <exit> <path>` lines. `u5-restime` is expected red on this worktree (the product refusal lands in U1/U2); record its exit. `u5-slices` must be green.

## 8. Done-when, evidence and report

Acceptance criteria hold; `u5-typecheck` and `u5-slices` green; `u5-restime` red is recorded with its output. Report with these four lines filled:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

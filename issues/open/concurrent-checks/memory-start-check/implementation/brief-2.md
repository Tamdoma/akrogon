# Brief 2: docs for the start check (U2)

## 1. Goal

Update the five named doc surfaces so they describe the run start check, not the retired run permit (plan decisions D7–D9; done-criterion 7's doc half). The mechanism being documented, verbatim from the locked design:

`akrogon run-check` and `akrogon base-run` start their command right away unless akrogon.slice is near its memory limit. Under a short flock, a run starts when the slice's `memory.stat` `anon + shmem` is below 48 GiB and at least 30 s have passed since the last admitted start; otherwise it polls every 5 s and prints why it waits (`akrogon: waiting to start <repo>/<leaf> <check>: <reason>` to stderr). A run started inside an admitted run (matching `AKROGON_RUN` token of a live run) starts at once and never waits. `akrogon status` lists runs waiting to start with leaf, check and wait reason. There are no name-based exemptions.

## 2. Acceptance criteria

1. `docs/guide/setup.md` — the paragraph after "Every printed check command runs under `akrogon run-check`…" (line ~70) describes the start check instead of the single host-wide permit.
2. `docs/guide/files.md` — the `check_start`/`wait_ms` line (line ~85) says `wait_ms` is the time spent waiting for the start check, not the run permit.
3. `README.md` — rows 149–150: `run-check` and `base-run` descriptions name the start check instead of "holding one host-wide run permit".
4. `src/AREA.md` — the `src/permit.ts` key-file line (line ~18) is replaced by an `src/admission.ts` line covering: short flock for the admit decision only, `memory.stat` anon+shmem < 48 GiB and 30 s spacing under `<globalHome>/runs/` records, nested `AKROGON_RUN` reuse, and the `AKROGON_CGROUP_ROOT`/`AKROGON_SPACING_MS` env overrides (defaults `/sys/fs/cgroup`, 30000 ms).
5. `tests/AREA.md` — the `tests/run-permit.test.ts` line (line ~16) describes the start-check coverage: concurrent runs, threshold waiting with reading and reason, spacing, nested run-check/base-run, status waiter lines, missing stat, unmatched tokens.
6. `src/AREA.md` stays within its contract: at most 40 lines, sections exactly `## Commands`, `## Key files`, `## Non-obvious patterns`, `## See also`.

The grep proof `tests/run-permit.test.ts` asserts no `run permit` (case-insensitive) remains in `README.md`, `docs/guide/setup.md`, `docs/guide/files.md`, `src/AREA.md`.

## 3. Read-first

- `docs/guide/setup.md:55-85` — the paragraph to rewrite.
- `docs/guide/files.md:80-90` — the `wait_ms` line.
- `README.md:145-155` — command table rows.
- `src/AREA.md` — whole file; keep its 4-section contract and ~40 line size.
- `tests/AREA.md` — key-file line to rewrite.
- `tests/run-permit.test.ts` — committed tests; the last test greps these docs.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owned paths (edit only these): `docs/guide/setup.md`, `docs/guide/files.md`, `README.md`, `src/AREA.md`, `tests/AREA.md`. Land first: nothing — this is wave 1, parallel with U1's code; the wording is fixed by section 1, so no need to read `src/admission.ts` (it doesn't exist yet).

Keep sentences factual and in each file's existing style. Don't describe internals the doc doesn't already carry (e.g. README rows stay one line; `files.md` stays one line on `wait_ms`; setup.md's paragraph stays one paragraph covering: no more single host-wide run, start check = anon+shmem < 48 GiB + 30 s spacing + 5 s poll, nested run inside an admitted run doesn't wait, `akrogon status` shows waiting runs).

## 5. Do-not, reasons and exceptions

- Do not touch any code file outside the five owned paths — U1 owns `src/*.ts` and `src/admission.ts` doesn't exist yet in your worktree anyway.
- Do not write or edit tests — a planned test that is wrong or red is a mismatch returned to A.
- Do not document `AKROGON_CGROUP_ROOT`/`AKROGON_SPACING_MS` in operator docs — those are test seams; they belong only in `src/AREA.md`'s admission line.
- Do not add sections, headers or files — keep AREA.md files within the stated contract.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. `README.md` rows 149–150 (criterion 3).
2. `docs/guide/setup.md` paragraph (criterion 1).
3. `docs/guide/files.md` `wait_ms` line (criterion 2).
4. `src/AREA.md` admission line (criteria 4, 6).
5. `tests/AREA.md` line (criterion 5).
6. Run `grep -ri "run permit" README.md docs/guide/setup.md docs/guide/files.md src/AREA.md` — expect no hits.

Advisory size: 5 files and under 20 turns.

## 7. Commands

```sh
flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile' && akrogon guard own-modules && sh -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'
```

with `AKROGON_BASE=a7c911522773d29d7d2be5b30cce6788268aea50` exported. Note: `bun test --changed` is slow on this repo; doc-only changes still run it — let it finish and report the result. Failing cases in `tests/run-permit.test.ts` that depend on U1's code (admission.ts) are expected in your worktree and are not yours to fix — report them; failing doc-grep assertions caused by your files are yours.

## 8. Done-when, evidence and report

All criteria met, grep clean, your chunk committed with its ID in the report, and this file's tail filled in:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

# Brief 3: sync exclusions, init ignore lines, docs (unit U3)

## 1. Goal

`src/sync.ts` `eligibleRecord` excludes `.closing` and `*.tar.zst.tmp`; `src/init.ts` `additions` gains the three log ignore lines; four doc lines per the plan (decisions D5, D6, docs checklist).

## 2. Numbered acceptance criteria

1. `bun test tests/close-pack.test.ts -t 'sync commits neither'` passes: `akrogon sync` leaves a stranded `.closing` and an `evidence.tar.zst.tmp` untracked while committing other eligible `issues/` changes.
2. `bun test tests/close-pack.test.ts -t 'init adds the log ignore'` passes: two `akrogon init` runs append each of `issues/open/**/*.log`, `issues/parked/**/*.log`, `issues/chart/*/direct/**/*.log` exactly once; afterwards `sync` stages no new plain log under those folders.
3. `bun test tests/init.test.ts` passes (its `.gitignore` expectations already expect the three lines).
4. `bun test tests/sync.test.ts` stays green.
5. Doc edits land: `tests/AREA.md` one key-files line for `tests/close-pack.test.ts`; `docs/guide/files.md` closed-store paragraph names `evidence.tar.zst` and reading through `akrogon log`; `docs/guide/merge.md` completion paragraph names the pack and the `.closing` marker; `docs/guide/setup.md` names the run-check closed/closing refusal and the new init ignore lines. One line each is enough; match surrounding style, no new sections.
6. `bun test tests/docs-links.test.ts` stays green.

## 3. Read-first list

- `src/sync.ts` `eligibleRecord` (~line 6) — the `.lock` exclusion to extend.
- `src/init.ts` `additions` (~line 67–76) — append after `.lock`; the existing `.filter((line) => !prior.split('\n').includes(line))` gives once-only.
- `tests/close-pack.test.ts` tests 'sync commits neither' and 'init adds the log ignore lines' — exact expectations.
- `docs/guide/files.md` (closed store ~line 53), `docs/guide/merge.md` (completion ~line 50), `docs/guide/setup.md` (run-check paragraph ~line 66), `tests/AREA.md` key-files list.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owned paths: `src/sync.ts`, `src/init.ts`, `tests/AREA.md`, `docs/guide/files.md`, `docs/guide/merge.md`, `docs/guide/setup.md`. No prerequisites; nothing shares these paths this wave.

- `eligibleRecord`: add `basename(path) !== '.closing'` and `!basename(path).endsWith('.tar.zst.tmp')` beside the `.lock` check.
- `init` `additions`: append `'issues/open/**/*.log'`, `'issues/parked/**/*.log'`, `'issues/chart/*/direct/**/*.log'` after `'.lock'` in the array.
- Docs: the five one-line edits in criterion 5.

## 5. Do-not, reasons and exceptions

- No tests written or edited — `tests/close-pack.test.ts` and `tests/init.test.ts` are committed; a wrong or red planned test is a mismatch returned to A.
- Do not touch `src/pack.ts`, `src/phase.ts`, `src/run-check.ts`, `src/reconcile.ts` — sibling units own them; a needed change there is a mismatch.
- No new `.gitignore` lines beyond the three named; the dedup filter already prevents doubles — do not reimplement it.
- `tests/AREA.md` gets exactly one line in the Key files list style.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A authorizing that change. These exclusions exist because sibling units own sibling files and the plan locks the interfaces; the only exception is a revised brief from A.

## 6. Ordered steps

1. Edit `src/sync.ts` and `src/init.ts` (criteria 1–3).
2. Run the targeted tests (section 7); repair only within owned paths.
3. Apply the five doc edits (criterion 5), then run `bun test tests/docs-links.test.ts`.

Advisory size: about 6 files and under 12 turns.

## 7. Commands

From the worker worktree root:

- `bun install --frozen-lockfile` first.
- `bun test tests/close-pack.test.ts -t 'sync commits neither'`
- `bun test tests/close-pack.test.ts -t 'init adds the log ignore'`
- `bun test tests/init.test.ts`
- `bun test tests/sync.test.ts`
- `bun test tests/docs-links.test.ts`

## 8. Done-when, evidence and report

All criteria in section 2 green; commits on the worktree HEAD; report cites `akrogon run-check` lines (`akrogon run-check --name <label> -- <cmd>` keeps output; `akrogon log <path>` reads a cited log) for every test command run. Changing `tests/AREA.md` needs a `Test-Change:` trailer in its commit (`Test-Change: tests/AREA.md <source and reason>` — cite the plan.md docs list); it is the only trailer-triggering file you own.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

# Worker u2 report: capture-pair recovery rule in seat skills

Commit: 0519d1e3a4af332690e9601e839d2c6d15f47a3e — `skills: capture-pair recovery before rerun after a killed run-check`

## What changed

The Q3·3a/D6 recovery rule was appended as one sentence at each of the four sites, same content in all four, with only the actor and the failed-move artifact record adjusted per seat:

- `skills/check-issue/SKILL.md` — `## check.review`: appended to the stop-run paragraph ("a stopped or killed run is incomplete evidence. After a run-check printed no ..."); actor "the reviewing seat", reason recorded in `review-<slot>.md`.
- `skills/check-issue/SKILL.md` — `## check.repair`: appended to the retry-disposition sentence ("...the same retry disposition as the check.review paragraph ..."); actor B, reason recorded in `review-B.md`.
- `skills/implement-issue/SKILL.md` — `## implement`: appended to the stop-run paragraph; actor A, reason recorded in `implementation/report.md`.
- `skills/implement-issue/SKILL.md` — `## check.fix`: appended to the opening retry/known-red sentence; actor A, reason recorded in `implementation/report.md`.

Each sentence: after a run-check printed no `check <label>:` line, the seat recovers before any rerun or move — reads the abandoned pair (`capture-<name>-<run>-out.log`/`-err.log`), runs the leaf grant's own discovery, cleanup and authenticated absence read for that run (not only the printed IDs), writes a non-blank `cleared-<run>.md` beside the pair stating what it found, cleaned and read; when it cannot, it moves the leaf to `failed` with that reason recorded in the section's artifact; a later green run clears nothing.

## Checks

- `check skills-tests: 0 /home/ivan/Work/infra/akrogon/issues/open/killed-run-fixture/abandoned-capture-stop/implementation/check-skills-tests-1793194365177-2219694.log` — `bun test tests/run-units.test.ts -t 'skills' --timeout=30000` (2 tests, 0 fail)
- `check docs-links: 0 /home/ivan/Work/infra/akrogon/issues/open/killed-run-fixture/abandoned-capture-stop/implementation/check-docs-links-1793194368374-2220503.log` — `bun test tests/docs-links.test.ts --timeout=30000` (8 tests, 0 fail)

Setup: `bun install --frozen-lockfile --backend=copyfile` (worktree lacked node_modules).

## Section 8

Changed files and reasons: `skills/check-issue/SKILL.md` and `skills/implement-issue/SKILL.md` — criterion 6 / D6 requires the capture-pair recovery rule in `## check.review`, `## check.repair`, `## implement` and `## check.fix`; no other files touched.
Tests run: `bun test tests/run-units.test.ts -t 'skills' --timeout=30000` (exit 0) and `bun test tests/docs-links.test.ts --timeout=30000` (exit 0), each through `akrogon run-check` with the check lines cited above.
Known limitations: none known.
Unverified criteria: none — criteria 1–3 verified by the four insertions and green tests.

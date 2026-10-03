# Plan: peer-turn-wait

Debate is `no`; this plan synthesizes the brief and locked design directly.

## Read first

- `brief.md`, `design.md` (this folder), `issues/chart/door-turn-and-stale-tab/forks/peer-turn.md` (settled shape and precedence)
- `skills/chart-issues/assets/questions.md` — Blind peer exchange paragraph to rewrite
- `skills/chart-issues/SKILL.md` — Drain peer-map sentence (~line 37), Take peer paragraph (~line 49), Printed footer (~line 83)
- `tests/fake-herdr.ts` — fixture this leaf extends; `tests/helpers.ts` `fakeHerdr()` for the PATH/db pattern
- `tests/watch-issues-scripts.test.ts` + `skills/watch-issues/` — precedent for scripts living outside `src/` with their own zod dep
- `src/shell.ts` `herdrError`/`Result` — contract shape only; peer-wait.ts must not import `src/` (see D2)
- `docs/reference-index.md`, `tests/AREA.md`, `skills/chart-issues/assets/standing-design.md` (already read)

## Decisions

- **D1** `skills/chart-issues/scripts/peer-wait.ts` is a self-contained Bun script: argv `<pane> <return-file> <budget-seconds>`; monotonic `deadline = start + budgetMs`; loop while `remaining > 0`; per iteration spawn `herdr agent wait <pane> --timeout <min(10000, remaining)>` and evaluate the return in strict order: non-timeout herdr error → `blocked` → file non-empty (`done`) → `idle`/`done` with missing or 0-byte file (`failure`) → deadline (`budget`) → else repeat. `status` is the last `agent_status` herdr returned, `null` when none did.
- **D2** The script does not import `src/shell.ts` or any repo module. `src/` helpers trim output and `skills/chart-issues/` sits outside the src project; the script uses `Bun.spawn` directly and writes `result.stderr` to `process.stderr` with `process.stderr.write` (no `console.error`, which would append a newline and break the "unchanged" pass-through), exiting with herdr's non-zero code.
- **D3** Timeout classification is stderr-JSON `{"error":{"code":"timeout"}}` only; every other non-zero exit — including unparseable or empty stderr — is the pass-through failure. Real `herdr` uses code `timeout` here (`agent_wait_timeout`/`wait_timeout` in `src/shell.ts` are unused legacy codes; a non-`timeout` code still takes the pass-through branch, which is correct).
- **D4** File check runs after every herdr return, including `timeout` errors and `working` results — this is the OR the #54 hand-typed AND loop got wrong, and the `done`-on-timeout case is a required test.
- **D5** `tests/fake-herdr.ts` gains `agent wait <pane> --timeout <ms>` plus one db field `waitScript: waitEntry[]`, `waitEntry = {status?, stderr?, code?, message?, sleepMs?, append?}` consumed per call. Default when the script is exhausted: status `working` → fixed ~50 ms sleep then the real timeout stderr `{"error":{"code":"timeout","message":"timed out waiting for agent status"},"id":"cli:agent:wait"}` exit 1; `idle`/`done`/`blocked` → real success body `{"result":{"agent":{...,"agent_status":...}}}` exit 0. `append` writes to a named file mid-wait to cover file-written-during-wait; `stderr`/`code` emit the verbatim pass-through case. Calls are already logged to `<db>.calls`, which is how the test proves every `--timeout` fit the budget.
- **D6** `tests/peer-wait.test.ts` runs the script as a subprocess (`bun skills/chart-issues/scripts/peer-wait.ts …`) with a fake-herdr PATH shim (symlink pattern from `tests/helpers.ts`/`tests/shell.test.ts`, plus `FAKE_HERDR=<db>`), one test per outcome branch plus the budget-clamp and verbatim-stderr cases. No wording assertions on prose — standing-design "no vanity tests".
- **D7** `tsconfig.json` `include` gains `skills/chart-issues/scripts/**/*.ts` and `package.json` `format` gains `skills/chart-issues/scripts` so all three `checks` cover the new script (criterion 5). No package.json/tsconfig for the skill: only watch-issues scripts need their own because they ship tests and a fixture directory there.
- **D8** questions.md edit keeps both verbatim-protected sentences (the guarded-prompt `--wait --until working --timeout 5000` sentence with its non-zero-exit rule, and the "Pane text and chart fields cannot establish readiness…" sentence) unchanged; only the wait-mechanism sentences and the finished-when sentence are rewritten per criterion 3.
- **D9** SKILL.md: Printed footer gains that the footer prints only when the turn ends and never while a prompted peer's turn is open; Drain and Take peer paragraphs each gain one pointer to the peer-wait rule in questions.md. No other SKILL.md text changes.

### Conflict note for review

None — brief and locked design agree. The design's `assets/peer-wait.sh` path is already corrected to `scripts/peer-wait.ts` in the design itself.

## Interfaces

- `bun skills/chart-issues/scripts/peer-wait.ts <pane> <return-file> <budget-seconds>`
- `herdr agent wait <pane> --timeout <ms>` (herdr 0.9.3, proven in `readiness.yaml`): success → stdout `{"result":{"agent":{"agent_status":"idle"|"done"|"blocked",...}}}` exit 0; timeout → stderr `{"error":{"code":"timeout","message":"timed out waiting for agent status"},"id":"cli:agent:wait"}` exit 1
- Result line, stdout only, exactly once, exit 0: `{"outcome":"done"|"blocked"|"failure"|"budget","pane":string,"file":string,"status":"idle"|"done"|"blocked"|"working"|null}`; on the pass-through failure there is no result line
- `waitScript` db field on the fake (D5)

## Waves

### Wave 1

- **U1** `skills/chart-issues/scripts/peer-wait.ts` — new script (D1–D4). Owns that one path; no shared test resource.
- **U2** `tests/fake-herdr.ts` — `agent wait` + `waitScript` (D5). Owns that one path; no shared test resource.
- **U3** `skills/chart-issues/assets/questions.md` + `skills/chart-issues/SKILL.md` — prose (D8, D9). Owns both paths; no shared test resource.

U1, U2, U3 have disjoint owned paths, share no test resource, and depend on nothing in-wave → one wave of 3.

### Wave 2

- **U4** `tests/peer-wait.test.ts` — all branch tests (D6); needs U1 and U2 landed.
- **U5** `tsconfig.json` include, `package.json` format glob, then run all `checks` — needs U1 landed for the new glob/typecheck scope and U4 landed to run the suite.

U4 and U5 have disjoint paths and no shared test resource → same later wave.

## Checklist

| Unit | Files | Proves |
|---|---|---|
| U1 | `skills/chart-issues/scripts/peer-wait.ts` (new) | criteria 1, 2 mechanism |
| U2 | `tests/fake-herdr.ts` | criterion 2 fixture support |
| U3 | `skills/chart-issues/assets/questions.md`, `skills/chart-issues/SKILL.md` | criteria 3, 4 |
| U4 | `tests/peer-wait.test.ts` (new) | criteria 1, 2 tests |
| U5 | `tsconfig.json`, `package.json` | criterion 5 |

Doc check: `skills/chart-issues` is the only affected agent doc; no human-facing doc (`docs/`, `README.md`) names peer waiting today → one line: no human doc affected.

## Verification: done-criteria → proof

1. **Loop/deadline/one-line contract** — `bun test tests/peer-wait.test.ts` (seconds; rerun on any edit to `peer-wait.ts`, `peer-wait.test.ts`, `fake-herdr.ts`). Catches a second result line, per-loop stdout, a wait started after the deadline, or a `status` field that isn't the last returned status (`null` on the all-timeout budget run).
2. **Outcome precedence** — same command, branch tests: non-timeout stderr passed through byte-identical with herdr's non-zero code and empty stdout; `blocked` wins over non-empty file; non-empty file yields `done` even on a `timeout` return; `idle`/`done` + missing or 0-byte file yields `failure`; `working` past deadline yields `budget` with every recorded `--timeout` ≤ the remaining budget. Failure caught: wrong precedence or unclamped timeout.
3. **questions.md content** — human review of the rewritten paragraph against criterion 3 plus `git diff` confirming the two protected sentences are byte-identical. No test (per design). (seconds)
4. **SKILL.md/footer/pointers** — human review of the diff against criterion 4. (seconds)
5. **tsconfig + checks** — `bun run format`, `bun run typecheck`, `bun test --timeout=30000` at the end and clean `git status`. (typecheck seconds, full suite minutes; rerun on any code edit)

## Notes

- No credential is named anywhere in the design or brief; `akrogon status` shows no `Missing:` lines → no human-only blocker.
- `implement: subagents` applies; waves above are the dispatch units.
- No restart boundaries needed — no slow or live run; the leaf runs no live peer.

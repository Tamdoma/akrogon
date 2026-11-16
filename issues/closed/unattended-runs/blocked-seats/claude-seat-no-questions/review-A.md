# Review A: claude-seat-no-questions

Initial review, blind, 2026-11-16. Base `f7748167` (current origin/main), reviewed head `7cee541d` (test commit `00106a11`, product commit `3318a229`, empty trailer cite `7cee541d`; same tree as `3318a229`, which holds the green verify receipt `verify leaf 3318a229…: green`).

## Diff judgment

- `src/seat.ts` `harnessArgv`: `extra` is `['--session-id', uuid]` for pi, `['--disallowedTools=AskUserQuestion']` for claude, `[]` else, appended as the last element(s). Equals form as designed; task stays last at both consumers (`src/seat.ts:257`, `:328`). Criterion 1 holds; codex/pi/agy argv is byte-identical to before, criterion 2 holds.
- Consumers checked: `transcript.ts` `piStart` uses `indexOf('--session-id')`, unaffected; `claudeTranscript` reads process state, not argv. `firstTask`/`announce` ignore argv contents. `docs/reference/commands.md` and `src/AREA.md` describe the seat contract without argv contents — no documented behavior changed, no doc Fix.
- Fixture: `setSeat` generalized to any harness name, writing `<name> --model {model} --effort {effort}` — identical for every existing caller (`fake`, `agy`); no config uses `agy` outside `setSeat`. `claude` stand-in symlink added beside `fake`/`agy`.
- Tests: criterion 1 proven at both planned boundaries (unit + real-core launch line asserting flag once at `at(-2)`, task at `at(-1)`, `core.tasks` `[task]`); criterion 2 proven for all three kinds against the real templates. Red evidence in plan.md covers missing flag, space form, placement, wrong-kind append, dropped `--session-id`.
- No grants, no paid launches; count audit clean. `Test-Change:` citations present for all three test paths.

## Findings

No Fixes.

### Nits

- N1 `plan.md` red-evidence note says the stand-in "consumes `AskUserQuestion` as the flag's value" under the space form. Actually `tests/stand-in.sh`'s `--*) shift` drops only the flag token, so `AskUserQuestion` becomes the first bare arg the stand-in logs as the task. Deferred: plan note imprecision only; the red proof stands on the flag assertions. Promotes if the wording ever drives a wrong proof.
- N2 `tests/seat.test.ts` copies the four live templates verbatim, so it can't notice live template drift. Deferred: criterion 2 guards `harnessArgv`'s behavior on other kinds, not template text, and the fixture is self-contained. Promotes if a template edit is ever expected to be caught by tests.

## Verdict

nits

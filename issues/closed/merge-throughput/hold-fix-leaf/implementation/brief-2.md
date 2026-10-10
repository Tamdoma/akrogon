# Brief 2: hold-fix docs

## 1. Goal

Implement plan.md D7: document `akrogon hold-fix <slug>` and the fix-leaf merge-turn override in the operator docs and the merge-issue skill. Leaf: hold-fix-leaf; plan at `/home/ivan/Work/infra/akrogon/issues/open/merge-throughput/hold-fix-leaf/plan.md`.

## 2. Acceptance criteria

1. README.md command table contains a `akrogon hold-fix <slug>` row describing that it names one merge leaf which takes the merge turn solo while the repo's hold stands.
2. `docs/guide/merge.md` and `docs/guide/next.md` each gain one sentence stating a hold may name one merge leaf via `akrogon hold-fix` to take the turn solo while the hold exists.
3. `skills/merge-issue/SKILL.md` states, where the holder rule is described (~line 35), that a hold's named fix leaf takes the turn and is accepted by phase authorization while the hold stands.
4. `src/AREA.md` hold line under Non-obvious patterns mentions the `fix` field and the holder override; the file keeps its section shape (Commands, Key files, Non-obvious patterns, See also, ≤40 lines).
5. No other file changes; wording matches each document's existing terse style.

## 3. Read-first

- `README.md:130-150` — command table rows (`unhold` row is the model).
- `docs/guide/merge.md:29` — hold paragraph.
- `docs/guide/next.md:119` — hold paragraph.
- `skills/merge-issue/SKILL.md:33-66` — merge-turn and base-red sections.
- `src/AREA.md` — Non-obvious patterns, the `held.yaml` line.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list

Owns: README.md, docs/guide/merge.md, docs/guide/next.md, skills/merge-issue/SKILL.md, src/AREA.md. One row/sentence each. No prerequisite units.

## 5. Do-not

- Do not edit `tests/command-reference.test.ts` — a later unit owns it; the README row must still match the contract form `akrogon hold-fix <slug>` (bare slug, no flags).
- Do not rewrite hold mechanics already documented (unhold, cleared-by-main-move); add only the fix override.
- Do not touch code.
- Return a mismatch with evidence instead of adding scope.

Reasons and exceptions as stated: doc additions only, plan-pinned; exception is a revised brief from A.

## 6. Ordered steps

1. Read the files; mirror the `unhold` row and hold paragraphs.
2. Edit README.md, then the two guide files, then SKILL.md, then src/AREA.md.
3. `bun install` if `node_modules` absent, then run the section-7 command (docs-links and command-reference tests may cover README).

Size: 5 files, ~15 turns.

## 7. Commands

```sh
export AKROGON_BASE=3fde73f7197f35ea17ba2ff06c0705c535f9f75e
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

## 8. Done-when, evidence, report

Criteria met, one commit on top of worktree HEAD, command output pasted. Commit message: `docs: hold-fix fix leaf in command reference and guides`.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

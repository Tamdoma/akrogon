# Plan: guard-at-creation

Debate is off (`debate: no`); synthesized directly from brief and locked design.

## Decisions

- **D1** — `withSetup` (`src/config.ts:283-295`) drops `akrogon guard ancestors && ` from both `inner` forms. The setup form keeps `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c <setup>` first, then `akrogon guard own-modules`, then `sh -c <cmd>`; the no-setup form keeps `akrogon guard own-modules && sh -c <cmd>`. `akrogon guard ancestors` stays as a command: creation-time `checkLocation` (`src/next.ts:287`, reached for batches at `src/batch.ts:97`) uses the same check.
- **D2** — `src/base-run.ts` keeps its internal `guard ancestors` prefix. The design names `akrogon base-run` and its instructions unchanged, and its checkouts land under `~/.akrogon/scratch/<repo>/` where the check is a no-op.
- **D3** — `src/AREA.md:8` gains one clause: composed check commands run only `own-modules`; `ancestors` runs at worktree creation through `checkLocation`.
- **D4** — The temp-file sentence in `skills/implement-issue/SKILL.md:25`, `skills/check-issue/SKILL.md:18` and `skills/merge-issue/SKILL.md:18` becomes: temp files and logs go under `$TMPDIR`, never a fixed `/tmp/<name>`; a base copy is made only through `akrogon base-run`; anything needed later goes in the leaf folder. Same sentence in all three.
- **D5** — U2 sweeps `skills/` by meaning for instructions to make a base checkout by hand or inside a repo; hits outside this leaf's owned files are listed in the report, not edited. Known already outside scope: `skills/init-akrogon/SKILL.md:72` (`mktemp` for a proposal file), `skills/watch-issues/scripts/log-tail.test.ts` and `observe-log-tail.test.ts` comments (`mktemp` cwd provenance).
- **D6** — The inverted dirty-ancestor test seeds `node_modules` in the worktree so only the removed ancestor guard can fail it; a `touch`-marker check proves the check command ran, not only that setup ran.

## Read-first

- `src/config.ts` (`withSetup`, `leafTemp`, `worktreeStore`)
- `src/guard.ts` (`checkLocation`, `guard`)
- `src/next.ts:281-340` (`createSparseWorktree`), `src/batch.ts:95-110` (`buildStack` creation)
- `src/base-run.ts:130-175` (unchanged; confirms D2)
- `tests/guard.test.ts`, `tests/config.test.ts:18,371-420`, `tests/worktree-store.test.ts:136-152`, `tests/batch.test.ts` (`batchFixture`)
- `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md` (temp-file sentence each)
- `docs/guide/phases.md` (test rules), `src/test-files.ts` (Test-Change path rule)

## Interfaces

None new or changed. `withSetup`'s signature and returned shape are unchanged; only the composed command strings lose one prefix. `checkLocation`, `guard`, `buildStack` signatures unchanged.

## Checklist

### Wave 1

- **U1 — drop the ancestor prefix from composed checks**
  - Owns: `src/config.ts` (`withSetup` only), `src/AREA.md` (`guard` bullet).
  - Depends on: nothing. Shared test resource: none.
  - Criterion: `bun test tests/config.test.ts tests/guard.test.ts` is green, and every printed `checks`/`merge_checks`/`advisory` command contains no `guard ancestors` while still containing the flocked setup (when configured) and `guard own-modules`.

- **U2 — temp-file sentence and skills sweep**
  - Owns: `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md` (temp-file sentence only).
  - Depends on: nothing. Shared test resource: none.
  - Criterion: each of the three sentences matches D4 and names no base copy under `$TMPDIR`; `grep -rn 'base cop\|base checkout\|mktemp\|\$TMPDIR' skills/` output reviewed by meaning; out-of-scope hits listed in `implementation/report.md`.

## Docs

- `src/AREA.md:8` — guard bullet gains the creation-time clause (U1).
- `README.md:148`, `docs/guide/*.md` — verified accurate, no edit.
- `tests/AREA.md` — verified accurate, no edit.

## Criterion proofs

| # | Criterion | Test / proof | Command | Catches | Size | Rerun trigger |
|---|-----------|--------------|---------|---------|------|---------------|
| 1 | Composed checks run without `guard ancestors`, setup under lock + `own-modules`, both config forms | `config composes setup into printed checks, merge_checks and advisory identically from worktree`; `config reports merge_checks separately from checks` (updated expectations); `config runs all of setup inside the install lock`; `config printed check installs into a fresh worktree` | `bun test tests/config.test.ts --timeout=30000` | a re-added `guard ancestors` prefix, a dropped flock, a dropped `own-modules` | minutes | any `withSetup` or check-composition change |
| 2 | Check run under dirty ancestor not refused; missing own `node_modules` still refused | `printed check runs to completion under a dirty ancestor with and without setup` (inverted, red now); `printed check refuses naming missing own node_modules` (unchanged) | `bun test tests/guard.test.ts --timeout=30000` | ancestor guard re-added to composed checks; `own-modules` refusal dropped | seconds | any `withSetup`, `guard`, or run-check change |
| 3 | Leaf and batch creation under dirty parent still refused | `dispatch refuses a store path under an ancestor holding node_modules` (existing, unchanged); `buildStack refuses a store path under an ancestor holding node_modules` (new, passes today); `checkLocation accepts a nonexistent target under clean ancestors and refuses it under a dirty one` (existing) | `bun test tests/worktree-store.test.ts tests/batch.test.ts tests/guard.test.ts --timeout=30000` | `checkLocation` removed or bypassed in `createSparseWorktree` | minutes | any creation-path or `checkLocation` change |
| 4 | Temp-file sentences name no `$TMPDIR` base copy; sweep finds no manual base-checkout instruction | the three sentences per D4; report lists sweep hits outside scope | review evidence + `grep -rn 'base cop\|base checkout\|mktemp\|\$TMPDIR' skills/` | sentence left claiming `$TMPDIR` base copies; a skill instructing a hand-made base checkout | seconds | any skills text change |

Deliberate break for implement evidence: re-adding `akrogon guard ancestors && ` to either `inner` form turns the four tests of criteria 1–2 red.

## Planned-test reds (recorded at synthesis, before product code)

- `tests/guard.test.ts` `printed check runs to completion under a dirty ancestor with and without setup`:
  `Expected: 0 / Received: 1` at `guard.test.ts:98` — the still-present ancestor guard refuses the run.
- `tests/config.test.ts` `config composes setup into printed checks, merge_checks and advisory identically from worktree`: expected string without `akrogon guard ancestors &&`, received composed command still starting with it.
- `tests/config.test.ts` `config reports merge_checks separately from checks`: same prefix mismatch (`Expected - 2 / Received + 37` diff at `config.test.ts:311`).
- `tests/batch.test.ts` `buildStack refuses a store path under an ancestor holding node_modules`: green today; proves the kept creation guard, never red.
- `printed check refuses naming missing own node_modules and never runs the check command`: unchanged, stays green.

## Limits and notes

- `src/base-run.ts` keeps `guard ancestors` by design exclusion (D2); known limitation is nil because its checkout root is clean.
- The stale `framework/.temp/tmp.*` copies mentioned in the brief are not moved or deleted (design exclusion).
- Design-vs-brief note: brief "Owned" lists only `src/config.ts` and the three skill files; `src/AREA.md` is added because implement updates every doc the diff makes stale.

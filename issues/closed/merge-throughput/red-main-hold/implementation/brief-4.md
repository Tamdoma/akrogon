# Worker brief U4: docs and merge-issue red ending

## 1. Goal

Implement plan decisions D7, D8 docs: teach `skills/merge-issue/SKILL.md` to judge base cause first on a red merge run and end with `--red-on-base`; document `--red-on-base` and `unhold` in the README command table, `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/cheat.md`; keep `tests/command-reference.test.ts` contracts in lockstep; one `src/AREA.md` line. Done-criterion proven: 8.

## 2. Numbered acceptance criteria

1. `skills/merge-issue/SKILL.md`: the "Shared endings" red paragraph opens with the base judgment — a red run with no cause in the stack's diff reruns the same command once, same args and scope, in a detached worktree at `AKROGON_BASE` (the check-issue:61 procedure, referenced not duplicated), records both runs and the cause in `review-B.md`, and only then ends: on base-red `akrogon phase <slug> check.fix --slot B --attempt <id> --red-on-base <fetched-main-sha> --command <exact command>`; on leaf-red the existing split/check.fix endings. It documents that a `--red-on-base` refusal means fetched main moved: refetch, rerun on the new base, re-judge. The earlier "attempt top" paragraph that says every red ends in split or check.fix names the held ending too.
2. `README.md` Command table gains an `akrogon unhold` row and the `phase` row gains the new flags.
3. `tests/command-reference.test.ts` `contracts` updates: `phase: '<slug> <phase> --slot <A|B> [--verdict <verdict>] [--reason <text>] [--check] [--attempt <id>] [--red-on-base <sha> --command <command>]'` and adds `unhold: ''`. The test's own argument-group parser treats `[--red-on-base <sha> --command <command>]` as one optional group — this exact form parses cleanly.
4. `docs/guide/merge.md`: the red-run paragraph documents `--red-on-base <sha> --command <cmd>` — leaf stays in `merge`, record cleared without halving, repo held until fetched main differs outside `issues/` and `learnings/`; `akrogon unhold` clears by hand.
5. `docs/guide/next.md`: one short paragraph — a hold stops merge attempts for `next` in every mode (manual too, unlike pause which only gates automatic dispatch); `unpause` prints an existing hold; `status` marks held repos.
6. `docs/guide/cheat.md`: `akrogon unhold` shown next to pause/unpause.
7. `src/AREA.md` Non-obvious patterns gains one line: a main-red merge ends in a repo hold (`held.yaml`) that `mergeTurn` checks after fetch and inside the batch lock. Keep the file under 40 lines with its exact four `##` sections.

## 3. Read-first list

- `skills/merge-issue/SKILL.md` — "Shared endings" (~line 65) and "attempt top" (~line 41); `skills/check-issue/SKILL.md` line ~61 for the base-run rule to reference.
- `README.md` Command table (~line 130), `tests/command-reference.test.ts` contracts object.
- `docs/guide/merge.md` — the `check.fix` paragraph ("If checks fail, B reports…"); `docs/guide/next.md` — "Pausing automatic dispatch" section (~line 100); `docs/guide/cheat.md` pause block (~line 110); `src/AREA.md`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `skills/merge-issue/SKILL.md`, `README.md`, `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/cheat.md`, `tests/command-reference.test.ts`, `src/AREA.md`. Nothing else; the CLI flags these docs describe (`--red-on-base`, `--command`, `unhold`) are landing in parallel in another unit with exactly these spellings — write the docs against the spellings above.

Match each file's existing voice: terse guide prose, `akrogon <verb>` examples in fenced blocks where the file already uses them. No new headings in the guide pages unless the file's pattern calls for it (merge.md: extend the existing red paragraph; next.md: a short paragraph after the pause section).

## 5. Do-not, reasons and exceptions

- Do not paraphrase the check-issue:61 base-run procedure into merge-issue — reference it ("the base-run rule from check-issue") so the two skills cannot drift; that duplication is exactly what the design's cross-reference exists to avoid.
- Do not document a fix-leaf override, `hold-fix-leaf`, or bounce counting — sibling leaves own those; the design excludes them here.
- Do not touch `docs/guide/problems.md`, `docs/guide/state.md` or other pages — only the files above; scope creep into adjacent docs is how guide drift happens.
- Do not invent a `Held` row in the README beyond the `unhold` row and the phase flags.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A. Restating: these exclusions keep this leaf inside its locked decisions; only a revised brief from A authorizes a change.

## 6. Ordered steps

1. `skills/merge-issue/SKILL.md` edits (criterion 1).
2. `README.md` + `tests/command-reference.test.ts` contracts together (criteria 2,3).
3. `docs/guide/merge.md`, `docs/guide/next.md`, `docs/guide/cheat.md` (criteria 4–6).
4. `src/AREA.md` (criterion 7); run `wc -l src/AREA.md`.
5. Run the changed-test command; `bun test tests/command-reference.test.ts tests/docs-links.test.ts` directly is the tight loop.

Advisory size: 7 files, under 30 turns.

## 7. Commands

```sh
AKROGON_BASE=547063c52e068702aaa9e77117b749e9d1341275 bun test --changed="$AKROGON_BASE" --timeout=30000
```

`bun install` first if `node_modules` is absent (the worktree is a fresh checkout).

## 8. Done-when, evidence and report

All criteria pass; `command-reference` and `docs-links` tests green with pasted output; commit ID returned. `tests/command-reference.test.ts` is an existing test file: the commit editing it must carry the trailer `Test-Change: tests/command-reference.test.ts contract extended for --red-on-base/--command and unhold` in its final trailer block.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
